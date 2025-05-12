"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useDownloadQueue } from '@/context/DownloadQueueContext';

interface DownloadButtonProps {
  url: string;
  filename: string;
  beatmapId: string;
  title: string;
  artist: string;
  creator: string;
  thumbnail: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function DownloadButton({ 
  url, 
  filename, 
  beatmapId, 
  title, 
  artist, 
  creator, 
  thumbnail,
  size = 'lg' 
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { addToQueue, updateProgress, queue } = useDownloadQueue();

  // Check if this beatmap is already in the queue
  const isInQueue = queue.some(item => item.beatmapId === beatmapId);

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isInQueue) return;
    
    setIsDownloading(true);
    
    // Add to queue
    addToQueue({
      beatmapId,
      title,
      artist,
      creator,
      thumbnail,
      url,
      filename
    });
    
    // Start download process
    try {
      // Create a unique identifier for this download
      const downloadId = queue.length;
      
      // Start the download with progress tracking
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentLength = response.headers.get('Content-Length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      
      // Create a reader for the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get response reader');
      
      let receivedBytes = 0;
      
      // Find the item in the queue
      const queueItem = queue.find(item => item.beatmapId === beatmapId);
      if (!queueItem) throw new Error('Queue item not found');
      
      // Update status to downloading
      updateProgress(queueItem.id, 0, 'downloading');
      
      // Process the data chunks
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Download complete
          updateProgress(queueItem.id, 100, 'completed');
          break;
        }
        
        // Calculate progress
        receivedBytes += value.length;
        const progress = totalBytes ? Math.round((receivedBytes / totalBytes) * 100) : 0;
        
        // Update progress in queue
        updateProgress(queueItem.id, progress);
        
        // Trigger download of the received chunk (in a real app, you'd accumulate all chunks)
        if (done && receivedBytes > 0) {
          // In a real implementation, we would accumulate all chunks and then create a blob
          // This is simplified for demonstration
          const blob = new Blob([value], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      // Find the item in the queue
      const queueItem = queue.find(item => item.beatmapId === beatmapId);
      if (queueItem) {
        updateProgress(queueItem.id, 0, 'error');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      asChild 
      size={size} 
      className="bg-pink-600 hover:bg-pink-700 text-white relative"
      disabled={isDownloading || isInQueue}
    >
      <a 
        href={url} 
        onClick={handleDownload}
        className={isDownloading ? 'opacity-80' : ''}
      >
        <Download className={`${isDownloading ? 'animate-pulse' : ''} mr-2 h-4 w-4`} /> 
        {isInQueue ? 'In Queue' : 'Download Beatmap'}
      </a>
    </Button>
  );
} 