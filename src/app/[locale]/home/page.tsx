// Remove "use client" - This is now a Server Component
// export const dynamic = 'force-dynamic'; // Keep if needed, or remove for default static generation

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

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = params;

  // Extract search params for the API call and pass to Search component
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const mode = typeof searchParams.mode === 'string' ? searchParams.mode : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  // Add other filters like page, NSFW if needed

  let beatmapsets: Beatmapset[] = [];
  let searchError: string | null = null;
  let totalResults: number = 0;

  const initialSearchParamsForClient: SearchParams = { query, mode, status };

  try {
    // Fetch data from osu! API based on search params
    // Use a default query or behavior if no query is present (e.g., fetch recent ranked?)
    const searchResult = await searchBeatmapsets(query || '', mode, status); // Default to empty search for now
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