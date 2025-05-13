"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useDownloadQueue, DownloadItem } from '@/context/DownloadQueueContext';

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
  const { addToQueue, updateProgress, queue, setError } = useDownloadQueue();

  // Check if this beatmap is already in the queue
  const isInQueue = queue.some(item => item.beatmapId === beatmapId);
  
  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isInQueue) return;
    
    setIsDownloading(true);
    
    // Add to queue and get the ID
    const itemId = addToQueue({
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
      // Update status to downloading
      updateProgress(itemId, 0, 'downloading');
      
      // Start the download with progress tracking
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `Download failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If we can't parse the error, just use the status code message
        }
        
        setError(itemId, errorMessage);
        return;
      }
      
      // Get content type to check if we received an error message JSON instead of a file
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const jsonData = await response.json();
          if (jsonData.error) {
            setError(itemId, jsonData.error);
            return;
          }
        } catch {
          // Continue with the download if JSON parsing fails
        }
      }
      
      const contentLength = response.headers.get('Content-Length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      
      // Handle empty response
      if (totalBytes === 0) {
        setError(itemId, 'Received empty file from server');
        return;
      }
      
      // Create a reader for the response
      const reader = response.body?.getReader();
      if (!reader) {
        setError(itemId, 'Failed to get response data');
        return;
      }
      
      // Create an array to store the received chunks
      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;
      
      // Process the data chunks
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Download complete
          break;
        }
        
        // Store this chunk
        chunks.push(value);
        
        // Calculate progress
        receivedBytes += value.length;
        const progress = totalBytes ? Math.round((receivedBytes / totalBytes) * 100) : 0;
        
        // Update progress in queue
        updateProgress(itemId, progress);
      }
      
      // Combine all chunks into a single array buffer
      const allChunks = new Uint8Array(receivedBytes);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }
      
      // Create a blob and trigger download
      const blob = new Blob([allChunks], { type: 'application/octet-stream' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      // Update the progress to completed
      updateProgress(itemId, 100, 'completed');
      
    } catch (error) {
      console.error('Download error:', error);
      // Update with error using our saved ID
      let errorMessage = 'Download failed unexpectedly';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(itemId, errorMessage);
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