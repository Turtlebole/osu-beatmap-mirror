"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Globe, Search, Download } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const locales = [
  { name: 'English', code: 'en' },
  { name: 'Español', code: 'es' },
  { name: '日本語', code: 'ja' },
];

type NavbarProps = {
  locale: string;
};

export function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: `/${locale}/home`, label: 'Home' },
    { href: `/${locale}/popular`, label: 'Popular' },
    { href: `/${locale}/recent`, label: 'Recent' },
    { href: `/${locale}/collections`, label: 'Collections' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container max-w-screen-2xl px-4 mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}/home`} className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-pink-600 flex items-center justify-center">
              <span className="text-white font-bold">O!</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">osu!mirror</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-pink-600/10 text-pink-600" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
              <Link href={`/${locale}/search`}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hidden sm:flex">
                  <Globe className="h-4 w-4 mr-1" />
                  {locale.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {locales.map((l) => (
                  <DropdownMenuItem key={l.code} asChild>
                    <Link href={`/${l.code}/home`} locale={l.code} className={cn(locale === l.code && "font-semibold")}>
                      {l.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Download Button */}
            <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center">
                    <div className="h-7 w-7 rounded-full bg-pink-600 flex items-center justify-center mr-2">
                      <span className="text-white font-bold text-xs">O!</span>
                    </div>
                    <span>osu!mirror</span>
                  </SheetTitle>
                </SheetHeader>
                <Separator className="my-4" />
                <div className="flex flex-col space-y-2">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <SheetClose key={link.href} asChild>
                        <Link 
                          href={link.href}
                          className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            isActive 
                              ? "bg-pink-600/10 text-pink-600" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                  <Separator className="my-2" />
                  <Button size="sm" className="justify-start w-full bg-pink-600 hover:bg-pink-700 text-white">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
} 