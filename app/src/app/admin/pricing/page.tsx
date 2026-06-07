'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import { Save } from 'lucide-react';

export default function AdminPricingPage() {
  const [tiers,   setTiers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null);
  const [saved,   setSaved]   = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { fetchTiers(); }, []);

  async function fetchTiers() {
    const { data } = await supabase
      .from('pricing_tiers').select('*')
      .order('product_type').order('min_qty');
    setTiers(data ?? []);
    setLoading(false);
  }

  function updateLocal(id: string, field: string, value: string) {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, [field]: parseFloat(value) || 0 } : t));
  }

  async function saveTier(id: string) {
    setSaving(id);
    const tier = tiers.find(t => t.id === id);
    await supabase.from('pricing_tiers').update({
      price_per_unit: tier.price_per_unit,
      min_qty:        tier.min_qty,
      max_qty:        tier.max_qty,
    }).eq('id', id);
    setSaving(null);
    setSaved(id);
    setTimeout(() => setSaved(null), 2000);
  }

  const grouped = tiers.reduce((acc: any, t: any) => {
    acc[t.product_type] = acc[t.product_type] ?? [];
    acc[t.product_type].push(t);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
      <Navigation />

      <div className="pt-28 pb-16 px-6 max-w-4xl mx-auto">

        <div className="mb-6">
          <Link href="/admin" className="text-xs text-gray-500 hover:text-[#E5232A] tracking-widest uppercase transition-colors"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>← Admin</Link>
        </div>

        <div className="mb-8">
          <p className="text-[11px] text-[#E5232A] tracking-[0.2em] uppercase mb-2"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>ADMIN — PRICING</p>
          <h1 className="font-cinzel text-3xl text-white">Pricing Tiers</h1>
          <p className="text-gray-500 text-sm mt-2 font-inter">Edit inline and save each row.</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([product, rows]: any) => (
              <div key={product}>
                <div className="text-[11px] text-[#E5232A] tracking-widest uppercase mb-3"
                  style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
                  {product.toUpperCase()}
                </div>
                <div className="border border-[#1E1E24] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1E1E24] bg-[#111114]">
                        {['Min Qty', 'Max Qty', 'Price / Unit (£)', ''].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-normal text-[10px] text-gray-500 tracking-widest uppercase"
                            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((tier: any) => (
                        <tr key={tier.id} className="border-b border-[#1E1E24] last:border-0">
                          <td className="px-5 py-3">
                            <input type="number" value={tier.min_qty}
                              onChange={e => updateLocal(tier.id, 'min_qty', e.target.value)}
                              className="w-24 bg-[#111114] border border-[#1E1E24] text-white px-2 py-1.5 text-sm focus:border-[#E5232A]/60 outline-none stat-readout" />
                          </td>
                          <td className="px-5 py-3">
                            <input type="number" value={tier.max_qty ?? ''}
                              onChange={e => updateLocal(tier.id, 'max_qty', e.target.value)}
                              placeholder="∞"
                              className="w-24 bg-[#111114] border border-[#1E1E24] text-white px-2 py-1.5 text-sm focus:border-[#E5232A]/60 outline-none stat-readout placeholder:text-gray-600" />
                          </td>
                          <td className="px-5 py-3">
                            <input type="number" step="0.01" value={tier.price_per_unit}
                              onChange={e => updateLocal(tier.id, 'price_per_unit', e.target.value)}
                              className="w-28 bg-[#111114] border border-[#1E1E24] text-[#E5232A] px-2 py-1.5 text-sm focus:border-[#E5232A]/60 outline-none font-semibold stat-readout" />
                          </td>
                          <td className="px-5 py-3">
                            <button onClick={() => saveTier(tier.id)} disabled={saving === tier.id}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-widest uppercase transition-all duration-200 ${
                                saved === tier.id
                                  ? 'border border-green-500 text-green-500'
                                  : 'border border-[#E5232A] text-[#E5232A] hover:bg-[#E5232A]/10'
                              }`} style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
                              <Save size={12} />
                              {saving === tier.id ? 'Saving…' : saved === tier.id ? 'Saved ✓' : 'Save'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
