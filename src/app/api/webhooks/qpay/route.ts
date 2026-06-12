import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSecret } from '../../../../lib/webhookAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const authFailure = verifyWebhookSecret(request, 'x-qpay-secret', process.env.QPAY_WEBHOOK_SECRET);
    if (authFailure) {
      return authFailure;
    }

    const body = await request.json();
    const { invoice_id, status } = body;

    if (typeof invoice_id !== 'string' || typeof status !== 'string') {
      return NextResponse.json({ error: 'Invalid payload types' }, { status: 400 });
    }

    const sanitizedInvoiceId = invoice_id.trim();
    const invoiceRegex = /^[a-zA-Z0-9_\-\.]+$/;
    if (!invoiceRegex.test(sanitizedInvoiceId)) {
      return NextResponse.json({ error: 'Invalid invoice_id format' }, { status: 400 });
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

    // 4. Update the payment (uses parametrized inputs via supabase query builder)
    const { data: updatedPayments, error: paymentError } = await supabase
      .from('payments')
      .update({ status: 'paid' })
      .eq('qpay_invoice', sanitizedInvoiceId)
      .select('*');

    if (paymentError) {
      console.error('Webhook database error (updating payment):', paymentError);
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    if (!updatedPayments || updatedPayments.length === 0) {
      return NextResponse.json({ error: `Payment record not found for invoice: ${sanitizedInvoiceId}` }, { status: 404 });
    }

    // 5. Update the corresponding visa applications to 'submitted'
    const applicationIds = updatedPayments.map(p => p.application_id).filter(Boolean);
    
    if (applicationIds.length > 0) {
      // Validate that applicationIds are valid UUIDs before executing the DB query
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validIds = applicationIds.filter(id => uuidRegex.test(id));

      if (validIds.length > 0) {
        const { error: appError } = await supabase
          .from('visa_applications')
          .update({ status: 'submitted' })
          .in('id', validIds);

        if (appError) {
          console.error('Webhook database error (updating visa application status):', appError);
          return NextResponse.json({ error: appError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, updatedCount: updatedPayments.length });
  } catch (error: unknown) {
    console.error('Webhook execution error:', error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
