"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import { useDownloadQueue } from '@/context/DownloadQueueContext';
import { useToast } from '@/components/ui/use-toast';

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
  const { addToQueue, queue } = useDownloadQueue();
  const { toast } = useToast();
  const [isInitiating, setIsInitiating] = useState(false);

  // Check if this beatmap is already in the queue
  const isInQueue = queue.some(item => item.beatmapId === beatmapId);
  
  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isInQueue || isInitiating) return;
    
    setIsInitiating(true);
    
    // Verify the beatmap exists before adding to queue
    try {
      // Quick check to make sure server is reachable
      const checkResponse = await fetch(`/api/proxy-download/${beatmapId}`, {
        method: 'HEAD',
      }).catch(() => null);
      
      if (!checkResponse || !checkResponse.ok) {
        if (checkResponse && checkResponse.status === 404) {
          toast({
            title: "Beatmap not found",
            description: "The requested beatmap could not be found on any server.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Network error",
            description: "Could not connect to download server. Please try again later.",
            variant: "destructive"
          });
        }
        setIsInitiating(false);
        return;
      }
    } catch (error) {
      console.error('Error checking beatmap availability:', error);
    }
    
    // Update download stats (non-critical)
    fetch('/api/download-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ beatmapId }),
    }).catch(err => console.error('Failed to update download stats:', err));
    
    // Add to queue with the new server-side proxy URL
    addToQueue({
      beatmapId,
      title,
      artist,
      creator,
      thumbnail,
      url: `/api/proxy-download/${beatmapId}`,
      filename
    });
    
    setIsInitiating(false);
  };

  return (
    <Button 
      asChild 
      size={size} 
      className="bg-pink-600 hover:bg-pink-700 text-white relative"
      disabled={isInQueue || isInitiating}
    >
      <a 
        href={`/api/proxy-download/${beatmapId}`}
        onClick={handleDownload}
      >
        {isInitiating ? (
          <>
            <span className="animate-pulse mr-2">●</span>
            Initiating...
          </>
        ) : isInQueue ? (
          <>
            <Download className="mr-2 h-4 w-4" />
            In Queue
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download Beatmap
          </>
        )}
      </a>
    </Button>
  );
} 