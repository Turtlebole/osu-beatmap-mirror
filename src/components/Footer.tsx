"use client";

import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FooterProps = {
  locale: string;
};

export function Footer({ locale }: FooterProps) {
  // Use a fixed year or server component to avoid hydration issues
  return (
    <footer className="border-t border-border/40 py-6 bg-card">
      <div className="container max-w-screen-2xl px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - About */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">O!</span>
              </div>
              <span className="font-bold text-lg">osu!mirror</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Fast and reliable mirror for downloading osu! beatmaps. Not affiliated with osu! or ppy Pty Ltd.
            </p>
          </div>
          
          {/* Middle Column - Links */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Links</h3>
            <nav className="grid grid-cols-2 gap-2 text-sm">
              <Link href={`/${locale}/home`} className="text-muted-foreground hover:text-pink-500 transition-colors">
                Home
              </Link>
              <Link href={`/${locale}/popular`} className="text-muted-foreground hover:text-pink-500 transition-colors">
                Popular
              </Link>
              <Link href={`/${locale}/recent`} className="text-muted-foreground hover:text-pink-500 transition-colors">
                Recent
              </Link>
              <Link href={`/${locale}/terms`} className="text-muted-foreground hover:text-pink-500 transition-colors">
                Terms
              </Link>
              <Link href={`/${locale}/privacy`} className="text-muted-foreground hover:text-pink-500 transition-colors">
                Privacy
              </Link>
              <Link href={`/${locale}/contact`} className="text-muted-foreground hover:text-pink-500 transition-colors">
                Contact
              </Link>
            </nav>
          </div>
          
          {/* Right Column - Social */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Connect</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" asChild className="rounded-full h-9 w-9">
                <Link href="https://github.com" target="_blank" rel="noreferrer">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild className="rounded-full h-9 w-9">
                <Link href="https://discord.com" target="_blank" rel="noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 7.5c3.5-1 5.5-1 9 0"/><path d="M7 16.5c3.5 1 6.5 1 10 0"/><path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5"/><path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.48-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5"/>
                  </svg>
                  <span className="sr-only">Discord</span>
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild className="rounded-full h-9 w-9">
                <Link href="https://twitter.com" target="_blank" rel="noreferrer">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border/40 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© 2024 osu!mirror - All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ♥ for the osu! community</p>
        </div>
      </div>
    </footer>
  );
} 