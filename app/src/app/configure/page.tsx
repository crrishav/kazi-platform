'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Check, ArrowRight, ArrowLeft } from 'lucide-react';
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

const STEPS = ['Pattern', 'Fabric', 'Colour', 'Logo', 'Quantity'];

function pricePerUnit(qty: number): number {
  if (qty >= 1000) return 3.20;
  if (qty >= 500)  return 4.50;
  if (qty >= 200)  return 6.00;
  if (qty >= 100)  return 7.80;
  return 10.20;
}

function ConfigurePageInner() {
  useSmoothScroll();
  const searchParams = useSearchParams();
  const [step, setStep]           = useState(1);
  const [inputMode, setInputMode] = useState<'upload' | 'standard'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver]   = useState(false);
  const [garment, setGarment]     = useState<string>('t-shirt');
  const [fabric, setFabric]       = useState<string>('cotton-180');
  const [colour, setColour]       = useState<string>('#E8E0D0');
  const [placement, setPlacement] = useState<string>('front-chest');
  const [logoFile, setLogoFile]   = useState<File | null>(null);
  const [logoUrl, setLogoUrl]     = useState<string | undefined>(undefined);
  const [qty, setQty]             = useState<number>(100);

  // Pre-fill garment and colour from query params (e.g. /configure?garment=hoodie&colour=%231B3D2A)
  useEffect(() => {
    const g = searchParams.get('garment');
    if (g && GARMENT_TYPES.some(gt => gt.id === g)) {
      setGarment(g);
      setInputMode('standard');
    }
    const c = searchParams.get('colour');
    if (c && COLOURS.some(col => col.hex.toLowerCase() === c.toLowerCase())) {
      setColour(c);
    }
  }, [searchParams]);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setUploadedFile(file);
  }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
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

  const selectedColour = COLOURS.find(c => c.hex === colour);
  const selectedFabric = FABRICS.find(f => f.id === fabric);
  const selectedGarment = GARMENT_TYPES.find(g => g.id === garment);
  const ppu      = pricePerUnit(qty);
  const totalGBP = (ppu * qty).toFixed(2);

  return (
    <main className="min-h-screen bg-cream">
      <Navigation />

      <div className="pt-36 pb-16 px-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10 border-b border-rule pb-8">
          <p className="font-inter text-xs tracking-nav text-text-muted uppercase mb-3">3D Configurator</p>
          <h1 className="font-cinzel text-3xl md:text-5xl text-espresso mb-3">
            Design Your Collection
          </h1>
          <p className="font-inter text-text-muted text-base max-w-lg">
            Configure your garment in 3D before a single stitch is made.
          </p>
        </div>

        {/* Step progress */}
        <div className="flex items-center mb-12 overflow-x-auto pb-1">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const isActive = step === n;
            const isDone   = step > n;
            return (
              <button key={n} onClick={() => setStep(n)}
                className={`flex items-center gap-0 shrink-0 ${i < 4 ? 'flex-1' : ''}`}>
                <div className={`flex items-center gap-2.5 px-3.5 py-2.5 border font-inter text-[10px] tracking-nav uppercase whitespace-nowrap transition-all duration-200 ${
                  isActive ? 'border-espresso bg-espresso text-cream'
                  : isDone  ? 'border-accent-warm/50 bg-transparent text-accent-warm'
                  :           'border-rule bg-transparent text-text-light hover:text-espresso hover:border-espresso/30'
                }`}>
                  <span className={`w-4 h-4 flex items-center justify-center text-[9px] border transition-colors ${
                    isActive ? 'border-cream/40 text-cream'
                    : isDone  ? 'border-accent-warm text-accent-warm'
                    :           'border-rule text-text-light'
                  }`}>{isDone ? '✓' : n}</span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < 4 && (
                  <div className={`h-px flex-1 transition-colors duration-200 ${
                    isDone ? 'bg-accent-warm/40' : 'bg-rule'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── LEFT: Config panels ── */}
          <div>

            {/* STEP 1 — Pattern */}
            {step === 1 && (
              <div>
                <h2 className="font-cinzel text-xl text-espresso mb-1">Your Pattern</h2>
                <p className="font-inter text-sm text-text-muted mb-6">
                  Upload your 2D tech pack for a custom 3D render within 24 hours, or configure from a standard base garment now.
                </p>

                {/* Mode toggle */}
                <div className="flex gap-0 mb-6 border border-rule">
                  {(['upload', 'standard'] as const).map(mode => (
                    <button key={mode} onClick={() => setInputMode(mode)}
                      className={`flex-1 py-2.5 font-inter text-xs tracking-nav uppercase transition-all duration-200 ${
                        inputMode === mode
                          ? 'bg-espresso text-cream'
                          : 'bg-transparent text-text-muted hover:text-espresso'
                      }`}>
                      {mode === 'upload' ? 'Upload Pattern' : 'Standard Garment'}
                    </button>
                  ))}
                </div>

                {inputMode === 'upload' && (
                  <div>
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleFileDrop}
                      className={`relative border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer ${
                        dragOver        ? 'border-accent-warm bg-accent-warm/5'
                        : uploadedFile  ? 'border-accent-warm/60 bg-accent-warm/5'
                        :                 'border-rule hover:border-accent-warm/50 bg-white'
                      }`}
                    >
                      <input type="file" accept=".dxf,.pdf,.ai,.svg,.png,.jpg,.jpeg,.zip"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {uploadedFile ? (
                        <div>
                          <div className="w-10 h-10 border border-accent-warm/40 flex items-center justify-center mx-auto mb-3">
                            <Check className="w-5 h-5 text-accent-warm" strokeWidth={1.5} />
                          </div>
                          <p className="font-inter text-sm text-espresso font-medium mb-0.5">{uploadedFile.name}</p>
                          <p className="font-inter text-xs text-text-muted">{(uploadedFile.size / 1024).toFixed(0)} KB · Pattern received</p>
                          <p className="mt-3 font-inter text-[10px] tracking-nav text-accent-warm uppercase">
                            3D render sent within 24 hours
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="w-10 h-10 border border-rule flex items-center justify-center mx-auto mb-3">
                            <Upload className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                          </div>
                          <p className="font-inter text-sm text-espresso mb-1">Drop your tech pack here</p>
                          <p className="font-inter text-xs text-text-muted mb-3">or click to browse</p>
                          <p className="font-inter text-[10px] tracking-nav text-text-light uppercase">
                            DXF · PDF · AI · SVG · PNG · ZIP
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-5 border border-rule bg-white">
                      <p className="font-inter text-[10px] tracking-nav text-text-light uppercase mb-3">What happens next</p>
                      <ul className="font-inter text-xs text-text-muted space-y-2">
                        <li className="flex items-start gap-2"><span className="text-accent-warm mt-0.5">→</span> Your pattern file is securely sent to our production team</li>
                        <li className="flex items-start gap-2"><span className="text-accent-warm mt-0.5">→</span> We reconstruct it in 3D using professional garment software</li>
                        <li className="flex items-start gap-2"><span className="text-accent-warm mt-0.5">→</span> You receive a render for approval within 24 hours</li>
                      </ul>
                    </div>
                  </div>
                )}

                {inputMode === 'standard' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GARMENT_TYPES.map(g => (
                      <button key={g.id} onClick={() => setGarment(g.id)}
                        className={`relative p-6 text-left border transition-all duration-200 ${
                          garment === g.id
                            ? 'border-espresso bg-espresso text-cream'
                            : 'border-rule bg-white hover:border-espresso/40 text-espresso'
                        }`}>
                        <p className={`font-inter text-[9px] tracking-nav uppercase mb-3 ${garment === g.id ? 'text-cream/50' : 'text-text-light'}`}>{g.code}</p>
                        <p className="font-cinzel text-base mb-1">{g.label}</p>
                        <p className={`font-inter text-xs ${garment === g.id ? 'text-cream/60' : 'text-text-muted'}`}>{g.desc}</p>
                        {garment === g.id && (
                          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent-warm" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={inputMode === 'upload' && !uploadedFile}
                  className="mt-8 flex items-center gap-2 bg-espresso text-cream font-inter text-xs tracking-button uppercase px-8 py-3 hover:bg-accent-warm disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next: Fabric <ArrowRight size={13} strokeWidth={1.5} />
                </button>
              </div>
            )}

            {/* STEP 2 — Fabric */}
            {step === 2 && (
              <div>
                <h2 className="font-cinzel text-xl text-espresso mb-6">Choose Fabric</h2>
                <div className="space-y-3">
                  {FABRICS.map(f => (
                    <button key={f.id} onClick={() => setFabric(f.id)}
                      className={`w-full p-5 text-left border flex items-center justify-between transition-all duration-200 ${
                        fabric === f.id
                          ? 'border-espresso bg-espresso text-cream'
                          : 'border-rule bg-white hover:border-espresso/40'
                      }`}>
                      <div>
                        <p className={`font-inter text-[9px] tracking-nav uppercase mb-1 ${fabric === f.id ? 'text-cream/50' : 'text-text-light'}`}>{f.code}</p>
                        <p className={`font-cinzel text-sm mb-0.5 ${fabric === f.id ? 'text-cream' : 'text-espresso'}`}>{f.label}</p>
                        <p className={`font-inter text-xs ${fabric === f.id ? 'text-cream/60' : 'text-text-muted'}`}>{f.detail}</p>
                      </div>
                      <span className={`font-inter text-xs border px-2.5 py-1 shrink-0 ml-4 transition-colors ${
                        fabric === f.id ? 'border-cream/30 text-cream' : 'border-rule text-text-muted'
                      }`}>{f.spec}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 border border-rule text-text-muted font-inter text-xs tracking-button uppercase px-5 py-3 hover:border-espresso hover:text-espresso transition-all duration-200">
                    <ArrowLeft size={13} strokeWidth={1.5} /> Back
                  </button>
                  <button onClick={() => setStep(3)} className="flex items-center gap-2 bg-espresso text-cream font-inter text-xs tracking-button uppercase px-8 py-3 hover:bg-accent-warm transition-colors duration-200">
                    Next: Colour <ArrowRight size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — Colour */}
            {step === 3 && (
              <div>
                <h2 className="font-cinzel text-xl text-espresso mb-6">Choose Colour</h2>
                <div className="grid grid-cols-6 gap-3 mb-6">
                  {COLOURS.map(c => (
                    <div key={c.hex} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setColour(c.hex)}
                        title={c.label}
                        className={`w-9 h-9 border-2 transition-all duration-200 ${
                          colour === c.hex ? 'border-espresso scale-110 shadow-md' : 'border-rule hover:border-espresso/40'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-inter text-[9px] text-text-light text-center leading-tight">{c.label}</span>
                    </div>
                  ))}
                </div>
                {/* Selected colour preview */}
                <div className="flex items-center gap-4 p-4 border border-rule bg-white mb-6">
                  <div className="w-10 h-10 border border-rule shrink-0" style={{ backgroundColor: colour }} />
                  <div>
                    <p className="font-inter text-[9px] tracking-nav text-text-light uppercase">Selected colour</p>
                    <p className="font-cinzel text-sm text-espresso">{selectedColour?.label ?? colour}</p>
                    <p className="font-inter text-xs text-text-light">{colour}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 border border-rule text-text-muted font-inter text-xs tracking-button uppercase px-5 py-3 hover:border-espresso hover:text-espresso transition-all duration-200">
                    <ArrowLeft size={13} strokeWidth={1.5} /> Back
                  </button>
                  <button onClick={() => setStep(4)} className="flex items-center gap-2 bg-espresso text-cream font-inter text-xs tracking-button uppercase px-8 py-3 hover:bg-accent-warm transition-colors duration-200">
                    Next: Logo <ArrowRight size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 — Logo */}
            {step === 4 && (
              <div>
                <h2 className="font-cinzel text-xl text-espresso mb-1">Logo &amp; Placement</h2>
                <p className="font-inter text-sm text-text-muted mb-6">Upload your graphic — PNG or SVG with transparency works best.</p>

                <div className="mb-6">
                  {logoFile ? (
                    <div className="flex items-center gap-4 p-4 border border-accent-warm/40 bg-accent-warm/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoUrl} alt="logo preview" className="w-14 h-14 object-contain border border-rule bg-white p-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm text-espresso truncate">{logoFile.name}</p>
                        <p className="font-inter text-xs text-text-muted mt-0.5">{(logoFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button onClick={clearLogo}
                        className="font-inter text-xs tracking-nav text-text-muted hover:text-red-500 uppercase shrink-0 transition-colors">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-rule hover:border-accent-warm/50 bg-white cursor-pointer transition-all duration-200">
                      <input type="file" accept=".png,.jpg,.jpeg,.svg,.webp" onChange={handleLogoInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <Upload className="w-5 h-5 text-text-light" strokeWidth={1.5} />
                      <div className="text-center">
                        <p className="font-inter text-sm text-espresso mb-1">Upload your graphic</p>
                        <p className="font-inter text-[10px] tracking-nav text-text-light uppercase">PNG · SVG · JPG · WEBP</p>
                      </div>
                    </label>
                  )}
                </div>

                <p className="font-inter text-[9px] tracking-nav text-text-light uppercase mb-3">Placement</p>
                <div className="space-y-3 mb-8">
                  {PLACEMENTS.map(p => (
                    <label key={p.id}
                      className={`flex items-center gap-4 p-5 border cursor-pointer transition-all duration-200 ${
                        placement === p.id
                          ? 'border-espresso bg-espresso text-cream'
                          : 'border-rule bg-white hover:border-espresso/40'
                      }`}>
                      <input type="radio" name="placement" value={p.id} checked={placement === p.id}
                        onChange={() => setPlacement(p.id)} className="sr-only" />
                      <div className={`w-4 h-4 border shrink-0 flex items-center justify-center transition-colors ${
                        placement === p.id ? 'border-cream/40' : 'border-rule'
                      }`}>
                        {placement === p.id && <div className="w-2 h-2 bg-cream" />}
                      </div>
                      <div>
                        <p className={`font-cinzel text-sm ${placement === p.id ? 'text-cream' : 'text-espresso'}`}>{p.label}</p>
                        <p className={`font-inter text-xs mt-0.5 ${placement === p.id ? 'text-cream/60' : 'text-text-muted'}`}>{p.note}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="flex items-center gap-2 border border-rule text-text-muted font-inter text-xs tracking-button uppercase px-5 py-3 hover:border-espresso hover:text-espresso transition-all duration-200">
                    <ArrowLeft size={13} strokeWidth={1.5} /> Back
                  </button>
                  <button onClick={() => setStep(5)} className="flex items-center gap-2 bg-espresso text-cream font-inter text-xs tracking-button uppercase px-8 py-3 hover:bg-accent-warm transition-colors duration-200">
                    Next: Quantity <ArrowRight size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5 — Quantity */}
            {step === 5 && (
              <div>
                <h2 className="font-cinzel text-xl text-espresso mb-6">Quantity &amp; Pricing</h2>

                {/* Qty slider panel */}
                <div className="p-6 border border-rule bg-white mb-5">
                  <div className="flex items-end justify-between mb-5">
                    <div>
                      <p className="font-inter text-[9px] tracking-nav text-text-light uppercase mb-1">Units</p>
                      <p className="font-cinzel text-4xl text-espresso">{qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-inter text-[9px] tracking-nav text-text-light uppercase mb-1">Per unit</p>
                      <p className="font-cinzel text-4xl text-accent-warm">£{ppu.toFixed(2)}</p>
                    </div>
                  </div>
                  <input
                    type="range" min={50} max={1000} step={10}
                    value={qty} onChange={e => setQty(Number(e.target.value))}
                    className="w-full h-0.5 bg-rule appearance-none cursor-pointer accent-espresso mb-2"
                    style={{ accentColor: '#1B3D2A' }}
                  />
                  <div className="flex justify-between font-inter text-[9px] text-text-light tracking-wide">
                    <span>50</span><span>200</span><span>500</span><span>1,000</span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="border border-rule overflow-hidden mb-8">
                  <div className="flex justify-between px-5 py-2.5 border-b border-rule bg-cream">
                    <span className="font-inter text-[9px] tracking-nav text-text-light uppercase">Breakdown</span>
                    <span className="font-inter text-[9px] tracking-nav text-text-light uppercase">GBP</span>
                  </div>
                  {[
                    [`${qty} × £${ppu.toFixed(2)} per unit`, `£${totalGBP}`],
                    ['UK Import Duty',             '£0.00 — DFQF'],
                    ['Est. shipping (air freight)', 'TBC on quote'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between px-5 py-3.5 border-b border-rule last:border-0 bg-white">
                      <span className="font-inter text-sm text-text-muted">{label}</span>
                      <span className="font-inter text-sm text-espresso font-medium">{val}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-5 py-4 bg-espresso">
                    <span className="font-cinzel text-sm text-cream">Estimated Total</span>
                    <span className="font-cinzel text-xl text-accent-warm">£{totalGBP}</span>
                  </div>
                </div>

                {/* Volume tiers */}
                <div className="grid grid-cols-5 gap-px bg-rule mb-8">
                  {[[50, 10.20], [100, 7.80], [200, 6.00], [500, 4.50], [1000, 3.20]].map(([units, price]) => (
                    <div key={units} className={`p-3 text-center ${qty >= units ? 'bg-espresso' : 'bg-white'}`}>
                      <p className={`font-inter text-[9px] tracking-nav uppercase mb-1 ${qty >= units ? 'text-cream/50' : 'text-text-light'}`}>{units}+</p>
                      <p className={`font-cinzel text-sm ${qty >= units ? 'text-accent-warm' : 'text-text-muted'}`}>£{(price as number).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(4)} className="flex items-center gap-2 border border-rule text-text-muted font-inter text-xs tracking-button uppercase px-5 py-3 hover:border-espresso hover:text-espresso transition-all duration-200">
                    <ArrowLeft size={13} strokeWidth={1.5} /> Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: 3D Preview ── */}
          <div className="lg:sticky lg:top-28 self-start">

            {/* Status bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 bg-white border border-rule border-b-0 overflow-x-auto">
              {[
                selectedGarment?.label ?? garment,
                selectedFabric?.label ?? fabric,
                selectedColour?.label ?? colour,
                `${qty} units`,
              ].map((v, i) => (
                <span key={i} className="font-inter text-[10px] tracking-nav text-text-muted uppercase whitespace-nowrap flex items-center gap-2">
                  {i > 0 && <span className="text-rule/60">·</span>}
                  {v}
                </span>
              ))}
            </div>

            {/* Canvas frame */}
            <div className="relative bg-white border border-rule overflow-hidden" style={{ minHeight: 460 }}>
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-accent-warm z-10 pointer-events-none" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-accent-warm z-10 pointer-events-none" />
              <div className="absolute bottom-[88px] left-0 w-5 h-5 border-b-2 border-l-2 border-accent-warm z-10 pointer-events-none" />
              <div className="absolute bottom-[88px] right-0 w-5 h-5 border-b-2 border-r-2 border-accent-warm z-10 pointer-events-none" />

              {/* Label */}
              <div className="absolute top-3 left-4 z-10">
                <span className="font-inter text-[9px] tracking-nav text-text-light uppercase">3D Preview</span>
              </div>

              {/* Canvas */}
              <div style={{ height: 360 }}>
                {MODELS_READY && inputMode === 'standard' ? (
                  <GarmentViewer garment={garment} colour={colour} logoUrl={logoUrl} placement={placement} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-5">
                    <div className="relative w-20 h-28 opacity-20">
                      <div className="absolute inset-3 border border-espresso"
                        style={{ animation: 'slowRotate 20s linear infinite', transformStyle: 'preserve-3d' }} />
                    </div>
                    <p className="font-inter text-xs text-text-light">
                      {inputMode === 'upload' ? '3D render sent within 24 hours' : '3D preview loading'}
                    </p>
                  </div>
                )}
              </div>

              {/* Config state strip */}
              <div className="border-t border-rule px-5 py-4 bg-cream/60">
                <p className="font-inter text-[9px] tracking-nav text-text-light uppercase mb-3">Configuration</p>
                <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                  {[
                    ['Garment',    selectedGarment?.label ?? garment],
                    ['Fabric',     selectedFabric?.label  ?? fabric],
                    ['Colour',     selectedColour?.label  ?? colour],
                    ['Placement',  PLACEMENTS.find(p => p.id === placement)?.label ?? placement],
                    ['Quantity',   String(qty)],
                    ['Per unit',   `£${ppu.toFixed(2)}`],
                  ].map(([key, val]) => (
                    <div key={key}>
                      <p className="font-inter text-[8px] tracking-nav text-text-light uppercase">{key}</p>
                      <p className="font-inter text-xs text-espresso truncate">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={(() => {
                const selGarment = GARMENT_TYPES.find(g => g.id === garment);
                const selFabric  = FABRICS.find(f => f.id === fabric);
                const selColour  = COLOURS.find(c => c.hex === colour);
                const selPlace   = PLACEMENTS.find(p => p.id === placement);
                const productType = garment === 'hoodie' ? 'Hoodies' : 'T-Shirts';
                const qtyMap: Record<string, string> = { '50': '50–99', '100': '100–249', '200': '250–499', '500': '500–999', '1000': '1,000+' };
                const qtyRange = qty >= 1000 ? '1,000+' : qty >= 500 ? '500–999' : qty >= 250 ? '250–499' : qty >= 100 ? '100–249' : '50–99';
                const details = `Custom configuration: ${selGarment?.label ?? garment}, Fabric: ${selFabric?.label ?? fabric} (${selFabric?.spec ?? ''}), Colour: ${selColour?.label ?? colour}, Logo: ${selPlace?.label ?? placement}, Qty: ${qty} units, Est. total: £${(pricePerUnit(qty) * qty).toFixed(2)}`;
                const params = new URLSearchParams({ productType, qtyRange, details });
                return `/quote?${params.toString()}`;
              })()}
              className="mt-4 flex items-center justify-center gap-2 bg-espresso text-cream font-inter text-xs tracking-button uppercase py-4 hover:bg-accent-warm transition-colors duration-200">
              Request a Quote <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
            <p className="text-center font-inter text-[10px] text-text-light mt-3">
              No commitment required · Response within 24 hours
            </p>
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
