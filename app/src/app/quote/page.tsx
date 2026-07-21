'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { createClient } from '@/lib/supabase/client';
import { Check, Upload, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const PRODUCT_TYPES = ['T-Shirts', 'Hoodies', 'Polo Shirts', 'Sweatshirts', 'Jackets', 'Other'];
const QTY_RANGES    = ['50–99', '100–249', '250–499', '500–999', '1,000+'];

function QuotePageInner() {
  useSmoothScroll();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '',
    productType: '', qtyRange: '', deadline: '',
    details: '',
  });
  const [files,      setFiles]      = useState<File[]>([]);
  const [dragOver,   setDragOver]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');
  const supabase = createClient();

  // Pre-fill form from configurator query params
  useEffect(() => {
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

      const { data: quote, error: qe } = await supabase
        .from('quotes')
        .insert({
          customer_id:  customerId,
          product_type: form.productType || 'other',
          quantity:     0,
          details: [
            form.qtyRange  ? `Qty: ${form.qtyRange}` : null,
            form.deadline  ? `Deadline: ${form.deadline}` : null,
            form.details   || null,
          ].filter(Boolean).join(' · '),
          status: 'pending',
        })
        .select('id').single();
      if (qe) throw qe;

      for (const file of files) {
        const ext  = file.name.split('.').pop();
        const path = `${quote.id}/${Date.now()}.${ext}`;
        await supabase.storage.from('design-files').upload(path, file);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-cream">
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
              <Link href="/configure"
                className="font-inter text-xs tracking-button uppercase text-accent-warm hover:text-espresso transition-colors">
                Explore configurator →
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <Navigation />

      {/* Hero */}
      <section className="pt-40 pb-16 px-6 text-center border-b border-rule">
        <p className="font-inter text-xs tracking-nav text-text-muted uppercase mb-4">Custom Production</p>
        <h1 className="font-cinzel text-4xl md:text-5xl text-espresso mb-5 leading-tight">
          Begin Your Collection
        </h1>
        <p className="font-inter text-text-muted text-base max-w-xl mx-auto leading-relaxed">
          Tell us about your project and we&apos;ll respond with a detailed quote within 24 hours.
          No commitment required.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {['Minimum 50 units', '24-hr response', 'No obligation'].map(tag => (
            <div key={tag} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-accent-warm" />
              <span className="font-inter text-xs text-text-muted">{tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">

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
                    <div className="grid grid-cols-5 gap-2">
                      {QTY_RANGES.map(q => (
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
                  </div>

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

                  {/* Details */}
                  <div>
                    <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                      Project Details
                    </label>
                    <textarea
                      rows={4}
                      value={form.details}
                      onChange={e => set('details', e.target.value)}
                      placeholder="Fabric preferences, print method, special requirements, sustainability goals…"
                      className="w-full px-4 py-3 border border-rule bg-white font-inter text-sm text-text-primary focus:outline-none focus:border-accent-warm transition-colors duration-200 resize-none placeholder:text-text-light"
                    />
                  </div>

                  {/* File upload */}
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
