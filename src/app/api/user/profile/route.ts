import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserProfile } from '@/lib/osu-api';

export async function GET(request: NextRequest) {
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
    // Fetch user profile from osu! API using user's access token
    const profile = await getUserProfile(
      userId,
      session.accessToken
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    // Return the profile
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' }, 
      { status: 500 }
    );
  }
} 