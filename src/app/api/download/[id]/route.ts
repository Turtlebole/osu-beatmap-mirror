export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy download route - redirects to the new proxy-download endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Properly await params to fix Next.js warning
  const { id } = await Promise.resolve(params);
  
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid beatmap ID' }, { status: 400 });
  }

  // Forward to our new proxy download endpoint
  return NextResponse.redirect(new URL(`/api/proxy-download/${id}`, request.url));
} 