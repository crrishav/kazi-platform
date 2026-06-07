import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import OrderTimeline from '@/components/OrderTimeline';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard');

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_updates(*)')
    .eq('id', params.id)
    .single();

  if (!order) notFound();

  const updates = (order.order_updates ?? []).sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <main className="min-h-screen bg-cream">
      <Navigation />

      <div className="pt-28 pb-16 px-6 max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/dashboard" className="font-inter text-xs text-text-muted hover:text-accent-warm tracking-nav transition-colors">
            ← Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-inter text-xs text-text-muted uppercase tracking-nav mb-1">Order</p>
            <h1 className="font-cinzel text-2xl text-espresso capitalize">
              {order.product_type} × {order.quantity}
            </h1>
            <p className="font-inter text-xs text-text-light mt-1">
              Placed {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        <div className="bg-white border border-rule px-6 py-6 mb-6">
          <h2 className="font-cinzel text-sm text-espresso uppercase tracking-wide mb-2">Production Progress</h2>
          <OrderTimeline status={order.status} />
        </div>

        {/* Order details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Product',    value: order.product_type },
            { label: 'Quantity',   value: `${order.quantity} units` },
            { label: 'Unit Price', value: `£${order.unit_price ?? '—'}` },
            { label: 'Total',      value: `£${order.total_price ?? '—'}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-rule px-5 py-4">
              <div className="font-inter text-xs text-text-muted uppercase tracking-nav mb-1">{label}</div>
              <div className="font-inter text-sm text-text-primary capitalize">{value}</div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white border border-rule px-5 py-4 mb-6">
            <div className="font-inter text-xs text-text-muted uppercase tracking-nav mb-2">Notes</div>
            <p className="font-inter text-sm text-text-primary leading-relaxed">{order.notes}</p>
          </div>
        )}

        {/* Update history */}
        {updates.length > 0 && (
          <div className="bg-white border border-rule px-6 py-5">
            <h2 className="font-cinzel text-sm text-espresso uppercase tracking-wide mb-4">Update History</h2>
            <div className="space-y-3">
              {updates.map((u: any) => (
                <div key={u.id} className="flex items-start gap-4 py-3 border-b border-rule-light last:border-0">
                  <div className="shrink-0 mt-0.5">
                    <OrderStatusBadge status={u.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {u.note && <p className="font-inter text-sm text-text-primary">{u.note}</p>}
                    <p className="font-inter text-xs text-text-light mt-1">
                      {new Date(u.created_at).toLocaleString('en-GB')}
                    </p>
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
