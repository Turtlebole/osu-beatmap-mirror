"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Beatmapset } from '@/lib/osu-api';
import { cn, formatNumber, formatTime } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, Clock, Play, ListMusic, Heart, CheckCircle, Hourglass, CircleSlash, Download } from 'lucide-react';

// Helper to get status attributes
const getStatusAttributes = (status: string): { variant: 'default' | 'secondary' | 'outline' | 'destructive', icon?: React.ElementType } => {
  switch (status.toLowerCase()) {
    case 'ranked':
    case 'approved': return { variant: 'default', icon: CheckCircle };
    case 'loved': return { variant: 'destructive', icon: Heart };
    case 'qualified': return { variant: 'secondary', icon: Hourglass };
    case 'pending':
    case 'wip': return { variant: 'outline', icon: Hourglass };
    case 'graveyard':
    default: return { variant: 'secondary', icon: CircleSlash };
  }
};

// Helper to get game mode name
const getModeName = (mode: string): string => {
  switch (mode) {
    case '0': return 'osu!';
    case '1': return 'taiko';
    case '2': return 'catch';
    case '3': return 'mania';
    default: return mode;
  }
};

type BeatmapCardProps = {
  beatmapset: Beatmapset;
  locale: string;
};

export function BeatmapCard({ beatmapset, locale }: BeatmapCardProps) {
  const { id, title, artist, creator, user_id, status, covers, beatmaps } = beatmapset;
  
  // Find the representative beatmap (usually the highest difficulty)
  const sortedBeatmaps = beatmaps ? [...beatmaps].sort((a, b) => b.difficulty_rating - a.difficulty_rating) : [];
  const representativeBeatmap = sortedBeatmaps[0];
  
  const maxDifficulty = representativeBeatmap?.difficulty_rating ?? 0;
  const lengthSeconds = representativeBeatmap?.total_length ?? 0;
  const mode = representativeBeatmap ? getModeName(representativeBeatmap.mode) : '';

  const statusAttributes = getStatusAttributes(status);
  const StatusIcon = statusAttributes.icon;

  // Color for difficulty rating
  const difficultyColor = maxDifficulty >= 6 
    ? 'text-pink-500' 
    : maxDifficulty >= 5 
      ? 'text-orange-500' 
      : maxDifficulty >= 4 
        ? 'text-yellow-500' 
        : '';

  // Download URL
  const downloadUrl = `/api/download/${id}`;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-pink-500/30 h-full flex flex-col group">
      <Link href={`/${locale}/beatmap/${id}`} className="block flex-grow">
        <CardHeader className="p-0 relative h-32 md:h-36">
          <div className="absolute inset-0 bg-card/30 group-hover:bg-card/0 transition-all duration-200 z-10"></div>
          <Image
            src={covers['cover@2x'] || covers.cover || '/placeholder.png'}
            alt={`Cover image for ${title} by ${artist}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-20"></div>
          <div className="absolute top-2 right-2 z-30">
            <Badge variant={statusAttributes.variant} className="capitalize">
              {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
              {status}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 p-3 w-full z-30">
            <h3 className="font-semibold text-white truncate text-base leading-tight" title={title}>{title}</h3>
            <p className="text-xs text-gray-300 truncate" title={artist}>{artist}</p>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Mapped by <span className="text-pink-500 hover:underline">{creator}</span></span>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1" title={`Max Difficulty: ${maxDifficulty.toFixed(2)} stars`}>
              <Star className={`h-3 w-3 ${difficultyColor || 'text-muted-foreground'}`} />
              <span className={difficultyColor || ''}>{maxDifficulty.toFixed(2)}★</span>
            </div>
            
            {mode && (
              <div className="font-medium text-xs px-2 py-0.5 bg-pink-600/10 text-pink-600 rounded-full">
                {mode}
              </div>
            )}
            
            <div className="flex items-center gap-1" title={`Length: ${formatTime(lengthSeconds)}`}>
              <Clock className="h-3 w-3" />
              <span>{formatTime(lengthSeconds)}</span>
            </div>
          </div>
          
          {beatmaps && (
            <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
              <div className="flex items-center gap-1" title={`${beatmaps.length} difficulties`}>
                <ListMusic className="h-3 w-3" />
                <span>{beatmaps.length} diffs</span>
              </div>
              
              {beatmapset.favourite_count && (
                <div className="flex items-center gap-1" title={`${formatNumber(beatmapset.favourite_count)} favorites`}>
                  <Heart className="h-3 w-3 text-pink-500" />
                  <span>{formatNumber(beatmapset.favourite_count)}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Link>
      
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Play className="h-3 w-3" />
          <span>{beatmapset.play_count ? formatNumber(beatmapset.play_count) : '0'} plays</span>
        </div>
        
        <a 
          href={downloadUrl} 
          download={`${artist} - ${title} [${creator}].osz`}
          className="text-muted-foreground hover:text-pink-500 transition-colors p-1 rounded-full hover:bg-pink-500/10"
          title="Download beatmap"
        >
          <Download className="h-4 w-4" />
        </a>
      </CardFooter>
    </Card>
  );
} 