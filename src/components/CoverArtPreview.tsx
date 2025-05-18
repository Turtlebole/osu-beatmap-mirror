"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { PlayCircle, PauseCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define CSS animation styles
const animationStyles = `
  @keyframes pulse-border {
    0%, 100% { border-color: rgba(236, 72, 153, 0.5); }
    50% { border-color: rgba(236, 72, 153, 0.8); }
  }
  @keyframes equalizer1 {
    0%, 100% { height: 6px; }
    50% { height: 8px; }
  }
  @keyframes equalizer2 {
    0%, 100% { height: 10px; }
    33% { height: 6px; }
    66% { height: 14px; }
  }
  @keyframes equalizer3 {
    0%, 100% { height: 6px; }
    25% { height: 9px; }
    75% { height: 4px; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  .pulse-border {
    animation: pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .equalizer1 {
    animation: equalizer1 0.8s ease-in-out infinite;
  }
  .equalizer2 {
    animation: equalizer2 0.9s ease-in-out infinite;
  }
  .equalizer3 {
    animation: equalizer3 0.85s ease-in-out infinite;
  }
  .pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

interface CoverArtPreviewProps {
  coverUrl: string;
  previewUrl: string | null;
  statusBadge: React.ReactNode;
  altText: string;
}

export default function CoverArtPreview({ coverUrl, previewUrl, statusBadge, altText }: CoverArtPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const toggleAudio = () => {
    if (!previewUrl || !audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
        console.error("Failed to play audio - autoplay may be restricted");
      });
      setIsPlaying(true);
    }
  };
  
  return (
    <>
      <style jsx>{animationStyles}</style>
      <div 
        className={`w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden border-4 ${isPlaying ? 'border-pink-500 pulse-border' : 'border-white/10'} shadow-2xl flex-shrink-0 relative group cursor-pointer`}
        onClick={toggleAudio}
      >
        {/* Audio element */}
        {previewUrl && (
          <audio 
            ref={audioRef} 
            src={previewUrl}
            onEnded={() => setIsPlaying(false)}
            preload="none"
          />
        )}
        
        <Image
          src={coverUrl}
          alt={altText}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Play/Pause overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
          <div className={`rounded-full ${isPlaying ? 'bg-pink-500/30' : 'bg-white/20'} p-3 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transform scale-90 group-hover:scale-100 transition-all`}>
            {isPlaying ? (
              <PauseCircle className="h-10 w-10 text-white" />
            ) : (
              <PlayCircle className="h-10 w-10 text-white" />
            )}
          </div>
        </div>
        
        {/* Now Playing indicator */}
        {isPlaying && (
          <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center shadow-lg pulse">
            <span className="mr-1.5">Now Playing</span>
            <div className="flex items-center gap-[2px]">
              <div className="w-[3px] h-[6px] bg-white rounded-full equalizer1"></div>
              <div className="w-[3px] h-[10px] bg-white rounded-full equalizer2"></div>
              <div className="w-[3px] h-[6px] bg-white rounded-full equalizer3"></div>
            </div>
          </div>
        )}
        
        {/* Status badge */}
        {statusBadge}
      </div>
    </>
  );
} 