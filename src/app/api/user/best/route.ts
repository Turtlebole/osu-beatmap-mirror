import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserBestScores } from '@/lib/osu-api';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check authentication
  if (!session || !session.accessToken || !session.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }

  // Get limit from query params (default to 50)
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  
  // Get userId from query params or use the session's user id
  const userId = searchParams.get('userId') || session.user.id;

  try {
    // Fetch best scores from osu! API using user's access token
    const scores = await getUserBestScores(
      userId,
      session.accessToken,
      limit
    );

    // Return the scores
    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching user best scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch best scores' }, 
      { status: 500 }
    );
  }
} 