"use client";

import { DownloadItem } from '@/context/DownloadQueueContext';

const MAX_CONCURRENT_DOWNLOADS = 3;

const activeDownloads = new Map<string, AbortController>();

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
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }
    
    let receivedBytes = 0;
    let chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedBytes += value.length;
      
      const progress = totalBytes ? Math.round((receivedBytes / totalBytes) * 100) : 0;
      updateProgress(item.id, progress);
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
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
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

export function cancelDownload(id: string): boolean {
  const controller = activeDownloads.get(id);
  if (controller) {
    controller.abort();
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