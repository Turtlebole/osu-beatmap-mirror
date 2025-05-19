"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserScore, Beatmapset } from "@/lib/osu-api";
import { formatNumber, formatDate } from '@/lib/utils';
import { Trophy, Medal, Clock, ChevronDown, AlertCircle, Loader2, Star, Filter } from 'lucide-react';
import Image from "next/image";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface UserScoresProps {
  beatmapId: string;
  beatmapset?: Beatmapset;
}

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

// Get difficulty color
const getDifficultyColor = (stars: number): string => {
  if (stars < 2) return 'text-[#88b300]';
  if (stars < 2.7) return 'text-[#38c21c]';
  if (stars < 4) return 'text-[#ffa801]';
  if (stars < 5.3) return 'text-[#ff5da2]';
  if (stars < 6.5) return 'text-[#cc2929]';
  return 'text-[#8866ff]';
};

export default function UserScores({ beatmapId, beatmapset }: UserScoresProps) {
  const { data: session, status } = useSession();
  const [scores, setScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedDifficultyId, setSelectedDifficultyId] = useState<string>(beatmapId);

  // Load scores when session is available and beatmapId/selectedDifficultyId changes
  useEffect(() => {
    // Reset state when beatmapId changes
    setScores([]);
    setError(null);
    setLoading(false);

    if (status === 'unauthenticated') {
      setShowLoginPrompt(true);
      return;
    }

    if (status !== 'authenticated' || !session || !session.accessToken || !session.user?.id) {
      return;
    }

    // At this point we know session is not null
    const currentSession = session;

    async function fetchScores() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/scores/${selectedDifficultyId}?userId=${currentSession.user.id}`, {
          headers: {
            'Authorization': `Bearer ${currentSession.accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch scores');
        }
        
        const data = await response.json();
        setScores(data.scores || []);
      } catch (err) {
        console.error('Error fetching scores:', err);
        setError('Failed to load your scores for this beatmap.');
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, [selectedDifficultyId, session, status]);

  // When beatmapId changes (navigating to a different beatmap), update the selected difficulty
  useEffect(() => {
    setSelectedDifficultyId(beatmapId);
  }, [beatmapId]);

  // If user is not logged in, show login prompt
  if (showLoginPrompt) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-pink-600/10 shadow-md overflow-hidden">
        <div className="bg-gradient-to-br from-pink-500/15 via-pink-500/5 to-transparent py-4 px-6 border-b border-pink-500/10">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-pink-500" />
            Your Scores
          </CardTitle>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center mb-4">
              <span className="text-pink-500 font-bold text-xl">o!</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Sign in with osu!</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Sign in with your osu! account to see your personal scores on this beatmap.
            </p>
            <Button 
              onClick={() => {
                const redirectUrl = window.location.href;
                window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(redirectUrl)}`;
              }}
              className="bg-pink-600 hover:bg-pink-700 rounded-full"
            >
              Sign in with osu!
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-pink-600/10 shadow-md overflow-hidden">
      <div className="bg-gradient-to-br from-pink-500/15 via-pink-500/5 to-transparent py-4 px-6 border-b border-pink-500/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-pink-500" />
            Your Scores
          </div>
          
          {/* Difficulty Selector */}
          {beatmapset && beatmapset.beatmaps && beatmapset.beatmaps.length > 1 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Difficulty:</span>
              </div>
              <Select
                value={selectedDifficultyId}
                onValueChange={setSelectedDifficultyId}
              >
                <SelectTrigger className="w-[180px] h-8 text-sm bg-background/80 border-pink-500/20">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {beatmapset.beatmaps.map((diff) => (
                    <SelectItem key={diff.id} value={diff.id.toString()}>
                      <span className="flex items-center gap-2">
                        <span className={`${getDifficultyColor(diff.difficulty_rating)} mr-1`}>
                          {diff.difficulty_rating.toFixed(2)}★
                        </span>
                        {diff.version}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardTitle>
      </div>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
            <span className="ml-3 text-muted-foreground">Loading your scores...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center mb-2">
              <ChevronDown className="h-6 w-6 text-pink-500" />
            </div>
            <p className="text-muted-foreground">You haven't played this difficulty yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Play it to see your scores here!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-pink-500/5 hover:bg-pink-500/10">
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                  <TableHead className="text-right">Combo</TableHead>
                  <TableHead className="text-right">PP</TableHead>
                  <TableHead>Mods</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((score) => (
                  <TableRow key={score.id} className="hover:bg-pink-500/5">
                    <TableCell>
                      <div className="flex items-center">
                        {RANK_STYLES[score.rank]?.icon || score.rank}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatNumber(score.score)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(score.accuracy * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {score.max_combo}x
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {score.pp ? `${score.pp.toFixed(2)}pp` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {score.mods.length > 0 ? score.mods.map((mod) => (
                          <span
                            key={mod}
                            className={`px-1 py-0.5 text-xs rounded text-white font-medium ${MODS[mod]?.color || 'bg-gray-500'}`}
                            title={MODS[mod]?.description || mod}
                          >
                            {mod}
                          </span>
                        )) : (
                          <span className="text-muted-foreground text-xs">NM</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(score.created_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 