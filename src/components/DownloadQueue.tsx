"use client";

import React, { useState, useEffect } from 'react';
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
  Trash2 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DownloadQueue() {
  const { queue, removeFromQueue, clearQueue } = useDownloadQueue();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Auto-open the queue when a new download is added
  useEffect(() => {
    if (queue.length > 0) {
      setIsCollapsed(false);
    }
  }, [queue.length]);
  
  // If queue is empty, don't render the component
  if (queue.length === 0) {
    return null;
  }
  
  const activeDownloads = queue.filter(item => item.status === 'downloading' || item.status === 'queued').length;
  const completedDownloads = queue.filter(item => item.status === 'completed').length;
  const failedDownloads = queue.filter(item => item.status === 'error').length;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] shadow-2xl rounded-lg bg-card border">
      <Card className="shadow-none border-0">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Queue {queue.length > 0 && `(${queue.length})`}
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              {activeDownloads > 0 && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {activeDownloads} active
                </Badge>
              )}
              {completedDownloads > 0 && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  {completedDownloads} completed
                </Badge>
              )}
              {failedDownloads > 0 && (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                  {failedDownloads} failed
                </Badge>
              )}
              {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </CardHeader>
        
        {!isCollapsed && (
          <>
            <CardContent className="max-h-96 overflow-y-auto space-y-2">
              {queue.map((item) => (
                <DownloadItem key={item.id} item={item} onRemove={removeFromQueue} />
              ))}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive/80"
                onClick={clearQueue}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Clear All
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsCollapsed(true)}
              >
                Minimize
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

function DownloadItem({ item, onRemove }: { item: DownloadItem; onRemove: (id: string) => void }) {
  let statusIcon;
  let statusColor;
  
  switch (item.status) {
    case 'downloading':
      statusIcon = <Download className="h-4 w-4 animate-pulse" />;
      statusColor = 'text-blue-500';
      break;
    case 'completed':
      statusIcon = <CheckCircle2 className="h-4 w-4" />;
      statusColor = 'text-green-500';
      break;
    case 'error':
      statusIcon = <AlertCircle className="h-4 w-4" />;
      statusColor = 'text-red-500';
      break;
    default:
      statusIcon = <Download className="h-4 w-4" />;
      statusColor = 'text-muted-foreground';
  }

  return (
    <div className="flex p-2 rounded-md border bg-card/50 relative group">
      <div className="h-12 w-12 relative rounded overflow-hidden mr-3 flex-shrink-0">
        <Image 
          src={item.thumbnail || '/placeholder.png'} 
          alt={`${item.artist} - ${item.title}`} 
          fill 
          className="object-cover"
        />
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start">
          <div className="truncate text-sm font-medium">
            {item.title}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" 
            onClick={() => onRemove(item.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground truncate">
          {item.artist} · {item.creator}
        </div>
        
        <div className="mt-1 space-y-1">
          <Progress value={item.progress} className="h-1.5" />
          <div className="flex justify-between items-center text-xs">
            <span className={`flex items-center gap-1 ${statusColor}`}>
              {statusIcon}
              {item.status === 'downloading' ? `${item.progress}%` : 
               item.status === 'error' ? 'Failed' : 
               item.status === 'completed' ? 'Completed' : 'Queued'}
            </span>
            {item.status === 'error' && item.error && (
              <span className="text-red-500 text-xs">{item.error}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 