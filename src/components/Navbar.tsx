"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { t } from '@/lib/i18n';

const locales = [
  { name: 'English', code: 'en' },
  { name: 'Español', code: 'es' },
  { name: '日本語', code: 'ja' },
];

type NavbarProps = {
  locale: string;
};

export function Navbar({ locale }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocaleDropdownOpen, setIsLocaleDropdownOpen] = useState(false);
  
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">O</span>
            </div>
            <span className="font-bold text-lg">osu!mirror</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href={`/${locale}/home`} className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href={`/${locale}/popular`} className="text-foreground hover:text-primary transition-colors">
              Popular
            </Link>
            <Link href={`/${locale}/recent`} className="text-foreground hover:text-primary transition-colors">
              Recent
            </Link>
            <Link href={`/${locale}/collections`} className="text-foreground hover:text-primary transition-colors">
              Collections
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative">
            <button 
              className="flex items-center space-x-1 text-sm text-foreground hover:text-primary transition-colors"
              onClick={() => setIsLocaleDropdownOpen(!isLocaleDropdownOpen)}
            >
              <span>{locale.toUpperCase()}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transition-transform ${isLocaleDropdownOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {isLocaleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-md border border-border overflow-hidden z-10">
                <div className="py-1">
                  {locales.map((l) => (
                    <Link
                      key={l.code}
                      href={`/${l.code}/home`}
                      className={`block px-4 py-2 text-sm hover:bg-muted transition-colors ${locale === l.code ? 'bg-muted' : ''}`}
                      onClick={() => setIsLocaleDropdownOpen(false)}
                    >
                      {l.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Login Button */}
          <Link 
            href={`/${locale}/login`}
            className="hidden md:inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Login
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link 
              href={`/${locale}/home`}
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href={`/${locale}/popular`}
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Popular
            </Link>
            <Link 
              href={`/${locale}/recent`}
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Recent
            </Link>
            <Link 
              href={`/${locale}/collections`}
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Collections
            </Link>
            <Link 
              href={`/${locale}/login`}
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
} 