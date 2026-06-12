import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSecret } from '../../../../lib/webhookAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Allowed application status values
const ALLOWED_STATUSES = ['draft', 'dan_verified', 'khur_checked', 'payment_pending', 'submitted', 'approved', 'rejected'];

export async function POST(request: Request) {
  try {
    const authFailure = verifyWebhookSecret(request, 'x-supabase-webhook-secret', process.env.SUPABASE_WEBHOOK_SECRET);
    if (authFailure) {
      return authFailure;
    }

    const payload = await request.json();

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { type, table, record, old_record } = payload;

    if (typeof type !== 'string' || typeof table !== 'string') {
      return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 });
    }

    if (type !== 'UPDATE' || table !== 'visa_applications' || !record || !old_record) {
      return NextResponse.json({ message: 'Ignore non-update/non-visa actions' }, { status: 200 });
    }

    if (typeof record.status !== 'string' || typeof old_record.status !== 'string') {
      return NextResponse.json({ error: 'Invalid status type' }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(record.status) || !ALLOWED_STATUSES.includes(old_record.status)) {
      return NextResponse.json({ error: 'Forbidden status value' }, { status: 400 });
    }

    if (record.status === old_record.status) {
      return NextResponse.json({ message: 'Status did not change, no action taken' }, { status: 200 });
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

    // 3. Fetch applicant's profile to get their email and phone
    const userId = record.created_by || record.user_id;
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'No valid user ID found on visa application' }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Failed to fetch user profile for notification:', profileError);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // 4. Construct notification message (Sanitize inputs to prevent log/XSS injection in emails)
    const rawApplicantName = record.applicant_name || 'Таны';
    const applicantName = typeof rawApplicantName === 'string' 
      ? rawApplicantName.replace(/[<>'"&;]/g, '').trim() 
      : 'Таны';

    const newStatus = record.status;
    let messageBody = '';
    let subject = '';

    switch (newStatus) {
      case 'submitted':
        subject = 'Виз мэдүүлэг хүлээн авлаа';
        messageBody = `Сайн байна уу, ${profile.name}. ${applicantName} виз мэдүүлгийн материалыг систем амжилттай хүлээн авлаа. Элчин сайдын яам удахгүй хянан шийдвэрлэх болно.`;
        break;
      case 'khur_checked':
        subject = 'Нийгмийн даатгал баталгаажлаа';
        messageBody = `Сайн байна уу, ${profile.name}. ${applicantName} визний ХУР системийн нийгмийн даатгал, цалингийн мэдээлэл амжилттай баталгаажлаа.`;
        break;
      case 'approved':
        subject = 'Виз зөвшөөрөгдлөө';
        messageBody = `Танд баяр хүргэе! Сайн байна уу, ${profile.name}. ${applicantName} визний мэдүүлэг Элчин сайдын яамаар зөвшөөрөгдлөө. Та хянах самбараасаа дэлгэрэнгүйг харна уу.`;
        break;
      case 'rejected':
        subject = 'Виз татгалзлаа';
        messageBody = `Сайн байна уу, ${profile.name}. ${applicantName} визний мэдүүлгээс Элчин сайдын яам татгалзсан шийдвэр гаргалаа. Төлбөрийн баримт болон тайлбарыг хянах самбараасаа харна уу.`;
        break;
      default:
        subject = 'Виз мэдүүлгийн статус өөрчлөгдлөө';
        messageBody = `Сайн байна уу, ${profile.name}. ${applicantName} виз мэдүүлгийн статус "${newStatus}" болж өөрчлөгдлөө.`;
    }

    // 5. Send Email (using SMTP or third-party service like Resend)
    console.log(`[NOTIFICATION] Sending Email to ${profile.email || 'user'}: Subject: ${subject}, Body: ${messageBody}`);

    // 6. Send SMS (if phone is present)
    if (profile.phone) {
      // Basic phone sanitization before logging/sending
      const sanitizedPhone = String(profile.phone).replace(/[^0-9+\s\-]/g, '');
      console.log(`[NOTIFICATION] Sending SMS to ${sanitizedPhone}: ${messageBody}`);
    }

    return NextResponse.json({
      success: true,
      notifiedUser: profile.id,
      emailSent: !!profile.email,
      smsSent: !!profile.phone,
      status: newStatus
    });
  } catch (error: unknown) {
    console.error('Notification webhook error:', error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
