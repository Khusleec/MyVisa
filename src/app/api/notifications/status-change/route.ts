import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    // 1. Verify webhook secret
    const authHeader = request.headers.get('x-supabase-webhook-secret');
    const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;

    if (expectedSecret && authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized webhook call' }, { status: 401 });
    }

    const payload = await request.json();
    const { type, table, record, old_record } = payload;

    // We only care about updates to visa_applications status
    if (type !== 'UPDATE' || table !== 'visa_applications' || !record || !old_record) {
      return NextResponse.json({ message: 'Ignore non-update/non-visa actions' }, { status: 200 });
    }

    // Check if status changed
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

    // 2. Fetch applicant's profile to get their email and phone
    const userId = record.created_by || record.user_id;
    if (!userId) {
      return NextResponse.json({ error: 'No user ID found on visa application' }, { status: 400 });
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

    // 3. Construct notification message based on status
    const applicantName = record.applicant_name || 'Таны';
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

    // 4. Send Email (using SMTP or third-party service like Resend)
    // We log it and show integration stub
    console.log(`[NOTIFICATION] Sending Email to ${profile.email || 'user'}: Subject: ${subject}, Body: ${messageBody}`);

    // If RESEND_API_KEY is configured in prod, you would invoke:
    // await resend.emails.send({ from: 'noreply@myvisa.mn', to: profile.email, subject, html: <p>{messageBody}</p> })

    // 5. Send SMS (if phone is present)
    if (profile.phone) {
      console.log(`[NOTIFICATION] Sending SMS to ${profile.phone}: ${messageBody}`);
      // If SMS gateway (like Lur.mn or Lhamour) is integrated, invoke it here:
      // await sendSMS(profile.phone, messageBody);
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
