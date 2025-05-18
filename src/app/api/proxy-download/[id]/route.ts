export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getBeatmapset } from '@/lib/osu-api';

// === ULTRA SPEED SETTINGS ===
const SKIP_ALL_PROCESSING = true;     // Bypass ALL processing for raw speed
const USE_DIRECT_PASSTHROUGH = true;  // Direct passthrough of remote responses
const TIMEOUT_MS = 15000;             // Shorter timeout for faster fallback

// === MIRROR CONFIGURATION - HYPER PERFORMANCE ===
const MIRRORS = [
  // Catboy.best - Ultra fast direct CDN
  {
    name: 'catboy',
    url: (id: string) => `https://catboy.best/d/${id}`,
    cdnUrl: (id: string) => `https://catboy.best/d/${id}`,
    headers: {
      'User-Agent': 'osu-mirror/1.0',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Referer': 'https://catboy.best/'
    }
  },
  // osu.direct - Official redirect to fast CDN
  {
    name: 'osu.direct',
    url: (id: string) => `https://osu.direct/d/${id}`,
    cdnUrl: (id: string) => `https://osu.direct/d/${id}`,
    headers: {
      'User-Agent': 'osu-mirror/1.0',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Referer': 'https://osu.direct/'
    }
  },
  // Sayobot - Very fast Chinese mirror
  {
    name: 'sayobot',
    url: (id: string) => `https://txy1.sayobot.cn/beatmaps/download/full/${id}`,
    cdnUrl: (id: string) => `https://txy1.sayobot.cn/beatmaps/download/full/${id}`,
    headers: {
      'User-Agent': 'osu-mirror/1.0',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Referer': 'https://sayobot.cn/'
    }
  },
  // Official osu! beatmap download
  {
    name: 'osu-official',
    url: (id: string) => `https://osu.ppy.sh/beatmapsets/${id}/download`,
    cdnUrl: (id: string) => `https://osu.ppy.sh/beatmapsets/${id}/download`,
    headers: {
      'User-Agent': 'osu-mirror/1.0',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Referer': 'https://osu.ppy.sh/'
    }
  },
];

// Direct links for front-end fallback
const DIRECT_URLS = MIRRORS.reduce((acc, mirror) => {
  acc[mirror.name] = mirror.cdnUrl || mirror.url;
  return acc;
}, {} as Record<string, Function>);

// Performance optimization headers for maximum bandwidth
const PERFORMANCE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'X-Accel-Buffering': 'no', // Disable Nginx buffering
  'Content-Transfer-Encoding': 'binary', // Binary transfer mode
  'Transfer-Encoding': 'chunked', // Chunked transfer
  'Keep-Alive': 'timeout=120, max=1000' // Maintain connection for large files
};

// === ULTRA DOWNLOAD FUNCTION ===
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params);
  const startTime = Date.now();
  
  try {
    console.log(`🚀 Starting ultra-speed download for beatmap ${id}`);
    
    // Create promises for all mirrors to race
    const downloadPromises = MIRRORS.map(async (mirror) => {
      // Create a specific abort controller for each request
      const controller = new AbortController();
      
      // Set individual timeouts for each request
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      
      try {
        console.log(`Trying ${mirror.name} for ${id}...`);
        
        // Ultra direct fetch
        const response = await fetch(mirror.url(id), {
          method: 'GET', 
          headers: mirror.headers,
          signal: controller.signal,
          next: { revalidate: 0 } // Force fresh request
        });
        
        if (!response.ok) {
          throw new Error(`${mirror.name} returned status ${response.status}`);
        }
        
        // Success! Clean up timeout
        clearTimeout(timeoutId);
        
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        const contentLength = response.headers.get('Content-Length');
        
        console.log(`✅ ${mirror.name} responded in ${Date.now() - startTime}ms with ${contentLength || 'unknown'} bytes`);
        
        return {
          mirror: mirror.name,
          response,
          contentType,
          contentLength
        };
      } catch (error) {
        clearTimeout(timeoutId);
        console.log(`❌ ${mirror.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    });
    
    try {
      // Race for fastest mirror - first one to resolve wins
      const { mirror, response, contentType, contentLength } = await Promise.any(downloadPromises);
      
      // Generate a filename (either from API or basic)
      const filename = await Promise.race([
        getBeatmapset(id).then(data => 
          data ? `${data.artist} - ${data.title}.osz` : `${id}.osz`
        ),
        new Promise<string>(r => setTimeout(() => r(`${id}.osz`), 200))
      ]);
      
      console.log(`🔥 Streaming directly from ${mirror} (${contentLength || 'unknown size'})`);
      
      // DIRECT STREAMING - Maximum bandwidth utilization
      return new NextResponse(response.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          ...(contentLength ? { 'Content-Length': contentLength } : {}),
          ...PERFORMANCE_HEADERS,
          'X-Download-Source': mirror
        }
      });
    } catch (allMirrorsError) {
      // All mirrors failed, return direct links
      console.error(`❌ All mirrors failed for ${id}`);
      
      return NextResponse.json({
        error: 'All download attempts failed',
        directLinks: Object.fromEntries(
          Object.entries(DIRECT_URLS).map(([name, urlFn]) => [name, (urlFn as Function)(id)])
        ),
        id
      }, { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.error(`Fatal error for ${id}:`, error);
    
    return NextResponse.json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      directLinks: Object.fromEntries(
        Object.entries(DIRECT_URLS).map(([name, urlFn]) => [name, (urlFn as Function)(id)])
      ),
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
