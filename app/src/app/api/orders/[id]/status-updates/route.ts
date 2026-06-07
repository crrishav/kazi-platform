export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('order_updates')
      .select('*')
      .eq('order_id', params.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const { status, note } = await request.json();

    const { data: update, error: updateError } = await supabase
      .from('order_updates')
      .insert({ order_id: params.id, status, note })
      .select()
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

    // Sync current status on orders table
    await supabase.from('orders').update({ status }).eq('id', params.id);

    return NextResponse.json(update);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
