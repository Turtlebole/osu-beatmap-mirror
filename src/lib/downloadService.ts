"use client";

import { DownloadItem } from '@/context/DownloadQueueContext';

const MAX_CONCURRENT_DOWNLOADS = 3;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const activeDownloads = new Map<string, { controller: AbortController, retries: number }>();

export async function processDownloadQueue(
  queue: DownloadItem[],
  updateProgress: (id: string, progress: number, status?: DownloadItem['status']) => void,
  removeFromQueue: (id: string) => void
) {
  const queuedItems = queue.filter(item => item.status === 'queued');
  const currentlyDownloading = queue.filter(item => item.status === 'downloading').length;
  const slotsAvailable = MAX_CONCURRENT_DOWNLOADS - currentlyDownloading;
  
  if (slotsAvailable <= 0 || queuedItems.length === 0) return;
  
  const itemsToStart = queuedItems.slice(0, slotsAvailable);
  
  for (const item of itemsToStart) {
    downloadFile(item, updateProgress)
      .catch(error => {
        console.error(`Download error for ${item.beatmapId}:`, error);
        updateProgress(item.id, 0, 'error');
      });
  }
}

export async function downloadFile(
  item: DownloadItem,
  updateProgress: (id: string, progress: number, status?: DownloadItem['status']) => void
): Promise<void> {
  const controller = new AbortController();
  activeDownloads.set(item.id, { controller, retries: 0 });
  
  try {
    updateProgress(item.id, 0, 'downloading');
    
    // Use our server-side proxy API instead of direct download
    const apiUrl = `/api/proxy-download/${item.beatmapId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/octet-stream',
      },
      signal: controller.signal,
    });
    
    if (!response.ok) {
      // Try to get more details from the error response
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          throw new Error(errorData.error);
        }
      } catch {}
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentLength = response.headers.get('Content-Length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    
    // Check for suspiciously small files - likely an error
    if (totalBytes > 0 && totalBytes < 1000) {
      throw new Error(`Invalid beatmap file: Size too small (${totalBytes} bytes)`);
    }
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }
    
    let receivedBytes = 0;
    let chunks: Uint8Array[] = [];
    let lastProgressUpdate = Date.now();
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedBytes += value.length;
      
      // Limit progress updates to avoid excessive rerenders
      const now = Date.now();
      if (now - lastProgressUpdate > 200) {
        const progress = totalBytes ? Math.round((receivedBytes / totalBytes) * 100) : 
                                     Math.round((receivedBytes / 1024 / 1024) * 5); // Fallback progress estimation
        updateProgress(item.id, Math.min(progress, 99)); // Cap at 99% until complete
        lastProgressUpdate = now;
      }
    }
    
    const allChunks = new Uint8Array(receivedBytes);
    let position = 0;
    
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }
    
    const blob = new Blob([allChunks], { type: 'application/octet-stream' });
    
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateProgress(item.id, 100, 'completed');
    activeDownloads.delete(item.id);
    
  } catch (error: any) {
    const downloadInfo = activeDownloads.get(item.id);
    
    if (error.name === 'AbortError') {
      console.log(`Download cancelled for ${item.filename}`);
      activeDownloads.delete(item.id);
    } else if (downloadInfo && downloadInfo.retries < MAX_RETRIES) {
      // Retry logic
      console.log(`Retrying download for ${item.filename} (${downloadInfo.retries + 1}/${MAX_RETRIES})`);
      activeDownloads.set(item.id, { 
        controller: new AbortController(), 
        retries: downloadInfo.retries + 1 
      });
      
      updateProgress(item.id, 0, 'downloading');
      
      // Wait before retrying
      setTimeout(() => {
        downloadFile(item, updateProgress).catch(e => {
          console.error(`Retry failed for ${item.filename}:`, e);
          updateProgress(item.id, 0, 'error');
        });
      }, RETRY_DELAY_MS);
    } else {
      console.error(`Download error for ${item.filename}:`, error);
      updateProgress(item.id, 0, 'error');
      activeDownloads.delete(item.id);
      throw error;
    }
  }
}

export function cancelDownload(id: string): boolean {
  const downloadInfo = activeDownloads.get(id);
  if (downloadInfo) {
    downloadInfo.controller.abort();
    activeDownloads.delete(id);
    return true;
  }
  return false;
}

export function getDownloadStats() {
  return {
    activeDownloads: activeDownloads.size,
    maxConcurrent: MAX_CONCURRENT_DOWNLOADS
  };
} 