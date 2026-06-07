import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();

  if (!profile || (profile.role !== 'customer' && profile.role !== 'admin')) {
    redirect('/factory');
  }

  const { data: orders } = await supabase
    .from('orders').select('*').eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  const { data: quotes } = await supabase
    .from('quotes').select('*').eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  const activeOrders    = orders?.filter(o => o.status !== 'delivered').length ?? 0;
  const completedOrders = orders?.filter(o => o.status === 'delivered').length ?? 0;
  const pendingQuotes   = quotes?.filter(q => q.status === 'pending').length ?? 0;

  return (
    <main className="min-h-screen bg-cream">
      <Navigation />

      <div className="pt-28 pb-16 px-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="font-inter text-xs tracking-nav text-text-muted uppercase mb-2">Customer Portal</p>
            <h1 className="font-cinzel text-3xl text-espresso">
              Welcome, {profile?.full_name ?? 'there'}
            </h1>
          </div>
          <Link href="/pricing"
            className="bg-espresso text-cream font-inter text-xs tracking-button uppercase px-6 py-3 hover:bg-accent-warm transition-colors duration-200">
            New Quote
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { value: activeOrders,    label: 'Active Orders' },
            { value: completedOrders, label: 'Completed' },
            { value: pendingQuotes,   label: 'Pending Quotes' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white border border-rule px-6 py-6">
              <div className="font-cinzel text-4xl text-espresso mb-1">{value}</div>
              <div className="font-inter text-xs tracking-nav text-text-muted uppercase">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cinzel text-lg text-espresso">Your Orders</h2>
              <Link href="/dashboard/api-keys"
                className="font-inter text-xs text-accent-warm hover:text-espresso tracking-nav transition-colors">
                API Keys →
              </Link>
            </div>
            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`}
                    className="block bg-white border border-rule px-5 py-4 hover:border-accent-warm transition-colors duration-200 group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-inter text-sm font-medium text-text-primary capitalize">
                          {order.product_type}
                        </div>
                        <div className="font-inter text-xs text-text-muted mt-0.5">
                          {order.quantity} units · £{order.total_price}
                        </div>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="font-inter text-xs text-text-light">
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-rule px-8 py-10 text-center">
                <p className="font-inter text-sm text-text-muted mb-4">No orders yet</p>
                <Link href="/pricing" className="font-inter text-xs text-accent-warm hover:text-espresso tracking-nav transition-colors">
                  Request your first quote →
                </Link>
              </div>
            )}
          </div>

          {/* Quotes */}
          <div>
            <h2 className="font-cinzel text-lg text-espresso mb-4">Your Quotes</h2>
            {quotes && quotes.length > 0 ? (
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <div key={quote.id} className="bg-white border border-rule px-5 py-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-inter text-sm font-medium text-text-primary capitalize">
                          {quote.product_type}
                        </div>
                        <div className="font-inter text-xs text-text-muted mt-0.5">{quote.quantity} units</div>
                      </div>
                      <OrderStatusBadge status={quote.status} />
                    </div>
                    {quote.quoted_price && (
                      <div className="font-inter text-sm font-medium text-accent-warm mb-2">
                        Quote: £{quote.quoted_price}
                      </div>
                    )}
                    <div className="font-inter text-xs text-text-light">
                      {new Date(quote.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-rule px-8 py-10 text-center">
                <p className="font-inter text-sm text-text-muted">No quotes yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
