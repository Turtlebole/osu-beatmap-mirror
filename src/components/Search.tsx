"use client";

import React, { useState } from 'react';
import { t } from '@/lib/i18n';

type SearchProps = {
  onSearch: (query: string, filters: SearchFilters) => void;
  locale: string;
};

export type SearchFilters = {
  mode: string;
  status: string;
  minStars: number;
  maxStars: number;
};

export function Search({ onSearch, locale }: SearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    mode: 'all',
    status: 'all',
    minStars: 0,
    maxStars: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  const handleFilterChange = (name: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full mb-6">
      <form onSubmit={handleSearch} className="w-full">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full p-3 pl-10 text-sm border border-border rounded-lg bg-card focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder={t(locale, 'search.placeholder')}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-3 bg-primary text-primary-foreground font-medium rounded-lg text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-colors hover:bg-primary/90"
          >
            {t(locale, 'search.button')}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-colors hover:bg-secondary/90"
          >
            Filters {showFilters ? '▲' : '▼'}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 p-4 bg-card border border-border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Game Mode</label>
                <select
                  className="block w-full p-2 text-sm border border-border rounded-lg bg-background"
                  value={filters.mode}
                  onChange={(e) => handleFilterChange('mode', e.target.value)}
                >
                  <option value="all">All Modes</option>
                  <option value="osu">osu!</option>
                  <option value="taiko">osu!taiko</option>
                  <option value="catch">osu!catch</option>
                  <option value="mania">osu!mania</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Status</label>
                <select
                  className="block w-full p-2 text-sm border border-border rounded-lg bg-background"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="ranked">Ranked</option>
                  <option value="approved">Approved</option>
                  <option value="loved">Loved</option>
                  <option value="qualified">Qualified</option>
                  <option value="pending">Pending</option>
                  <option value="graveyard">Graveyard</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Min Stars</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.minStars}
                    onChange={(e) => handleFilterChange('minStars', parseFloat(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 w-10 text-sm">{filters.minStars}★</span>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Max Stars</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.maxStars}
                    onChange={(e) => handleFilterChange('maxStars', parseFloat(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 w-10 text-sm">{filters.maxStars}★</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 