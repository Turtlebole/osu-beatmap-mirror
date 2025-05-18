import { NextRequest, NextResponse } from 'next/server';

// In-memory fallback storage 
const localStats: Record<string, number> = {};

type DownloadStats = {
  totalDownloads: number;
  beatmapStats: Record<string, number>;
  lastUpdated: string;
};

// Optional KV import - this prevents build errors when vercel/kv isn't installed
let kv: any = null;
try {
  const kvModule = require('@vercel/kv');
  kv = kvModule.kv;
} catch (e) {
  console.log('Vercel KV module not available, using in-memory storage');
}

export async function GET() {
  try {
    // Try to get stats from KV storage
    let stats: DownloadStats | null = null;
    
    if (kv) {
      try {
        stats = await kv.get('download_stats');
      } catch (error) {
        console.error('Error accessing KV storage:', error);
      }
    }
    
    // If no KV stats, use local stats
    if (!stats) {
      stats = {
        totalDownloads: Object.values(localStats).reduce((a, b) => a + b, 0),
        beatmapStats: { ...localStats },
        lastUpdated: new Date().toISOString()
      };
    }
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching download stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch download statistics' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beatmapId } = body;
    
    if (!beatmapId) {
      return NextResponse.json(
        { error: 'Missing beatmapId parameter' }, 
        { status: 400 }
      );
    }
    
    // Update stats
    if (kv) {
      try {
        // Use KV storage if available
        await kv.hincr('download_stats', 'totalDownloads', 1);
        await kv.hincr('download_stats', `beatmap:${beatmapId}`, 1);
        await kv.hset('download_stats', 'lastUpdated', new Date().toISOString());
      } catch (error) {
        console.error('Error updating KV storage:', error);
        // Fallback to local stats
        localStats[beatmapId] = (localStats[beatmapId] || 0) + 1;
      }
    } else {
      // Use in-memory fallback
      localStats[beatmapId] = (localStats[beatmapId] || 0) + 1;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating download stats:', error);
    return NextResponse.json(
      { error: 'Failed to update download statistics' }, 
      { status: 500 }
    );
  }
} 