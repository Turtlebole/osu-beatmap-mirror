"use client";

import { useEffect } from 'react';
import { useDownloadQueue } from '@/context/DownloadQueueContext';
import { processDownloadQueue } from '@/lib/downloadService';

/**
 * This is a "headless" component that runs in the background
 * to process the download queue.
 */
export default function DownloadQueueProcessor() {
  const { queue, updateProgress, removeFromQueue } = useDownloadQueue();
  
  // Process the queue whenever it changes
  useEffect(() => {
    const processQueue = async () => {
      await processDownloadQueue(queue, updateProgress, removeFromQueue);
    };
    
    processQueue();
    
    // Set up interval to check queue regularly
    const intervalId = setInterval(processQueue, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [queue, updateProgress, removeFromQueue]);
  
  // This component doesn't render anything
  return null;
} 