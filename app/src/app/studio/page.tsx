'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Upload, ArrowRight, RotateCw, Plus, ChevronDown, ChevronUp, X, Type,
  Shirt, Layers, Palette, ImagePlus, BookmarkPlus, Trash2,
  MoreVertical, Copy, BringToFront, SendToBack,
} from 'lucide-react';
import {
  type DesignLayer, type DesignSide, type ImageDesignLayer, type TextDesignLayer, type LayerGeometryPatch,
  createImageLayer, createTextLayer, TEXT_FONTS, clamp, MIN_LAYER_OPACITY,
} from '@/lib/design-layers';
import type { RotateRequest } from '@/components/GarmentViewer';
import Garment2DEditor from '@/components/Garment2DEditor';

const MODELS_READY = true;

type ViewMode = '3d' | '2d';

const GarmentViewer = dynamic(() => import('@/components/GarmentViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span className="font-inter text-[10px] text-accent-warm tracking-nav uppercase animate-pulse">
        Loading model…
      </span>
    </div>
  ),
});

const GARMENT_TYPES = [
  { id: 't-shirt', label: 'T-Shirt',  code: 'GAR-001', desc: 'Classic crew neck' },
  { id: 'hoodie',  label: 'Hoodie',   code: 'GAR-002', desc: 'Pullover with hood' },
] as const;

const FABRICS = [
  { id: 'cotton-180', label: 'Cotton Jersey',     spec: '180 gsm', code: 'FAB-01', detail: 'GOTS certified · breathable · year-round' },
  { id: 'fleece-380', label: 'Heavyweight Fleece', spec: '380 gsm', code: 'FAB-02', detail: 'Recycled polyester · insulating · winter weight' },
  { id: 'terry-280',  label: 'French Terry',       spec: '280 gsm', code: 'FAB-03', detail: 'Loop-back · mid-weight · soft hand-feel' },
] as const;

const COLOURS = [
  { hex: '#FFFFFF', label: 'White' },
  { hex: '#F5F3EE', label: 'Cream' },
  { hex: '#E8E0D0', label: 'Oat' },
  { hex: '#D4C5A9', label: 'Linen' },
  { hex: '#B8A898', label: 'Sand' },
  { hex: '#6B6560', label: 'Stone' },
  { hex: '#3D2B1F', label: 'Espresso' },
  { hex: '#1A1A1A', label: 'Black' },
  { hex: '#2C4A3E', label: 'Forest' },
  { hex: '#556B2F', label: 'Sage' },
  { hex: '#8B4513', label: 'Rust' },
  { hex: '#C4956A', label: 'Camel' },
] as const;

type PanelId = 'garment' | 'fabric' | 'colour' | 'design';
type LayerOrderAction = 'front' | 'forward' | 'backward' | 'back';

interface ContextMenuState {
  layerId: string;
  x: number;
  y: number;
}

interface SavedDesign {
  id: string;
  garment: string;
  fabric: string;
  colour: string;
  pattern: string | null;
  patternOpacity: number;
  qty: number;
  layers: DesignLayer[];
}

const DOCK_ITEMS: { id: PanelId; label: string; icon: typeof Shirt }[] = [
  { id: 'garment',  label: 'Garment',  icon: Shirt },
  { id: 'fabric',   label: 'Fabric',   icon: Layers },
  { id: 'colour',   label: 'Colour',   icon: Palette },
  { id: 'design',   label: 'Design',   icon: ImagePlus },
];

function pricePerUnit(qty: number): number {
  if (qty >= 1000) return 3.20;
  if (qty >= 500)  return 4.50;
  if (qty >= 200)  return 6.00;
  if (qty >= 100)  return 7.80;
  return 10.20;
}

async function fileToAspectRatio(url: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth / img.naturalHeight || 1);
    img.onerror = () => resolve(1);
    img.src = url;
  });
}

async function cloneImageLayerUrl(layer: DesignLayer): Promise<DesignLayer> {
  if (layer.type !== 'image') return layer;
  try {
    const blob = await (await fetch(layer.url)).blob();
    return { ...layer, url: URL.createObjectURL(blob) };
  } catch {
    return layer;
  }
}

async function cloneObjectUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const blob = await (await fetch(url)).blob();
    return URL.createObjectURL(blob);
  } catch {
    return url;
  }
}

function ConfigPanel({
  title, onClose, children, side = 'left', headerAction,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  headerAction?: React.ReactNode;
}) {
  return (
    <div className={`absolute bottom-24 ${side === 'left' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} w-[calc(100vw-2rem)] sm:w-[300px] max-h-[min(60vh,540px)] sm:max-h-[min(70vh,540px)] bg-white border border-rule rounded-xl shadow-xl flex flex-col overflow-hidden z-20`}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-rule shrink-0">
        <span className="font-cinzel text-sm text-espresso">{title}</span>
        <div className="flex items-center gap-3 shrink-0">
          {headerAction}
          <button onClick={onClose} aria-label="Close panel" className="text-text-muted hover:text-espresso transition-colors">
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className="min-h-0 overflow-y-auto px-4 py-4">
        {children}
      </div>
    </div>
  );
}

const LAYER_MENU_ITEMS: { action: LayerOrderAction | 'duplicate' | 'delete'; label: string; icon: typeof Copy; divider?: boolean; danger?: boolean }[] = [
  { action: 'front',     label: 'Bring to Front', icon: BringToFront },
  { action: 'forward',   label: 'Bring Forward',  icon: ChevronUp },
  { action: 'backward',  label: 'Send Backward',  icon: ChevronDown },
  { action: 'back',      label: 'Send to Back',   icon: SendToBack },
  { action: 'duplicate', label: 'Duplicate',      icon: Copy, divider: true },
  { action: 'delete',    label: 'Delete',         icon: Trash2, danger: true },
];

function LayerContextMenu({
  x, y, onClose, onAction,
}: {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: LayerOrderAction | 'duplicate' | 'delete') => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        className="fixed z-50 w-44 bg-white border border-rule rounded-lg shadow-xl py-1.5 overflow-hidden"
        style={{ left: x, top: y }}
      >
        {LAYER_MENU_ITEMS.map(({ action, label, icon: Icon, divider, danger }) => (
          <button
            key={action}
            onClick={() => { onAction(action); onClose(); }}
            className={`flex items-center gap-2.5 w-full text-left px-3 py-2 font-inter text-xs transition-colors ${
              divider ? 'border-t border-rule-light mt-1 pt-2.5' : ''
            } ${danger ? 'text-red-500 hover:bg-red-50' : 'text-espresso hover:bg-cream/60'}`}
          >
            <Icon size={13} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

function StudioPageInner() {
  const searchParams = useSearchParams();
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [garment, setGarment]     = useState<string>('t-shirt');
  const [fabric, setFabric]       = useState<string>('cotton-180');
  const [colour, setColour]       = useState<string>('#E8E0D0');
  const [pattern, setPattern]     = useState<string | null>(null);
  const [patternOpacity, setPatternOpacity] = useState<number>(1);
  const [layers, setLayers]       = useState<DesignLayer[]>([]);
  const [activeSide, setActiveSide] = useState<DesignSide>('front');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [qty, setQty]             = useState<number>(100);
  const [collection, setCollection] = useState<SavedDesign[]>([]);
  const [showCollection, setShowCollection] = useState(false);
  const [rotateRequest, setRotateRequest] = useState<RotateRequest | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('3d');

  // Mobile browsers resize their chrome (address bar, etc.) without reliably firing a
  // `dvh` recompute on a page that never scrolls — measure the true visible height directly
  // so the dock can never end up positioned underneath it.
  useEffect(() => {
    const vv = window.visualViewport;
    function updateHeight() {
      setViewportHeight(Math.round(vv?.height ?? window.innerHeight));
    }
    updateHeight();
    vv?.addEventListener('resize', updateHeight);
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    return () => {
      vv?.removeEventListener('resize', updateHeight);
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  // This page is a fixed, app-like canvas — lock out the rubber-band/overscroll bounce so
  // an errant swipe can never reveal browser chrome under the fixed dock.
  useEffect(() => {
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overscrollBehavior = 'none';
    return () => { document.body.style.overscrollBehavior = prevOverscroll; };
  }, []);

  // Pre-fill garment and colour from query params (e.g. /studio?garment=hoodie&colour=%231B3D2A)
  useEffect(() => {
    const g = searchParams.get('garment');
    if (g && GARMENT_TYPES.some(gt => gt.id === g)) {
      setGarment(g);
    }
    const c = searchParams.get('colour');
    if (c && COLOURS.some(col => col.hex.toLowerCase() === c.toLowerCase())) {
      setColour(c);
    }
  }, [searchParams]);

  function togglePanel(id: PanelId) {
    setActivePanel(p => (p === id ? null : id));
  }

  function switchActiveSide(side: DesignSide) {
    setActiveSide(side);
    setSelectedLayerId(cur => {
      if (!cur) return cur;
      const layer = layers.find(l => l.id === cur);
      return layer && layer.side !== side ? null : cur;
    });
  }

  // In 3D, activeSide tracks whatever the camera is actually facing (see
  // handleFacingSideChange) — this just asks the viewer to spin to a side, and the panel
  // follows once it arrives. There's no camera in 2D, so just switch immediately.
  function requestRotateToSide(side: DesignSide) {
    if (side === activeSide) return;
    if (viewMode === '2d') {
      switchActiveSide(side);
      return;
    }
    setRotateRequest({ side, nonce: Date.now() });
  }

  function handleFacingSideChange(side: DesignSide) {
    switchActiveSide(side);
  }

  function selectLayer(id: string | null) {
    setSelectedLayerId(id);
  }

  function updateLayer(id: string, patch: LayerGeometryPatch) {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, ...patch } : l)));
  }

  function updateTextLayer(id: string, patch: Partial<Pick<TextDesignLayer, 'text' | 'color' | 'fontFamily'>>) {
    setLayers(prev => prev.map(l => (l.id === id && l.type === 'text' ? { ...l, ...patch } : l)));
  }

  function deleteLayer(id: string) {
    setLayers(prev => {
      const target = prev.find(l => l.id === id);
      if (target?.type === 'image') URL.revokeObjectURL(target.url);
      return prev.filter(l => l.id !== id);
    });
    setSelectedLayerId(cur => (cur === id ? null : cur));
  }

  function duplicateLayer(id: string) {
    const copyId = crypto.randomUUID();
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const copy: DesignLayer = {
        ...original,
        id: copyId,
        x: clamp(original.x + 0.04, 0, 1),
        y: clamp(original.y + 0.04, 0, 1),
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setSelectedLayerId(copyId);
  }

  // Stacking order is just array order (composeDesignCanvas + the ghost-polygon overlay both
  // render in array order, later = on top) — reordering only ever happens within the same side,
  // so the other side's layers keep their absolute slots untouched.
  function reorderLayer(id: string, action: LayerOrderAction) {
    setLayers(prev => {
      const target = prev.find(l => l.id === id);
      if (!target) return prev;
      const slots: number[] = [];
      const sameSide: DesignLayer[] = [];
      prev.forEach((l, i) => {
        if (l.side === target.side) {
          slots.push(i);
          sameSide.push(l);
        }
      });
      const from = sameSide.findIndex(l => l.id === id);
      let to = from;
      if (action === 'front') to = sameSide.length - 1;
      else if (action === 'back') to = 0;
      else if (action === 'forward') to = Math.min(from + 1, sameSide.length - 1);
      else if (action === 'backward') to = Math.max(from - 1, 0);
      if (to === from) return prev;

      const [moved] = sameSide.splice(from, 1);
      sameSide.splice(to, 0, moved);
      const next = [...prev];
      slots.forEach((slot, i) => { next[slot] = sameSide[i]; });
      return next;
    });
  }

  // Keyboard shortcuts for the selected layer: Delete/Backspace to remove, Escape to back out
  // of whatever's open (context menu, then selection, then panel), Cmd/Ctrl+D to duplicate,
  // Cmd/Ctrl+[ / ] to reorder, and arrow keys to nudge position (Shift for a bigger step).
  // Ignored while a text field has focus so it doesn't hijack normal typing/editing.
  useEffect(() => {
    function isEditableTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;

      if (e.key === 'Escape') {
        if (contextMenu) { setContextMenu(null); return; }
        if (selectedLayerId) { setSelectedLayerId(null); return; }
        if (activePanel) setActivePanel(null);
        return;
      }

      if (!selectedLayerId) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteLayer(selectedLayerId);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateLayer(selectedLayerId);
      } else if ((e.metaKey || e.ctrlKey) && (e.key === ']' || e.key === '[')) {
        e.preventDefault();
        reorderLayer(selectedLayerId, e.key === ']' ? 'forward' : 'backward');
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const step = e.shiftKey ? 0.02 : 0.005;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        setLayers(prev => prev.map(l => (
          l.id === selectedLayerId ? { ...l, x: clamp(l.x + dx, 0, 1), y: clamp(l.y + dy, 0, 1) } : l
        )));
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedLayerId, activePanel, contextMenu]);

  function openLayerContextMenu(id: string, clientX: number, clientY: number) {
    const MENU_W = 176;
    const MENU_H = 232;
    setContextMenu({
      layerId: id,
      x: Math.min(clientX, window.innerWidth - MENU_W - 8),
      y: Math.min(clientY, window.innerHeight - MENU_H - 8),
    });
  }

  function handleLayerMenuAction(action: LayerOrderAction | 'duplicate' | 'delete') {
    const id = contextMenu?.layerId;
    if (!id) return;
    if (action === 'duplicate') duplicateLayer(id);
    else if (action === 'delete') deleteLayer(id);
    else reorderLayer(id, action);
  }

  async function handleImageInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const aspect = await fileToAspectRatio(url);
    const layer = createImageLayer(activeSide, url, file.name, aspect);
    setLayers(prev => [...prev, layer]);
    setSelectedLayerId(layer.id);
  }

  function addTextLayer() {
    const layer = createTextLayer(activeSide);
    setLayers(prev => [...prev, layer]);
    setSelectedLayerId(layer.id);
  }

  function handlePatternInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPattern(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function removePattern() {
    setPattern(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  // Clears the working design back to a fresh default — used after saving to the collection,
  // so "save" reads as "file this away and start the next one" rather than just a bookmark.
  function startNewDesign() {
    setLayers(prev => {
      prev.forEach(l => { if (l.type === 'image') URL.revokeObjectURL(l.url); });
      return [];
    });
    setPattern(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPatternOpacity(1);
    setGarment('t-shirt');
    setFabric('cotton-180');
    setColour('#E8E0D0');
    setQty(100);
    setSelectedLayerId(null);
    setActiveSide('front');
  }

  async function addToCollection() {
    // Mint independent object URLs for the snapshot — the live layers' (and pattern's) URLs
    // get revoked once startNewDesign clears the working design, which would otherwise break
    // this saved entry's thumbnail/fill.
    const [snapshotLayers, snapshotPattern] = await Promise.all([
      Promise.all(layers.map(cloneImageLayerUrl)),
      cloneObjectUrl(pattern),
    ]);
    setCollection(prev => [
      { id: crypto.randomUUID(), garment, fabric, colour, pattern: snapshotPattern, patternOpacity, qty, layers: snapshotLayers },
      ...prev,
    ]);
    setShowCollection(true);
    startNewDesign();
  }

  // Swaps the working design for a saved one — clones fresh object URLs (and layer ids) so
  // editing/deleting here can't revoke the URLs the collection entry itself still depends on.
  async function loadFromCollection(entry: SavedDesign) {
    const [workingLayers, workingPattern] = await Promise.all([
      Promise.all(entry.layers.map(async (l) => ({ ...(await cloneImageLayerUrl(l)), id: crypto.randomUUID() }))),
      cloneObjectUrl(entry.pattern),
    ]);
    setLayers(prev => {
      prev.forEach(l => { if (l.type === 'image') URL.revokeObjectURL(l.url); });
      return workingLayers;
    });
    setPattern(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return workingPattern;
    });
    setPatternOpacity(entry.patternOpacity);
    setGarment(entry.garment);
    setFabric(entry.fabric);
    setColour(entry.colour);
    setQty(entry.qty);
    setSelectedLayerId(null);
    setActiveSide('front');
    setShowCollection(false);
  }

  function removeFromCollection(id: string) {
    setCollection(prev => {
      const target = prev.find(entry => entry.id === id);
      target?.layers.forEach(l => { if (l.type === 'image') URL.revokeObjectURL(l.url); });
      if (target?.pattern) URL.revokeObjectURL(target.pattern);
      return prev.filter(entry => entry.id !== id);
    });
  }

  const selectedColour    = COLOURS.find(c => c.hex.toLowerCase() === colour.toLowerCase());
  const selectedFabric    = FABRICS.find(f => f.id === fabric);
  const selectedGarment   = GARMENT_TYPES.find(g => g.id === garment);
  const ppu      = pricePerUnit(qty);
  const totalGBP = (ppu * qty).toFixed(2);
  const sideLayers = layers.filter(l => l.side === activeSide);

  const frontCount = layers.filter(l => l.side === 'front').length;
  const backCount  = layers.filter(l => l.side === 'back').length;
  const designSummary = layers.length === 0
    ? 'No custom artwork'
    : `${frontCount} front element(s), ${backCount} back element(s)`;

  const qtyRange = qty >= 1000 ? '1,000+' : qty >= 500 ? '500–999' : qty >= 250 ? '250–499' : qty >= 100 ? '100–249' : '50–99';
  const quoteHref = `/quote?${new URLSearchParams({
    productType: garment === 'hoodie' ? 'Hoodies' : 'T-Shirts',
    qtyRange,
    details: `Custom configuration: ${selectedGarment?.label ?? garment}, Fabric: ${selectedFabric?.label ?? fabric} (${selectedFabric?.spec ?? ''}), Colour: ${selectedColour?.label ?? colour}, Design: ${designSummary}, Qty: ${qty} units, Est. total: £${totalGBP}`,
  }).toString()}`;

  return (
    <main
      className="overflow-hidden bg-white relative h-[100dvh]"
      style={viewportHeight ? { height: `${viewportHeight}px` } : undefined}
    >
      <Navigation />

      <div className="absolute inset-0 pt-[112px]">
        <div className="relative w-full h-full bg-cream/30 overflow-hidden">

          {/* Canvas */}
          <div className="absolute inset-0 bottom-28">
            {viewMode === '2d' ? (
              <Garment2DEditor
                garment={garment}
                colour={colour}
                pattern={pattern}
                patternOpacity={patternOpacity}
                layers={layers}
                activeSide={activeSide}
                selectedLayerId={selectedLayerId}
                onSelectLayer={selectLayer}
                onUpdateLayer={updateLayer}
                onDeleteLayer={deleteLayer}
                onLayerContextMenu={openLayerContextMenu}
              />
            ) : MODELS_READY ? (
              <GarmentViewer
                garment={garment}
                colour={colour}
                pattern={pattern}
                patternOpacity={patternOpacity}
                layers={layers}
                activeSide={activeSide}
                selectedLayerId={selectedLayerId}
                onSelectLayer={selectLayer}
                onUpdateLayer={updateLayer}
                onDeleteLayer={deleteLayer}
                onLayerContextMenu={openLayerContextMenu}
                onFacingSideChange={handleFacingSideChange}
                rotateRequest={rotateRequest}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-5">
                <div className="relative w-20 h-28 opacity-20">
                  <div className="absolute inset-3 border border-espresso"
                    style={{ animation: 'slowRotate 20s linear infinite', transformStyle: 'preserve-3d' }} />
                </div>
                <p className="font-inter text-xs text-text-light">3D preview loading</p>
              </div>
            )}
          </div>

          {/* Live summary — top left */}
          <div className="absolute top-4 left-4 sm:left-6 z-10 flex items-center gap-1.5 sm:gap-2 max-w-[60vw] sm:max-w-none px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm border border-rule rounded-lg">
            <span className="font-cinzel text-xs text-espresso whitespace-nowrap shrink-0">{selectedGarment?.label ?? garment}</span>
            <span className="text-rule shrink-0">·</span>
            <span className="font-inter text-[10px] tracking-nav text-text-muted uppercase whitespace-nowrap truncate max-w-[90px] sm:max-w-none">
              {selectedFabric?.label ?? fabric} · {selectedColour?.label ?? colour}
            </span>
          </div>

          {/* Live price — top right */}
          <div className="absolute top-4 right-4 sm:right-6 z-10 flex items-baseline gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm border border-rule rounded-lg">
            <span className="font-cinzel text-sm text-accent-warm">£{ppu.toFixed(2)}</span>
            <span className="font-inter text-[9px] text-text-light uppercase whitespace-nowrap">
              /unit<span className="hidden sm:inline"> · {qty} units</span>
            </span>
          </div>

          {/* Front/Back — a single sliding switch, right edge. Centered vertically by default;
              a panel opening (Fabric, etc.) can grow nearly full-width on mobile and would
              otherwise sit right under it, so it steps up out of the way while one is open. */}
          <div
            className={`absolute right-4 sm:right-6 z-10 transition-[top] duration-200 ease-out ${
              activePanel || showCollection ? 'top-16 sm:top-20' : 'top-1/2 -translate-y-1/2'
            }`}
          >
            <div className="relative flex p-1 w-[5.75rem] sm:w-[6.5rem] bg-white/90 backdrop-blur-sm border border-rule rounded-full shadow-xl" role="group" aria-label="Front or back">
              <span
                aria-hidden
                className="absolute left-1 top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-accent-warm transition-transform duration-200 ease-out"
                style={{ transform: activeSide === 'back' ? 'translateX(100%)' : 'translateX(0%)' }}
              />
              {(['front', 'back'] as const).map(side => (
                <button key={side} onClick={() => requestRotateToSide(side)} title={`Show ${side}`}
                  aria-pressed={activeSide === side}
                  className={`relative z-10 flex-1 h-8 sm:h-9 flex items-center justify-center rounded-full font-inter text-[9px] tracking-nav uppercase transition-colors duration-150 ${
                    activeSide === side ? 'text-cream' : 'text-text-muted hover:text-espresso'
                  }`}>
                  {side}
                </button>
              ))}
            </div>
          </div>

          {/* Rotate hint */}
          {MODELS_READY && viewMode === '3d' && (
            <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 border border-rule bg-white/85 backdrop-blur-sm rounded-full z-10">
              <RotateCw size={11} className="text-text-light" strokeWidth={1.5} />
              <span className="font-inter text-[9px] tracking-nav text-text-light uppercase">Drag to rotate</span>
            </div>
          )}

          {/* ── Contextual panel ── */}
          {activePanel === 'garment' && (
            <ConfigPanel title="Garment" onClose={() => setActivePanel(null)}>
              <div className="space-y-2.5">
                {GARMENT_TYPES.map(g => (
                  <button key={g.id} onClick={() => setGarment(g.id)}
                    className={`relative w-full text-left border px-4 py-3 transition-all duration-200 ${
                      garment === g.id
                        ? 'border-espresso bg-espresso text-cream'
                        : 'border-rule bg-white hover:border-espresso/40 text-espresso'
                    }`}>
                    <p className={`font-inter text-[9px] tracking-nav uppercase mb-1 ${garment === g.id ? 'text-cream/50' : 'text-text-light'}`}>{g.code}</p>
                    <p className="font-cinzel text-sm mb-0.5">{g.label}</p>
                    <p className={`font-inter text-xs ${garment === g.id ? 'text-cream/60' : 'text-text-muted'}`}>{g.desc}</p>
                    {garment === g.id && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent-warm" />}
                  </button>
                ))}
              </div>
            </ConfigPanel>
          )}

          {activePanel === 'fabric' && (
            <ConfigPanel title="Fabric" onClose={() => setActivePanel(null)}>
              <div className="space-y-2.5">
                {FABRICS.map(f => (
                  <button key={f.id} onClick={() => setFabric(f.id)}
                    className={`w-full text-left border px-4 py-3 transition-all duration-200 ${
                      fabric === f.id
                        ? 'border-espresso bg-espresso text-cream'
                        : 'border-rule bg-white hover:border-espresso/40'
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-inter text-[9px] tracking-nav uppercase ${fabric === f.id ? 'text-cream/50' : 'text-text-light'}`}>{f.code}</span>
                      <span className={`font-inter text-[10px] border px-1.5 py-0.5 ${fabric === f.id ? 'border-cream/30 text-cream' : 'border-rule text-text-muted'}`}>{f.spec}</span>
                    </div>
                    <p className={`font-cinzel text-sm mb-0.5 ${fabric === f.id ? 'text-cream' : 'text-espresso'}`}>{f.label}</p>
                    <p className={`font-inter text-xs leading-snug ${fabric === f.id ? 'text-cream/60' : 'text-text-muted'}`}>{f.detail}</p>
                  </button>
                ))}
              </div>
            </ConfigPanel>
          )}

          {activePanel === 'colour' && (
            <ConfigPanel title="Colour" onClose={() => setActivePanel(null)}>
              <div className="flex items-center gap-3 p-3 border border-rule mb-4">
                <input
                  type="color"
                  value={colour}
                  onChange={e => setColour(e.target.value)}
                  aria-label="Pick a custom colour"
                  className="w-11 h-11 border border-rule cursor-pointer bg-white p-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-cinzel text-xs text-espresso truncate">{selectedColour?.label ?? 'Custom'}</p>
                  <p className="font-inter text-[10px] text-text-light">{colour.toUpperCase()}</p>
                </div>
              </div>

              <p className="font-inter text-[9px] tracking-nav text-text-light uppercase mb-2.5">Quick picks</p>
              <div className="grid grid-cols-6 gap-2 mb-5">
                {COLOURS.map(c => (
                  <button key={c.hex} onClick={() => setColour(c.hex)} title={c.label}
                    className={`w-8 h-8 border-2 transition-all duration-200 ${
                      colour.toLowerCase() === c.hex.toLowerCase() ? 'border-espresso scale-110 shadow-sm' : 'border-rule hover:border-espresso/40'
                    }`}
                    style={{ backgroundColor: c.hex }} />
                ))}
              </div>

              <div className="flex items-center justify-between mb-2.5">
                <p className="font-inter text-[9px] tracking-nav text-text-light uppercase">Custom pattern</p>
                {pattern && (
                  <button onClick={removePattern} className="font-inter text-[9px] tracking-nav text-text-muted hover:text-red-500 uppercase transition-colors">
                    Remove
                  </button>
                )}
              </div>
              {pattern ? (
                <div className="border border-rule p-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 border border-rule shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pattern} alt="" className="w-full h-full object-cover" />
                    </div>
                    <p className="font-inter text-[10px] text-text-muted leading-relaxed">
                      Tiled across the whole garment, under any images or text.
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-rule-light">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-inter text-[9px] tracking-nav text-text-light uppercase">Pattern opacity</span>
                      <span className="font-inter text-[10px] text-espresso">{Math.round(patternOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range" min={0.1} max={1} step={0.01}
                      value={patternOpacity}
                      onChange={e => setPatternOpacity(Number(e.target.value))}
                      className="w-full h-0.5 bg-rule appearance-none cursor-pointer"
                      style={{ accentColor: '#1B3D2A' }}
                    />
                  </div>
                </div>
              ) : (
                <label className="relative flex items-center justify-center gap-1.5 py-3.5 border-2 border-dashed border-rule hover:border-accent-warm/50 bg-white cursor-pointer transition-all duration-200">
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handlePatternInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="w-4 h-4 text-text-light" strokeWidth={1.5} />
                  <span className="font-inter text-[10px] text-espresso">Upload a pattern</span>
                </label>
              )}
            </ConfigPanel>
          )}

          {activePanel === 'design' && (
            <ConfigPanel title="Design" onClose={() => setActivePanel(null)}>
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <label className="relative flex flex-col items-center justify-center gap-1.5 py-4 border-2 border-dashed border-rule hover:border-accent-warm/50 bg-white cursor-pointer transition-all duration-200">
                  <input type="file" accept=".png,.jpg,.jpeg,.svg,.webp" onChange={handleImageInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="w-4 h-4 text-text-light" strokeWidth={1.5} />
                  <span className="font-inter text-[10px] text-espresso">Add Image</span>
                </label>
                <button onClick={addTextLayer}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 border-2 border-dashed border-rule hover:border-accent-warm/50 bg-white transition-all duration-200">
                  <Type className="w-4 h-4 text-text-light" strokeWidth={1.5} />
                  <span className="font-inter text-[10px] text-espresso">Add Text</span>
                </button>
              </div>

              {sideLayers.length === 0 ? (
                <p className="font-inter text-xs text-text-muted leading-relaxed">
                  No elements on the {activeSide} yet. Add an image or text, then drag it directly on the model to position and resize it.
                </p>
              ) : (
                <div className="space-y-2">
                  {/* Stacking order is array order (later = on top) — show the list in the
                      same visual order the layers actually render, top-most first. */}
                  {[...sideLayers].reverse().map(layer => (
                    <div key={layer.id}>
                      <button onClick={() => selectLayer(layer.id)}
                        className={`flex items-center gap-2.5 w-full text-left p-2 border transition-colors ${
                          selectedLayerId === layer.id ? 'border-espresso bg-espresso/5' : 'border-rule hover:border-espresso/30'
                        }`}>
                        <div className="w-8 h-8 border border-rule shrink-0 flex items-center justify-center bg-white overflow-hidden">
                          {layer.type === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={layer.url} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Type size={13} strokeWidth={1.5} className="text-text-light" />
                          )}
                        </div>
                        <span className="flex-1 min-w-0 font-inter text-xs text-espresso truncate">
                          {layer.type === 'image' ? layer.fileName : (layer.text || 'Text')}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="Layer options"
                          className="text-text-muted hover:text-espresso transition-colors shrink-0 p-0.5 -m-0.5"
                          onClick={(e) => { e.stopPropagation(); openLayerContextMenu(layer.id, e.clientX, e.clientY); }}
                        >
                          <MoreVertical size={14} strokeWidth={1.5} />
                        </span>
                      </button>

                      {selectedLayerId === layer.id && (
                        <div className="mt-2 mb-1 p-2.5 border border-rule-light space-y-2.5">
                          {layer.type === 'text' && (
                            <>
                              <input
                                type="text"
                                value={layer.text}
                                onChange={e => updateTextLayer(layer.id, { text: e.target.value })}
                                placeholder="Your text"
                                className="w-full border border-rule px-2.5 py-1.5 font-inter text-xs text-espresso focus:outline-none focus:border-espresso"
                              />
                              <div className="flex items-center gap-2">
                                {TEXT_FONTS.map(f => (
                                  <button key={f.value} onClick={() => updateTextLayer(layer.id, { fontFamily: f.value })}
                                    style={{ fontFamily: f.value }}
                                    className={`px-2 py-1 border text-xs transition-colors ${
                                      layer.fontFamily === f.value ? 'border-espresso bg-espresso text-cream' : 'border-rule text-espresso hover:border-espresso/40'
                                    }`}>
                                    {f.label}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="color"
                                  value={layer.color}
                                  onChange={e => updateTextLayer(layer.id, { color: e.target.value })}
                                  aria-label="Text colour"
                                  className="w-8 h-8 border border-rule cursor-pointer bg-white p-0.5"
                                />
                                <span className="font-inter text-[10px] text-text-light uppercase">{layer.color}</span>
                              </div>
                            </>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-inter text-[9px] tracking-nav text-text-light uppercase">Opacity</span>
                              <span className="font-inter text-[10px] text-espresso">{Math.round(layer.opacity * 100)}%</span>
                            </div>
                            <input
                              type="range" min={MIN_LAYER_OPACITY} max={1} step={0.01}
                              value={layer.opacity}
                              onChange={e => updateLayer(layer.id, { opacity: Number(e.target.value) })}
                              className="w-full h-0.5 bg-rule appearance-none cursor-pointer"
                              style={{ accentColor: '#1B3D2A' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ConfigPanel>
          )}

          {showCollection && (
            <ConfigPanel
              title={`Collection${collection.length ? ` (${collection.length})` : ''}`}
              onClose={() => setShowCollection(false)}
              side="right"
              headerAction={
                <button onClick={addToCollection} title="Save current design" aria-label="Save current design"
                  className="text-text-muted hover:text-accent-warm transition-colors">
                  <Plus size={15} strokeWidth={1.5} />
                </button>
              }
            >
              {collection.length === 0 ? (
                <p className="font-inter text-xs text-text-muted leading-relaxed">
                  No saved designs yet. Design a garment and tap <Plus size={10} strokeWidth={2} className="inline -mt-0.5" /> to save it here.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {collection.map(entry => {
                    const g = GARMENT_TYPES.find(x => x.id === entry.garment);
                    const f = FABRICS.find(x => x.id === entry.fabric);
                    const c = COLOURS.find(x => x.hex.toLowerCase() === entry.colour.toLowerCase());
                    const thumb = entry.layers.find((l): l is ImageDesignLayer => l.type === 'image');
                    return (
                      <div key={entry.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => loadFromCollection(entry)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadFromCollection(entry); } }}
                        title="Load this design"
                        className="flex items-center gap-3 border border-rule p-2.5 cursor-pointer hover:border-espresso/40 transition-colors"
                      >
                        <div className="relative w-11 h-11 border border-rule shrink-0 overflow-hidden" style={{ backgroundColor: entry.colour }}>
                          {entry.pattern ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={entry.pattern} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          ) : thumb && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb.url} alt="" className="absolute inset-0 w-full h-full object-contain p-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-cinzel text-xs text-espresso truncate">{g?.label ?? entry.garment}</p>
                          <p className="font-inter text-[10px] text-text-muted truncate">
                            {f?.label ?? entry.fabric} · {c?.label ?? entry.colour}
                            {entry.layers.length > 0 && ` · ${entry.layers.length} el.`}
                          </p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeFromCollection(entry.id); }} aria-label="Remove from collection"
                          className="text-text-muted hover:text-red-500 transition-colors shrink-0">
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ConfigPanel>
          )}

          {contextMenu && (
            <LayerContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
              onAction={handleLayerMenuAction}
            />
          )}

          {/* ── Floating dock ── */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-20 max-w-[calc(100vw-1.5rem)]"
            style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center gap-0.5 sm:gap-1 bg-espresso rounded-2xl px-1.5 sm:px-2 py-2 shadow-xl overflow-x-auto">
              <div className="flex items-center bg-cream/10 rounded-lg p-0.5 shrink-0" role="group" aria-label="Editing view">
                {(['3d', '2d'] as const).map((mode) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    title={mode === '3d' ? '3D model' : '2D mockup'} aria-pressed={viewMode === mode}
                    className={`px-2.5 h-8 sm:h-9 rounded-md font-inter text-[10px] tracking-nav uppercase transition-colors duration-150 ${
                      viewMode === mode ? 'bg-accent-warm text-cream' : 'text-cream/70 hover:text-cream'
                    }`}>
                    {mode}
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-cream/15 mx-1 sm:mx-1.5 shrink-0" />

              {DOCK_ITEMS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => togglePanel(id)} title={label} aria-label={label}
                  aria-pressed={activePanel === id}
                  className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-lg transition-colors duration-150 ${
                    activePanel === id ? 'bg-accent-warm text-cream' : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
                  }`}>
                  <Icon size={17} strokeWidth={1.5} />
                </button>
              ))}

              <div className="w-px h-6 bg-cream/15 mx-1 sm:mx-1.5 shrink-0" />

              <button onClick={() => setShowCollection(v => !v)} title="Collection" aria-label="Collection"
                aria-pressed={showCollection}
                className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-lg transition-colors duration-150 ${
                  showCollection ? 'bg-accent-warm text-cream' : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
                }`}>
                <BookmarkPlus size={17} strokeWidth={1.5} />
              </button>

              <div className="w-px h-6 bg-cream/15 mx-1 sm:mx-1.5 shrink-0" />

              <Link href={quoteHref} title="Request a Quote"
                className="flex items-center gap-1.5 h-9 sm:h-10 pl-3.5 pr-3 sm:pl-4 sm:pr-3.5 rounded-lg bg-accent-warm text-cream font-inter text-[11px] tracking-nav uppercase hover:bg-accent-warm/90 transition-colors duration-150 whitespace-nowrap shrink-0">
                Quote <ArrowRight size={13} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function StudioPage() {
  return (
    <Suspense>
      <StudioPageInner />
    </Suspense>
  );
}
