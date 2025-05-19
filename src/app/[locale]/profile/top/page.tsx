"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserScore } from "@/lib/osu-api";
import { formatNumber, formatDate, cn } from "@/lib/utils";
import { 
  Trophy, 
  Medal, 
  Clock, 
  Music,
  Star,
  ChevronLeft,
  Loader2,
  AlertCircle
} from "lucide-react";

// Country flag component
const CountryFlag = ({ countryCode, className }: { countryCode: string, className?: string }) => {
  const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  
  return (
    <div className={cn("inline-block rounded-sm overflow-hidden", className)}>
      <Image 
        src={flagUrl} 
        alt={countryCode} 
        width={20} 
        height={15}
        className="h-auto object-cover"
      />
    </div>
  );
};

// Mods mapping for display
const MODS: Record<string, { acronym: string; description: string; color?: string }> = {
  "HD": { acronym: "HD", description: "Hidden", color: "bg-blue-500" },
  "HR": { acronym: "HR", description: "Hard Rock", color: "bg-red-500" },
  "DT": { acronym: "DT", description: "Double Time", color: "bg-yellow-500" },
  "NC": { acronym: "NC", description: "Nightcore", color: "bg-pink-500" },
  "FL": { acronym: "FL", description: "Flashlight", color: "bg-purple-500" },
  "SO": { acronym: "SO", description: "Spun Out", color: "bg-green-500" },
  "PF": { acronym: "PF", description: "Perfect", color: "bg-green-500" },
  "SD": { acronym: "SD", description: "Sudden Death", color: "bg-red-500" },
  "EZ": { acronym: "EZ", description: "Easy", color: "bg-green-500" },
  "NF": { acronym: "NF", description: "No Fail", color: "bg-orange-500" },
  "HT": { acronym: "HT", description: "Half Time", color: "bg-blue-500" },
  "TD": { acronym: "TD", description: "Touch Device", color: "bg-purple-500" },
};

// Rank icons/colors
const RANK_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
  "XH": { color: "text-[#daa520] font-bold", icon: <Trophy className="text-[#daa520] h-4 w-4" /> },
  "X": { color: "text-[#daa520] font-bold", icon: <Trophy className="text-[#daa520] h-4 w-4" /> },
  "SH": { color: "text-[#c0c0c0] font-bold", icon: <Medal className="text-[#c0c0c0] h-4 w-4" /> },
  "S": { color: "text-[#c0c0c0] font-bold", icon: <Medal className="text-[#c0c0c0] h-4 w-4" /> },
  "A": { color: "text-green-500 font-bold", icon: <span className="font-bold text-green-500">A</span> },
  "B": { color: "text-blue-500 font-bold", icon: <span className="font-bold text-blue-500">B</span> },
  "C": { color: "text-purple-500 font-bold", icon: <span className="font-bold text-purple-500">C</span> },
  "D": { color: "text-red-500 font-bold", icon: <span className="font-bold text-red-500">D</span> },
  "F": { color: "text-red-500 font-bold", icon: <span className="font-bold text-red-500">F</span> },
};

export default function TopPlaysPage() {
  // Fixed locale handling with useParams
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  
  const { data: session, status } = useSession();
  const [scores, setScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // CSS for custom scrollbars
  const scrollbarCSS = `
    .pink-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .pink-scrollbar::-webkit-scrollbar-track {
      background: rgba(236, 72, 153, 0.05);
      border-radius: 10px;
    }
    .pink-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(236, 72, 153, 0.3);
      border-radius: 10px;
    }
    .pink-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(236, 72, 153, 0.5);
    }
  `;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/signin?callbackUrl=${encodeURIComponent(`/${locale}/profile/top`)}`);
      return;
    }

    if (status !== "authenticated" || !session?.accessToken || !session?.user?.id) {
      return;
    }

    const fetchTopPlays = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/user/best?limit=50`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch top plays: ${response.statusText}`);
        }

        const data = await response.json();
        setScores(data.scores || []);
      } catch (err) {
        console.error("Error fetching top plays:", err);
        setError("Failed to load your top plays. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlays();
  }, [session, status, router, locale]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-pink-500/30 animate-ping"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-pink-500 animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading your top plays...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md border-red-400/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Top Plays</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button
              onClick={() => router.push(`/${locale}/profile`)}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Return to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{scrollbarCSS}</style>

      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center mb-6 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/${locale}/profile`)}
            className="h-9 rounded-lg border-pink-500/20 hover:bg-pink-500/5 text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Button>
          <h1 className="text-2xl font-bold">Best Performance</h1>
        </div>

        <Card className="border-pink-500/10 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent py-5 px-6 border-b border-pink-500/10">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-pink-500" />
              All-Time Top Plays
            </CardTitle>
          </CardHeader>
          
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] pink-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <TableRow className="hover:bg-pink-500/5 border-b border-pink-500/10">
                  <TableHead className="w-[50px] font-medium">RANK</TableHead>
                  <TableHead className="font-medium">BEATMAP</TableHead>
                  <TableHead className="w-[70px] font-medium">GRADE</TableHead>
                  <TableHead className="text-right font-medium">PP</TableHead>
                  <TableHead className="text-right font-medium">ACC</TableHead>
                  <TableHead className="text-right font-medium">COMBO</TableHead>
                  <TableHead className="font-medium">MODS</TableHead>
                  <TableHead className="text-right font-medium">DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Trophy className="h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="font-medium text-muted-foreground">No top plays found</p>
                        <p className="text-xs text-muted-foreground/70 mt-1 max-w-md">
                          Play some beatmaps to start building your performance history
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  scores.map((score, index) => (
                    <TableRow key={score.id} className="hover:bg-pink-500/5 border-b border-pink-500/5">
                      <TableCell className="font-bold text-center">
                        {index < 3 ? (
                          <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center font-bold text-white mx-auto",
                            index === 0 ? "bg-yellow-500" : 
                            index === 1 ? "bg-slate-400" : "bg-amber-700"
                          )}>
                            {index + 1}
                          </div>
                        ) : (
                          index + 1
                        )}
                      </TableCell>
                      <TableCell>
                        {score.beatmapset && (
                          <Link 
                            href={`/${locale}/beatmap/${score.beatmapset.id}`}
                            className="flex items-center gap-3 hover:text-pink-500"
                          >
                            <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-pink-500/5 border border-pink-500/10">
                              <Image
                                src={score.beatmapset.covers['list@2x'] || score.beatmapset.covers.list}
                                alt={`${score.beatmapset.artist} - ${score.beatmapset.title}`}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {score.beatmapset.title}
                              </div>
                              <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                                <span>{score.beatmapset.artist}</span>
                                {score.beatmap?.version && (
                                  <>
                                    <span className="text-muted-foreground/50">|</span>
                                    <span className="italic">{score.beatmap.version}</span>
                                  </>
                                )}
                                {score.user?.country_code && (
                                  <CountryFlag countryCode={score.user.country_code} className="ml-auto h-4 shadow-sm" />
                                )}
                              </div>
                            </div>
                          </Link>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            score.rank === 'XH' || score.rank === 'X' ? "bg-yellow-500/10" :
                            score.rank === 'SH' || score.rank === 'S' ? "bg-slate-500/10" :
                            score.rank === 'A' ? "bg-green-500/10" :
                            score.rank === 'B' ? "bg-blue-500/10" :
                            score.rank === 'C' ? "bg-purple-500/10" : "bg-red-500/10"
                          )}>
                            {RANK_STYLES[score.rank]?.icon || score.rank}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-pink-500">
                        {score.pp ? `${score.pp.toFixed(0)}pp` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(score.accuracy * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(score.max_combo)}x
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {score.mods.length > 0 ? score.mods.map((mod) => (
                            <span
                              key={mod}
                              className={cn(
                                "px-1.5 py-0.5 text-xs rounded text-white font-medium",
                                MODS[mod]?.color || 'bg-gray-500'
                              )}
                              title={MODS[mod]?.description || mod}
                            >
                              {mod}
                            </span>
                          )) : (
                            <span className="text-muted-foreground text-xs">NM</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(score.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </>
  );
} 