import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import OrderStatusBadge from '@/components/OrderStatusBadge';

const STAGES = ['ordered', 'cutting', 'sewing', 'printing', 'qc', 'shipping', 'delivered'] as const;

export default async function FactoryPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/factory');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'employee' && profile.role !== 'admin')) {
    redirect('/dashboard');
  }

  const [ordersRes, quotesRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('quotes').select('id').eq('status', 'pending'),
  ]);

  const orders       = ordersRes.data ?? [];
  const pendingCount = quotesRes.data?.length ?? 0;

  const kanban: Record<string, any[]> = {};
  STAGES.forEach(s => { kanban[s] = []; });
  orders.forEach((o: any) => {
    if (kanban[o.status]) kanban[o.status].push(o);
  });

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
      <Navigation />

      <div className="pt-28 pb-16 px-6 max-w-full mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 max-w-7xl mx-auto">
          <div>
            <p className="text-[11px] text-[#E5232A] tracking-[0.2em] uppercase mb-2"
              style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
              FACTORY — PRODUCTION FLOOR
            </p>
            <h1 className="font-cinzel text-3xl text-white">Production Board</h1>
          </div>
          {pendingCount > 0 && (
            <div className="border border-[#E5232A]/40 bg-[#E5232A]/10 px-4 py-3 text-center">
              <div className="text-2xl font-bold text-[#E5232A] stat-readout">{pendingCount}</div>
              <div className="text-[10px] text-gray-400 tracking-widest uppercase mt-0.5"
                style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>Pending Quotes</div>
            </div>
          )}
        </div>

        {/* Kanban */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: `${STAGES.length * 240}px` }}>
            {STAGES.map(stage => (
              <div key={stage} className="flex-1 min-w-[220px]">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] tracking-widest uppercase text-gray-500"
                    style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>{stage}</span>
                  <span className="text-[10px] text-gray-600 stat-readout">{kanban[stage].length}</span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {kanban[stage].map((o: any) => (
                    <Link key={o.id} href={`/factory/orders/${o.id}`}
                      className="block bg-[#111114] border border-[#1E1E24] p-4 hover:border-[#E5232A]/40 transition-all duration-200 group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] text-gray-600">{o.id.slice(0, 8)}</span>
                        <OrderStatusBadge status={o.status} />
                      </div>
                      <div className="text-sm font-medium text-gray-200 capitalize mb-1">{o.product_type}</div>
                      <div className="text-xs text-gray-500 stat-readout">{o.quantity} units</div>
                      {(o.customer_name || o.customer_email) && (
                        <div className="text-xs text-gray-600 mt-1.5 truncate">
                          {o.customer_name ?? o.customer_email}
                        </div>
                      )}
                      <div className="text-[10px] text-gray-700 mt-2">
                        {new Date(o.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </Link>
                  ))}
                  {kanban[stage].length === 0 && (
                    <div className="border border-dashed border-[#1E1E24] p-4 text-center">
                      <span className="text-[10px] text-gray-700"
                        style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>—</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
