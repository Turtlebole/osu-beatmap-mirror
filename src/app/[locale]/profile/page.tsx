"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserProfile, UserScore } from "@/lib/osu-api";
import { formatNumber, formatDate, cn } from "@/lib/utils";
import { 
  User, 
  Trophy, 
  Medal, 
  Clock, 
  Calendar,
  Flag,
  Music, 
  Loader2, 
  ExternalLink,
  History,
  Star,
  Zap,
  ChevronRight,
  BarChart3,
  Award,
  Target,
  Check
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function ProfilePage() {
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topPlays, setTopPlays] = useState<UserScore[]>([]);
  const [recentPlays, setRecentPlays] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const dataLoadedRef = useRef(false);

  const formattedJoinDate = useMemo(() => {
    if (!profile) return '';
    return formatDate(profile.join_date);
  }, [profile]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/signin?callbackUrl=${encodeURIComponent(`/${locale}/profile`)}`);
      return;
    }

    if (status !== "authenticated" || !session?.accessToken || !session?.user?.id) {
      return;
    }
    
    if (dataLoadedRef.current) {
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [profileResponse, topPlaysResponse, recentPlaysResponse] = await Promise.all([
          fetch(`/api/user/profile`, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }),
          fetch(`/api/user/best?limit=15`, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }),
          fetch(`/api/user/recent?limit=15`, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          })
        ]);

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch profile: ${profileResponse.statusText}`);
        }

        const profileData = await profileResponse.json();
        setProfile(profileData.profile);
        
        if (topPlaysResponse.ok) {
          const topPlaysData = await topPlaysResponse.json();
          setTopPlays(topPlaysData.scores || []);
        }
        
        if (recentPlaysResponse.ok) {
          const recentPlaysData = await recentPlaysResponse.json();
          setRecentPlays(recentPlaysData.scores || []);
        }
        
        dataLoadedRef.current = true;
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load your profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

  }, [status, session?.user?.id, locale, router]);

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
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md border-red-400/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Profile</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push(`/${locale}/home`)}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const levelProgress = profile.statistics.level.progress || 0;
  const totalHits = profile.statistics.total_hits || 0;
  const playTime = profile.statistics.play_time || 0;
  
  const playTimeHours = Math.floor(playTime / 3600);
  
  return (
    <>
      <style jsx global>{scrollbarCSS}</style>
      
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl space-y-8">
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-pink-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5 z-0">
            <div className="absolute inset-0 opacity-10"
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 }}
            ></div>
          </div>
        
          <div className="relative z-10 backdrop-blur-sm p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-md opacity-75 blur group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-md overflow-hidden border-4 border-background">
                    <Image
                      src={profile.avatar_url}
                      alt={profile.username}
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                </div>
                
                <div className="space-y-1 max-w-full">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{profile.username}</h1>
                    {profile.is_supporter && (
                      <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-3 py-0.5 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" />
                        Supporter
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CountryFlag countryCode={profile.country.code} className="shadow-sm" />
                      <span>{profile.country.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-pink-500" />
                      <span>Joined {formattedJoinDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Button 
                    asChild
                    className="rounded-full bg-pink-600 hover:bg-pink-700 shadow-md"
                  >
                    <a
                      href={`https://osu.ppy.sh/users/${profile.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      osu! Profile
                    </a>
                  </Button>
                </div>
              </div>
              
              {/* Stats overview */}
              <div className="col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Global Ranking Card */}
                  <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-4 hover:bg-pink-500/10 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">GLOBAL RANK</span>
                      <Trophy className="h-4 w-4 text-pink-500" />
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold">#{formatNumber(profile.statistics.global_rank)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <CountryFlag countryCode={profile.country.code} className="h-3.5 shadow-sm" />
                      <span>#{formatNumber(profile.statistics.country_rank)} in {profile.country.name}</span>
                    </div>
                  </div>
                  
                  {/* Performance Card */}
                  <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-4 hover:bg-pink-500/10 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">PERFORMANCE</span>
                      <Zap className="h-4 w-4 text-pink-500" />
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold">{formatNumber(profile.statistics.pp)}</span>
                      <span className="text-xl font-medium text-pink-500 mb-0.5">pp</span>
                    </div>
                    <div className="mt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Level {profile.statistics.level.current}</span>
                        <span className="text-pink-500">{levelProgress}%</span>
                      </div>
                      <Progress value={levelProgress} className="h-1.5" />
                    </div>
                  </div>
                  
                  {/* Accuracy Card */}
                  <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-4 hover:bg-pink-500/10 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">ACCURACY</span>
                      <Target className="h-4 w-4 text-pink-500" />
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold">{profile.statistics.hit_accuracy.toFixed(2)}</span>
                      <span className="text-xl font-medium mb-0.5">%</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Check className="h-3 w-3 opacity-70" />
                      <span>{formatNumber(totalHits)} total hits</span>
                    </div>
                  </div>
                  
                  {/* Play Stats Card */}
                  <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-4 hover:bg-pink-500/10 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">PLAY COUNT</span>
                      <BarChart3 className="h-4 w-4 text-pink-500" />
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold">{formatNumber(profile.statistics.play_count)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      <span>{formatNumber(playTimeHours)} hours played</span>
                    </div>
                  </div>
                </div>
                
                {/* Additional stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="flex flex-col bg-pink-500/5 border border-pink-500/10 rounded-xl p-4">
                    <span className="text-xs text-muted-foreground mb-1">Ranked Score</span>
                    <span className="text-xl font-bold">{formatNumber(profile.statistics.ranked_score)}</span>
                  </div>
                  
                  <div className="flex flex-col bg-pink-500/5 border border-pink-500/10 rounded-xl p-4">
                    <span className="text-xs text-muted-foreground mb-1">Total Score</span>
                    <span className="text-xl font-bold">{formatNumber(profile.statistics.total_score)}</span>
                  </div>
                  
                  <div className="flex flex-col bg-pink-500/5 border border-pink-500/10 rounded-xl p-4">
                    <span className="text-xs text-muted-foreground mb-1">Maximum Combo</span>
                    <span className="text-xl font-bold">{formatNumber(profile.statistics.maximum_combo)}x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabbed content section */}
        <Tabs defaultValue="top-plays" className="mt-6">
          <TabsList className="mb-6 bg-pink-500/5 p-1 rounded-xl">
            <TabsTrigger value="top-plays" className="rounded-lg data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              <Trophy className="h-4 w-4 mr-2" />
              Top Plays
            </TabsTrigger>
            <TabsTrigger value="recent-plays" className="rounded-lg data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              <History className="h-4 w-4 mr-2" />
              Recent Activity
            </TabsTrigger>
          </TabsList>
          
          {/* Top Plays Tab */}
          <TabsContent value="top-plays" className="mt-0">
            <Card className="border-pink-500/10 shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent py-5 px-6 border-b border-pink-500/10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Trophy className="h-5 w-5 text-pink-500" />
                      Best Performance
                    </CardTitle>
                    <CardDescription>Your highest PP plays</CardDescription>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-1 text-sm border-pink-500/20 hover:bg-pink-500/5"
                  >
                    <Link href={`/${locale}/profile/top`} prefetch={false}>
                      View All
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] pink-scrollbar">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                    <TableRow className="hover:bg-pink-500/5 border-b border-pink-500/10">
                      <TableHead className="w-[50px] font-medium">RANK</TableHead>
                      <TableHead className="font-medium">BEATMAP</TableHead>
                      <TableHead className="w-[70px] font-medium">GRADE</TableHead>
                      <TableHead className="text-right font-medium">PP</TableHead>
                      <TableHead className="text-right font-medium">ACC</TableHead>
                      <TableHead className="font-medium">MODS</TableHead>
                      <TableHead className="text-right font-medium">DATE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPlays.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Award className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="font-medium text-muted-foreground">No top plays found</p>
                            <p className="text-xs text-muted-foreground/70 mt-1 max-w-md">
                              Play some beatmaps to see your best performances here
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      topPlays.map((score, index) => (
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
                                    src={score.beatmapset.covers.list || score.beatmapset.covers['list@2x']}
                                    alt={score.beatmapset.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{score.beatmapset.title}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {score.beatmapset.artist} [{score.beatmap?.version || ''}]
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
          </TabsContent>
          
          {/* Recent Plays Tab */}
          <TabsContent value="recent-plays" className="mt-0">
            <Card className="border-pink-500/10 shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent py-5 px-6 border-b border-pink-500/10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <History className="h-5 w-5 text-pink-500" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest plays</CardDescription>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-1 text-sm border-pink-500/20 hover:bg-pink-500/5"
                  >
                    <Link href={`/${locale}/profile/recent`} prefetch={false}>
                      View All
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] pink-scrollbar">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                    <TableRow className="hover:bg-pink-500/5 border-b border-pink-500/10">
                      <TableHead className="w-[50px] font-medium">RANK</TableHead>
                      <TableHead className="font-medium">BEATMAP</TableHead>
                      <TableHead className="w-[70px] font-medium">GRADE</TableHead>
                      <TableHead className="text-right font-medium">PP</TableHead>
                      <TableHead className="text-right font-medium">ACC</TableHead>
                      <TableHead className="font-medium">MODS</TableHead>
                      <TableHead className="text-right font-medium">DATE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPlays.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Award className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="font-medium text-muted-foreground">No recent plays found</p>
                            <p className="text-xs text-muted-foreground/70 mt-1 max-w-md">
                              Play some beatmaps to see your recent activity here
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentPlays.map((score, index) => (
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
                                    src={score.beatmapset.covers.list || score.beatmapset.covers['list@2x']}
                                    alt={score.beatmapset.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{score.beatmapset.title}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {score.beatmapset.artist} [{score.beatmap?.version || ''}]
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
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}