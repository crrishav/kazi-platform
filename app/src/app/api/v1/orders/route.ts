export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function validateApiKey(apiKey: string): Promise<string | null> {
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, user_id, is_active')
    .eq('key_hash', hash)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  return data.user_id;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const userId = await validateApiKey(authHeader.slice(7));
    if (!userId) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const body = await request.json();
    const { product_type, quantity, sizes, colors, print_placement, details } = body;

    if (!product_type || !quantity) {
      return NextResponse.json({ error: 'Missing required fields: product_type, quantity' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles').select('id, email, full_name').eq('id', userId).single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('quotes')
      .insert({
        customer_id:     profile.id,
        product_type,
        quantity,
        size_breakdown:  sizes || {},
        colors:          colors || [],
        print_placement: print_placement || [],
        details:         details || '',
        status:          'pending',
      })
      .select().single();

    if (quoteError) {
      return NextResponse.json({ error: 'Failed to create order', details: quoteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id:           quote.id,
        product_type: quote.product_type,
        quantity:     quote.quantity,
        status:       quote.status,
        created_at:   quote.created_at,
      },
      message: 'Order created successfully. Our team will review and contact you shortly.',
    });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const userId = await validateApiKey(authHeader.slice(7));
    if (!userId) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const { data: quotes, error } = await supabaseAdmin
      .from('quotes')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ orders: quotes });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
