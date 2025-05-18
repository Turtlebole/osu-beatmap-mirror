"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDownloadQueue, type DownloadItem } from '@/context/DownloadQueueContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ChevronUp, 
  ChevronDown,
  Trash2,
  MoreHorizontal,
  Clock,
  Music
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

// Define the allowed tab values
type TabValue = 'all' | 'active' | 'completed' | 'failed';

export default function DownloadQueue() {
  const { queue, removeFromQueue, clearQueue } = useDownloadQueue();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Auto-open the queue when a new download is added
  useEffect(() => {
    if (queue.length > 0) {
      setIsCollapsed(false);
    }
  }, [queue.length]);

  // Slide up animation to close queue
  const handleClose = () => {
    if (panelRef.current) {
      panelRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      panelRef.current.style.transform = 'translateY(100%)';
      panelRef.current.style.opacity = '0';
      setTimeout(() => setIsCollapsed(true), 300);
    } else {
      setIsCollapsed(true);
    }
  };
  
  // If queue is empty, don't render the component
  if (queue.length === 0) {
    return null;
  }
  
  const activeDownloads = queue.filter(item => item.status === 'downloading' || item.status === 'queued').length;
  const completedDownloads = queue.filter(item => item.status === 'completed').length;
  const failedDownloads = queue.filter(item => item.status === 'error').length;

  // Filter items based on active tab
  const filteredItems = queue.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return item.status === 'downloading' || item.status === 'queued';
    if (activeTab === 'completed') return item.status === 'completed';
    if (activeTab === 'failed') return item.status === 'error';
    return true;
  });

  return (
    <div className="fixed bottom-0 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="container mx-auto max-w-2xl">
        {!isCollapsed && (
          <div 
            ref={panelRef}
            className={cn(
              "rounded-t-xl overflow-hidden shadow-2xl backdrop-blur-md bg-background/90 border pointer-events-auto",
              "transition-all transform duration-300",
              "border-t border-l border-r border-accent"
            )}
            style={{ 
              boxShadow: '0 -10px 30px -15px rgba(0,0,0,0.3)',
              animation: 'slideInFromBottom 0.3s ease forwards'
            }}
          >
            {/* Header with gradient accent */}
            <div className="relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-full h-1"
                style={{ 
                  background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
                }}
              />
              <div className="flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="bg-pink-600 text-white p-1.5 rounded-full">
                    <Download className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-semibold">Download Manager</h2>
                  <div className="flex items-center space-x-1">
                    <div className="px-1.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">
                      {queue.length}
                    </div>
                    {activeDownloads > 0 && (
                      <div className="flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-500 font-medium">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1 animate-pulse" />
                        {activeDownloads}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleClose}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Tab navigation */}
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={(v: string) => setActiveTab(v as TabValue)}
              className="w-full"
            >
              <div className="px-4 border-b border-accent/30">
                <TabsList className="grid grid-cols-4 h-9 bg-transparent">
                  <TabsTrigger 
                    value="all" 
                    className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    All ({queue.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="active" 
                    className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                  >
                    Active ({activeDownloads})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed" 
                    className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-green-500 data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none"
                  >
                    Done ({completedDownloads})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="failed" 
                    className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-red-500 data-[state=active]:border-b-2 data-[state=active]:border-red-500 rounded-none"
                    disabled={failedDownloads === 0}
                  >
                    Failed ({failedDownloads})
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="h-[40vh] max-h-80 overflow-y-auto custom-scrollbar py-2 px-4">
                <AnimatePresence>
                  {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                      <Music className="h-12 w-12 mb-2 text-muted-foreground/50" />
                      <p className="text-sm">No {activeTab} downloads</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <DownloadItem item={item} onRemove={removeFromQueue} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </Tabs>
            
            {/* Footer with actions */}
            <div className="border-t border-accent/30 px-4 py-2 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {activeDownloads > 0 ? (
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {activeDownloads} active download{activeDownloads !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span>No active downloads</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600"
                  onClick={clearQueue}
                  disabled={queue.length === 0}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Collapsed state - just a floating button */}
      {isCollapsed && (
        <div className="flex justify-end pb-4 pointer-events-none">
          <Button
            className="rounded-full shadow-lg bg-pink-600 hover:bg-pink-700 text-white pointer-events-auto"
            size="sm"
            onClick={() => setIsCollapsed(false)}
          >
            <Download className="h-4 w-4 mr-1.5" />
            <span className="mr-1">Download Queue</span>
            <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
              {queue.length}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

function DownloadItem({ item, onRemove }: { item: DownloadItem; onRemove: (id: string) => void }) {
  const { updateProgress } = useDownloadQueue();
  const [elapsedTime, setElapsedTime] = useState<string>('0s');
  const [completedTime, setCompletedTime] = useState<string>('');
  const [downloadSpeed, setDownloadSpeed] = useState<string>('');
  const [mirrorSource, setMirrorSource] = useState<string>('');
  const [showFastOption, setShowFastOption] = useState(false);
  
  // Calculate and display completed time for finished downloads
  useEffect(() => {
    if (item.status === 'completed' && item.startTime && item.endTime) {
      const elapsed = item.endTime - item.startTime;
      setCompletedTime(formatTime(elapsed));
    }
  }, [item.status, item.startTime, item.endTime]);
  
  // Format time helper function
  const formatTime = (ms: number): string => {
    if (ms < 60000) {
      return `${Math.floor(ms / 1000)}s`;
    } else if (ms < 3600000) {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      return `${hours}h ${minutes}m`;
    }
  };
  
  // Check server for mirror source when downloading starts
  useEffect(() => {
    if (item.status !== 'downloading') return;
    
    // Make a HEAD request to get X-Download-Source header
    fetch(`/api/proxy-download/${item.beatmapId}`, {
      method: 'HEAD',
    }).then(response => {
      const source = response.headers.get('X-Download-Source');
      if (source) {
        setMirrorSource(source);
      }
    }).catch(() => {
      // Silently fail - non-critical
    });
  }, [item.status, item.beatmapId]);
  
  // Update the timer for active downloads
  useEffect(() => {
    if (item.status !== 'downloading') return;
    
    const startTime = item.startTime || Date.now();
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(formatTime(elapsed));
      
      // Calculate and display download speed if we have progress data
      if (item.progress > 0) {
        // This is just an estimate since we don't know the exact file size
        const estimatedDownloadSpeed = calculateDownloadSpeed(elapsed, item.progress);
        if (estimatedDownloadSpeed) {
          setDownloadSpeed(estimatedDownloadSpeed);
        }
      }
    };
    
    // Update immediately
    updateTimer();
    
    // Then update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [item.status, item.startTime, item.progress]);
  
  // Estimate download speed based on elapsed time and progress percentage
  const calculateDownloadSpeed = (elapsed: number, progress: number): string | null => {
    if (elapsed < 1000 || progress < 1) return null; // Need some time to get a meaningful speed
    
    // We don't know the exact file size, so just use a rough estimate based on progress percentage
    // This is not accurate but gives a visual indication of speed
    const avgBeatmapSize = 40 * 1024 * 1024; // 40MB average estimate (increased from 30MB)
    const estimatedSizeDownloaded = (avgBeatmapSize * progress) / 100;
    const speedBps = estimatedSizeDownloaded / (elapsed / 1000);
    
    if (speedBps < 1024) {
      return `${speedBps.toFixed(1)} B/s`;
    } else if (speedBps < 1024 * 1024) {
      return `${(speedBps / 1024).toFixed(1)} KB/s`;
    } else {
      const mbps = (speedBps / 1024 / 1024);
      // Add color coding for speed
      if (mbps < 1) {
        return `<span class="text-orange-500">${mbps.toFixed(1)} MB/s</span>`;
      } else if (mbps < 5) {
        return `<span class="text-green-500">${mbps.toFixed(1)} MB/s</span>`;
      } else {
        return `<span class="text-blue-500 font-bold">${mbps.toFixed(1)} MB/s</span>`;
      }
    }
  };
  
  // Add direct download function for slow downloads
  const handleDirectDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the beatmap ID from the URL
    const beatmapId = item.beatmapId;
    
    // Direct download URLs (prioritize faster mirrors)
    const urls = [
      `https://catboy.best/d/${beatmapId}`,
      `https://osu.direct/d/${beatmapId}`,
      `https://txy1.sayobot.cn/beatmaps/download/full/${beatmapId}`,
      `https://osu.ppy.sh/beatmapsets/${beatmapId}/download`
    ];
    
    // Open the first URL directly
    window.open(urls[0], '_blank');
  };
  
  // Simple retry function
  const handleRetry = () => {
    // Reset download to queued state
    updateProgress(item.id, 0, 'queued');
  };
  
  // Show fast download option after 5 seconds for active downloads (reduced from 10s)
  useEffect(() => {
    if (item.status !== 'downloading') {
      setShowFastOption(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setShowFastOption(true);
    }, 5000); // Show after 5 seconds
    
    return () => clearTimeout(timer);
  }, [item.status]);
  
  let statusBadge;
  
  switch (item.status) {
    case 'downloading':
      statusBadge = (
        <div className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1 animate-pulse" />
          {item.progress}%
          {mirrorSource && (
            <span className="ml-1 bg-blue-500/20 px-1 rounded text-[10px]" title={`Downloading from ${mirrorSource}`}>
              {mirrorSource}
            </span>
          )}
        </div>
      );
      break;
    case 'completed':
      statusBadge = (
        <div className="bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {completedTime ? `Done in ${completedTime}` : 'Done'}
          {mirrorSource && (
            <span className="ml-1 bg-green-500/20 px-1 rounded text-[10px]" title={`Downloaded from ${mirrorSource}`}>
              {mirrorSource}
            </span>
          )}
        </div>
      );
      break;
    case 'error':
      statusBadge = (
        <div className="bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </div>
      );
      break;
    default:
      statusBadge = (
        <div className="bg-slate-500/10 text-slate-500 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Queued
        </div>
      );
  }

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden transition-all duration-200 group border",
      item.status === 'downloading' ? "border-blue-500/20 bg-blue-500/5" : 
      item.status === 'completed' ? "border-green-500/20 bg-green-500/5" : 
      item.status === 'error' ? "border-red-500/20 bg-red-500/5" : 
      "border-accent bg-accent/5"
    )}>
      <div className="flex items-start p-3">
        {/* Beatmap thumbnail */}
        <div className="h-14 w-14 rounded overflow-hidden flex-shrink-0 mr-3 relative">
          <Image 
            src={item.thumbnail || '/placeholder.png'} 
            alt={`${item.artist} - ${item.title}`} 
            fill 
            className="object-cover"
          />
          {/* Status overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            {item.status === 'downloading' && (
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
                <path 
                  className="opacity-75" 
                  fill="white" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  style={{transformOrigin: 'center', animation: 'spin 1s linear infinite'}}
                />
              </svg>
            )}
            {item.status === 'completed' && <CheckCircle2 className="h-8 w-8 text-white" />}
            {item.status === 'error' && <AlertCircle className="h-8 w-8 text-white" />}
            {item.status === 'queued' && <Clock className="h-8 w-8 text-white opacity-75" />}
          </div>
        </div>
        
        {/* Beatmap info */}
        <div className="flex-grow min-w-0 pr-6">
          {/* Title */}
          <h3 className="font-medium text-sm truncate">{item.title}</h3>
          
          {/* Artist & creator */}
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {item.artist} · {item.creator}
          </p>
          
          {/* Progress bar */}
          <div className="mt-2">
            <Progress 
              value={item.progress} 
              className={cn(
                "h-1 bg-accent/30",
                item.status === 'downloading' ? "bg-blue-500/20" : 
                item.status === 'completed' ? "bg-green-500/20" : 
                item.status === 'error' ? "bg-red-500/20" : ""
              )}
              indicatorClassName={
                item.status === 'downloading' ? "bg-blue-500" : 
                item.status === 'completed' ? "bg-green-500" : 
                item.status === 'error' ? "bg-red-500" : ""
              }
            />
          </div>
          
          {/* Status info and actions */}
          <div className="flex justify-between items-center mt-1">
            {statusBadge}
            
            {item.status === 'downloading' && (
              <div className="text-blue-500 text-xs flex items-center space-x-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{elapsedTime}</span>
                {downloadSpeed && (
                  <span 
                    className="text-blue-500 bg-blue-500/5 px-1 rounded text-xs font-mono"
                    dangerouslySetInnerHTML={{ __html: downloadSpeed }}
                  />
                )}
                {showFastOption && (
                  <button 
                    className="ml-1 text-xs px-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded cursor-pointer"
                    onClick={handleDirectDownload}
                    title="Download directly from mirror site (may be faster)"
                  >
                    Fast Direct
                  </button>
                )}
              </div>
            )}
            
            {item.status === 'completed' && (
              <div className="text-green-500 text-xs flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {completedTime}
              </div>
            )}
            
            {item.status === 'error' && item.error && (
              <div className="text-red-500 text-xs max-w-[180px] truncate flex items-center gap-1" title={item.error}>
                <span className="truncate">{item.error}</span>
                <Button 
                  variant="ghost" 
                  className="h-5 w-5 p-0 text-red-500 hover:bg-red-500/10 rounded-full"
                  onClick={handleRetry}
                  title="Retry download"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-5 w-5 p-0 text-blue-500 hover:bg-blue-500/10 rounded-full"
                  onClick={handleDirectDownload}
                  title="Direct download from mirror site"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 rounded-full absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-white hover:bg-black/40",
            (item.status === 'error' || item.status === 'completed') && "opacity-100 sm:opacity-60"
          )}
          onClick={() => onRemove(item.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
} 