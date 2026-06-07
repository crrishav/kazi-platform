import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/admin');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const [ordersRes, quotesRes, usersRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('quotes').select('*').eq('status', 'pending'),
    supabase.from('profiles').select('id'),
  ]);

  const orders = ordersRes.data ?? [];
  const quotes = quotesRes.data ?? [];
  const users  = usersRes.data ?? [];

  const revenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum: number, o: any) => sum + (o.total_price ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
      <Navigation />

      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] text-[#E5232A] tracking-[0.2em] uppercase mb-2"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
            ADMIN — CONTROL PANEL
          </p>
          <h1 className="font-cinzel text-3xl text-white">Admin Overview</h1>
        </div>

        {/* Quick nav */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { href: '/admin/orders',  label: 'Orders' },
            { href: '/admin/pricing', label: 'Pricing' },
            { href: '/admin/users',   label: 'Users' },
            { href: '/factory',       label: 'Factory' },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="border border-[#1E1E24] px-4 py-2 text-xs tracking-widest uppercase text-gray-400 hover:border-[#E5232A] hover:text-white transition-all duration-200"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { value: orders.length, label: 'Total Orders', accent: false },
            { value: `£${revenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: 'Revenue (delivered)', accent: true },
            { value: quotes.length, label: 'Pending Quotes', accent: false },
            { value: users.length,  label: 'Registered Users', accent: false },
          ].map(({ value, label, accent }) => (
            <div key={label} className="bg-[#111114] border border-[#1E1E24] p-6">
              <div className={`text-3xl font-bold stat-readout mb-1 ${accent ? 'text-[#E5232A]' : 'text-white'}`}>{value}</div>
              <div className="text-xs text-gray-500 tracking-widest uppercase"
                style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#E5232A] hover:text-red-400 tracking-widest uppercase transition-colors"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>View all →</Link>
          </div>
          <div className="border border-[#1E1E24] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E24] bg-[#111114]">
                  {['ID', 'Product', 'Qty', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-normal text-[10px] text-gray-500 tracking-widest uppercase"
                      style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((o: any) => (
                  <tr key={o.id} className="border-b border-[#1E1E24] last:border-0 hover:bg-[#111114] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{o.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3 text-gray-300 capitalize">{o.product_type}</td>
                    <td className="px-5 py-3 text-gray-300 stat-readout">{o.quantity}</td>
                    <td className="px-5 py-3 text-white font-semibold stat-readout">£{o.total_price ?? '—'}</td>
                    <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(o.created_at).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-600">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
