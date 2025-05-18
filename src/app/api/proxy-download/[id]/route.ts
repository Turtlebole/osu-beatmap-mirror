export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getBeatmapset, getAccessToken } from '@/lib/osu-api';
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
    name: 'osu-direct',
    async getUrl(id: string) {
      // Get official osu! API token
      const token = await getAccessToken();
      return {
        url: `https://osu.ppy.sh/beatmapsets/${id}/download`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'osu-mirror/1.0.0',
          'Accept': 'application/octet-stream',
          'Referer': 'https://osu.ppy.sh/',
          'Origin': 'https://osu.ppy.sh'
        },
        validateResponse: (response: any) => {
          // Make sure we're not getting HTML
          const contentType = response.headers['content-type'] || '';
          const contentLength = parseInt(response.headers['content-length'] || '0');
          
          // Reject HTML responses and suspiciously small files (like 484 bytes errors)
          return !contentType.includes('text/html') && contentLength > 10000;
        }
      };
    },
  },
  {
    name: 'chimu.moe',
    async getUrl(id: string) {
      return {
        url: `https://api.chimu.moe/v1/download/${id}`,
        headers: {
          'User-Agent': 'osu-mirror/1.0.0',
          'Accept': 'application/octet-stream',
        },
        validateResponse: (response: any) => {
          const contentLength = parseInt(response.headers['content-length'] || '0');
          return contentLength > 1000; // Ensure it's not just an error message
        }
      };
    },
  },
  {
    name: 'kitsu.moe',
    async getUrl(id: string) {
      return {
        url: `https://kitsu.moe/api/d/${id}`,
        headers: {
          'User-Agent': 'osu-mirror/1.0.0',
          'Accept': 'application/octet-stream',
        },
        validateResponse: (response: any) => {
          const contentLength = parseInt(response.headers['content-length'] || '0');
          return contentLength > 1000;
        }
      };
    },
  },
  {
    name: 'beatconnect.io',
    async getUrl(id: string) {
      return {
        url: `https://beatconnect.io/b/${id}`,
        headers: {
          'User-Agent': 'osu-mirror/1.0.0',
          'Accept': 'application/octet-stream',
        },
        validateResponse: (response: any) => {
          const contentLength = parseInt(response.headers['content-length'] || '0');
          return contentLength > 1000;
        }
      };
    },
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

// Detect if a download response is valid
function isValidBeatmapFile(buffer: Buffer): boolean {
  // Check for OSZ file signature (it's a ZIP file)
  // More thorough validation to ensure we have a real OSZ/ZIP file
  if (buffer.length < 1000) {
    console.log(`File too small (${buffer.length} bytes), likely an error response`);
    return false; // Too small to be a valid beatmap
  }
  
  // Verify ZIP file signature (PK\x03\x04)
  if (!(buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04)) {
    console.log('Invalid file signature, not a ZIP/OSZ file');
    return false;
  }
  
  // Basic check for ZIP central directory signature (PK\x01\x02)
  // This should exist in any valid ZIP file
  let hasCentralDir = false;
  for (let i = 0; i < buffer.length - 4; i++) {
    if (buffer[i] === 0x50 && buffer[i+1] === 0x4B && buffer[i+2] === 0x01 && buffer[i+3] === 0x02) {
      hasCentralDir = true;
      break;
    }
  }
  
  if (!hasCentralDir && buffer.length > 5000) {
    console.log('No central directory found in ZIP structure');
    return false;
  }
  
  return true;
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
      try {
        const fileBuffer = fs.readFileSync(cacheFilePath);
        const stats = fs.statSync(cacheFilePath);
        const fileAge = Date.now() - stats.mtimeMs;
        
        // Verify it's a genuine OSZ file and not too old
        if (fileAge < CACHE_MAX_AGE && isValidBeatmapFile(fileBuffer)) {
          console.log(`Serving cached beatmap ${id}`);
          
          // Return the cached file
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
        } else if (!isValidBeatmapFile(fileBuffer)) {
          console.log(`Invalid cached file detected for beatmap ${id}, removing`);
          fs.unlinkSync(cacheFilePath);
        }
      } catch (cacheError) {
        console.error('Error reading cache file:', cacheError);
      }
    }

    const mirrorErrors = [];

    // Try each mirror in order until one works
    for (const mirror of MIRRORS) {
      try {
        console.log(`Attempting download from ${mirror.name} for beatmap ${id}`);
        
        const downloadConfig = await mirror.getUrl(id);
        
        // Stream the download through our server
        const response = await axios.get(downloadConfig.url, {
          responseType: 'arraybuffer',
          headers: downloadConfig.headers,
          timeout: 45000, // 45 second timeout
          maxRedirects: 5,
          validateStatus: (status) => status >= 200 && status < 400,
        });
        
        // Make sure we got a valid response
        if (!response.data || response.data.length === 0) {
          console.log(`${mirror.name} returned empty file for beatmap ${id}`);
          mirrorErrors.push(`${mirror.name}: Empty response`);
          continue;
        }
        
        // Check for suspiciously small files (like 484 byte error messages)
        if (response.data.length < 1000) {
          console.log(`${mirror.name} returned suspiciously small file (${response.data.length} bytes) for beatmap ${id}`);
          mirrorErrors.push(`${mirror.name}: Small file (${response.data.length} bytes)`);
          continue;
        }
        
        // Response validation if provided
        if (downloadConfig.validateResponse && !downloadConfig.validateResponse(response)) {
          console.log(`${mirror.name} response failed validation for beatmap ${id}`);
          mirrorErrors.push(`${mirror.name}: Failed validation`);
          continue;
        }
        
        // Verify the file is a genuine OSZ file
        const fileBuffer = Buffer.from(response.data);
        if (!isValidBeatmapFile(fileBuffer)) {
          console.log(`${mirror.name} returned invalid OSZ file for beatmap ${id}`);
          mirrorErrors.push(`${mirror.name}: Invalid OSZ file`);
          continue;
        }
        
        console.log(`Successfully downloaded beatmap ${id} from ${mirror.name}`);
        
        // Save to cache if enabled
        if (ENABLE_CACHE) {
          fs.writeFileSync(cacheFilePath, fileBuffer);
        }
        
        // Return the file to the client
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'public, max-age=86400',
            'X-Cache-Hit': 'false'
          }
        });
      } catch (error: any) {
        console.error(`Error downloading from ${mirror.name} for beatmap ${id}:`, error);
        mirrorErrors.push(`${mirror.name}: ${error.message}`);
      }
    }

    // If we've tried all mirrors and none worked, return an error
    return NextResponse.json(
      { error: 'Failed to download beatmap', mirrors: mirrorErrors },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
