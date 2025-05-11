"use client";

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { featuredBeatmaps, recentBeatmaps } from '@/lib/mock-data';
import { t } from '@/lib/i18n';

export default function BeatmapPage({ params }: { params: { id: string, locale: string } }) {
  const { id, locale } = params;
  
  // Find beatmap from our mock data
  const allBeatmaps = [...featuredBeatmaps, ...recentBeatmaps];
  const beatmap = allBeatmaps.find(b => b.id === id);
  
  if (!beatmap) {
    notFound();
  }
  
  // Calculate the max difficulty stars
  const maxStars = Math.max(...beatmap.difficulties.map(d => d.stars));
  
  // Get color based on max difficulty
  const getDifficultyColor = (stars: number) => {
    if (stars < 2) return 'bg-green-500';
    if (stars < 3) return 'bg-blue-500';
    if (stars < 4) return 'bg-yellow-500';
    if (stars < 5) return 'bg-orange-500';
    if (stars < 6) return 'bg-red-500';
    return 'bg-purple-500';
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link 
          href={`/${locale}/home`}
          className="text-primary hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to home
        </Link>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="relative h-64 md:h-80">
          <Image
            src={beatmap.coverUrl}
            alt={`${beatmap.artist} - ${beatmap.title}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold">{beatmap.title}</h1>
            <p className="text-xl md:text-2xl">{beatmap.artist}</p>
            <p className="text-lg mt-2">Mapped by <span className="text-primary">{beatmap.creator}</span></p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Beatmap Info</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between pb-2 border-b border-border">
                  <span className="font-medium">BPM</span>
                  <span>{beatmap.bpm}</span>
                </div>
                
                <div className="flex justify-between pb-2 border-b border-border">
                  <span className="font-medium">Length</span>
                  <span>{beatmap.length}</span>
                </div>
                
                <div className="flex justify-between pb-2 border-b border-border">
                  <span className="font-medium">Play Count</span>
                  <span>{beatmap.playCount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between pb-2 border-b border-border">
                  <span className="font-medium">Highest Difficulty</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(maxStars)} text-white`}>
                    {maxStars.toFixed(2)}★
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  {t(locale, 'beatmap.download')}
                </button>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Difficulties</h2>
              
              <div className="space-y-3">
                {beatmap.difficulties.map((diff, index) => (
                  <div 
                    key={index} 
                    className="bg-muted p-3 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{diff.version}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(diff.stars)} text-white`}>
                      {diff.stars.toFixed(2)}★
                    </div>
                  </div>
                ))}
              </div>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-muted rounded-full text-sm">Electronic</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm">Featured</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm">Stream</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm">PP</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm">Ranked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Similar Beatmaps</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBeatmaps.slice(0, 4).filter(b => b.id !== beatmap.id).map((beatmap) => (
            <div key={beatmap.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
              <Link href={`/${locale}/beatmap/${beatmap.id}`}>
                <div className="relative h-32">
                  <Image
                    src={beatmap.coverUrl}
                    alt={`${beatmap.artist} - ${beatmap.title}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-3 text-white">
                    <p className="font-bold truncate max-w-[200px]">{beatmap.title}</p>
                    <p className="text-sm truncate max-w-[200px]">{beatmap.artist}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 