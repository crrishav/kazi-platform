'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { X } from 'lucide-react';
import {
  type DesignLayer, type DesignSide, type TextDesignLayer,
  clamp, MIN_LAYER_SIZE, RESIZE_HANDLES,
} from '@/lib/design-layers';
import { GarmentMockup2D, getDesignArea, getImageMeta } from './GarmentMockup2D';

/** Shrinks the font to fit the box, mirroring composeDesignCanvas's text-fit so the live 2D
 * preview matches what actually gets baked into the 3D decal texture. */
function AutoFitText({ layer }: { layer: TextDesignLayer }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    function recompute() {
      const w = el!.clientWidth;
      const h = el!.clientHeight;
      if (!w || !h) return;
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return;
      const label = layer.text || ' ';
      const maxWidth = w * 0.94;
      let size = h * 0.7;
      ctx.font = `600 ${size}px ${layer.fontFamily}`;
      while (size > 4 && ctx.measureText(label).width > maxWidth) {
        size -= 1;
        ctx.font = `600 ${size}px ${layer.fontFamily}`;
      }
      setFontSize(size);
    }
    recompute();
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    });
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [layer.text, layer.fontFamily]);

  return (
    <div ref={ref} className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
      <span style={{ fontFamily: layer.fontFamily, color: layer.color, fontSize, fontWeight: 600, whiteSpace: 'nowrap' }}>
        {layer.text || ' '}
      </span>
    </div>
  );
}

export default function Garment2DEditor({
  garment, colour, layers, activeSide, selectedLayerId,
  onSelectLayer, onUpdateLayer, onDeleteLayer, onLayerContextMenu,
}: {
  garment: string;
  colour: string;
  layers: DesignLayer[];
  activeSide: DesignSide;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<Pick<DesignLayer, 'x' | 'y' | 'width' | 'height'>>) => void;
  onDeleteLayer: (id: string) => void;
  onLayerContextMenu?: (id: string, clientX: number, clientY: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const imageMeta = getImageMeta(garment, activeSide);

  // Size the stage to exactly contain the mockup image within whatever space is available, in
  // pixels — sidesteps the letterboxing math that CSS aspect-ratio + max-width/height combos
  // get wrong when a flex parent's own aspect ratio doesn't match the artwork's. Re-runs on
  // garment/side change too since the tee and hoodie photos aren't quite the same aspect.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ratio = imageMeta.width / imageMeta.height;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      let w = width;
      let h = w / ratio;
      if (h > height) {
        h = height;
        w = h * ratio;
      }
      setStageSize({ width: w, height: h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [imageMeta.width, imageMeta.height]);

  const sideLayers = layers.filter((l) => l.side === activeSide);
  const area = getDesignArea(garment, activeSide);
  const areaPct = {
    left: area.x * 100,
    top: area.y * 100,
    width: area.width * 100,
    height: area.height * 100,
  };

  function beginMove(e: ReactPointerEvent, layer: DesignLayer) {
    e.stopPropagation();
    if (e.button !== 0) return;
    e.preventDefault();
    onSelectLayer(layer.id);
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetX = layer.x - (e.clientX - rect.left) / rect.width;
    const offsetY = layer.y - (e.clientY - rect.top) / rect.height;

    const onMove = (ev: PointerEvent) => {
      const r = areaRef.current?.getBoundingClientRect();
      if (!r) return;
      onUpdateLayer(layer.id, {
        x: clamp((ev.clientX - r.left) / r.width + offsetX, 0, 1),
        y: clamp((ev.clientY - r.top) / r.height + offsetY, 0, 1),
      });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function beginResize(e: ReactPointerEvent, layer: DesignLayer, dx: -1 | 0 | 1, dy: -1 | 0 | 1) {
    e.stopPropagation();
    if (e.button !== 0) return;
    e.preventDefault();
    const fixedX = dx === 0 ? null : dx > 0 ? layer.x - layer.width / 2 : layer.x + layer.width / 2;
    const fixedY = dy === 0 ? null : dy > 0 ? layer.y - layer.height / 2 : layer.y + layer.height / 2;

    const onMove = (ev: PointerEvent) => {
      const r = areaRef.current?.getBoundingClientRect();
      if (!r) return;
      const cx = clamp((ev.clientX - r.left) / r.width, 0, 1);
      const cy = clamp((ev.clientY - r.top) / r.height, 0, 1);
      const patch: Partial<Pick<DesignLayer, 'x' | 'y' | 'width' | 'height'>> = {};
      if (fixedX !== null) {
        const left = Math.min(fixedX, cx);
        const right = Math.max(fixedX, cx);
        patch.width = Math.max(MIN_LAYER_SIZE, right - left);
        patch.x = (left + right) / 2;
      }
      if (fixedY !== null) {
        const top = Math.min(fixedY, cy);
        const bottom = Math.max(fixedY, cy);
        patch.height = Math.max(MIN_LAYER_SIZE, bottom - top);
        patch.y = (top + bottom) / 2;
      }
      onUpdateLayer(layer.id, patch);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center p-6 sm:p-10"
      onPointerDown={() => onSelectLayer(null)}
    >
      <div className="relative" style={{ width: stageSize.width || undefined, height: stageSize.height || undefined }}>
        {stageSize.width > 0 && (
          <>
            <GarmentMockup2D garment={garment} side={activeSide} colour={colour} />

            <div
              ref={areaRef}
              className="absolute"
              style={{ left: `${areaPct.left}%`, top: `${areaPct.top}%`, width: `${areaPct.width}%`, height: `${areaPct.height}%` }}
            >
              {sideLayers.map((layer) => (
                <div
                  key={layer.id}
                  className="absolute touch-none select-none"
                  style={{
                    left: `${layer.x * 100}%`,
                    top: `${layer.y * 100}%`,
                    width: `${layer.width * 100}%`,
                    height: `${layer.height * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'move',
                    outline: selectedLayerId === layer.id ? '1.5px solid #3A7D44' : 'none',
                  }}
                  onPointerDown={(e) => beginMove(e, layer)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectLayer(layer.id);
                    onLayerContextMenu?.(layer.id, e.clientX, e.clientY);
                  }}
                >
                  {layer.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={layer.url} alt="" className="w-full h-full object-fill pointer-events-none" draggable={false} />
                  ) : (
                    <AutoFitText layer={layer} />
                  )}

                  {selectedLayerId === layer.id && (
                    <>
                      {RESIZE_HANDLES.map((h) => (
                        <div
                          key={h.id}
                          onPointerDown={(e) => beginResize(e, layer, h.dx, h.dy)}
                          className="absolute w-10 h-10 flex items-center justify-center"
                          style={{
                            left: `${((h.dx + 1) / 2) * 100}%`,
                            top: `${((h.dy + 1) / 2) * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            cursor: h.cursor,
                            touchAction: 'none',
                          }}
                        >
                          <div className="w-3 h-3 bg-white border border-espresso shadow-sm" />
                        </div>
                      ))}

                      <button
                        onPointerDown={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                        aria-label="Delete layer"
                        className="absolute w-9 h-9 flex items-center justify-center"
                        style={{ left: '100%', top: '0%', transform: 'translate(-50%, -50%)', touchAction: 'none' }}
                      >
                        <span className="w-5 h-5 rounded-full bg-white border border-rule shadow-sm flex items-center justify-center text-espresso hover:border-red-400 hover:text-red-500 transition-colors">
                          <X size={10} strokeWidth={2} />
                        </span>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
