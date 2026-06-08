import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    // 1. Verify QPay webhook secret to protect the endpoint
    const authHeader = request.headers.get('x-qpay-secret');
    const expectedSecret = process.env.QPAY_WEBHOOK_SECRET;

    if (expectedSecret && authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized callback' }, { status: 401 });
    }

    // 2. Parse payload
    const body = await request.json();
    const { invoice_id, status } = body;

    if (!invoice_id || !status) {
      return NextResponse.json({ error: 'Missing invoice_id or status' }, { status: 400 });
    }

    if (status !== 'paid') {
      return NextResponse.json({ message: 'Status is not paid, no action taken', status }, { status: 200 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    // 3. Update the payment
    const { data: updatedPayments, error: paymentError } = await supabase
      .from('payments')
      .update({ status: 'paid' })
      .eq('qpay_invoice', invoice_id)
      .select('*');

    if (paymentError) {
      console.error('Webhook database error (updating payment):', paymentError);
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    if (!updatedPayments || updatedPayments.length === 0) {
      return NextResponse.json({ error: `Payment record not found for invoice: ${invoice_id}` }, { status: 404 });
    }

    // 4. Update the corresponding visa applications to 'submitted'
    const applicationIds = updatedPayments.map(p => p.application_id).filter(Boolean);
    
    if (applicationIds.length > 0) {
      const { error: appError } = await supabase
        .from('visa_applications')
        .update({ status: 'submitted' })
        .in('id', applicationIds);

      if (appError) {
        console.error('Webhook database error (updating visa application status):', appError);
        return NextResponse.json({ error: appError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, updatedCount: updatedPayments.length });
  } catch (error: unknown) {
    console.error('Webhook execution error:', error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
