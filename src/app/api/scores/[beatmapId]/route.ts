import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserBeatmapScores } from '@/lib/osu-api';

export async function GET(
  request: NextRequest, 
  { params }: { params: { beatmapId: string } }
) {
  const { beatmapId } = params;
  const session = await getServerSession(authOptions);

  // Check authentication
  if (!session || !session.accessToken || !session.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }

  // Get userId from query params or use the session's user id
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || session.user.id;

  try {
    // Fetch scores from osu! API using user's access token
    const scores = await getUserBeatmapScores(
      userId,
      beatmapId,
      session.accessToken
    );

    // Return the scores
    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching user scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores' }, 
      { status: 500 }
    );
  }
} 