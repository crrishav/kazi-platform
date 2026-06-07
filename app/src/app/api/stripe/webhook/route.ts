export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Invalid webhook setup' }, { status: 400 });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as any;
  const { productType, quantity, email, name, notes } = session.metadata;

  try {
    const supabase = await createClient();

    const { data: pricingTiers } = await supabase
      .from('pricing_tiers')
      .select('price_per_unit')
      .eq('product_type', productType)
      .lte('min_qty', quantity)
      .gte('max_qty', quantity)
      .single();

    const unitPrice  = pricingTiers?.price_per_unit || 0;
    const totalPrice = unitPrice * quantity;

    const { error: orderError } = await supabase.from('orders').insert({
      product_type:      productType,
      quantity:          parseInt(quantity),
      unit_price:        unitPrice,
      total_price:       totalPrice,
      status:            'ordered',
      notes:             notes || null,
      stripe_session_id: session.id,
      customer_email:    email,
      customer_name:     name,
    });

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
