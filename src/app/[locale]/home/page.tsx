"use client";

export const dynamic = 'force-dynamic';

import { Search, SearchFilters } from '@/components/Search';
import { BeatmapCard } from '@/components/BeatmapCard';
import Link from 'next/link';
import { featuredBeatmaps, recentBeatmaps, popularCategories, featuredCreators } from '@/lib/mock-data';
import { t } from '@/lib/i18n';

// Since we're using the "use client" directive, we can directly use params
export default function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const handleSearch = (query: string, filters: SearchFilters) => {
    console.log('Search query:', query);
    console.log('Filters:', filters);
    // In a real app, we'd implement search functionality here
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome to osu!mirror</h1>
          <p className="text-muted-foreground">Discover and download beatmaps for osu!</p>
        </div>
        
        <Search onSearch={handleSearch} locale={locale} />
      </section>
      
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Beatmaps</h2>
          <Link 
            href={`/${locale}/featured`}
            className="text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBeatmaps.slice(0, 6).map((beatmap) => (
            <BeatmapCard 
              key={beatmap.id}
              id={beatmap.id}
              title={beatmap.title}
              artist={beatmap.artist}
              creator={beatmap.creator}
              coverUrl={beatmap.coverUrl}
              bpm={beatmap.bpm}
              length={beatmap.length}
              playCount={beatmap.playCount}
              difficulties={beatmap.difficulties}
              locale={locale}
            />
          ))}
        </div>
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Uploads</h2>
            <Link 
              href={`/${locale}/recent`}
              className="text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recentBeatmaps.slice(0, 4).map((beatmap) => (
              <BeatmapCard 
                key={beatmap.id}
                id={beatmap.id}
                title={beatmap.title}
                artist={beatmap.artist}
                creator={beatmap.creator}
                coverUrl={beatmap.coverUrl}
                bpm={beatmap.bpm}
                length={beatmap.length}
                playCount={beatmap.playCount}
                difficulties={beatmap.difficulties}
                locale={locale}
              />
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          
          <div className="bg-card border border-border rounded-lg p-4 mb-8">
            <ul className="space-y-3">
              {popularCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/${locale}/category/${category.id}`}
                    className="flex justify-between items-center hover:bg-muted p-2 rounded transition-colors"
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">{category.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-4 pt-4 border-t border-border">
              <Link 
                href={`/${locale}/categories`}
                className="text-primary hover:underline flex justify-center"
              >
                View all categories
              </Link>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-6">Featured Creators</h2>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <ul className="space-y-4">
              {featuredCreators.map((creator) => (
                <li key={creator.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {creator.name.charAt(0)}
                  </div>
                  <div>
                    <Link 
                      href={`/${locale}/creators/${creator.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {creator.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {creator.beatmaps} beatmaps • {creator.followers.toLocaleString()} followers
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="mt-4 pt-4 border-t border-border">
              <Link 
                href={`/${locale}/creators`}
                className="text-primary hover:underline flex justify-center"
              >
                View all creators
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 