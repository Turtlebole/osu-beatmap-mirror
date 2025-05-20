export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBeatmapset, Beatmapset } from '@/lib/osu-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatTime, formatNumber, formatDate } from '@/lib/utils';
import CoverArtPreview from '@/components/CoverArtPreview';
import UserScores from '@/components/UserScores';
import { 
  Star, 
  Clock, 
  User, 
  Download, 
  Heart, 
  CheckCircle, 
  Hourglass, 
  CircleSlash, 
  ExternalLink, 
  Terminal, 
  Music,
  PlayCircle,
  Headphones,
  Calendar,
  Hash,
  Zap,
  Info,
  Tag
} from 'lucide-react';

import DownloadButton from '@/components/DownloadButton';

type BeatmapPageProps = {
  params: {
    locale: string;
    id: string;
  };
};

const getStatusAttributes = (status: string): { variant: 'default' | 'secondary' | 'outline' | 'destructive', icon?: React.ElementType, color: string } => {
  switch (status.toLowerCase()) {
    case 'ranked': return { variant: 'default', icon: CheckCircle, color: 'bg-emerald-500' };
    case 'approved': return { variant: 'default', icon: CheckCircle, color: 'bg-emerald-500' };
    case 'loved': return { variant: 'destructive', icon: Heart, color: 'bg-pink-500' };
    case 'qualified': return { variant: 'secondary', icon: Hourglass, color: 'bg-blue-500' };
    case 'pending':
    case 'wip': return { variant: 'outline', icon: Hourglass, color: 'bg-amber-500' };
    case 'graveyard':
    default: return { variant: 'secondary', icon: CircleSlash, color: 'bg-slate-500' };
  }
};

const getModeInfo = (mode: string) => {
  switch (mode) {
    case '0': case 'osu': return { name: 'osu!', icon: '●', color: 'text-pink-500' };
    case '1': case 'taiko': return { name: 'osu!taiko', icon: '◯', color: 'text-orange-500' };
    case '2': case 'fruits': case 'catch': return { name: 'osu!catch', icon: '◓', color: 'text-green-500' };
    case '3': case 'mania': return { name: 'osu!mania', icon: '◨', color: 'text-blue-500' };
    default: return { name: mode, icon: '●', color: 'text-pink-500' };
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

export async function generateMetadata(props: BeatmapPageProps): Promise<Metadata> {
  const { id } = await Promise.resolve(props.params);
  
  try {
    const beatmapset = await getBeatmapset(id);
    if (!beatmapset) {
      return { title: 'Beatmap Not Found' };
    }
    return {
      title: `${beatmapset.artist} - ${beatmapset.title} | osu!mirror`,
      description: `Download ${beatmapset.artist} - ${beatmapset.title}, mapped by ${beatmapset.creator}`,
      openGraph: {
        images: [beatmapset.covers['cover@2x'] || '']
      },
    };
  } catch (error) {
    return { title: 'Beatmap - osu!mirror' };
  }
}

export default async function BeatmapPage(props: BeatmapPageProps) {
  const { locale, id } = await Promise.resolve(props.params);
  
  if (!id || isNaN(Number(id))) {
    return notFound();
  }

  let beatmapset: Beatmapset | null = null;
  let fetchError: string | null = null;

  try {
    beatmapset = await getBeatmapset(id);
  } catch (error) {
    console.error(`Failed to fetch beatmapset ${id}:`, error);
    fetchError = error instanceof Error ? error.message : "An unknown error occurred while fetching beatmap details.";
  }

  if (fetchError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Beatmap</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!beatmapset) {
    notFound();
  }

  const statusAttributes = getStatusAttributes(beatmapset.status);
  const StatusIcon = statusAttributes.icon;
  
  const downloadUrl = `/api/download/${beatmapset.id}`;
  const downloadFilename = `${beatmapset.artist} - ${beatmapset.title} [${beatmapset.creator}].osz`;
  const thumbnail = beatmapset.covers['cover@2x'] || beatmapset.covers.cover || '/placeholder.png';

  const representativeBeatmap = beatmapset.beatmaps && beatmapset.beatmaps.length > 0 
    ? beatmapset.beatmaps.sort((a, b) => b.difficulty_rating - a.difficulty_rating)[0]
    : null;

  const uniqueTags = beatmapset.tags ? 
    Array.from(new Set(beatmapset.tags.split(' ')))
      .filter(tag => tag.trim() !== '') : [];
      
  // Check if preview exists (may not be in the type but could be in the data)
  const previewUrl = (beatmapset as any).preview_url || null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-2xl space-y-6">
      {/* Hero Banner with background image and osu! style elements */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-pink-600/20 shadow-lg bg-black">
        {/* Background image */}
        <Image
          src={beatmapset.covers['cover@2x'] || beatmapset.covers.cover || '/placeholder.png'}
          alt={`Cover for ${beatmapset.title}`}
          fill
          className="object-cover opacity-50"
          priority
        />
        
        {/* Simple dark overlay instead of gradient */}
        <div className="absolute inset-0 bg-black/70" />
        
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Use the client component for cover art with preview functionality */}
          <CoverArtPreview 
            coverUrl={beatmapset.covers['cover@2x'] || beatmapset.covers.cover || '/placeholder.png'}
            previewUrl={previewUrl}
            altText={`Cover for ${beatmapset.title}`}
            statusBadge={
              <Badge variant={statusAttributes.variant} className="absolute top-3 right-3 capitalize shadow-lg">
                {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                {beatmapset.status}
              </Badge>
            }
          />
          
          {/* Beatmap details with improved typography */}
          <div className="flex flex-col text-center md:text-left">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 leading-tight">{beatmapset.title}</h1>
              <h2 className="text-xl md:text-2xl font-medium text-gray-300">{beatmapset.artist}</h2>
              
              <div className="flex items-center justify-center md:justify-start text-gray-400 mt-2 gap-1.5">
                <span>mapped by</span>
                <Link 
                  href={`https://osu.ppy.sh/users/${beatmapset.user_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-semibold text-pink-400 hover:text-pink-300 hover:underline flex items-center"
                >
                  <User className="h-3.5 w-3.5 mr-1" />
                  {beatmapset.creator}
                </Link>
              </div>
            </div>
            
            {/* Key stats in osu! style - REDESIGNED */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 rounded-lg p-3">
                <div className="flex items-center justify-center md:justify-start text-xs text-gray-400 mb-1">
                  <Star className="h-3.5 w-3.5 mr-1 text-pink-400" />
                  <span>DIFFICULTY</span>
                </div>
                <div className={`text-xl font-bold text-center md:text-left ${getDifficultyColor(representativeBeatmap?.difficulty_rating || 0)}`}>
                  {representativeBeatmap?.difficulty_rating.toFixed(2) || '?.??'}★
                </div>
              </div>
              
              <div className="bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 rounded-lg p-3">
                <div className="flex items-center justify-center md:justify-start text-xs text-gray-400 mb-1">
                  <Clock className="h-3.5 w-3.5 mr-1 text-pink-400" />
                  <span>LENGTH</span>
                </div>
                <div className="text-xl font-bold text-center md:text-left text-white">
                  {formatTime(representativeBeatmap?.total_length || 0)}
                </div>
              </div>
              
              <div className="bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 rounded-lg p-3">
                <div className="flex items-center justify-center md:justify-start text-xs text-gray-400 mb-1">
                  <Zap className="h-3.5 w-3.5 mr-1 text-pink-400" />
                  <span>BPM</span>
                </div>
                <div className="text-xl font-bold text-center md:text-left text-white">
                  {representativeBeatmap?.bpm || '---'}
                </div>
              </div>
              
              <div className="bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 rounded-lg p-3">
                <div className="flex items-center justify-center md:justify-start text-xs text-gray-400 mb-1">
                  <Heart className="h-3.5 w-3.5 mr-1 text-pink-400 fill-pink-400" />
                  <span>FAVORITES</span>
                </div>
                <div className="text-xl font-bold text-center md:text-left text-white">
                  {formatNumber(beatmapset.favourite_count || 0)}
                </div>
              </div>
            </div>
            
            {/* Download button enhanced - removing className prop as it's not supported */}
            <div className="mt-6">
              <DownloadButton 
                url={downloadUrl} 
                filename={downloadFilename}
                beatmapId={id}
                title={beatmapset.title}
                artist={beatmapset.artist}
                creator={beatmapset.creator}
                thumbnail={thumbnail}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Details card with more osu! specific info - REDESIGNED */}
        <Card className="lg:col-span-1 bg-card/50 backdrop-blur-sm border-pink-600/10 shadow-md overflow-hidden">
          <div className="bg-gradient-to-br from-pink-500/15 via-pink-500/5 to-transparent py-4 px-6 border-b border-pink-500/10">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-pink-500" />
              Beatmap Details
            </CardTitle>
          </div>
          
          <CardContent className="space-y-5 p-6">
            {/* Basic stats */}
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-pink-400" />
                BPM
              </div>
              <div className="font-medium text-right">{representativeBeatmap?.bpm || 'Unknown'}</div>
              
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-pink-400" />
                Source
              </div>
              <div className="font-medium text-right">{beatmapset.source || 'Original'}</div>
              
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-pink-400" />
                Submitted
              </div>
              <div className="font-medium text-right">{formatDate(beatmapset.submitted_date)}</div>
              
              {beatmapset.ranked_date && (
                <>
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-pink-400" />
                    Ranked
                  </div>
                  <div className="font-medium text-right">{formatDate(beatmapset.ranked_date)}</div>
                </>
              )}
              
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-pink-400" />
                Favorites
              </div>
                  <div className="font-medium text-right flex items-center justify-end">
                {formatNumber(beatmapset.favourite_count || 0)}
                  </div>
              
              {beatmapset.play_count && (
                <>
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <PlayCircle className="h-3.5 w-3.5 text-pink-400" />
                    Plays
                  </div>
                  <div className="font-medium text-right">{formatNumber(beatmapset.play_count)}</div>
                </>
              )}
              
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-pink-400" />
                Beatmap ID
              </div>
              <div className="font-medium text-right font-mono text-xs">{beatmapset.id}</div>
            </div>
            
            {/* Audio preview */}
            {previewUrl && (
              <div className="pt-3 border-t border-border/10">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Headphones className="h-3.5 w-3.5 text-pink-400" />
                  Audio Preview
                </div>
                <audio 
                  controls 
                  src={previewUrl} 
                  className="w-full h-8 opacity-80 hover:opacity-100 transition-opacity"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            {/* Tags cloud */}
            {uniqueTags.length > 0 && (
              <div className="pt-3 border-t border-border/10">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-pink-400" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {uniqueTags.map((tag, index) => (
                    <Badge 
                      key={`${tag}-${index}`} 
                      variant="outline" 
                      className="bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* External links - Removed watch gameplay link */}
            <div className="pt-3 border-t border-border/10">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-pink-400" />
                External Links
              </div>
              <div className="flex flex-col gap-2">
              <Link 
                href={`https://osu.ppy.sh/beatmapsets/${id}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                  className="text-pink-500 hover:text-pink-400 hover:underline flex items-center text-sm group"
              >
                  <div className="h-5 w-5 rounded-full bg-pink-500/10 flex items-center justify-center mr-2 group-hover:bg-pink-500/20 transition-colors">
                    <span className="text-pink-500 font-bold text-[8px]">o!</span>
                  </div>
                  Official osu! website
              </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Difficulties table with enhanced styling - REDESIGNED */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-pink-600/10 shadow-md overflow-hidden">
          <div className="bg-gradient-to-br from-pink-500/15 via-pink-500/5 to-transparent py-4 px-6 border-b border-pink-500/10">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-pink-500" />
              Difficulties ({beatmapset.beatmaps?.length || 0})
            </CardTitle>
          </div>
          <CardContent className="p-0">
            {beatmapset.beatmaps && beatmapset.beatmaps.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-500/5 hover:bg-pink-500/10">
                      <TableHead className="w-[50px]">Mode</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead className="text-right">Stars</TableHead>
                      <TableHead className="text-right">Length</TableHead>
                      <TableHead className="text-right">BPM</TableHead>
                      <TableHead className="text-right">CS</TableHead>
                      <TableHead className="text-right">AR</TableHead>
                      <TableHead className="text-right">OD</TableHead>
                      <TableHead className="text-right">HP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beatmapset.beatmaps.map((diff) => {
                      const mode = getModeInfo(diff.mode);
                      const difficultyColor = getDifficultyColor(diff.difficulty_rating);
                      return (
                        <TableRow key={diff.id} className="hover:bg-pink-500/5 transition-colors">
                          <TableCell 
                            className="font-mono text-center" 
                            title={mode.name}
                          >
                            <span className={`${mode.color} font-bold`}>{mode.icon}</span>
                          </TableCell>
                          <TableCell className="font-medium">
                            <Link 
                              href={diff.url || `https://osu.ppy.sh/beatmaps/${diff.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-pink-500 hover:underline flex items-center"
                            >
                              <span className="h-2 w-2 rounded-full mr-2" style={{
                                backgroundColor: difficultyColor.replace('text-', '').replace('[', '').replace(']', '')
                              }}></span>
                              {diff.version}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={difficultyColor}>
                              {diff.difficulty_rating.toFixed(2)}★
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            <Clock className="h-3 w-3 inline mr-1 opacity-70" />
                            {formatTime(diff.total_length)}
                          </TableCell>
                          <TableCell className="text-right">{diff.bpm?.toFixed(0) || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Tooltip content="Circle Size">
                              <span>{diff.cs.toFixed(1)}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-right">
                            <Tooltip content="Approach Rate">
                              <span>{diff.ar.toFixed(1)}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-right">
                            <Tooltip content="Overall Difficulty">
                              <span>{diff.accuracy.toFixed(1)}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-right">
                            <Tooltip content="Health Drain">
                              <span>{diff.drain.toFixed(1)}</span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Music className="h-12 w-12 mb-2 text-muted-foreground/50" />
                <p>No difficulty information available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* User Scores section */}
      {beatmapset.beatmaps && beatmapset.beatmaps.length > 0 && (
        <UserScores 
          beatmapId={beatmapset.beatmaps[0].id.toString()} 
          beatmapset={beatmapset}
        />
      )}
      
      {/* Additional section: Similar Beatmaps */}
      <Card className="bg-card/50 backdrop-blur-sm border-pink-600/10 shadow-md overflow-hidden">
        <div className="bg-gradient-to-br from-pink-500/15 via-pink-500/5 to-transparent py-4 px-6 border-b border-pink-500/10">
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-pink-500" />
            You might also like
          </CardTitle>
        </div>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <p>Similar beatmaps will appear here soon™</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Tooltip component for difficulty stats
function Tooltip({ children, content }: { children: React.ReactNode, content: string }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
        {content}
        <svg className="absolute text-black/90 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </div>
  );
} 