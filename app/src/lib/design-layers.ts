// Shared types + pure helpers for the configurator's per-side design layers
// (uploaded images and text, independently placed on the front/back of the garment).

export type DesignSide = 'front' | 'back';

interface DesignLayerBase {
  id: string;
  side: DesignSide;
  /** Center position, normalized 0..1 within the side's design canvas (0,0 = top-left). */
  x: number;
  y: number;
  /** Size, normalized 0..1 as a fraction of the design canvas width/height. */
  width: number;
  height: number;
}

export interface ImageDesignLayer extends DesignLayerBase {
  type: 'image';
  url: string;
  fileName: string;
}

export interface TextDesignLayer extends DesignLayerBase {
  type: 'text';
  text: string;
  color: string;
  fontFamily: string;
}

export type DesignLayer = ImageDesignLayer | TextDesignLayer;

export const TEXT_FONTS = [
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Cinzel', value: "'Cinzel', serif" },
  { label: 'Newsreader', value: "'Newsreader', serif" },
] as const;

export const MIN_LAYER_SIZE = 0.05;
export const DESIGN_CANVAS_PX = 1024;

function newId(): string {
  return crypto.randomUUID();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function createImageLayer(side: DesignSide, url: string, fileName: string, aspect: number): ImageDesignLayer {
  const width = 0.42;
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  return {
    id: newId(),
    type: 'image',
    side,
    x: 0.5,
    y: 0.5,
    width,
    height: clamp(width / safeAspect, MIN_LAYER_SIZE, 0.9),
    url,
    fileName,
  };
}

export function createTextLayer(side: DesignSide): TextDesignLayer {
  return {
    id: newId(),
    type: 'text',
    side,
    x: 0.5,
    y: 0.5,
    width: 0.55,
    height: 0.14,
    text: 'Your text',
    color: '#1A1A1A',
    fontFamily: TEXT_FONTS[0].value,
  };
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Draws every layer for one side, in array order (later = on top). Pass `target` to redraw
 * an existing canvas in place (keeps the GPU texture that wraps it from being reallocated
 * on every edit) — omit it to allocate a fresh one.
 */
export function composeDesignCanvas(
  layers: DesignLayer[],
  imageCache: Map<string, HTMLImageElement>,
  target?: HTMLCanvasElement,
): HTMLCanvasElement {
  const canvas = target ?? document.createElement('canvas');
  canvas.width = DESIGN_CANVAS_PX;
  canvas.height = DESIGN_CANVAS_PX;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const size = DESIGN_CANVAS_PX;
  for (const layer of layers) {
    const w = layer.width * size;
    const h = layer.height * size;
    const cx = layer.x * size;
    const cy = layer.y * size;

    if (layer.type === 'image') {
      const img = imageCache.get(layer.url);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
      }
      continue;
    }

    ctx.save();
    ctx.fillStyle = layer.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = layer.text || ' ';
    const maxWidth = w * 0.94;
    let fontSize = h * 0.7;
    ctx.font = `600 ${fontSize}px ${layer.fontFamily}`;
    while (fontSize > 4 && ctx.measureText(label).width > maxWidth) {
      fontSize -= 1;
      ctx.font = `600 ${fontSize}px ${layer.fontFamily}`;
    }
    ctx.fillText(label, cx, cy);
    ctx.restore();
  }

  return canvas;
}
