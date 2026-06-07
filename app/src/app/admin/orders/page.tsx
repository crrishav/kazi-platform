'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import OrderStatusBadge from '@/components/OrderStatusBadge';

const ALL_STATUSES = ['all', 'ordered', 'cutting', 'sewing', 'printing', 'qc', 'shipping', 'delivered'];

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [filter,  setFilter]  = useState('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data } = await supabase
      .from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  }

  const visible = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
      <Navigation />

      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">

        <div className="mb-6">
          <Link href="/admin" className="text-xs text-gray-500 hover:text-[#E5232A] tracking-widest uppercase transition-colors"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>← Admin</Link>
        </div>

        <div className="mb-8">
          <p className="text-[11px] text-[#E5232A] tracking-[0.2em] uppercase mb-2"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>ADMIN — ORDERS</p>
          <h1 className="font-cinzel text-3xl text-white">All Orders</h1>
        </div>

        {/* Status filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[10px] tracking-widest uppercase border transition-all duration-200 ${
                filter === s
                  ? 'border-[#E5232A] text-[#E5232A] bg-[#E5232A]/10'
                  : 'border-[#1E1E24] text-gray-500 hover:border-gray-600 hover:text-gray-300'
              }`} style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading…</div>
        ) : (
          <div className="border border-[#1E1E24] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E24] bg-[#111114]">
                  {['ID', 'Customer', 'Product', 'Qty', 'Total', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-normal text-[10px] text-gray-500 tracking-widest uppercase"
                      style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((o: any) => (
                  <tr key={o.id} className="border-b border-[#1E1E24] last:border-0 hover:bg-[#111114] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{o.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{o.customer_email ?? o.customer_name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-300 capitalize">{o.product_type}</td>
                    <td className="px-5 py-3 text-gray-300 stat-readout">{o.quantity}</td>
                    <td className="px-5 py-3 text-white font-semibold stat-readout">£{o.total_price ?? '—'}</td>
                    <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3">
                      <Link href={`/factory/orders/${o.id}`}
                        className="text-[10px] text-[#E5232A] hover:text-red-400 tracking-widest uppercase transition-colors"
                        style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>Manage →</Link>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-600">No orders matching filter</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
