export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getBeatmapset } from '@/lib/osu-api';
import path from 'path';
import fs from 'fs';
import os from 'os';
import axios from 'axios';

// Configure beatmap download cache
const CACHE_DIR = path.join(os.tmpdir(), 'osu-mirror-cache');
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
const ENABLE_CACHE = process.env.ENABLE_DOWNLOAD_CACHE !== 'false';

// Beatmap download mirrors in priority order
const MIRRORS = [
  {
    name: 'chimu.moe',
    getUrl: (id: string) => `https://api.chimu.moe/v1/download/${id}`,
  },
  {
    name: 'kitsu.moe',
    getUrl: (id: string) => `https://kitsu.moe/api/d/${id}`,
  },
  {
    name: 'beatconnect.io',
    getUrl: (id: string) => `https://beatconnect.io/b/${id}`,
  }
];

// Create cache directory if it doesn't exist
try {
  if (ENABLE_CACHE && !fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create cache directory:', error);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Properly await params to fix Next.js warning
  const { id } = await Promise.resolve(params);
  
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid beatmap ID' }, { status: 400 });
  }

  try {
    // Get beatmap details to verify it exists and get the real download URL
    const beatmapset = await getBeatmapset(id);
    
    if (!beatmapset) {
      return NextResponse.json(
        { error: 'Beatmap not found' }, 
        { status: 404 }
      );
    }

    // Build cache path and filename
    const cacheFilePath = path.join(CACHE_DIR, `${id}.osz`);
    const filename = `${beatmapset.artist} - ${beatmapset.title} [${beatmapset.creator}].osz`;
    
    // Check if we have a valid cached file
    if (ENABLE_CACHE && fs.existsSync(cacheFilePath)) {
      const stats = fs.statSync(cacheFilePath);
      const fileAge = Date.now() - stats.mtimeMs;
      
      if (fileAge < CACHE_MAX_AGE) {
        // Return the cached file
        const fileBuffer = fs.readFileSync(cacheFilePath);
        
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            'Content-Length': stats.size.toString(),
            'Cache-Control': 'public, max-age=86400',
            'X-Cache-Hit': 'true'
          }
        });
      }
    }

    // Try each mirror in order until one works
    for (const mirror of MIRRORS) {
      try {
        console.log(`Attempting download from ${mirror.name} for beatmap ${id}`);
        
        const downloadUrl = mirror.getUrl(id);
        
        // Stream the download through our server
        const response = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'osu-beatmap-mirror/1.0'
          },
          timeout: 30000 // 30 second timeout
        });
        
        // Make sure we got a valid response
        if (!response.data || response.data.length === 0) {
          console.log(`${mirror.name} returned empty file for beatmap ${id}`);
          continue;
        }
        
        // Save to cache if enabled
        if (ENABLE_CACHE) {
          try {
            fs.writeFileSync(cacheFilePath, Buffer.from(response.data));
          } catch (cacheError) {
            console.error('Failed to cache beatmap:', cacheError);
          }
        }
        
        console.log(`Successfully downloaded beatmap ${id} from ${mirror.name}`);
        
        // Return the response to the client
        return new NextResponse(response.data, {
          status: 200,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            'Content-Length': response.headers['content-length'] || Buffer.byteLength(response.data).toString(),
            'Cache-Control': 'public, max-age=86400',
            'X-Cache-Hit': 'false',
            'X-Source': mirror.name
          }
        });
      } catch (mirrorError: any) {
        console.error(`Error downloading from ${mirror.name} for beatmap ${id}:`, mirrorError.message);
        // Continue to next mirror
      }
    }
    
    // All mirrors failed
    throw new Error(`All download mirrors failed for beatmap ${id}`);

  } catch (error) {
    console.error(`Error proxying download for beatmap ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to download the beatmap from any source. Please try again later.' }, 
      { status: 503 }
    );
  }
} 