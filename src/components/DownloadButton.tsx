"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
  url: string;
  filename: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function DownloadButton({ url, filename, size = 'lg' }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsDownloading(true);
    
    setTimeout(() => {
      setIsDownloading(false);
    }, 3000);
  };

  return (
    <Button 
      asChild 
      size={size} 
      className="bg-pink-600 hover:bg-pink-700 text-white relative"
      disabled={isDownloading}
    >
      <a 
        href={url} 
        download={filename}
        onClick={handleDownload}
        className={isDownloading ? 'opacity-80' : ''}
      >
        <Download className={`${isDownloading ? 'animate-pulse' : ''} mr-2 h-4 w-4`} /> 
        {isDownloading ? 'Downloading...' : 'Download Beatmap'}
      </a>
    </Button>
  );
} 