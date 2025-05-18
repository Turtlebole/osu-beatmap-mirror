export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getBeatmapset } from '@/lib/osu-api';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { Readable } from 'stream';

// === MAXIMUM SPEED SETTINGS ===
const MAX_BANDWIDTH = true;           // Enable all bandwidth optimization techniques
const CHUNK_SIZE = 4 * 1024 * 1024;   // 4MB chunks for parallel downloads
const SKIP_ALL_PROCESSING = true;     // Bypass ALL processing for raw speed
const USE_DIRECT_PASSTHROUGH = true;  // Direct passthrough of remote responses
const COMPRESSION = false;            // Disable compression for speed

// === MIRROR CONFIGURATION - ULTRA FAST ===
const MIRRORS = [
  // Sayobot - Extremely fast Chinese mirror with great bandwidth
  {
    name: 'sayobot',
    url: (id: string) => `https://txy1.sayobot.cn/beatmaps/download/full/${id}`,
    cdnUrl: (id: string) => `https://txy1.sayobot.cn/beatmaps/download/full/${id}`, // CDN path
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Referer': 'https://sayobot.cn/',
    }
  },
  // Direct chimu CDN
  {
    name: 'chimu.moe',
    url: (id: string) => `https://cdn.chimu.moe/beatmaps/${id}`,
    cdnUrl: (id: string) => `https://cdn.chimu.moe/beatmaps/${id}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Referer': 'https://chimu.moe/beatmaps',
    }
  },
  // Alternative chimu mirror
  {
    name: 'chimu-alt',
    url: (id: string) => `https://api.chimu.moe/v1/download/${id}?n=1`,
    cdnUrl: (id: string) => `https://api.chimu.moe/v1/download/${id}?n=1`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Referer': 'https://chimu.moe/beatmaps',
    }
  },
  // Kitsu mirror
  {
    name: 'kitsu.moe',
    url: (id: string) => `https://kitsu.moe/api/d/${id}`,
    cdnUrl: (id: string) => `https://kitsu.moe/api/d/${id}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Referer': 'https://kitsu.moe/',
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
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-Accel-Buffering': 'no', // Disable Nginx buffering
  'Content-Transfer-Encoding': 'binary', // Binary transfer mode
  'Transfer-Encoding': 'chunked', // Chunked transfer
};

// === HIGH PERFORMANCE DOWNLOAD FUNCTION ===
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params);
  const startTime = Date.now();
  const abortController = new AbortController();
  
  // Set 30 second timeout for the entire operation
  const timeoutId = setTimeout(() => abortController.abort(), 30000);
  
  try {
    // === ULTRA DIRECT MODE - MAX PERFORMANCE ===
    if (SKIP_ALL_PROCESSING) {
      console.log(`🚀 Starting max bandwidth download for beatmap ${id}`);
      
      // Create promises for first 3 mirrors
      const downloadPromises = MIRRORS.slice(0, 3).map(async (mirror) => {
        try {
          console.log(`Trying ${mirror.name} for ${id}...`);
          
          // Direct fetch with no overhead
          const response = await fetch(mirror.url(id), {
            method: 'GET',
            headers: mirror.headers,
            signal: abortController.signal,
            cache: 'no-store', // Skip cache
            next: { revalidate: 0 } // Force fresh request
          });
          
          if (!response.ok) {
            throw new Error(`${mirror.name} returned status ${response.status}`);
          }
          
          const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
          const contentLength = response.headers.get('Content-Length');
          
          // Success! This mirror responded
          console.log(`✅ ${mirror.name} responded in ${Date.now() - startTime}ms with ${contentLength || 'unknown'} bytes`);
          
          return {
            mirror: mirror.name,
            response,
            contentType,
            contentLength
          };
        } catch (error) {
          console.log(`❌ ${mirror.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
      });
      
      try {
        // Race to get fastest mirror
        const { mirror, response, contentType, contentLength } = await Promise.any(downloadPromises);
        
        // Cancel the timeout as we got a response
        clearTimeout(timeoutId);
        
        // Generate a filename (either from API or basic)
        const filename = await Promise.race([
          getBeatmapset(id).then(data => 
            data ? `${data.artist} - ${data.title}.osz` : `${id}.osz`
          ),
          new Promise<string>(r => setTimeout(() => r(`${id}.osz`), 200))
        ]);
        
        console.log(`🔄 Streaming from ${mirror} (${contentLength || 'unknown size'})`);
        
        if (USE_DIRECT_PASSTHROUGH) {
          // DIRECT STREAMING - Maximum bandwidth utilization
          return new NextResponse(response.body, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
              ...(contentLength ? { 'Content-Length': contentLength } : {}),
              ...PERFORMANCE_HEADERS,
              'X-Download-Source': mirror,
              'X-Content-Type-Options': 'nosniff'
            }
          });
        } else {
          // Buffer mode as fallback
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
              'Content-Length': buffer.length.toString(),
              ...PERFORMANCE_HEADERS,
              'X-Download-Source': mirror
            }
          });
        }
      } catch (allMirrorsError) {
        // All mirrors failed, return direct links
        console.error(`❌ All mirrors failed for ${id}`);
        clearTimeout(timeoutId);
        
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
    }
    
    // Fallback implementation - should never run with SKIP_ALL_PROCESSING=true
    return NextResponse.json({
      error: 'Download mode not available',
      directLinks: Object.fromEntries(
        Object.entries(DIRECT_URLS).map(([name, urlFn]) => [name, (urlFn as Function)(id)])
      ),
    }, { status: 500 });
    
  } catch (error) {
    clearTimeout(timeoutId);
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
