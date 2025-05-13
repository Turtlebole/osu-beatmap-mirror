export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getBeatmapset } from '@/lib/osu-api';
import { unstable_noStore as noStore } from 'next/cache';
import { checkRateLimit, recordDownload, getRateLimiterStats } from '@/lib/rateLimiter';

const OSU_DOWNLOAD_URL = 'https://osu.ppy.sh/beatmapsets';

const STATS_LOG_FREQUENCY = 50;
let requestCounter = 0;

function logMessage(level: 'INFO' | 'SUCCESS' | 'ERROR' | 'IMPORTANT', message: string): void {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  
  switch (level) {
    case 'SUCCESS':
      console.log(`[${timestamp}] [SUCCESS] ${message}`);
      break;
    case 'ERROR':
      console.log(`[${timestamp}] [ERROR] ${message}`);
      break;
    case 'IMPORTANT':
      console.log(`[${timestamp}] [IMPORTANT] ${message}`);
      break;
    default:
      console.log(`[${timestamp}] [INFO] ${message}`);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  noStore();
  
  const { id } = await Promise.resolve(params);
  
  const ip = 
    req.headers.get('cf-connecting-ip') || 
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
    '127.0.0.1';
  
  if (++requestCounter % STATS_LOG_FREQUENCY === 0) {
    logMessage('INFO', `Rate limiter stats: ${JSON.stringify(getRateLimiterStats())}`);
  }
  
  const rateLimitCheck = checkRateLimit(ip, id);
  if (rateLimitCheck.isLimited) {
    logMessage('IMPORTANT', `Rate limit hit for beatmap ${id} by IP ${anonymizeIp(ip)}: ${rateLimitCheck.message}`);
    return NextResponse.json(
      { error: rateLimitCheck.message },
      { status: 429 }
    );
  }
  
  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: 'Invalid beatmap ID' },
      { status: 400 }
    );
  }
  
  let beatmapInfo;
  try {
    beatmapInfo = await getBeatmapset(id);
  } catch (error) {
    logMessage('INFO', `Failed to fetch beatmap info for ${id}`);
  }
  
  const filename = beatmapInfo 
    ? `${beatmapInfo.artist} - ${beatmapInfo.title} (${beatmapInfo.creator}).osz`
    : `beatmapset-${id}.osz`;
    
  const safeFilename = filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ');
  
  try {
    logMessage('INFO', `Attempting download from official osu! website for beatmap ${id}`);
    
    const accessToken = await getAccessToken();
    
    const downloadUrl = `${OSU_DOWNLOAD_URL}/${id}/download`;
    
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'osu-mirror/1.0.0',
        'Accept': 'application/octet-stream',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      logMessage('INFO', `Official source failed with status: ${response.status}`);
      return await fallbackToMirrors(id, safeFilename, ip);
    }
    
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    if (contentType && contentType.includes('text/html')) {
      logMessage('INFO', 'Official source returned HTML instead of file');
      return await fallbackToMirrors(id, safeFilename, ip);
    }
    
    const fileData = await response.arrayBuffer();
    
    if (!fileData || fileData.byteLength === 0) {
      logMessage('INFO', 'Official source returned empty file');
      return await fallbackToMirrors(id, safeFilename, ip);
    }
    
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    headers.set('Content-Type', 'application/octet-stream');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    
    logMessage('SUCCESS', `Downloaded beatmap ${id} from official osu! website (${fileData.byteLength} bytes)`);
    
    recordDownload(ip, id);
    
    return new NextResponse(fileData, {
      status: 200,
      headers,
    });
  } catch (error) {
    logMessage('INFO', `Error downloading from official osu! website, falling back to mirrors`);
    return await fallbackToMirrors(id, safeFilename, ip);
  }
}

async function fallbackToMirrors(id: string, filename: string, ip: string) {
  logMessage('IMPORTANT', `Using fallback mirrors for beatmap ${id} since official source failed`);
  
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

  const headers = new Headers();
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  headers.set('Content-Type', 'application/octet-stream');

  for (const mirror of MIRRORS) {
    try {
      logMessage('INFO', `Attempting download from ${mirror.name} for beatmap ${id}`);
      
      const downloadUrl = mirror.getUrl(id);
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'osu-mirror/1.0.0',
          'Accept': 'application/octet-stream',
        },
        redirect: 'follow',
      }).catch(() => {
        logMessage('INFO', `Network error when connecting to ${mirror.name}`);
        return null;
      });

      if (!response || !response.ok) {
        logMessage('INFO', `Failed to download from ${mirror.name}`);
        continue;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        logMessage('INFO', `${mirror.name} returned HTML, not a file`);
        continue;
      }
      
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        headers.set('Content-Length', contentLength);
      }
      
      try {
        const fileData = await response.arrayBuffer();
        
        if (!fileData || fileData.byteLength === 0) {
          logMessage('INFO', `${mirror.name} returned empty file`);
          continue;
        }
        
        logMessage('SUCCESS', `Downloaded from ${mirror.name} (${fileData.byteLength} bytes)`);
        
        recordDownload(ip, id);
        
        return new NextResponse(fileData, {
          status: 200,
          headers,
        });
      } catch (error) {
        logMessage('INFO', `Error processing response from ${mirror.name}`);
        continue;
      }
    } catch (error) {
      logMessage('INFO', `Error with ${mirror.name} mirror`);
    }
  }

  logMessage('ERROR', `Failed to download beatmap ${id} from any source`);
  return NextResponse.json(
    { error: 'Failed to download beatmap from any source. Please try again later.' },
    { status: 503 }
  );
}

function anonymizeIp(ip: string): string {
  if (ip.includes('.')) {
    const parts = ip.split('.');
    parts[parts.length - 1] = 'xxx';
    return parts.join('.');
  }
  else if (ip.includes(':')) {
    const parts = ip.split(':');
    parts[parts.length - 1] = 'xxx';
    return parts.join(':');
  }
  return 'unknown';
} 