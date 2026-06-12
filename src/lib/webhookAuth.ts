import { NextResponse } from 'next/server';
import { getClientIp, checkRateLimit, handleRateLimitResponse } from './rateLimit';

export function verifyWebhookSecret(
  request: Request,
  headerName: string,
  expectedSecret: string | undefined
): NextResponse | null {
  const authHeader = request.headers.get(headerName);

  if (!expectedSecret || authHeader !== expectedSecret) {
    const ip = getClientIp(request);
    const limitData = checkRateLimit(`webhook-unauth:${ip}`, 30, 60000);
    const rateLimitCheck = handleRateLimitResponse(limitData);
    if (rateLimitCheck instanceof NextResponse) {
      return rateLimitCheck;
    }
    return NextResponse.json(
      { error: 'Unauthorized callback' },
      { status: 401, headers: rateLimitCheck.headers }
    );
  }

  return null;
}
