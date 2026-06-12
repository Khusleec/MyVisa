import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface NewApplicationPayload {
  user_id: string | null;
  created_by: string;
  company_id: string | null;
  applicant_name: string;
  applicant_relation: string;
  country: string;
  country_code: string;
  khur_salary: number | null;
  khur_employer: string | null;
  khur_insurance_months: number | null;
  passport_url: string | null;
  photo_url: string | null;
  bank_statement_url: string | null;
  amount: number;
  qpay_invoice?: string;
}

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) {
    return null;
  }

  return { user, userClient };
}

async function verifyApplicationOwnership(
  userClient: SupabaseClient,
  userId: string,
  applicationId: string
) {
  const { data: app, error } = await userClient
    .from('visa_applications')
    .select('id, user_id, created_by, company_id')
    .eq('id', applicationId)
    .single();

  if (error || !app) {
    return false;
  }

  const ownedApp = app as {
    user_id: string | null;
    created_by: string | null;
    company_id: string | null;
  };

  if (ownedApp.user_id === userId || ownedApp.created_by === userId) {
    return true;
  }

  const { data: profile } = await userClient
    .from('profiles')
    .select('role, company_id')
    .eq('id', userId)
    .single();

  const adminProfile = profile as { role: string; company_id: string | null } | null;

  return (
    adminProfile?.role === 'business_admin' &&
    adminProfile.company_id != null &&
    ownedApp.company_id === adminProfile.company_id
  );
}

async function markApplicationsPaid(
  serviceClient: SupabaseClient,
  entries: Array<{ applicationId: string; companyId: string | null; amount: number; qpayInvoice: string }>
) {
  for (const entry of entries) {
    const { error: paymentError } = await serviceClient
      .from('payments')
      .insert({
        application_id: entry.applicationId,
        company_id: entry.companyId,
        amount: entry.amount,
        qpay_invoice: entry.qpayInvoice,
        status: 'paid',
      });

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    const { error: appError } = await serviceClient
      .from('visa_applications')
      .update({ status: 'submitted' })
      .eq('id', entry.applicationId);

    if (appError) {
      throw new Error(appError.message);
    }
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (Array.isArray(body.applicationIds)) {
      const applicationIds = body.applicationIds.filter(
        (id: unknown): id is string => typeof id === 'string' && uuidRegex.test(id)
      );

      if (applicationIds.length === 0) {
        return NextResponse.json({ error: 'No valid application IDs provided' }, { status: 400 });
      }

      const payments = Array.isArray(body.payments) ? body.payments : [];
      const entries: Array<{ applicationId: string; companyId: string | null; amount: number; qpayInvoice: string }> = [];

      for (const applicationId of applicationIds) {
        const ownsApp = await verifyApplicationOwnership(auth.userClient, auth.user.id, applicationId);
        if (!ownsApp) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const paymentInfo = payments.find((p: { applicationId?: string }) => p.applicationId === applicationId);
        const amount = typeof paymentInfo?.amount === 'number' ? paymentInfo.amount : 0;
        const companyId = typeof paymentInfo?.companyId === 'string' ? paymentInfo.companyId : null;
        const qpayInvoice =
          typeof paymentInfo?.qpayInvoice === 'string'
            ? paymentInfo.qpayInvoice
            : `QPAY-INV-${Math.floor(100000 + Math.random() * 900000)}`;

        entries.push({ applicationId, companyId, amount, qpayInvoice });
      }

      await markApplicationsPaid(serviceClient, entries);
      return NextResponse.json({ success: true, updatedCount: entries.length });
    }

    if (body.newApplication && typeof body.newApplication === 'object') {
      const payload = body.newApplication as NewApplicationPayload;

      if (payload.created_by !== auth.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data: newApp, error: insertError } = await auth.userClient
        .from('visa_applications')
        .insert({
          user_id: payload.user_id,
          created_by: payload.created_by,
          company_id: payload.company_id,
          applicant_name: payload.applicant_name,
          applicant_relation: payload.applicant_relation,
          country: payload.country,
          country_code: payload.country_code,
          status: 'draft',
          khur_salary: payload.khur_salary,
          khur_employer: payload.khur_employer,
          khur_insurance_months: payload.khur_insurance_months,
          passport_url: payload.passport_url,
          photo_url: payload.photo_url,
          bank_statement_url: payload.bank_statement_url,
        })
        .select('id')
        .single();

      if (insertError || !newApp) {
        return NextResponse.json({ error: insertError?.message || 'Failed to create application' }, { status: 400 });
      }

      const qpayInvoice =
        payload.qpay_invoice || `QPAY-INV-${Math.floor(100000 + Math.random() * 900000)}`;

      await markApplicationsPaid(serviceClient, [{
        applicationId: newApp.id,
        companyId: payload.company_id,
        amount: payload.amount,
        qpayInvoice,
      }]);

      return NextResponse.json({ success: true, applicationId: newApp.id });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Payment complete error:', error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
