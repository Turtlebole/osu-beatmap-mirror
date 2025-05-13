// Remove "use client" - This is now a Server Component
export const dynamic = 'force-dynamic'; // Enable dynamic rendering for searchParams

import { searchBeatmapsets, Beatmapset } from '@/lib/osu-api';
import { Search, SearchParams } from '@/components/Search';
import { BeatmapCard } from '@/components/BeatmapCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
// Removed mock data imports
// Removed unused Link import
// Removed i18n import (can add back if needed for server-side text)

// Define the props for the page, including searchParams
type HomePageProps = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function HomePage(props: HomePageProps) {
  // Use Promise.resolve to properly await the params object
  const { locale } = await Promise.resolve(props.params);
  
  // Extract search params with proper await pattern
  const { q, mode, status } = await Promise.resolve(props.searchParams);
  
  // Process the search params
  const query = typeof q === 'string' ? q : undefined;
  const modeValue = typeof mode === 'string' ? mode : undefined;
  const statusValue = typeof status === 'string' ? status : undefined;

  let beatmapsets: Beatmapset[] = [];
  let searchError: string | null = null;
  let totalResults: number = 0;

  const initialSearchParamsForClient: SearchParams = { 
    query, 
    mode: modeValue, 
    status: statusValue 
  };

  try {
    // Fetch data from osu! API based on search params
    const searchResult = await searchBeatmapsets(query || '', modeValue, statusValue);
    beatmapsets = searchResult.beatmapsets;
    totalResults = searchResult.total;
  } catch (error) {
    console.error("Failed to fetch beatmapsets:", error);
    searchError = error instanceof Error ? error.message : "An unknown error occurred.";
  }

  return (
    // Use `max-w-screen-2xl` to match Navbar/Footer container if desired
    <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
      <section className="mb-8">
        <Search initialSearchParams={initialSearchParamsForClient} locale={locale} />
      </section>

      <section>
        {searchError ? (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Fetching Beatmaps</AlertTitle>
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        ) : beatmapsets.length > 0 ? (
          <>
            {query && <p className="text-sm text-muted-foreground mb-4">Found {totalResults} results for "{query}".</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {beatmapsets.map((beatmapset) => (
                <BeatmapCard 
                  key={beatmapset.id} 
                  beatmapset={beatmapset} 
                  locale={locale} 
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No beatmaps found matching your criteria.</p>
          </div>
        )}
      </section>
    </div>
  );
} 