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
      <div className="border border-[#1E1E24] bg-[#111114] p-16 text-center">
        <div className="w-14 h-14 border border-[#FF0000]/40 flex items-center justify-center mx-auto mb-6">
          <Check className="w-7 h-7 text-[#FF0000]" strokeWidth={2.5} />
        </div>
        <div
          className="text-[11px] text-[#FF0000] tracking-[0.2em] uppercase mb-3"
          style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}
        >
          QUOTE.SUBMITTED — REF PENDING
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Quote submitted</h3>
        <p className="text-gray-500">We&apos;ll review your details and respond within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 border border-[#1E1E24] overflow-hidden">

      {/* LEFT — Calculator */}
      <div className="bg-[#0D0D10] border-r border-[#1E1E24]">

        {/* Product type */}
        <div className="p-6 border-b border-[#1E1E24]">
          <label
            className="block text-[11px] font-semibold uppercase tracking-widest text-gray-600 mb-3"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}
          >
            PRODUCT TYPE
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['tshirt', 'hoodie'] as ProductType[]).map(type => (
              <button
                key={type}
                onClick={() => setProductType(type)}
                className={`py-3 px-4 border text-sm font-medium tracking-wider uppercase transition-all duration-200 ${
                  productType === type
                    ? 'border-[#FF0000] bg-[#FF0000]/10 text-[#FF0000]'
                    : 'border-[#1E1E24] text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                {type === 'tshirt' ? 'T-Shirts' : 'Hoodies'}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="p-6 border-b border-[#1E1E24]">
          <div className="flex justify-between items-baseline mb-4">
            <label
              className="text-[11px] font-semibold uppercase tracking-widest text-gray-600"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}
            >
              QUANTITY
            </label>
            <span className="text-2xl font-bold text-white stat-readout">
              {quantity.toLocaleString()}
              <span className="text-base font-normal text-gray-500 ml-1">units</span>
            </span>
          </div>
          <input
            type="range" min="50" max="2000" step="10"
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value))}
            className="w-full h-px bg-[#1E1E24] appearance-none cursor-pointer accent-[#FF0000]"
          />
          <div
            className="flex justify-between text-[10px] text-gray-600 mt-2"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}
          >
            <span>50</span><span>500</span><span>1000</span><span>2000</span>
          </div>
          <div className="flex mt-3 gap-1">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`flex-1 h-px transition-colors duration-200 ${
                  quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty)
                    ? 'bg-[#FF0000]' : 'bg-[#1E1E24]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="p-6 border-b border-[#1E1E24]">
          <label
            className="block text-[11px] font-semibold uppercase tracking-widest text-gray-600 mb-3"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}
          >
            DECORATION ADD-ONS
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-[#1E1E24] hover:border-[#FF0000]/30 cursor-pointer transition-colors duration-200">
              <input type="checkbox" checked={addOns.embroidery}
                onChange={e => setAddOns({ ...addOns, embroidery: e.target.checked })}
                className="w-4 h-4 accent-[#FF0000]" />
              <div className="flex-1 text-sm">
                <div className="font-medium text-gray-300">Embroidery</div>
                <div className="text-gray-600 text-xs stat-readout">+£{addOns.embroiderySize === 'small' ? '2.50' : '4.00'}/unit</div>
              </div>
              {addOns.embroidery && (
                <select value={addOns.embroiderySize}
                  onChange={e => setAddOns({ ...addOns, embroiderySize: e.target.value })}
                  className="text-sm bg-[#111114] border border-[#1E1E24] text-gray-300 px-2 py-1">
                  <option value="small">Small</option>
                  <option value="large">Large</option>
                </select>
              )}
            </label>
            <label className="flex items-center gap-3 p-3 border border-[#1E1E24] hover:border-[#FF0000]/30 cursor-pointer transition-colors duration-200">
              <input type="checkbox" checked={addOns.screenPrint}
                onChange={e => setAddOns({ ...addOns, screenPrint: e.target.checked })}
                className="w-4 h-4 accent-[#FF0000]" />
              <div className="flex-1 text-sm">
                <div className="font-medium text-gray-300">Screen Print</div>
                <div className="text-gray-600 text-xs stat-readout">+£1.50/colour/unit</div>
              </div>
              {addOns.screenPrint && (
                <input type="number" min="1" max="6" value={addOns.screenPrintColors}
                  onChange={e => setAddOns({ ...addOns, screenPrintColors: parseInt(e.target.value) || 1 })}
                  className="w-14 text-sm bg-[#111114] border border-[#1E1E24] text-gray-300 px-2 py-1 text-center" />
              )}
            </label>
            <label className="flex items-center gap-3 p-3 border border-[#1E1E24] hover:border-[#FF0000]/30 cursor-pointer transition-colors duration-200">
              <input type="checkbox" checked={addOns.dtgPrint}
                onChange={e => setAddOns({ ...addOns, dtgPrint: e.target.checked })}
                className="w-4 h-4 accent-[#FF0000]" />
              <div className="flex-1 text-sm">
                <div className="font-medium text-gray-300">DTG Print</div>
                <div className="text-gray-600 text-xs stat-readout">+£3.50/unit</div>
              </div>
            </label>
          </div>
        </div>

        {/* Price summary */}
        <div className="p-6 bg-[#111114]">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[11px] text-gray-600 uppercase tracking-widest"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>PER UNIT</span>
            <span className="text-xl font-bold text-white stat-readout">£{unitPrice.toFixed(2)}</span>
          </div>
          {savings > 0 && (
            <div className="text-xs text-green-500 mb-3 stat-readout">↓ £{savings.toFixed(2)} saved vs. minimum tier</div>
          )}
          <div className="flex justify-between items-baseline pt-4 border-t border-[#1E1E24]">
            <span className="text-[11px] text-gray-500 uppercase tracking-widest"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>TOTAL ESTIMATE</span>
            <span className="text-3xl font-bold text-[#FF0000] stat-readout">
              £{totalPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-gray-600 mt-2"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
            * EXCL. SHIPPING, CUSTOMS AND PACKAGING
          </p>
        </div>
      </div>

      {/* RIGHT — Quote form */}
      <div className="bg-[#0A0A0B]">
        <div className="p-6 border-b border-[#1E1E24] bg-[#111114]">
          <div className="text-[11px] text-[#FF0000] tracking-widest uppercase mb-1"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>REQUEST QUOTE</div>
          <h3 className="font-bold text-white">Submit your configuration</h3>
          <p className="text-xs text-gray-500 mt-1 stat-readout">
            {quantity.toLocaleString()} × {productType === 'tshirt' ? 'T-Shirts' : 'Hoodies'} · £{unitPrice.toFixed(2)}/unit ·{' '}
            <span className="text-[#FF0000]">
              £{totalPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} est.
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="border border-red-500/50 bg-red-900/20 text-red-400 px-4 py-3 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Name *',  type: 'text',  key: 'name',    required: true },
              { label: 'Email *', type: 'email', key: 'email',   required: true },
              { label: 'Company', type: 'text',  key: 'company', required: false },
              { label: 'Phone',   type: 'tel',   key: 'phone',   required: false },
            ].map(({ label, type, key, required }) => (
              <div key={key}>
                <label className="block text-[10px] font-medium text-gray-600 mb-1 tracking-widest uppercase"
                  style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>{label}</label>
                <input type={type} required={required}
                  value={(formData as any)[key]}
                  onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#111114] border border-[#1E1E24] text-white text-sm focus:border-[#FF0000]/60 focus:ring-1 focus:ring-[#FF0000]/30 outline-none transition-colors duration-200" />
              </div>
            ))}
          </div>

          {/* Size breakdown */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-2 tracking-widest uppercase"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
              SIZE BREAKDOWN <span className="text-gray-700 normal-case tracking-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {SIZES.map(size => (
                <div key={size} className="text-center">
                  <label className="text-[10px] text-gray-600 block mb-1"
                    style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>{size}</label>
                  <input type="number" min="0"
                    value={formData.sizes[size] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, sizes: { ...prev.sizes, [size]: parseInt(e.target.value) || 0 } }))}
                    className="w-full px-1 py-1.5 bg-[#111114] border border-[#1E1E24] text-white text-center text-xs focus:border-[#FF0000]/60 outline-none"
                    placeholder="0" />
                </div>
              ))}
            </div>
          </div>

          {/* Garment colours */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-2 tracking-widest uppercase"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>GARMENT COLOURS</label>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map(color => (
                <button key={color.name} type="button" onClick={() => toggleColor(color.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-xs transition-all duration-200 ${
                    formData.colors.includes(color.name)
                      ? 'border-[#FF0000] bg-[#FF0000]/10 text-white'
                      : 'border-[#1E1E24] text-gray-500 hover:border-gray-600 hover:text-gray-300'
                  }`}>
                  {color.hex && <span className="w-3 h-3 rounded-full border border-gray-700 shrink-0" style={{ backgroundColor: color.hex }} />}
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-2 tracking-widest uppercase"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
              DESIGN FILES <span className="text-gray-700 normal-case tracking-normal">(PNG, JPG, PDF, AI, PSD)</span>
            </label>
            <div onDragOver={e => e.preventDefault()} onDrop={handleFileDrop}
              className="border border-dashed border-[#1E1E24] p-4 text-center hover:border-[#FF0000]/40 transition-colors duration-200 cursor-pointer">
              <FolderOpen className="w-5 h-5 text-gray-600 mx-auto mb-1.5" />
              <p className="text-xs text-gray-600 mb-2">Drag & drop or</p>
              <label className="inline-block bg-[#111114] border border-[#1E1E24] text-gray-400 px-3 py-1.5 cursor-pointer hover:border-gray-600 hover:text-gray-200 transition-colors duration-200 text-xs font-medium">
                Browse
                <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf,.ai,.psd" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#111114] border border-[#1E1E24] px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-gray-600" />
                      <span className="truncate max-w-[160px] text-gray-400">{file.name}</span>
                      <span className="text-gray-600 stat-readout">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                    </div>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-gray-600 hover:text-[#FF0000] transition-colors duration-200 font-medium">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1 tracking-widest uppercase"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>ADDITIONAL DETAILS</label>
            <textarea rows={3} value={formData.details}
              onChange={e => setFormData({ ...formData, details: e.target.value })}
              placeholder="Deadline, fabric preferences, special instructions..."
              className="w-full px-3 py-2.5 bg-[#111114] border border-[#1E1E24] text-white text-sm focus:border-[#FF0000]/60 focus:ring-1 focus:ring-[#FF0000]/30 outline-none resize-none placeholder:text-gray-700 transition-colors duration-200" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-[#FF0000] text-white py-3.5 font-semibold text-sm tracking-widest uppercase hover:bg-red-500 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] disabled:opacity-40 transition-all duration-200">
            {submitting
              ? 'SUBMITTING...'
              : `SUBMIT QUOTE — £${totalPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </button>
        </form>
      </div>
    </div>
  );
}
