'use client';

import { useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Check, FolderOpen, FileText } from 'lucide-react';

const TSHIRT_TIERS = [
  { minQty: 50,   maxQty: 99,   price: 8.50 },
  { minQty: 100,  maxQty: 249,  price: 6.50 },
  { minQty: 250,  maxQty: 499,  price: 5.00 },
  { minQty: 500,  maxQty: 999,  price: 4.00 },
  { minQty: 1000, maxQty: null, price: 3.20 },
];
const HOODIE_TIERS = [
  { minQty: 50,   maxQty: 99,   price: 18.00 },
  { minQty: 100,  maxQty: 249,  price: 14.50 },
  { minQty: 250,  maxQty: 499,  price: 12.00 },
  { minQty: 500,  maxQty: 999,  price: 10.00 },
  { minQty: 1000, maxQty: null, price: 8.50 },
];
const SIZES  = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const COLORS = [
  { name: 'Black',        hex: '#000000' },
  { name: 'White',        hex: '#FFFFFF' },
  { name: 'Navy',         hex: '#1a365d' },
  { name: 'Heather Grey', hex: '#9ca3af' },
  { name: 'Red',          hex: '#dc2626' },
  { name: 'Royal Blue',   hex: '#2563eb' },
  { name: 'Forest Green', hex: '#166534' },
  { name: 'Custom',       hex: null },
];

type ProductType = 'tshirt' | 'hoodie';

function getPricePerUnit(tiers: typeof TSHIRT_TIERS, qty: number) {
  return tiers.find(t => qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty))?.price ?? tiers[0].price;
}

export default function PricingQuoteSection() {
  const [productType, setProductType] = useState<ProductType>('tshirt');
  const [quantity,    setQuantity]    = useState(100);
  const [addOns, setAddOns] = useState({
    embroidery: false,
    embroiderySize: 'small',
    screenPrint: false,
    screenPrintColors: 1,
    dtgPrint: false,
  });

  const [formData, setFormData] = useState({
    name: '', email: '', company: '', phone: '',
    sizes: {} as Record<string, number>,
    colors: [] as string[],
    details: '',
  });
  const [files,      setFiles]      = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');

  const supabase = createClient();

  const tiers     = productType === 'tshirt' ? TSHIRT_TIERS : HOODIE_TIERS;
  const basePrice = getPricePerUnit(tiers, quantity);
  const addOnPrice = useMemo(() => {
    let total = 0;
    if (addOns.embroidery)  total += addOns.embroiderySize === 'small' ? 2.50 : 4.00;
    if (addOns.screenPrint) total += addOns.screenPrintColors * 1.50;
    if (addOns.dtgPrint)    total += 3.50;
    return total;
  }, [addOns]);
  const unitPrice  = basePrice + addOnPrice;
  const totalPrice = unitPrice * quantity;
  const savings    = useMemo(
    () => (tiers[0].price + addOnPrice - unitPrice) * quantity,
    [tiers, addOnPrice, unitPrice, quantity],
  );

  const toggleColor = (name: string) =>
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(name)
        ? prev.colors.filter(c => c !== name)
        : [...prev.colors, name],
    }));

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const totalFromSizes = Object.values(formData.sizes).reduce((a, b) => a + b, 0);
      const finalQty = totalFromSizes > 0 ? totalFromSizes : quantity;

      let customerId = null;
      const { data: existing } = await supabase
        .from('profiles').select('id').eq('email', formData.email).single();
      if (existing) {
        customerId = existing.id;
      } else {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            email: formData.email,
            full_name: formData.name,
            company_name: formData.company || null,
            phone: formData.phone || null,
            role: 'customer',
          })
          .select('id').single();
        if (profileError) throw profileError;
        customerId = newProfile.id;
      }

      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          customer_id: customerId,
          product_type: productType,
          quantity: finalQty,
          size_breakdown: formData.sizes,
          colors: formData.colors,
          details: [
            addOns.embroidery  ? `Embroidery (${addOns.embroiderySize})` : null,
            addOns.screenPrint ? `Screen print (${addOns.screenPrintColors} colour${addOns.screenPrintColors > 1 ? 's' : ''})` : null,
            addOns.dtgPrint    ? 'DTG print' : null,
            formData.details,
          ].filter(Boolean).join(' · '),
          quoted_price: unitPrice,
          status: 'pending',
        })
        .select('id').single();
      if (quoteError) throw quoteError;

      for (const file of files) {
        const ext  = file.name.split('.').pop();
        const path = `${quote.id}/${Date.now()}-${Math.random().toString(36).slice(7)}.${ext}`;
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
      <div className="border border-rule bg-white p-16 text-center">
        <div className="w-14 h-14 border border-accent-warm/40 flex items-center justify-center mx-auto mb-6">
          <Check className="w-7 h-7 text-accent-warm" strokeWidth={2.5} />
        </div>
        <p className="font-inter text-[11px] text-text-muted tracking-widest uppercase mb-3">
          Quote Submitted
        </p>
        <h3 className="font-cinzel text-2xl text-espresso mb-2">Quote submitted</h3>
        <p className="font-inter text-sm text-text-muted">We&apos;ll review your details and respond within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 border border-rule overflow-hidden">

      {/* LEFT — Calculator */}
      <div className="bg-cream/40 border-r border-rule">

        {/* Product type */}
        <div className="p-6 border-b border-rule">
          <label className="block font-inter text-[11px] font-medium uppercase tracking-widest text-text-muted mb-3">
            Product Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['tshirt', 'hoodie'] as ProductType[]).map(type => (
              <button
                key={type}
                onClick={() => setProductType(type)}
                className={`py-3 px-4 border font-inter text-sm font-medium tracking-wider uppercase transition-all duration-200 ${
                  productType === type
                    ? 'border-espresso bg-espresso text-cream'
                    : 'border-rule text-text-muted hover:border-espresso/40 hover:text-espresso'
                }`}
              >
                {type === 'tshirt' ? 'T-Shirts' : 'Hoodies'}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="p-6 border-b border-rule">
          <div className="flex justify-between items-baseline mb-4">
            <label className="font-inter text-[11px] font-medium uppercase tracking-widest text-text-muted">
              Quantity
            </label>
            <span className="font-inter text-2xl font-semibold text-espresso">
              {quantity.toLocaleString()}
              <span className="text-base font-normal text-text-muted ml-1">units</span>
            </span>
          </div>
          <input
            type="range" min="50" max="2000" step="10"
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value))}
            className="w-full h-px bg-rule appearance-none cursor-pointer accent-accent-warm"
          />
          <div className="flex justify-between font-inter text-[10px] text-text-light mt-2">
            <span>50</span><span>500</span><span>1000</span><span>2000</span>
          </div>
          <div className="flex mt-3 gap-1">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`flex-1 h-px transition-colors duration-200 ${
                  quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty)
                    ? 'bg-accent-warm' : 'bg-rule'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="p-6 border-b border-rule">
          <label className="block font-inter text-[11px] font-medium uppercase tracking-widest text-text-muted mb-3">
            Decoration Add-Ons
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-rule hover:border-accent-warm/40 cursor-pointer transition-colors duration-200">
              <input type="checkbox" checked={addOns.embroidery}
                onChange={e => setAddOns({ ...addOns, embroidery: e.target.checked })}
                className="w-4 h-4 accent-accent-warm" />
              <div className="flex-1 font-inter text-sm">
                <div className="font-medium text-text-primary">Embroidery</div>
                <div className="text-text-muted text-xs">+£{addOns.embroiderySize === 'small' ? '2.50' : '4.00'}/unit</div>
              </div>
              {addOns.embroidery && (
                <select value={addOns.embroiderySize}
                  onChange={e => setAddOns({ ...addOns, embroiderySize: e.target.value })}
                  className="font-inter text-sm bg-white border border-rule text-text-primary px-2 py-1">
                  <option value="small">Small</option>
                  <option value="large">Large</option>
                </select>
              )}
            </label>
            <label className="flex items-center gap-3 p-3 border border-rule hover:border-accent-warm/40 cursor-pointer transition-colors duration-200">
              <input type="checkbox" checked={addOns.screenPrint}
                onChange={e => setAddOns({ ...addOns, screenPrint: e.target.checked })}
                className="w-4 h-4 accent-accent-warm" />
              <div className="flex-1 font-inter text-sm">
                <div className="font-medium text-text-primary">Screen Print</div>
                <div className="text-text-muted text-xs">+£1.50/colour/unit</div>
              </div>
              {addOns.screenPrint && (
                <input type="number" min="1" max="6" value={addOns.screenPrintColors}
                  onChange={e => setAddOns({ ...addOns, screenPrintColors: parseInt(e.target.value) || 1 })}
                  className="w-14 font-inter text-sm bg-white border border-rule text-text-primary px-2 py-1 text-center" />
              )}
            </label>
            <label className="flex items-center gap-3 p-3 border border-rule hover:border-accent-warm/40 cursor-pointer transition-colors duration-200">
              <input type="checkbox" checked={addOns.dtgPrint}
                onChange={e => setAddOns({ ...addOns, dtgPrint: e.target.checked })}
                className="w-4 h-4 accent-accent-warm" />
              <div className="flex-1 font-inter text-sm">
                <div className="font-medium text-text-primary">DTG Print</div>
                <div className="text-text-muted text-xs">+£3.50/unit</div>
              </div>
            </label>
          </div>
        </div>

        {/* Price summary */}
        <div className="p-6 bg-white">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-inter text-[11px] text-text-muted uppercase tracking-widest">Per Unit</span>
            <span className="font-inter text-xl font-semibold text-espresso">£{unitPrice.toFixed(2)}</span>
          </div>
          {savings > 0 && (
            <div className="font-inter text-xs text-[#3A7D44] mb-3">↓ £{savings.toFixed(2)} saved vs. minimum tier</div>
          )}
          <div className="flex justify-between items-baseline pt-4 border-t border-rule">
            <span className="font-inter text-[11px] text-text-muted uppercase tracking-widest">Total Estimate</span>
            <span className="font-inter text-3xl font-semibold text-accent-warm">
              £{totalPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="font-inter text-[10px] text-text-light mt-2">
            * Excl. shipping, customs and packaging
          </p>
        </div>
      </div>

      {/* RIGHT — Quote form */}
      <div className="bg-white">
        <div className="p-6 border-b border-rule bg-cream/40">
          <p className="font-inter text-[11px] text-accent-warm tracking-widest uppercase mb-1">Request Quote</p>
          <h3 className="font-cinzel text-lg text-espresso">Submit your configuration</h3>
          <p className="font-inter text-xs text-text-muted mt-1">
            {quantity.toLocaleString()} × {productType === 'tshirt' ? 'T-Shirts' : 'Hoodies'} · £{unitPrice.toFixed(2)}/unit ·{' '}
            <span className="text-accent-warm">
              £{totalPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} est.
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 font-inter text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Name *',  type: 'text',  key: 'name',    required: true },
              { label: 'Email *', type: 'email', key: 'email',   required: true },
              { label: 'Company', type: 'text',  key: 'company', required: false },
              { label: 'Phone',   type: 'tel',   key: 'phone',   required: false },
            ].map(({ label, type, key, required }) => (
              <div key={key}>
                <label className="block font-inter text-[10px] font-medium text-text-muted mb-1 tracking-widest uppercase">{label}</label>
                <input type={type} required={required}
                  value={(formData as any)[key]}
                  onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 bg-cream/40 border border-rule text-text-primary font-inter text-sm focus:border-accent-warm focus:outline-none transition-colors duration-200" />
              </div>
            ))}
          </div>

          {/* Size breakdown */}
          <div>
            <label className="block font-inter text-[10px] font-medium text-text-muted mb-2 tracking-widest uppercase">
              Size Breakdown <span className="text-text-light normal-case tracking-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {SIZES.map(size => (
                <div key={size} className="text-center">
                  <label className="font-inter text-[10px] text-text-light block mb-1">{size}</label>
                  <input type="number" min="0"
                    value={formData.sizes[size] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, sizes: { ...prev.sizes, [size]: parseInt(e.target.value) || 0 } }))}
                    className="w-full px-1 py-1.5 bg-cream/40 border border-rule text-text-primary font-inter text-center text-xs focus:border-accent-warm focus:outline-none"
                    placeholder="0" />
                </div>
              ))}
            </div>
          </div>

          {/* Garment colours */}
          <div>
            <label className="block font-inter text-[10px] font-medium text-text-muted mb-2 tracking-widest uppercase">Garment Colours</label>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map(color => (
                <button key={color.name} type="button" onClick={() => toggleColor(color.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 border font-inter text-xs transition-all duration-200 ${
                    formData.colors.includes(color.name)
                      ? 'border-espresso bg-espresso text-cream'
                      : 'border-rule text-text-muted hover:border-espresso/40 hover:text-espresso'
                  }`}>
                  {color.hex && <span className="w-3 h-3 rounded-full border border-rule shrink-0" style={{ backgroundColor: color.hex }} />}
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block font-inter text-[10px] font-medium text-text-muted mb-2 tracking-widest uppercase">
              Design Files <span className="text-text-light normal-case tracking-normal">(PNG, JPG, PDF, AI, PSD)</span>
            </label>
            <div onDragOver={e => e.preventDefault()} onDrop={handleFileDrop}
              className="border border-dashed border-rule p-4 text-center hover:border-accent-warm/50 transition-colors duration-200 cursor-pointer">
              <FolderOpen className="w-5 h-5 text-text-light mx-auto mb-1.5" />
              <p className="font-inter text-xs text-text-muted mb-2">Drag & drop or</p>
              <label className="inline-block bg-cream/40 border border-rule text-text-muted px-3 py-1.5 cursor-pointer hover:border-espresso/40 hover:text-espresso transition-colors duration-200 font-inter text-xs font-medium">
                Browse
                <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf,.ai,.psd" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-cream/40 border border-rule px-3 py-2 font-inter text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-text-light" />
                      <span className="truncate max-w-[160px] text-text-muted">{file.name}</span>
                      <span className="text-text-light">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                    </div>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-text-light hover:text-accent-warm transition-colors duration-200 font-medium">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <label className="block font-inter text-[10px] font-medium text-text-muted mb-1 tracking-widest uppercase">Additional Details</label>
            <textarea rows={3} value={formData.details}
              onChange={e => setFormData({ ...formData, details: e.target.value })}
              placeholder="Deadline, fabric preferences, special instructions..."
              className="w-full px-3 py-2.5 bg-cream/40 border border-rule text-text-primary font-inter text-sm focus:border-accent-warm focus:outline-none resize-none placeholder:text-text-light transition-colors duration-200" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-espresso text-cream py-3.5 font-inter font-medium text-sm tracking-widest uppercase hover:bg-accent-warm disabled:opacity-40 transition-colors duration-200">
            {submitting
              ? 'Submitting...'
              : `Submit Quote — £${totalPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </button>
        </form>
      </div>
    </div>
  );
}
