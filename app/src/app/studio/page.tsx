'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Upload, ArrowRight, RotateCw, Minus, Plus, ChevronDown, ChevronUp, X,
  Shirt, Layers, Palette, ImagePlus, PoundSterling, BookmarkPlus, Trash2,
} from 'lucide-react';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const MODELS_READY = true;

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

const PLACEMENTS = [
  { id: 'front-chest', label: 'Front Chest', note: 'Left breast, standard position' },
  { id: 'back',        label: 'Back',        note: 'Centred, below collar' },
] as const;

const VOLUME_TIERS: [number, number][] = [[50, 10.20], [100, 7.80], [200, 6.00], [500, 4.50], [1000, 3.20]];

type PanelId = 'garment' | 'fabric' | 'colour' | 'logo' | 'quantity';

interface SavedDesign {
  id: string;
  garment: string;
  fabric: string;
  colour: string;
  qty: number;
  logoPreviewUrl?: string;
}

const DOCK_ITEMS: { id: PanelId; label: string; icon: typeof Shirt }[] = [
  { id: 'garment',  label: 'Garment',  icon: Shirt },
  { id: 'fabric',   label: 'Fabric',   icon: Layers },
  { id: 'colour',   label: 'Colour',   icon: Palette },
  { id: 'logo',     label: 'Logo',     icon: ImagePlus },
  { id: 'quantity', label: 'Quantity & Pricing', icon: PoundSterling },
];

function pricePerUnit(qty: number): number {
  if (qty >= 1000) return 3.20;
  if (qty >= 500)  return 4.50;
  if (qty >= 200)  return 6.00;
  if (qty >= 100)  return 7.80;
  return 10.20;
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
    <div className={`absolute bottom-24 ${side === 'left' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} w-[300px] max-h-[min(70vh,540px)] bg-white border border-rule rounded-xl shadow-xl flex flex-col overflow-hidden z-20`}>
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

function ConfigurePageInner() {
  useSmoothScroll();
  const searchParams = useSearchParams();
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [garment, setGarment]     = useState<string>('t-shirt');
  const [fabric, setFabric]       = useState<string>('cotton-180');
  const [colour, setColour]       = useState<string>('#E8E0D0');
  const [placement, setPlacement] = useState<string>('front-chest');
  const [logoFile, setLogoFile]   = useState<File | null>(null);
  const [logoUrl, setLogoUrl]     = useState<string | undefined>(undefined);
  const [qty, setQty]             = useState<number>(100);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [collection, setCollection] = useState<SavedDesign[]>([]);
  const [showCollection, setShowCollection] = useState(false);

  // Pre-fill garment and colour from query params (e.g. /configure?garment=hoodie&colour=%231B3D2A)
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
  function handleLogoInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(URL.createObjectURL(file));
  }
  function clearLogo() {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoFile(null); setLogoUrl(undefined);
  }
  function addToCollection() {
    setCollection(prev => [
      {
        id: crypto.randomUUID(),
        garment, fabric, colour, qty,
        // Mint an independent object URL — the live `logoUrl` gets revoked on replace/clear,
        // which would otherwise break this saved entry's thumbnail.
        logoPreviewUrl: logoFile ? URL.createObjectURL(logoFile) : undefined,
      },
      ...prev,
    ]);
    setShowCollection(true);
  }
  function removeFromCollection(id: string) {
    setCollection(prev => {
      const target = prev.find(entry => entry.id === id);
      if (target?.logoPreviewUrl) URL.revokeObjectURL(target.logoPreviewUrl);
      return prev.filter(entry => entry.id !== id);
    });
  }

  const selectedColour    = COLOURS.find(c => c.hex === colour);
  const selectedFabric    = FABRICS.find(f => f.id === fabric);
  const selectedGarment   = GARMENT_TYPES.find(g => g.id === garment);
  const selectedPlacement = PLACEMENTS.find(p => p.id === placement);
  const ppu      = pricePerUnit(qty);
  const totalGBP = (ppu * qty).toFixed(2);

  const qtyRange = qty >= 1000 ? '1,000+' : qty >= 500 ? '500–999' : qty >= 250 ? '250–499' : qty >= 100 ? '100–249' : '50–99';
  const quoteHref = `/quote?${new URLSearchParams({
    productType: garment === 'hoodie' ? 'Hoodies' : 'T-Shirts',
    qtyRange,
    details: `Custom configuration: ${selectedGarment?.label ?? garment}, Fabric: ${selectedFabric?.label ?? fabric} (${selectedFabric?.spec ?? ''}), Colour: ${selectedColour?.label ?? colour}, Logo: ${selectedPlacement?.label ?? placement}, Qty: ${qty} units, Est. total: £${totalGBP}`,
  }).toString()}`;

  return (
    <main className="h-[100dvh] overflow-hidden bg-white relative">
      <Navigation />

      <div className="absolute inset-0 pt-[112px]">
        <div className="relative w-full h-full bg-cream/30 overflow-hidden">

          {/* Canvas */}
          <div className="absolute inset-0 bottom-28">
            {MODELS_READY ? (
              <GarmentViewer garment={garment} colour={colour} logoUrl={logoUrl} placement={placement} />
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
          <div className="absolute top-4 left-4 sm:left-6 z-10 flex items-center gap-2 px-3.5 py-2 bg-white/90 backdrop-blur-sm border border-rule rounded-lg">
            <span className="font-cinzel text-xs text-espresso whitespace-nowrap">{selectedGarment?.label ?? garment}</span>
            <span className="text-rule">·</span>
            <span className="font-inter text-[10px] tracking-nav text-text-muted uppercase whitespace-nowrap truncate max-w-[160px] sm:max-w-none">
              {selectedFabric?.label ?? fabric} · {selectedColour?.label ?? colour}
            </span>
          </div>

          {/* Live price — top right */}
          <div className="absolute top-4 right-4 sm:right-6 z-10 flex items-baseline gap-1.5 px-3.5 py-2 bg-white/90 backdrop-blur-sm border border-rule rounded-lg">
            <span className="font-cinzel text-sm text-accent-warm">£{ppu.toFixed(2)}</span>
            <span className="font-inter text-[9px] text-text-light uppercase whitespace-nowrap">/unit · {qty} units</span>
          </div>

          {/* Rotate hint */}
          {MODELS_READY && (
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
              <div className="grid grid-cols-5 gap-2.5 mb-5">
                {COLOURS.map(c => (
                  <div key={c.hex} className="flex flex-col items-center gap-1">
                    <button onClick={() => setColour(c.hex)} title={c.label}
                      className={`w-9 h-9 border-2 transition-all duration-200 ${
                        colour === c.hex ? 'border-espresso scale-110 shadow-sm' : 'border-rule hover:border-espresso/40'
                      }`}
                      style={{ backgroundColor: c.hex }} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 p-3 border border-rule">
                <div className="w-8 h-8 border border-rule shrink-0" style={{ backgroundColor: colour }} />
                <div className="min-w-0">
                  <p className="font-cinzel text-xs text-espresso truncate">{selectedColour?.label ?? colour}</p>
                  <p className="font-inter text-[10px] text-text-light">{colour}</p>
                </div>
              </div>
            </ConfigPanel>
          )}

          {activePanel === 'logo' && (
            <ConfigPanel title="Logo & Placement" onClose={() => setActivePanel(null)}>
              <div className="mb-5">
                {logoFile ? (
                  <div className="flex items-center gap-3 p-3 border border-accent-warm/40 bg-accent-warm/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="logo preview" className="w-11 h-11 object-contain border border-rule bg-white p-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-xs text-espresso truncate">{logoFile.name}</p>
                      <p className="font-inter text-[10px] text-text-muted mt-0.5">{(logoFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={clearLogo} aria-label="Remove logo" className="text-text-muted hover:text-red-500 transition-colors shrink-0">
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <label className="relative flex flex-col items-center justify-center gap-2.5 p-6 border-2 border-dashed border-rule hover:border-accent-warm/50 bg-white cursor-pointer transition-all duration-200">
                    <input type="file" accept=".png,.jpg,.jpeg,.svg,.webp" onChange={handleLogoInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Upload className="w-5 h-5 text-text-light" strokeWidth={1.5} />
                    <div className="text-center">
                      <p className="font-inter text-xs text-espresso mb-1">Upload your graphic</p>
                      <p className="font-inter text-[9px] tracking-nav text-text-light uppercase">PNG · SVG · JPG · WEBP</p>
                    </div>
                  </label>
                )}
              </div>

              <p className="font-inter text-[9px] tracking-nav text-text-light uppercase mb-2.5">Placement</p>
              <div className="space-y-2.5">
                {PLACEMENTS.map(p => (
                  <label key={p.id}
                    className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-200 ${
                      placement === p.id ? 'border-espresso bg-espresso text-cream' : 'border-rule bg-white hover:border-espresso/40'
                    }`}>
                    <input type="radio" name="placement" value={p.id} checked={placement === p.id}
                      onChange={() => setPlacement(p.id)} className="sr-only" />
                    <div className={`w-3.5 h-3.5 border shrink-0 flex items-center justify-center transition-colors ${
                      placement === p.id ? 'border-cream/40' : 'border-rule'
                    }`}>
                      {placement === p.id && <div className="w-1.5 h-1.5 bg-cream" />}
                    </div>
                    <div>
                      <p className={`font-cinzel text-xs ${placement === p.id ? 'text-cream' : 'text-espresso'}`}>{p.label}</p>
                      <p className={`font-inter text-[10px] mt-0.5 ${placement === p.id ? 'text-cream/60' : 'text-text-muted'}`}>{p.note}</p>
                    </div>
                  </label>
                ))}
              </div>
            </ConfigPanel>
          )}

          {activePanel === 'quantity' && (
            <ConfigPanel title="Quantity & Pricing" onClose={() => setActivePanel(null)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(q => Math.max(50, q - 10))} aria-label="Decrease quantity"
                    className="w-6 h-6 border border-rule flex items-center justify-center hover:border-espresso transition-colors">
                    <Minus size={11} strokeWidth={1.5} />
                  </button>
                  <div className="text-center w-14">
                    <p className="font-cinzel text-xl text-espresso leading-none">{qty}</p>
                    <p className="font-inter text-[8px] text-text-light uppercase tracking-nav">units</p>
                  </div>
                  <button onClick={() => setQty(q => Math.min(1000, q + 10))} aria-label="Increase quantity"
                    className="w-6 h-6 border border-rule flex items-center justify-center hover:border-espresso transition-colors">
                    <Plus size={11} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-cinzel text-xl text-accent-warm leading-none">£{ppu.toFixed(2)}</p>
                  <p className="font-inter text-[8px] text-text-light uppercase tracking-nav">per unit</p>
                </div>
              </div>

              <input
                type="range" min={50} max={1000} step={10}
                value={qty} onChange={e => setQty(Number(e.target.value))}
                className="w-full h-0.5 bg-rule appearance-none cursor-pointer mb-5"
                style={{ accentColor: '#1B3D2A' }}
              />

              <button onClick={() => setShowBreakdown(v => !v)}
                className="flex items-center justify-between w-full font-inter text-[10px] tracking-nav text-text-muted hover:text-espresso uppercase transition-colors mb-3 pb-3 border-b border-rule-light">
                Full breakdown {showBreakdown ? <ChevronUp size={12} strokeWidth={1.5} /> : <ChevronDown size={12} strokeWidth={1.5} />}
              </button>

              {showBreakdown && (
                <div className="mb-5">
                  {[
                    [`${qty} × £${ppu.toFixed(2)} per unit`, `£${totalGBP}`],
                    ['UK Import Duty', '£0.00 — DFQF'],
                    ['Est. shipping (air freight)', 'TBC on quote'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-rule-light last:border-0">
                      <span className="font-inter text-[11px] text-text-muted">{label}</span>
                      <span className="font-inter text-[11px] text-espresso font-medium">{val}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2.5 mt-2 bg-espresso">
                    <span className="font-cinzel text-xs text-cream">Estimated Total</span>
                    <span className="font-cinzel text-sm text-accent-warm">£{totalGBP}</span>
                  </div>

                  <p className="font-inter text-[9px] tracking-nav text-text-light uppercase mt-4 mb-2">Volume tiers</p>
                  <div className="grid grid-cols-5 gap-px bg-rule">
                    {VOLUME_TIERS.map(([units, price]) => (
                      <div key={units} className={`p-1.5 text-center ${qty >= units ? 'bg-espresso' : 'bg-white'}`}>
                        <p className={`font-inter text-[7px] uppercase mb-0.5 ${qty >= units ? 'text-cream/50' : 'text-text-light'}`}>{units}+</p>
                        <p className={`font-cinzel text-[10px] ${qty >= units ? 'text-accent-warm' : 'text-text-muted'}`}>£{price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!showBreakdown && (
                <div className="flex items-center justify-between px-3 py-2.5 bg-espresso mb-1">
                  <span className="font-cinzel text-xs text-cream">Estimated Total</span>
                  <span className="font-cinzel text-sm text-accent-warm">£{totalGBP}</span>
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
                  No saved designs yet. Configure a garment and tap <Plus size={10} strokeWidth={2} className="inline -mt-0.5" /> to save it here.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {collection.map(entry => {
                    const g = GARMENT_TYPES.find(x => x.id === entry.garment);
                    const f = FABRICS.find(x => x.id === entry.fabric);
                    const c = COLOURS.find(x => x.hex === entry.colour);
                    return (
                      <div key={entry.id} className="flex items-center gap-3 border border-rule p-2.5">
                        <div className="relative w-11 h-11 border border-rule shrink-0 overflow-hidden" style={{ backgroundColor: entry.colour }}>
                          {entry.logoPreviewUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={entry.logoPreviewUrl} alt="" className="absolute inset-0 w-full h-full object-contain p-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-cinzel text-xs text-espresso truncate">{g?.label ?? entry.garment}</p>
                          <p className="font-inter text-[10px] text-text-muted truncate">{f?.label ?? entry.fabric} · {c?.label ?? entry.colour} · {entry.qty}u</p>
                        </div>
                        <button onClick={() => removeFromCollection(entry.id)} aria-label="Remove from collection"
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

          {/* ── Floating dock ── */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-1 bg-espresso rounded-2xl px-2 py-2 shadow-xl">
              {DOCK_ITEMS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => togglePanel(id)} title={label} aria-label={label}
                  aria-pressed={activePanel === id}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-150 ${
                    activePanel === id ? 'bg-accent-warm text-cream' : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
                  }`}>
                  <Icon size={17} strokeWidth={1.5} />
                </button>
              ))}

              <div className="w-px h-6 bg-cream/15 mx-1.5" />

              <button onClick={addToCollection} title="Add to collection" aria-label="Add to collection"
                aria-pressed={showCollection}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-150 ${
                  showCollection ? 'bg-accent-warm text-cream' : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
                }`}>
                <BookmarkPlus size={17} strokeWidth={1.5} />
              </button>

              <div className="w-px h-6 bg-cream/15 mx-1.5" />

              <Link href={quoteHref} title="Request a Quote"
                className="flex items-center gap-1.5 h-10 pl-4 pr-3.5 rounded-lg bg-accent-warm text-cream font-inter text-[11px] tracking-nav uppercase hover:bg-accent-warm/90 transition-colors duration-150 whitespace-nowrap">
                Quote <ArrowRight size={13} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense>
      <ConfigurePageInner />
    </Suspense>
  );
}
