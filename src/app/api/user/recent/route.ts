import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserRecentScores } from '@/lib/osu-api';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check authentication
  if (!session || !session.accessToken || !session.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }

  // Get params from query 
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const includeFails = searchParams.get('includeFails') !== 'false';
  
  // Get userId from query params or use the session's user id
  const userId = searchParams.get('userId') || session.user.id;

  try {
    // Fetch recent scores from osu! API using user's access token
    const scores = await getUserRecentScores(
      userId,
      session.accessToken,
      limit,
      includeFails
    );

    // Return the scores
    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching user recent scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent scores' }, 
      { status: 500 }
    );
  }
} 