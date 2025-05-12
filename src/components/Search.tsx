"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon, SlidersHorizontal } from 'lucide-react';

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type SearchFilters = {
  mode: string;
  status: string;
  minStars: number;
  maxStars: number;
};

export type SearchParams = {
  query?: string;
  mode?: string;
  status?: string;
};

type SearchComponentProps = {
  initialSearchParams: SearchParams;
  locale: string;
};

export function Search({ initialSearchParams, locale }: SearchComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialSearchParams.query || '');
  const [mode, setMode] = useState(initialSearchParams.mode || 'any');
  const [status, setStatus] = useState(initialSearchParams.status || 'any');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setMode(searchParams.get('mode') || 'any');
    setStatus(searchParams.get('status') || 'any');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (mode && mode !== 'any') params.set('mode', mode);
    if (status && status !== 'any') params.set('status', status);

    router.push(`/${locale}/home?${params.toString()}`);
  };

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
    { value: 'loved', label: 'Loved' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'pending', label: 'Pending' },
    { value: 'graveyard', label: 'Graveyard' },
  ];

  return (
    <div className="w-full mb-6">
      <form onSubmit={handleSearch} className="w-full">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-10"
              placeholder="Search beatmaps by title, artist, creator, tags..."
            />
          </div>
          <Button type="submit" className="h-10">
            Search
          </Button>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="h-10 w-full md:w-auto">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-4 border rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mode">Mode</Label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger id="mode">
                      <SelectValue placeholder="Any Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {gameModes.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Any Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {beatmapStatuses.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </form>
    </div>
  );
} 