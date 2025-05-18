"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search as SearchIcon, 
  SlidersHorizontal, 
  Star, 
  Calendar, 
  Music, 
  User, 
  Clock, 
  Hash, 
  ChevronDown,
  ChevronUp, 
  Gauge,
  Filter,
  Film,
  ImageIcon,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type SearchFilters = {
  mode: string;
  status: string;
  minStars: number;
  maxStars: number;
  minBpm: number;
  maxBpm: number;
  minLength: number;
  maxLength: number;
  minAr: number;
  maxAr: number;
  minCs: number;
  maxCs: number;
  minDrain: number;
  maxDrain: number;
  sort: string;
  nsfw: boolean;
  video: string;
  storyboard: string;
};

export type SearchParams = {
  query?: string;
  mode?: string;
  status?: string;
  sort?: string;
  nsfw?: string;
  video?: string;
  storyboard?: string;
  minStars?: string;
  maxStars?: string;
  minBpm?: string;
  maxBpm?: string;
  minLength?: string;
  maxLength?: string;
  minAr?: string;
  maxAr?: string;
  minCs?: string;
  maxCs?: string;
  minDrain?: string;
  maxDrain?: string;
};

type SearchComponentProps = {
  initialSearchParams: SearchParams;
  locale: string;
};

export function Search({ initialSearchParams, locale }: SearchComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(initialSearchParams.query || '');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'advanced'>('general');
  
  // General filters
  const [mode, setMode] = useState(initialSearchParams.mode || 'any');
  const [status, setStatus] = useState(initialSearchParams.status || 'any');
  const [sort, setSort] = useState(initialSearchParams.sort || 'relevance');
  const [nsfw, setNsfw] = useState(initialSearchParams.nsfw || 'any');
  const [video, setVideo] = useState(initialSearchParams.video || 'any');
  const [storyboard, setStoryboard] = useState(initialSearchParams.storyboard || 'any');
  
  // Advanced filters
  const [minStars, setMinStars] = useState<number>(parseFloat(initialSearchParams.minStars || '0'));
  const [maxStars, setMaxStars] = useState<number>(parseFloat(initialSearchParams.maxStars || '10'));
  const [minBpm, setMinBpm] = useState<number>(parseFloat(initialSearchParams.minBpm || '0'));
  const [maxBpm, setMaxBpm] = useState<number>(parseFloat(initialSearchParams.maxBpm || '300'));
  const [minLength, setMinLength] = useState<number>(parseFloat(initialSearchParams.minLength || '0'));
  const [maxLength, setMaxLength] = useState<number>(parseFloat(initialSearchParams.maxLength || '600'));
  const [minAr, setMinAr] = useState<number>(parseFloat(initialSearchParams.minAr || '0'));
  const [maxAr, setMaxAr] = useState<number>(parseFloat(initialSearchParams.maxAr || '10'));
  const [minCs, setMinCs] = useState<number>(parseFloat(initialSearchParams.minCs || '0'));
  const [maxCs, setMaxCs] = useState<number>(parseFloat(initialSearchParams.maxCs || '10'));
  const [minDrain, setMinDrain] = useState<number>(parseFloat(initialSearchParams.minDrain || '0'));
  const [maxDrain, setMaxDrain] = useState<number>(parseFloat(initialSearchParams.maxDrain || '10'));

  // Update filter values when searchParams change
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setMode(searchParams.get('mode') || 'any');
    setStatus(searchParams.get('status') || 'any');
    setSort(searchParams.get('sort') || 'relevance');
    setNsfw(searchParams.get('nsfw') || 'any');
    setVideo(searchParams.get('video') || 'any');
    setStoryboard(searchParams.get('storyboard') || 'any');
    
    if (searchParams.get('minStars')) setMinStars(parseFloat(searchParams.get('minStars') || '0'));
    if (searchParams.get('maxStars')) setMaxStars(parseFloat(searchParams.get('maxStars') || '10'));
    if (searchParams.get('minBpm')) setMinBpm(parseFloat(searchParams.get('minBpm') || '0'));
    if (searchParams.get('maxBpm')) setMaxBpm(parseFloat(searchParams.get('maxBpm') || '300'));
    if (searchParams.get('minLength')) setMinLength(parseFloat(searchParams.get('minLength') || '0'));
    if (searchParams.get('maxLength')) setMaxLength(parseFloat(searchParams.get('maxLength') || '600'));
    if (searchParams.get('minAr')) setMinAr(parseFloat(searchParams.get('minAr') || '0'));
    if (searchParams.get('maxAr')) setMaxAr(parseFloat(searchParams.get('maxAr') || '10'));
    if (searchParams.get('minCs')) setMinCs(parseFloat(searchParams.get('minCs') || '0'));
    if (searchParams.get('maxCs')) setMaxCs(parseFloat(searchParams.get('maxCs') || '10'));
    if (searchParams.get('minDrain')) setMinDrain(parseFloat(searchParams.get('minDrain') || '0'));
    if (searchParams.get('maxDrain')) setMaxDrain(parseFloat(searchParams.get('maxDrain') || '10'));
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (mode && mode !== 'any') params.set('mode', mode);
    if (status && status !== 'any') params.set('status', status);
    if (sort && sort !== 'relevance') params.set('sort', sort);
    if (nsfw && nsfw !== 'any') params.set('nsfw', nsfw);
    if (video && video !== 'any') params.set('video', video);
    if (storyboard && storyboard !== 'any') params.set('storyboard', storyboard);
    
    // Only add advanced filters if they differ from defaults
    if (minStars > 0) params.set('minStars', minStars.toString());
    if (maxStars < 10) params.set('maxStars', maxStars.toString());
    if (minBpm > 0) params.set('minBpm', minBpm.toString());
    if (maxBpm < 300) params.set('maxBpm', maxBpm.toString());
    if (minLength > 0) params.set('minLength', minLength.toString());
    if (maxLength < 600) params.set('maxLength', maxLength.toString());
    if (minAr > 0) params.set('minAr', minAr.toString());
    if (maxAr < 10) params.set('maxAr', maxAr.toString());
    if (minCs > 0) params.set('minCs', minCs.toString());
    if (maxCs < 10) params.set('maxCs', maxCs.toString());
    if (minDrain > 0) params.set('minDrain', minDrain.toString());
    if (maxDrain < 10) params.set('maxDrain', maxDrain.toString());

    router.push(`/${locale}/home?${params.toString()}`);
  };

  const resetFilters = () => {
    setMode('any');
    setStatus('any');
    setSort('relevance');
    setNsfw('any');
    setVideo('any');
    setStoryboard('any');
    setMinStars(0);
    setMaxStars(10);
    setMinBpm(0);
    setMaxBpm(300);
    setMinLength(0);
    setMaxLength(600);
    setMinAr(0);
    setMaxAr(10);
    setMinCs(0);
    setMaxCs(10);
    setMinDrain(0);
    setMaxDrain(10);
  };

  // Slide up animation to close filters
  const handleClose = () => {
    if (panelRef.current) {
      panelRef.current.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
      panelRef.current.style.maxHeight = '0px';
      panelRef.current.style.opacity = '0';
      setTimeout(() => setIsFiltersOpen(false), 300);
    } else {
      setIsFiltersOpen(false);
    }
  };
  
  // Data arrays for select dropdowns
  const gameModes = [
    { value: 'any', label: 'Any Mode' },
    { value: '0', label: 'osu!' },
    { value: '1', label: 'osu!taiko' },
    { value: '2', label: 'osu!catch' },
    { value: '3', label: 'osu!mania' },
  ];

  const beatmapStatuses = [
    { value: 'any', label: 'Any Status' },
    { value: 'ranked', label: 'Ranked' },
    { value: 'approved', label: 'Approved' },
    { value: 'loved', label: 'Loved' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'pending', label: 'Pending' },
    { value: 'graveyard', label: 'Graveyard' },
  ];
  
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'difficulty', label: 'Difficulty (⬆)' },
    { value: 'plays', label: 'Most Played' },
    { value: 'favorites', label: 'Most Favorited' },
    { value: 'rating', label: 'Highest Rated' },
  ];
  
  const yesNoOptions = [
    { value: 'any', label: 'Any' },
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  // Format time for display in length filter
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (mode !== 'any') count++;
    if (status !== 'any') count++;
    if (sort !== 'relevance') count++;
    if (nsfw !== 'any') count++;
    if (video !== 'any') count++;
    if (storyboard !== 'any') count++;
    if (minStars > 0) count++;
    if (maxStars < 10) count++;
    if (minBpm > 0) count++;
    if (maxBpm < 300) count++;
    if (minLength > 0) count++;
    if (maxLength < 600) count++;
    if (minAr > 0) count++;
    if (maxAr < 10) count++;
    if (minCs > 0) count++;
    if (maxCs < 10) count++;
    if (minDrain > 0) count++;
    if (maxDrain < 10) count++;
    return count;
  };
  
  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="w-full mb-3">
      <div className={cn(
        "rounded-lg overflow-hidden shadow-sm backdrop-blur-sm bg-background/95 border border-border/20",
        "transition-all transform duration-300",
      )}>
        {/* Search form header - removed gradient line */}
        <div className="relative">
          <form onSubmit={handleSearch} className="px-4 py-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-9 text-sm"
                  placeholder="Search beatmaps by title, artist, mapper, tags..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="h-9 px-3 bg-pink-600 hover:bg-pink-700 text-white"
                  size="sm"
                >
                  <SearchIcon className="h-4 w-4 mr-1.5" />
                  Search
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-9 px-3 flex items-center text-sm",
                    isFiltersOpen ? "bg-accent/5" : "",
                    activeFilterCount > 0 ? "border-pink-500/30 text-pink-500" : ""
                  )}
                  size="sm"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                  <Filter className="h-4 w-4 mr-1.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1.5 bg-pink-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                  {isFiltersOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 ml-1.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Filters Panel */}
        {isFiltersOpen && (
          <div 
            ref={panelRef}
            className="border-t border-border/10 overflow-hidden"
            style={{
              maxHeight: '800px',
              transition: 'max-height 0.3s ease-in-out',
              animation: 'slideInFromBottom 0.3s ease forwards'
            }}
          >
            <Tabs 
              defaultValue="general" 
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'general' | 'advanced')}
              className="w-full"
            >
              <div className="px-4 border-b border-border/10">
                <TabsList className="h-9 bg-transparent grid grid-cols-2 w-64">
                  <TabsTrigger 
                    value="general" 
                    className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-500 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
                  >
                    General Filters
                  </TabsTrigger>
                  <TabsTrigger 
                    value="advanced" 
                    className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-500 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
                  >
                    Advanced Filters
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-4">
                {activeTab === 'general' ? (
                  <div className="flex flex-wrap gap-3 items-start">
                    <div className="space-y-1.5 w-[130px]">
                      <Label htmlFor="mode" className="text-xs flex items-center">
                        <Music className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        Game Mode
                      </Label>
                      <Select value={mode} onValueChange={setMode}>
                        <SelectTrigger id="mode" className="w-full h-8 text-sm">
                          <SelectValue placeholder="Any Mode" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[130px]">
                          {gameModes.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 w-[130px]">
                      <Label htmlFor="status" className="text-xs flex items-center">
                        <Hash className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        Status
                      </Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status" className="w-full h-8 text-sm">
                          <SelectValue placeholder="Any Status" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[130px]">
                          {beatmapStatuses.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5 w-[130px]">
                      <Label htmlFor="sort" className="text-xs flex items-center">
                        <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        Sort By
                      </Label>
                      <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger id="sort" className="w-full h-8 text-sm">
                          <SelectValue placeholder="Relevance" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[130px]">
                          {sortOptions.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5 w-[130px]">
                      <Label htmlFor="nsfw" className="text-xs flex items-center">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        NSFW Content
                      </Label>
                      <Select value={nsfw} onValueChange={setNsfw}>
                        <SelectTrigger id="nsfw" className="w-full h-8 text-sm">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[130px]">
                          {yesNoOptions.map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5 w-[130px]">
                      <Label htmlFor="video" className="text-xs flex items-center">
                        <Film className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        Has Video
                      </Label>
                      <Select value={video} onValueChange={setVideo}>
                        <SelectTrigger id="video" className="w-full h-8 text-sm">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[130px]">
                          {yesNoOptions.map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5 w-[130px]">
                      <Label htmlFor="storyboard" className="text-xs flex items-center">
                        <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        Has Storyboard
                      </Label>
                      <Select value={storyboard} onValueChange={setStoryboard}>
                        <SelectTrigger id="storyboard" className="w-full h-8 text-sm">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[130px]">
                          {yesNoOptions.map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center">
                          <Star className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                          Star Rating: {minStars.toFixed(1)} - {maxStars.toFixed(1)}★
                        </Label>
                        <div className="px-1.5">
                          <Slider
                            min={0}
                            max={10}
                            step={0.1}
                            value={[minStars, maxStars]}
                            onValueChange={([min, max]) => {
                              setMinStars(min);
                              setMaxStars(max);
                            }}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center">
                          <Gauge className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                          BPM: {minBpm.toFixed(0)} - {maxBpm.toFixed(0)}
                        </Label>
                        <div className="px-1.5">
                          <Slider
                            min={0}
                            max={300}
                            step={1}
                            value={[minBpm, maxBpm]}
                            onValueChange={([min, max]) => {
                              setMinBpm(min);
                              setMaxBpm(max);
                            }}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                          Length: {formatTime(minLength)} - {formatTime(maxLength)}
                        </Label>
                        <div className="px-1.5">
                          <Slider
                            min={0}
                            max={600}
                            step={15}
                            value={[minLength, maxLength]}
                            onValueChange={([min, max]) => {
                              setMinLength(min);
                              setMaxLength(max);
                            }}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center">
                          AR: {minAr.toFixed(1)} - {maxAr.toFixed(1)}
                        </Label>
                        <div className="px-1.5">
                          <Slider
                            min={0}
                            max={10}
                            step={0.1}
                            value={[minAr, maxAr]}
                            onValueChange={([min, max]) => {
                              setMinAr(min);
                              setMaxAr(max);
                            }}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center">
                          CS: {minCs.toFixed(1)} - {maxCs.toFixed(1)}
                        </Label>
                        <div className="px-1.5">
                          <Slider
                            min={0}
                            max={10}
                            step={0.1}
                            value={[minCs, maxCs]}
                            onValueChange={([min, max]) => {
                              setMinCs(min);
                              setMaxCs(max);
                            }}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center">
                          HP: {minDrain.toFixed(1)} - {maxDrain.toFixed(1)}
                        </Label>
                        <div className="px-1.5">
                          <Slider
                            min={0}
                            max={10}
                            step={0.1}
                            value={[minDrain, maxDrain]}
                            onValueChange={([min, max]) => {
                              setMinDrain(min);
                              setMaxDrain(max);
                            }}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
            
            {/* Footer with actions */}
            <div className="border-t border-border/10 px-4 py-2 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {activeFilterCount > 0 ? (
                  <span>{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
                ) : (
                  <span>No filters active</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs hover:bg-red-500/5 text-red-500 hover:text-red-600"
                  onClick={resetFilters}
                  disabled={activeFilterCount === 0}
                >
                  Reset filters
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  form="search-form"
                  className="h-7 text-xs bg-pink-600 hover:bg-pink-700 text-white"
                  onClick={handleSearch}
                >
                  Apply filters
                </Button>
                <Button
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleClose}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}