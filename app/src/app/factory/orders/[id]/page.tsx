'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import OrderTimeline from '@/components/OrderTimeline';

const STAGE_ORDER = ['ordered', 'cutting', 'sewing', 'printing', 'qc', 'shipping', 'delivered'];

export default function FactoryOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params.id as string;

  const [order,    setOrder]    = useState<any>(null);
  const [updates,  setUpdates]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [note,     setNote]     = useState('');
  const [saving,   setSaving]   = useState(false);
  const supabase = createClient();

  useEffect(() => { if (id) fetchData(); }, [id]);

  async function fetchData() {
    setLoading(true);
    const [{ data: o }, { data: u }] = await Promise.all([
      supabase.from('orders').select('*').eq('id', id).single(),
      supabase.from('order_updates').select('*').eq('order_id', id).order('created_at', { ascending: false }),
    ]);
    setOrder(o);
    setUpdates(u ?? []);
    setLoading(false);
  }

  async function setStatus(newStatus: string) {
    if (!order || saving) return;
    setSaving(true);

    await supabase.from('order_updates').insert({ order_id: id, status: newStatus, note: note.trim() || null });
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);

    setOrder((prev: any) => ({ ...prev, status: newStatus }));
    await fetchData();
    setNote('');
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0B]">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <span className="text-gray-500 font-mono text-sm">Loading…</span>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#0A0A0B]">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <span className="text-gray-500 font-mono text-sm">Order not found</span>
        </div>
      </main>
    );
  }

  const currentIdx = STAGE_ORDER.indexOf(order.status);
  const prevStatus = currentIdx > 0 ? STAGE_ORDER[currentIdx - 1] : null;
  const nextStatus = currentIdx < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentIdx + 1] : null;

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
      <Navigation />

      <div className="pt-28 pb-16 px-6 max-w-4xl mx-auto">

        <div className="mb-6">
          <Link href="/factory" className="text-xs text-gray-500 hover:text-[#E5232A] tracking-widest uppercase transition-colors"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>← Factory Board</Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] text-[#E5232A] tracking-[0.2em] uppercase mb-1"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
              ORDER — {order.id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="font-cinzel text-2xl text-white capitalize">
              {order.product_type} × {order.quantity}
            </h1>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        <div className="bg-[#111114] border border-[#1E1E24] px-6 py-6 mb-6">
          <div className="text-[10px] text-gray-500 tracking-widest uppercase mb-3"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>PRODUCTION STAGE</div>
          <OrderTimeline status={order.status} />
        </div>

        {/* Quick status update */}
        <div className="bg-[#111114] border border-[#1E1E24] px-6 py-6 mb-6">
          <div className="text-[10px] text-gray-500 tracking-widest uppercase mb-4"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>UPDATE STATUS</div>

          {/* Note field */}
          <div className="mb-4">
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional note for this status change…"
              className="w-full px-3 py-2.5 bg-[#0A0A0B] border border-[#1E1E24] text-white text-sm focus:border-[#E5232A]/60 outline-none resize-none placeholder:text-gray-700 font-inter"
            />
          </div>

          {/* Prev / Next buttons */}
          <div className="flex gap-3 mb-4">
            {prevStatus && (
              <button onClick={() => setStatus(prevStatus)} disabled={saving}
                className="flex-1 py-2.5 border border-[#1E1E24] text-sm text-gray-400 hover:text-white hover:border-white/30 disabled:opacity-40 transition-all duration-200 tracking-widest uppercase"
                style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
                ← {prevStatus}
              </button>
            )}
            {nextStatus && (
              <button onClick={() => setStatus(nextStatus)} disabled={saving}
                className="flex-1 py-2.5 bg-[#E5232A] text-white text-sm font-semibold hover:bg-red-500 disabled:opacity-40 transition-all duration-200 tracking-widest uppercase"
                style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
                → {nextStatus}
              </button>
            )}
          </div>

          {/* Manual select */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-600 shrink-0"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>MANUAL:</span>
            <select
              value={order.status}
              onChange={e => setStatus(e.target.value)}
              disabled={saving}
              className="flex-1 bg-[#0A0A0B] border border-[#1E1E24] text-gray-300 text-sm px-3 py-2 focus:border-[#E5232A]/60 outline-none cursor-pointer"
            >
              {STAGE_ORDER.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Order details */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Product',  value: order.product_type },
            { label: 'Quantity', value: `${order.quantity} units` },
            { label: 'Total',    value: `£${order.total_price ?? '—'}` },
            { label: 'Customer', value: order.customer_name ?? order.customer_email ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#111114] border border-[#1E1E24] px-5 py-4">
              <div className="text-[10px] text-gray-500 tracking-widest uppercase mb-1"
                style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>{label}</div>
              <div className="text-sm text-gray-300 capitalize">{value}</div>
            </div>
          ))}
        </div>

        {/* Update history */}
        {updates.length > 0 && (
          <div className="bg-[#111114] border border-[#1E1E24] px-6 py-5">
            <div className="text-[10px] text-gray-500 tracking-widest uppercase mb-4"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>UPDATE HISTORY</div>
            <div className="space-y-3">
              {updates.map((u: any) => (
                <div key={u.id} className="flex items-start gap-4 py-3 border-b border-[#1E1E24] last:border-0">
                  <OrderStatusBadge status={u.status} />
                  <div className="flex-1 min-w-0">
                    {u.note && <p className="text-sm text-gray-300 font-inter">{u.note}</p>}
                    <p className="text-xs text-gray-600 mt-0.5">{new Date(u.created_at).toLocaleString('en-GB')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
