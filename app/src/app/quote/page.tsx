'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { Check, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import QtyStepper from '@/components/QtyStepper';
import { readQuoteDesigns, clearQuoteDesigns, type QuoteDesign } from '@/lib/quote-handoff';

const PRODUCT_TYPES = ['T-Shirts', 'Hoodies', 'Polo Shirts', 'Sweatshirts', 'Jackets', 'Other'];
const QTY_RANGES    = ['50–99', '100–249', '250–499', '500–999', '1,000+'];
const CUSTOM_QTY = 'Custom';

function QuotePageInner() {
  useSmoothScroll();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '',
    productType: '', qtyRange: '', qtyCustom: '', deadline: '',
    details: '',
  });
  const [studioDesigns, setStudioDesigns] = useState<QuoteDesign[]>([]);
  const [files,      setFiles]      = useState<File[]>([]);
  const [dragOver,   setDragOver]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');
  const supabase = createClient();

  const isStudioOrder = studioDesigns.length > 0;

  // A studio hand-off (sessionStorage — see lib/quote-handoff) means real designs with real
  // per-design quantities are already known, so it takes priority over the generic
  // product-type/qty-range prefill that a product page or the cart passes via query string.
  useEffect(() => {
    const designs = readQuoteDesigns();
    if (designs) {
      setStudioDesigns(designs);
      return;
    }
    const productType = searchParams.get('productType');
    const qtyRange    = searchParams.get('qtyRange');
    const details     = searchParams.get('details');
    if (productType || qtyRange || details) {
      setForm(prev => ({
        ...prev,
        ...(productType && PRODUCT_TYPES.includes(productType) ? { productType } : {}),
        ...(qtyRange && QTY_RANGES.includes(qtyRange) ? { qtyRange } : {}),
        ...(details ? { details } : {}),
      }));
    }
  }, [searchParams]);

  const set = (key: string, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  function updateDesignQty(id: string, qty: number) {
    setStudioDesigns(prev => prev.map(d => (d.id === id ? { ...d, qty } : d)));
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let customerId: string | null = null;
      const { data: existing } = await supabase
        .from('profiles').select('id').eq('email', form.email).single();
      if (existing) {
        customerId = existing.id;
      } else {
        const { data: np, error: pe } = await supabase
          .from('profiles')
          .insert({
            email:        form.email,
            full_name:    form.name,
            company_name: form.company || null,
            phone:        form.phone  || null,
            role:         'customer',
          })
          .select('id').single();
        if (pe) throw pe;
        customerId = np.id;
      }

      const quantity = isStudioOrder
        ? studioDesigns.reduce((sum, d) => sum + d.qty, 0)
        : (form.qtyRange === CUSTOM_QTY ? parseInt(form.qtyCustom, 10) || 0 : 0);

      const productType = isStudioOrder
        ? Array.from(new Set(studioDesigns.map(d => d.garmentLabel))).join(', ')
        : (form.productType || 'other');

      const designLines = isStudioOrder
        ? studioDesigns.map((d, i) => {
            const bits = [
              `${d.qty} × ${d.garmentLabel}`,
              d.fabricLabel,
              d.colourLabel,
              d.hasPattern ? 'custom pattern' : null,
              d.layerCount > 0 ? `${d.layerCount} artwork element${d.layerCount > 1 ? 's' : ''}` : null,
            ].filter(Boolean);
            return `Design ${i + 1}: ${bits.join(' · ')}`;
          }).join('\n')
        : null;

      const qtyLine = !isStudioOrder && form.qtyRange
        ? `Qty: ${form.qtyRange === CUSTOM_QTY ? (form.qtyCustom || 'custom') : form.qtyRange}`
        : null;

      const { data: quote, error: qe } = await supabase
        .from('quotes')
        .insert({
          customer_id:  customerId,
          product_type: productType,
          quantity,
          details: [
            designLines,
            qtyLine,
            form.deadline  ? `Deadline: ${form.deadline}` : null,
            form.details   || null,
          ].filter(Boolean).join('\n'),
          status: 'pending',
        })
        .select('id').single();
      if (qe) throw qe;

      for (const file of files) {
        const ext  = file.name.split('.').pop();
        const path = `${quote.id}/${Date.now()}.${ext}`;
        await supabase.storage.from('design-files').upload(path, file);
      }

      if (isStudioOrder) clearQuoteDesigns();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 border border-rule-light flex items-center justify-center mx-auto mb-8">
              <Check className="w-7 h-7 text-accent-warm" strokeWidth={1.5} />
            </div>
            <h1 className="font-cinzel text-3xl text-espresso mb-4">
              Request received
            </h1>
            <p className="font-inter text-text-muted text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Thank you, {form.name.split(' ')[0]}. Our team will review your enquiry and respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/"
                className="font-inter text-xs tracking-button uppercase text-text-muted hover:text-espresso transition-colors">
                ← Return home
              </Link>
              <Link href="/studio"
                className="font-inter text-xs tracking-button uppercase text-accent-warm hover:text-espresso transition-colors">
                Explore the Studio →
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Form */}
      <section className="pt-48 pb-16 px-6">
        <div className="max-w-4xl mx-auto">

          {isStudioOrder && (
            <Link href="/studio"
              className="inline-flex items-center gap-1.5 font-inter text-xs tracking-button uppercase text-text-muted hover:text-espresso transition-colors mb-8">
              <ArrowLeft size={13} strokeWidth={1.5} />
              Back to Studio
            </Link>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* LEFT — Contact */}
              <div>
                <h2 className="font-cinzel text-lg text-espresso mb-6">Your Details</h2>

                {error && (
                  <div className="mb-5 border border-red-200 bg-red-50 text-red-700 px-4 py-3 font-inter text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  {[
                    { label: 'Full Name *', key: 'name',    type: 'text',  required: true },
                    { label: 'Email *',     key: 'email',   type: 'email', required: true },
                    { label: 'Company',     key: 'company', type: 'text',  required: false },
                    { label: 'Phone',       key: 'phone',   type: 'tel',   required: false },
                  ].map(({ label, key, type, required }) => (
                    <div key={key}>
                      <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                        {label}
                      </label>
                      <input
                        type={type}
                        required={required}
                        value={(form as any)[key]}
                        onChange={e => set(key, e.target.value)}
                        className="w-full px-4 py-3 border border-rule bg-white font-inter text-sm text-text-primary focus:outline-none focus:border-accent-warm transition-colors duration-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — Project */}
              <div>
                <h2 className="font-cinzel text-lg text-espresso mb-6">Your Project</h2>

                <div className="space-y-5">
                  {isStudioOrder ? (
                    /* Designs — pulled straight from the studio's collection, each with its
                       own quantity, instead of a single product type + one shared qty. */
                    <div>
                      <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                        Your Designs
                      </label>
                      <div className="space-y-2.5">
                        {studioDesigns.map(d => (
                          <div key={d.id} className="border border-rule p-2.5">
                            {d.id === 'current' && (
                              <p className="font-inter text-[9px] tracking-nav text-accent-warm uppercase mb-1.5">Currently editing</p>
                            )}
                            <div className="flex items-center gap-3">
                              <div className="relative w-11 h-11 border border-rule shrink-0 overflow-hidden" style={{ backgroundColor: d.colourHex }}>
                                {d.patternThumb ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={d.patternThumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                ) : d.assetThumb && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={d.assetThumb} alt="" className="absolute inset-0 w-full h-full object-contain p-1" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-cinzel text-xs text-espresso truncate">{d.garmentLabel}</p>
                                <p className="font-inter text-[10px] text-text-muted truncate">
                                  {d.fabricLabel} · {d.colourLabel}
                                  {d.layerCount > 0 && ` · ${d.layerCount} asset${d.layerCount > 1 ? 's' : ''}`}
                                  {d.hasPattern && ' · pattern'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-rule-light">
                              <QtyStepper value={d.qty} onChange={(qty) => updateDesignQty(d.id, qty)} />
                              <span className="font-inter text-[9px] tracking-nav text-text-light uppercase">units</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="font-inter text-[10px] text-text-muted mt-2.5">
                        {studioDesigns.length} design{studioDesigns.length === 1 ? '' : 's'} · {studioDesigns.reduce((sum, d) => sum + d.qty, 0)} units total
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Product type */}
                      <div>
                        <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                          Product Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {PRODUCT_TYPES.map(pt => (
                            <button
                              key={pt} type="button"
                              onClick={() => set('productType', pt)}
                              className={`py-2.5 px-3 border font-inter text-xs transition-colors duration-200 text-left ${
                                form.productType === pt
                                  ? 'border-espresso bg-espresso text-cream'
                                  : 'border-rule text-text-muted hover:border-espresso/40'
                              }`}
                            >
                              {pt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Qty range */}
                      <div>
                        <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                          Estimated Quantity
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[...QTY_RANGES, CUSTOM_QTY].map(q => (
                            <button
                              key={q} type="button"
                              onClick={() => set('qtyRange', q)}
                              className={`py-2.5 border font-inter text-xs transition-colors duration-200 ${
                                form.qtyRange === q
                                  ? 'border-espresso bg-espresso text-cream'
                                  : 'border-rule text-text-muted hover:border-espresso/40'
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                        {form.qtyRange === CUSTOM_QTY && (
                          <input
                            type="number"
                            min={1}
                            placeholder="Exact quantity"
                            value={form.qtyCustom}
                            onChange={e => set('qtyCustom', e.target.value)}
                            className="mt-2 w-full px-4 py-3 border border-rule bg-white font-inter text-sm text-text-primary focus:outline-none focus:border-accent-warm transition-colors duration-200 placeholder:text-text-light"
                          />
                        )}
                      </div>
                    </>
                  )}

                  {/* Deadline */}
                  <div>
                    <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                      Desired Deadline <span className="normal-case text-text-light">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={e => set('deadline', e.target.value)}
                      className="w-full px-4 py-3 border border-rule bg-white font-inter text-sm text-text-primary focus:outline-none focus:border-accent-warm transition-colors duration-200"
                    />
                  </div>

                  {/* Specific instructions */}
                  <div>
                    <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                      Specific Instructions
                    </label>
                    <textarea
                      rows={4}
                      value={form.details}
                      onChange={e => set('details', e.target.value)}
                      placeholder="Fabric preferences, print method, special requirements, sustainability goals…"
                      className="w-full px-4 py-3 border border-rule bg-white font-inter text-sm text-text-primary focus:outline-none focus:border-accent-warm transition-colors duration-200 resize-none placeholder:text-text-light"
                    />
                  </div>

                  {/* File upload — generic enquiries only; a studio order already carries its
                      designs from the collection above. */}
                  {!isStudioOrder && (
                    <div>
                      <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                        Design Files <span className="normal-case text-text-light">(optional)</span>
                      </label>
                      <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed p-6 text-center transition-colors duration-200 ${
                          dragOver ? 'border-accent-warm bg-accent-warm/5' : 'border-rule hover:border-rule-light'
                        }`}
                      >
                        <Upload className="w-5 h-5 text-text-light mx-auto mb-2" strokeWidth={1.5} />
                        <p className="font-inter text-xs text-text-muted mb-1">Drag & drop or</p>
                        <label className="cursor-pointer font-inter text-xs text-accent-warm hover:text-espresso transition-colors">
                          browse files
                          <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf,.ai,.psd,.svg"
                            onChange={e => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                            className="hidden" />
                        </label>
                        <p className="font-inter text-[10px] text-text-light mt-1">PNG · PDF · AI · SVG</p>
                      </div>
                      {files.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {files.map((f, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-2 bg-white border border-rule">
                              <span className="font-inter text-xs text-text-muted truncate max-w-[200px]">{f.name}</span>
                              <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                                className="font-inter text-xs text-text-light hover:text-red-500 transition-colors ml-2">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-12 pt-8 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="font-inter text-xs text-text-light max-w-sm leading-relaxed">
                By submitting you agree to our privacy policy. We&apos;ll only use your details to respond to your enquiry.
              </p>
              <button
                type="submit"
                disabled={submitting || !form.name || !form.email}
                className="flex items-center gap-2 bg-espresso text-cream font-inter text-xs tracking-button uppercase px-8 py-4 hover:bg-accent-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 shrink-0"
              >
                {submitting ? 'Sending…' : 'Submit Enquiry'}
                {!submitting && <ArrowRight size={14} strokeWidth={1.5} />}
              </button>
            </div>
          </form>

          {/* Alternate CTA */}
          <div className="mt-10 pt-8 border-t border-rule-light flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div>
              <p className="font-cinzel text-sm text-espresso mb-1">Need precise pricing?</p>
              <p className="font-inter text-xs text-text-muted">Use our interactive calculator to see per-unit costs instantly.</p>
            </div>
            <Link href="/pricing"
              className="shrink-0 font-inter text-xs tracking-button uppercase text-accent-warm hover:text-espresso border border-current px-5 py-2.5 transition-colors duration-200">
              Open Calculator →
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default function QuotePage() {
  return (
    <Suspense>
      <QuotePageInner />
    </Suspense>
  );
}
