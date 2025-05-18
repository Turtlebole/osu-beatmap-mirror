"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Beatmapset } from '@/lib/osu-api';
import { cn, formatNumber, formatTime, formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Clock, 
  Heart, 
  Download, 
  Music, 
  User, 
  CheckCircle, 
  PlayCircle, 
  ExternalLink,
  Eye
} from 'lucide-react';
import { useDownloadQueue } from '@/context/DownloadQueueContext';
import { useRef, useState } from 'react';

// Get status icon
const getStatusIcon = (status: string): React.ReactNode => {
  switch (status.toLowerCase()) {
    case 'ranked': 
    case 'approved': 
      return <CheckCircle className="h-3 w-3 mr-1" />;
    case 'loved': 
      return <Heart className="h-3 w-3 mr-1 fill-current" />;
    case 'qualified':
    case 'pending': 
      return <Clock className="h-3 w-3 mr-1" />;
    default: 
      return null;
  }
};

// Get difficulty color
const getDifficultyColor = (stars: number): string => {
  if (stars < 2) return 'text-[#88b300]';
  if (stars < 2.7) return 'text-[#38c21c]';
  if (stars < 4) return 'text-[#ffa801]';
  if (stars < 5.3) return 'text-[#ff5da2]';
  if (stars < 6.5) return 'text-[#cc2929]';
  return 'text-[#8866ff]';
};

// Game mode symbols
const gameModeSymbols: Record<string, {symbol: string, color: string, name: string}> = {
  '0': { symbol: '●', color: 'text-pink-500', name: 'osu!' },
  '1': { symbol: '◉', color: 'text-orange-500', name: 'taiko' },
  '2': { symbol: '◓', color: 'text-green-500', name: 'catch' },
  '3': { symbol: '◨', color: 'text-blue-500', name: 'mania' },
  'osu': { symbol: '●', color: 'text-pink-500', name: 'osu!' },
  'taiko': { symbol: '◉', color: 'text-orange-500', name: 'taiko' },
  'fruits': { symbol: '◓', color: 'text-green-500', name: 'catch' },
  'catch': { symbol: '◓', color: 'text-green-500', name: 'catch' },
  'mania': { symbol: '◨', color: 'text-blue-500', name: 'mania' },
};

type BeatmapCardProps = {
  beatmapset: Beatmapset;
  locale: string;
};

export function BeatmapCard({ beatmapset, locale }: BeatmapCardProps) {
  const { id, title, artist, creator, status, covers, beatmaps } = beatmapset;
  const { addToQueue, queue } = useDownloadQueue();
  const [isHovering, setIsHovering] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Calculate essential metadata
  const allDiffs = beatmaps || [];
  const sortedDiffs = [...allDiffs].sort((a, b) => b.difficulty_rating - a.difficulty_rating);
  const maxDiff = sortedDiffs[0]?.difficulty_rating || 0;
  const minDiff = sortedDiffs[sortedDiffs.length - 1]?.difficulty_rating || 0;
  const duration = sortedDiffs[0]?.total_length || 0;
  const bpm = sortedDiffs[0]?.bpm || 0;
  
  // Handle audio preview
  const handleMouseEnter = () => {
    setIsHovering(true);
    // Audio preview disabled
    /*
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {}); // Catch and ignore autoplay restrictions
    }
    */
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    // Audio preview disabled
    /*
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    */
  };
  
  // Generate mode counts and stats
  const modeCounts = {
    '0': allDiffs.filter(d => d.mode === '0' || d.mode === 'osu').length,
    '1': allDiffs.filter(d => d.mode === '1' || d.mode === 'taiko').length,
    '2': allDiffs.filter(d => d.mode === '2' || d.mode === 'fruits' || d.mode === 'catch').length,
    '3': allDiffs.filter(d => d.mode === '3' || d.mode === 'mania').length,
  };
  
  // Calculate unique game modes
  const uniqueModes = Object.entries(modeCounts)
    .filter(([_, count]) => count > 0)
    .map(([mode]) => mode);
  
  // Determine primary mode for display
  const primaryMode = uniqueModes.length > 0 ? uniqueModes[0] : '0'; // Default to osu! if unknown
  
  // Download handling
  const isInQueue = queue.some(item => item.beatmapId === id.toString());
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInQueue) return;
    
    addToQueue({
      beatmapId: id.toString(),
      title,
      artist,
      creator,
      thumbnail: covers['cover@2x'] || covers.cover || '/placeholder.png',
      url: `/api/download/${id}`,
      filename: `${artist} - ${title} [${creator}].osz`
    });
  };

  // Card URL
  const cardUrl = `/${locale}/beatmap/${id}`;
  
  // Check for audio preview URL
  const previewUrl = (beatmapset as any).preview_url || null;
  
  // Get status icon
  const statusIcon = getStatusIcon(status);
  
  return (
    <Link 
      href={cardUrl} 
      className="block group h-full focus:outline-none" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card className="h-full overflow-hidden rounded-xl border-border/10 transition-all duration-300 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-pink-500/5 hover:border-pink-500/20 flex flex-col">
        {/* Audio preview (hidden but functional) */}
        {previewUrl && (
          <audio ref={audioRef} src={previewUrl} preload="none" className="hidden" />
        )}
        
        {/* Header section with cover image and status */}
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-black">
          {/* Background image */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={covers.cover || covers['cover@2x'] || '/placeholder.png'}
              alt={`${artist} - ${title}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500 ease-out"
            />
            
            {/* Foreground elements will go here */}
            <div className="absolute inset-0 flex flex-col z-10">
              {/* Top bar with mode indicators and status */}
              <div className="flex justify-between mt-2 mx-2">
                {/* Mode indicators - Made more prominent */}
                <div className="flex gap-1">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                    {uniqueModes.length > 0 ? (
                      <>
                        {uniqueModes.map(mode => (
                          <span 
                            key={mode} 
                            className={`${gameModeSymbols[mode]?.color} font-bold`}
                            title={gameModeSymbols[mode]?.name || 'Mode'}
                          >
                            {gameModeSymbols[mode]?.symbol}
                          </span>
                        ))}
                        <span className="ml-1 opacity-80 text-[10px]">
                          {uniqueModes.length === 1 
                            ? gameModeSymbols[uniqueModes[0]]?.name 
                            : gameModeSymbols[primaryMode]?.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-pink-500 font-bold">●</span>
                        <span className="ml-1 opacity-80 text-[10px]">osu!</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Status badge */}
                <Badge 
                  variant="secondary" 
                  className="bg-pink-600/80 text-white border-0 backdrop-blur-md text-xs capitalize shadow-md"
                >
                  {statusIcon}
                  {status}
                </Badge>
              </div>
              
              {/* View overlay */}
              <div className="flex-grow flex items-center justify-center">
                <div className={cn(
                  "rounded-full bg-black/40 p-4 backdrop-blur-md border border-white/10",
                  "opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100",
                  "transition-all duration-300 transform"
                )}>
                  <Eye className="h-8 w-8 text-white" />
                </div>
              </div>
              
              {/* Title area with gradient overlay */}
              <div className="relative">
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
                <div className="relative px-3 py-2 flex flex-col z-20">
                  <h3 className="text-white font-bold text-sm leading-tight line-clamp-1">{title}</h3>
                  <p className="text-white/80 text-xs line-clamp-1">{artist}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area - Simplified with consistent colors */}
        <div className="flex flex-col flex-grow p-3 pt-2">
          {/* Creator info */}
          <div className="flex items-center gap-1.5 text-xs mb-3 pb-2 border-b border-border/10">
            <User className="h-3 w-3 text-pink-500" />
            <span className="line-clamp-1 font-medium">{creator}</span>
          </div>
          
          {/* Essential stats in a simple consistent layout */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-pink-500" />
              <span className={getDifficultyColor(maxDiff)}>
                {maxDiff.toFixed(1)}★
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-pink-500" />
              <span className="font-medium">
                {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5 text-pink-500" />
              <span className="font-medium">
                {bpm} BPM
              </span>
            </div>
          </div>
          
          <div className="mt-auto"></div>
          
          {/* Footer with likes, plays and download button */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/10 mt-1">
            <div className="flex items-center gap-3">
              {beatmapset.favourite_count && beatmapset.favourite_count > 0 && (
                <div className="flex items-center" title={`${formatNumber(beatmapset.favourite_count)} favorites`}>
                  <Heart className="h-3 w-3 mr-1 text-pink-500 fill-pink-500" />
                  <span>{formatNumber(beatmapset.favourite_count)}</span>
                </div>
              )}
              
              {beatmapset.play_count && beatmapset.play_count > 0 && (
                <div className="flex items-center" title={`${formatNumber(beatmapset.play_count)} plays`}>
                  <PlayCircle className="h-3 w-3 mr-1 text-pink-500" />
                  <span>{formatNumber(beatmapset.play_count)}</span>
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`https://osu.ppy.sh/beatmapsets/${id}`, '_blank', 'noopener,noreferrer');
                }}
                className="flex items-center text-muted-foreground hover:text-pink-500 transition-colors"
                title="View on osu! website"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                <span>osu!</span>
              </button>
            </div>
            
            <button
              onClick={handleDownload}
              className={cn(
                "flex items-center gap-1 transition-colors",
                isInQueue 
                  ? "text-pink-500" 
                  : "text-muted-foreground hover:text-pink-500"
              )}
              title={isInQueue ? "In download queue" : "Download beatmap"}
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
}