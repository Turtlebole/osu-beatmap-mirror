"use client";

import { DownloadItem } from '@/context/DownloadQueueContext';

// Maximum number of simultaneous downloads
const MAX_CONCURRENT_DOWNLOADS = 3;

// Map to track active downloads
const activeDownloads = new Map<string, AbortController>();

// Queue processor
export async function processDownloadQueue(
  queue: DownloadItem[],
  updateProgress: (id: string, progress: number, status?: DownloadItem['status']) => void,
  removeFromQueue: (id: string) => void
) {
  // Get items that are queued and not yet being processed
  const queuedItems = queue.filter(item => item.status === 'queued');
  
  // Count current active downloads
  const currentlyDownloading = queue.filter(item => item.status === 'downloading').length;
  
  // Calculate how many new downloads we can start
  const slotsAvailable = MAX_CONCURRENT_DOWNLOADS - currentlyDownloading;
  
  if (slotsAvailable <= 0 || queuedItems.length === 0) return;
  
  // Start downloads for the available slots
  const itemsToStart = queuedItems.slice(0, slotsAvailable);
  
  for (const item of itemsToStart) {
    // Start download in background
    downloadFile(item, updateProgress)
      .catch(error => {
        console.error(`Download error for ${item.beatmapId}:`, error);
        updateProgress(item.id, 0, 'error');
      });
  }
}

// Download a single file with progress tracking
export async function downloadFile(
  item: DownloadItem,
  updateProgress: (id: string, progress: number, status?: DownloadItem['status']) => void
): Promise<void> {
  // Create abort controller for this download
  const abortController = new AbortController();
  activeDownloads.set(item.id, abortController);
  
  try {
    updateProgress(item.id, 0, 'downloading');
    
    const response = await fetch(item.url, {
      method: 'GET',
      headers: {
        Accept: 'application/octet-stream',
      },
      signal: abortController.signal,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentLength = response.headers.get('Content-Length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    
    // Get reader from the response body
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }
    
    // Read the data chunks
    let receivedBytes = 0;
    let chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedBytes += value.length;
      
      // Calculate and update progress
      const progress = totalBytes ? Math.round((receivedBytes / totalBytes) * 100) : 0;
      updateProgress(item.id, progress);
    }
    
    // Concatenate chunks
    const allChunks = new Uint8Array(receivedBytes);
    let position = 0;
    
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }
    
    // Create a blob from all the chunks
    const blob = new Blob([allChunks], { type: 'application/octet-stream' });
    
    // Create object URL
    const url = URL.createObjectURL(blob);
    
    // Create and trigger download link
    const a = document.createElement('a');
    a.href = url;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Mark as completed
    updateProgress(item.id, 100, 'completed');
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`Download cancelled for ${item.filename}`);
    } else {
      console.error(`Download error for ${item.filename}:`, error);
      updateProgress(item.id, 0, 'error');
    }
    throw error;
  } finally {
    activeDownloads.delete(item.id);
  }
}

// Cancel a download
export function cancelDownload(id: string): boolean {
  const controller = activeDownloads.get(id);
  if (controller) {
    controller.abort();
    activeDownloads.delete(id);
    return true;
  }
  return false;
}

// Get download progress information
export function getDownloadStats() {
  return {
    activeDownloads: activeDownloads.size,
    maxConcurrent: MAX_CONCURRENT_DOWNLOADS
  };
} 