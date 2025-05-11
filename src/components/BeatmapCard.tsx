"use client";

import Image from 'next/image';
import Link from 'next/link';
import { t } from '@/lib/i18n';

type BeatmapDifficulty = {
  stars: number;
  version: string;
};

type BeatmapCardProps = {
  id: string;
  title: string;
  artist: string;
  creator: string;
  coverUrl: string;
  bpm: number;
  length: string;
  playCount: number;
  difficulties: BeatmapDifficulty[];
  locale: string;
};

export function BeatmapCard({
  id,
  title,
  artist,
  creator,
  coverUrl,
  bpm,
  length,
  playCount,
  difficulties,
  locale,
}: BeatmapCardProps) {
  // Calculate the max difficulty stars
  const maxStars = Math.max(...difficulties.map(d => d.stars));
  const difficultyColors = [
    'bg-green-500', // < 2 stars
    'bg-blue-500',  // < 3 stars
    'bg-yellow-500', // < 4 stars
    'bg-orange-500', // < 5 stars
    'bg-red-500',    // < 6 stars
    'bg-purple-500', // >= 6 stars
  ];
  
  // Get color based on max difficulty
  const getDifficultyColor = (stars: number) => {
    if (stars < 2) return difficultyColors[0];
    if (stars < 3) return difficultyColors[1];
    if (stars < 4) return difficultyColors[2];
    if (stars < 5) return difficultyColors[3];
    if (stars < 6) return difficultyColors[4];
    return difficultyColors[5];
  };
  
  const diffColor = getDifficultyColor(maxStars);
  
  return (
    <Link href={`/${locale}/beatmap/${id}`}>
      <div className="beatmap-card bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
        <div className="relative h-36">
          <Image
            src={coverUrl}
            alt={`${artist} - ${title}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-3 text-white">
            <p className="font-bold truncate max-w-[250px]">{title}</p>
            <p className="text-sm truncate max-w-[250px]">{artist}</p>
          </div>
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {difficulties.length} {difficulties.length === 1 ? t(locale, 'beatmap.difficulty') : `${t(locale, 'beatmap.difficulty')}s`}
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-muted-foreground">
              <span>Mapped by </span>
              <span className="text-primary hover:underline">{creator}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              {length}
            </div>
          </div>
          
          <div className="flex justify-between mb-2">
            <div className="text-sm">
              <span className="text-muted-foreground">BPM: </span>
              <span>{bpm}</span>
            </div>
            <div className="text-sm flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <span>{playCount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {difficulties.map((diff, index) => (
              <div 
                key={index} 
                className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(diff.stars)} text-white`}
                title={`${diff.version} (${diff.stars.toFixed(1)}★)`}
              >
                {diff.stars.toFixed(1)}★
              </div>
            ))}
          </div>
          
          <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div 
              className={`${diffColor} h-full`} 
              style={{ width: `${(maxStars / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
} 