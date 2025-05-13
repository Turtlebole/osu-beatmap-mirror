// Increase the maximum response size for large files
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getBeatmapset } from '@/lib/osu-api';
import { unstable_noStore as noStore } from 'next/cache';

// Official osu! download URL
const OSU_DOWNLOAD_URL = 'https://osu.ppy.sh/beatmapsets';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Prevent caching to ensure fresh downloads
  noStore();
  
  // Properly await params before accessing
  const { id } = await Promise.resolve(params);
  
  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: 'Invalid beatmap ID' },
      { status: 400 }
    );
  }
  
  // First, get beatmap details for proper filename
  let beatmapInfo;
  try {
    beatmapInfo = await getBeatmapset(id);
  } catch (error) {
    // Log error without detailed stacktrace
    console.log(`[Info] Failed to fetch beatmap info for ${id}`);
    // Continue anyway, we'll use a generic filename
  }
  
  // Generate filename
  const filename = beatmapInfo 
    ? `${beatmapInfo.artist} - ${beatmapInfo.title} (${beatmapInfo.creator}).osz`
    : `beatmapset-${id}.osz`;
    
  // Clean the filename to be URL-safe
  const safeFilename = filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ');
  
  try {
    console.log(`[Info] Attempting to download beatmap ${id} from official osu! website`);
    
    // Get access token from osu! API
    const accessToken = await getAccessToken();
    
    // Construct direct download URL
    const downloadUrl = `${OSU_DOWNLOAD_URL}/${id}/download`;
    
    // Make the request to the osu! website
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'osu-mirror/1.0.0',
        'Accept': 'application/octet-stream',
      },
      redirect: 'follow', // Follow redirects
    });

    if (!response.ok) {
      console.log(`[Info] Failed to download from osu! website: ${response.status}`);
      
      // Fall back to mirrors if official download fails
      return await fallbackToMirrors(id, safeFilename);
    }
    
    // Get the response headers to check content type
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // Check if we got an actual file (non-HTML response)
    if (contentType && contentType.includes('text/html')) {
      console.log('[Info] Received HTML instead of file, using fallback mirrors');
      return await fallbackToMirrors(id, safeFilename);
    }
    
    // Get the file data as a stream for better handling of large files
    const fileData = await response.arrayBuffer();
    
    // Set headers for client response
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    headers.set('Content-Type', 'application/octet-stream');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    
    console.log(`[Success] Downloaded beatmap ${id} from official osu! website (${fileData.byteLength} bytes)`);
    
    // Return the file
    return new NextResponse(fileData, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.log(`[Info] Error downloading from osu! website, trying mirrors`);
    
    // Fall back to mirrors if official download fails
    return await fallbackToMirrors(id, safeFilename);
  }
}

// Fallback function to try mirrors if official download fails
async function fallbackToMirrors(id: string, filename: string) {
  // List of mirrors to try in order of preference
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

  // Headers for client response
  const headers = new Headers();
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  headers.set('Content-Type', 'application/octet-stream');

  // Try mirrors in sequence until one works
  for (const mirror of MIRRORS) {
    try {
      console.log(`[Info] Attempting download from ${mirror.name} for beatmap ${id}`);
      
      const downloadUrl = mirror.getUrl(id);
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'osu-mirror/1.0.0',
          'Accept': 'application/octet-stream',
        },
        redirect: 'follow',
      }).catch(() => {
        console.log(`[Info] Network error when connecting to ${mirror.name}`);
        return null;
      });

      if (!response || !response.ok) {
        console.log(`[Info] Failed to download from ${mirror.name}`);
        continue; // Try next mirror
      }
      
      // Get the content type to check if we're getting a file
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.log(`[Info] ${mirror.name} returned HTML, not a file`);
        continue; // Try next mirror
      }
      
      // Get file length if available
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        headers.set('Content-Length', contentLength);
      }
      
      try {
        // Get the file data
        const fileData = await response.arrayBuffer();
        
        // If we got an empty file, try next mirror
        if (!fileData || fileData.byteLength === 0) {
          console.log(`[Info] ${mirror.name} returned empty file`);
          continue;
        }
        
        console.log(`[Success] Downloaded from ${mirror.name} (${fileData.byteLength} bytes)`);
        
        // Return the file
        return new NextResponse(fileData, {
          status: 200,
          headers,
        });
      } catch (error) {
        console.log(`[Info] Error processing response from ${mirror.name}`);
        continue;
      }
    } catch (error) {
      // Simplified error logging
      console.log(`[Info] Error with ${mirror.name} mirror`);
      // Continue to next mirror
    }
  }

  // If all mirrors fail
  console.log(`[Error] Failed to download beatmap ${id} from any source`);
  return NextResponse.json(
    { error: 'Failed to download beatmap from any source. Please try again later.' },
    { status: 503 }
  );
}

// Optionally, you could implement a rate limiter here to prevent abuse 