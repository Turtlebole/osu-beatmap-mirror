import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiterStats } from '@/lib/rateLimiter';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic' } }
    );
  }

  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const [username, password] = credentials;
  
  if (username !== 'admin' || password !== 'admin') {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic' } }
    );
  }

  const stats = getRateLimiterStats();
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stats,
    explanation: "The rate limiter restricts users to 3 downloads of the same beatmap per 10-minute window. There is no global download limit.",
    note: "In-memory rate limiting will reset when the server restarts."
  });
} 