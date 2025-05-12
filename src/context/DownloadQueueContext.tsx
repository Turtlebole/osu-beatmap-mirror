"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define types for download items and queue state
export interface DownloadItem {
  id: string;
  beatmapId: string;
  title: string;
  artist: string;
  creator: string;
  thumbnail: string;
  url: string;
  filename: string;
  progress: number;
  status: 'queued' | 'downloading' | 'completed' | 'error';
  error?: string;
  startTime?: number;
}

interface DownloadQueueContextType {
  queue: DownloadItem[];
  addToQueue: (item: Omit<DownloadItem, 'id' | 'progress' | 'status'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  updateProgress: (id: string, progress: number, status?: DownloadItem['status']) => void;
  setError: (id: string, error: string) => void;
}

const DownloadQueueContext = createContext<DownloadQueueContextType | undefined>(undefined);

export function useDownloadQueue() {
  const context = useContext(DownloadQueueContext);
  if (context === undefined) {
    throw new Error('useDownloadQueue must be used within a DownloadQueueProvider');
  }
  return context;
}

export function DownloadQueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<DownloadItem[]>([]);

  const addToQueue = useCallback((item: Omit<DownloadItem, 'id' | 'progress' | 'status'>) => {
    setQueue(prev => [
      ...prev,
      {
        ...item,
        id: uuidv4(),
        progress: 0,
        status: 'queued',
        startTime: Date.now()
      }
    ]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const updateProgress = useCallback((id: string, progress: number, status?: DownloadItem['status']) => {
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          progress,
          status: status || item.status
        };
      }
      return item;
    }));
  }, []);

  const setError = useCallback((id: string, error: string) => {
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'error',
          error
        };
      }
      return item;
    }));
  }, []);

  return (
    <DownloadQueueContext.Provider 
      value={{ 
        queue, 
        addToQueue, 
        removeFromQueue, 
        clearQueue, 
        updateProgress, 
        setError 
      }}
    >
      {children}
    </DownloadQueueContext.Provider>
  );
} 