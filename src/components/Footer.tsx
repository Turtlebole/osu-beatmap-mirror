"use client";

import Link from 'next/link';
import { Github, Heart, Twitter, ExternalLink, Home, Flame, Clock, Info, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FooterProps = {
  locale: string;
};

export function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  // Main footer links organized by category
  const footerLinks = {
    main: [
      { href: `/${locale}/home`, label: 'Home', icon: Home },
      { href: `/${locale}/popular`, label: 'Popular', icon: Flame },
      { href: `/${locale}/recent`, label: 'Recent', icon: Clock },
    ],
    legal: [
      { href: `/${locale}/terms`, label: 'Terms of Service', icon: Info },
      { href: `/${locale}/privacy`, label: 'Privacy Policy', icon: Info },
      { href: `/${locale}/contact`, label: 'Contact', icon: Mail },
    ],
    external: [
      { href: 'https://osu.ppy.sh', label: 'osu! Website', icon: ExternalLink },
      { href: 'https://osu.ppy.sh/beatmapsets', label: 'Official Beatmaps', icon: ExternalLink },
      { href: 'https://osu.ppy.sh/wiki', label: 'osu! Wiki', icon: ExternalLink },
    ]
  };
  
  return (
    <footer className="mt-auto border-t border-border/10 py-8 bg-background/50 backdrop-blur-sm">
      <div className="container max-w-screen-2xl px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand and description */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">o!</span>
              </div>
              <span className="font-semibold">osu!mirror</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Fast and reliable mirror for downloading osu! beatmaps. All content belongs to their respective owners.
              Not affiliated with osu! or ppy Pty Ltd.
            </p>
            
            {/* Social links */}
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full hover:text-pink-500 hover:bg-pink-500/5">
                <Link href="https://github.com" target="_blank" rel="noreferrer">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full hover:text-pink-500 hover:bg-pink-500/5">
                <Link href="https://discord.com" target="_blank" rel="noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 7.5c3.5-1 5.5-1 9 0"/><path d="M7 16.5c3.5 1 6.5 1 10 0"/><path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5"/><path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.48-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5"/>
                  </svg>
                  <span className="sr-only">Discord</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full hover:text-pink-500 hover:bg-pink-500/5">
                <Link href="https://twitter.com" target="_blank" rel="noreferrer">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Navigation links */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Main Links */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Navigation</h3>
                <ul className="space-y-2">
                  {footerLinks.main.map(link => (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        className="text-sm text-muted-foreground hover:text-pink-500 transition-colors flex items-center"
                      >
                        <link.icon className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Legal Links */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Legal</h3>
                <ul className="space-y-2">
                  {footerLinks.legal.map(link => (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        className="text-sm text-muted-foreground hover:text-pink-500 transition-colors flex items-center"
                      >
                        <link.icon className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* External Links */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Official osu!</h3>
                <ul className="space-y-2">
                  {footerLinks.external.map(link => (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-pink-500 transition-colors flex items-center"
                      >
                        <link.icon className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright section */}
        <div className="mt-8 pt-5 border-t border-border/10 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© {currentYear} osu!mirror — All rights reserved</p>
          <p className="mt-2 md:mt-0 flex items-center">
            Made with <Heart className="h-3 w-3 mx-1 text-pink-500 fill-pink-500" /> for the osu! community
          </p>
        </div>
      </div>
    </footer>
  );
} 