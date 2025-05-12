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
import { formatTime, formatNumber } from '@/lib/utils';
import { Star, Clock, User, Download, Heart, CheckCircle, Hourglass, CircleSlash, ExternalLink, Terminal, Music } from 'lucide-react';

// Client component for the download button
import DownloadButton from '@/components/DownloadButton';

type BeatmapPageProps = {
  params: {
    locale: string;
    id: string;
  };
};

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

// Helper to get game mode icon/name
const getModeInfo = (mode: string) => {
  switch (mode) {
    case '0': case 'osu': return { name: 'osu!', icon: '●' };
    case '1': case 'taiko': return { name: 'osu!taiko', icon: '◯' };
    case '2': case 'fruits': case 'catch': return { name: 'osu!catch', icon: '◓' };
    case '3': case 'mania': return { name: 'osu!mania', icon: '◨' };
    default: return { name: mode, icon: '●' };
  }
};

// Generate metadata for SEO
export async function generateMetadata({ params }: BeatmapPageProps): Promise<Metadata> {
  try {
    const beatmapset = await getBeatmapset(params.id);
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

export default async function BeatmapPage({ params }: BeatmapPageProps) {
  const { locale, id } = params;
  
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
  
  // Download URL
  const downloadUrl = `/api/download/${beatmapset.id}`;
  const downloadFilename = `${beatmapset.artist} - ${beatmapset.title} [${beatmapset.creator}].osz`;

  // Calculate representative beatmap information
  const representativeBeatmap = beatmapset.beatmaps && beatmapset.beatmaps.length > 0 
    ? beatmapset.beatmaps.sort((a, b) => b.difficulty_rating - a.difficulty_rating)[0]
    : null;

  // Process tags to remove duplicates or ensure unique keys
  const uniqueTags = beatmapset.tags ? 
    Array.from(new Set(beatmapset.tags.split(' ')))
      .filter(tag => tag.trim() !== '') : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-2xl space-y-6">
      {/* Header Section */}
      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden border-2 border-pink-600/20 shadow-lg">
        <Image
          src={beatmapset.covers['cover@2x'] || beatmapset.covers.cover || '/placeholder.png'}
          alt={`Cover for ${beatmapset.title}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end p-6">
          <Badge variant={statusAttributes.variant} className="absolute top-4 right-4 capitalize">
            {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
            {beatmapset.status}
          </Badge>
          
          <div className="md:flex md:justify-between md:items-end">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">{beatmapset.title}</h1>
              <h2 className="text-lg md:text-2xl font-medium text-gray-200 drop-shadow-md">{beatmapset.artist}</h2>
              <p className="text-sm text-gray-300 mt-1">
                Mapped by <Link href={`https://osu.ppy.sh/users/${beatmapset.user_id}`} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{beatmapset.creator}</Link>
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <DownloadButton url={downloadUrl} filename={downloadFilename} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Details Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-muted-foreground">BPM</div>
              <div className="font-medium text-right">{representativeBeatmap?.bpm || 'Unknown'}</div>
              
              <div className="text-muted-foreground">Source</div>
              <div className="font-medium text-right">{beatmapset.source || 'Original'}</div>
              
              <div className="text-muted-foreground">Submitted</div>
              <div className="font-medium text-right">{new Date(beatmapset.submitted_date).toLocaleDateString()}</div>
              
              {beatmapset.ranked_date && (
                <>
                  <div className="text-muted-foreground">Ranked</div>
                  <div className="font-medium text-right">{new Date(beatmapset.ranked_date).toLocaleDateString()}</div>
                </>
              )}
              
              {beatmapset.favourite_count && (
                <>
                  <div className="text-muted-foreground">Favorites</div>
                  <div className="font-medium text-right flex items-center justify-end">
                    <Heart className="h-3 w-3 text-pink-500 mr-1" />
                    {formatNumber(beatmapset.favourite_count)}
                  </div>
                </>
              )}
              
              {beatmapset.play_count && (
                <>
                  <div className="text-muted-foreground">Plays</div>
                  <div className="font-medium text-right">{formatNumber(beatmapset.play_count)}</div>
                </>
              )}
            </div>
            
            {uniqueTags.length > 0 && (
              <div className="pt-3 border-t">
                <div className="text-xs text-muted-foreground mb-1">Tags</div>
                <div className="flex flex-wrap gap-1 text-xs">
                  {uniqueTags.map((tag, index) => (
                    <Badge key={`${tag}-${index}`} variant="outline" className="bg-card">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-3">
              <Link 
                href={`https://osu.ppy.sh/beatmapsets/${id}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-pink-500 hover:underline inline-flex items-center text-xs"
              >
                View on osu! website <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Difficulties */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Difficulties ({beatmapset.beatmaps?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {beatmapset.beatmaps && beatmapset.beatmaps.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                      return (
                        <TableRow key={diff.id}>
                          <TableCell className="font-mono text-center" title={mode.name}>
                            {mode.icon}
                          </TableCell>
                          <TableCell className="font-medium">
                            <Link 
                              href={diff.url || `https://osu.ppy.sh/beatmaps/${diff.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-pink-500 hover:underline"
                            >
                              {diff.version}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={`${diff.difficulty_rating >= 6 ? 'text-pink-500' : diff.difficulty_rating >= 5 ? 'text-orange-500' : diff.difficulty_rating >= 4 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                              {diff.difficulty_rating.toFixed(2)}★
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatTime(diff.total_length)}
                          </TableCell>
                          <TableCell className="text-right">{diff.bpm?.toFixed(0) || '-'}</TableCell>
                          <TableCell className="text-right">{diff.cs.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{diff.ar.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{diff.accuracy.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{diff.drain.toFixed(1)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">No difficulty information available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 