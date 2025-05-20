"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Globe, Download, ChevronDown, Home, Flame, Clock, Bookmark, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
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
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  
  // Use flagcdn.com instead of osu's flag service
  const getCountryFlagUrl = (countryCode: string) => {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  };

  const navLinks = [
    { href: `/${locale}/home`, label: 'Home', icon: Home },
    { href: `/${locale}/popular`, label: 'Popular', icon: Flame },
    { href: `/${locale}/recent`, label: 'Recent', icon: Clock },
    { href: `/${locale}/collections`, label: 'Collections', icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/5 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl px-4 lg:px-6 mx-auto">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={`/${locale}/home`} className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">o!</span>
              </div>
              <span className="font-bold hidden sm:block tracking-tight">osu!mirror</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center ml-6 space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={cn(
                      "px-3 py-1.5 text-sm transition-colors flex items-center",
                      isActive 
                        ? "text-pink-600 font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-1.5 opacity-70" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0 rounded-full md:w-auto md:px-3 md:rounded-md"
            >
              <Link href={`/${locale}/search`}>
                <Search className="h-4 w-4 md:mr-1.5" />
                <span className="sr-only md:not-sr-only md:inline-block">Search</span>
              </Link>
            </Button>

            {/* User Menu - Show when authenticated */}
            {isAuthenticated && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-sm overflow-hidden p-0">
                    <Image 
                      src={session.user.image || "https://a.ppy.sh/0"}
                      alt={session.user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <div className="relative h-8 w-8 rounded-sm overflow-hidden flex-shrink-0">
                      <Image 
                        src={session.user.image || "https://a.ppy.sh/0"} 
                        alt={session.user.name || "User"} 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      {session.user.country?.code && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {session.user.country.code && (
                            <Image 
                              src={getCountryFlagUrl(session.user.country.code)}
                              alt={session.user.country.code}
                              width={16}
                              height={12}
                              className="rounded-[1px]"
                            />
                          )}
                          <span>{session.user.country?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`} className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: `/${locale}/home` })}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : status === "unauthenticated" ? (
              <Button 
                size="sm" 
                asChild
                className="h-8 text-sm font-medium"
              >
                <Link href={`/${locale}/signin`}>
                  Sign In
                </Link>
              </Button>
            ) : null}

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground px-2 h-8 hidden sm:flex"
                >
                  <Globe className="h-4 w-4 mr-1 opacity-70" />
                  {locale.toUpperCase()}
                  <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32">
                {locales.map((l) => (
                  <DropdownMenuItem key={l.code} asChild>
                    <Link 
                      href={`/${l.code}/home`} 
                      locale={l.code} 
                      className={cn(
                        "flex w-full items-center", 
                        locale === l.code && "text-pink-500 font-medium"
                      )}
                    >
                      {l.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Download Button */}
            <Button 
              size="sm" 
              className="h-8 bg-pink-600 hover:bg-pink-700 text-white rounded-full px-3 gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> 
              <span className="text-xs font-medium">Download</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden h-8 w-8 p-0 rounded-full"
                >
                  <span className="sr-only">Open menu</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <SheetHeader className="text-left border-b pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-pink-600 flex items-center justify-center">
                      <span className="text-white font-bold">o!</span>
                    </div>
                    <span className="font-bold text-lg">osu!mirror</span>
                  </div>
                </SheetHeader>
                
                {/* User info in mobile menu */}
                {isAuthenticated && session?.user && (
                  <div className="border-b border-border pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-sm overflow-hidden flex-shrink-0">
                        <Image 
                          src={session.user.image || "https://a.ppy.sh/0"} 
                          alt={session.user.name || "User"} 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{session.user.name}</p>
                        {session.user.country?.code && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {session.user.country.code && (
                              <Image 
                                src={getCountryFlagUrl(session.user.country.code)}
                                alt={session.user.country.code}
                                width={16}
                                height={12}
                                className="rounded-[1px]"
                              />
                            )}
                            <span>{session.user.country?.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col py-2 gap-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <SheetClose key={link.href} asChild>
                        <Link 
                          href={link.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors",
                            isActive 
                              ? "bg-pink-600/5 text-pink-600 font-medium" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                  
                  <div className="h-px bg-border my-2"></div>
                  
                  <SheetClose asChild>
                    <Link
                      href={`/${locale}/search`}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <Search className="h-4 w-4" />
                      Search
                    </Link>
                  </SheetClose>
                  
                  {/* Profile link in mobile menu or sign in button */}
                  {isAuthenticated ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href={`/${locale}/profile`}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors",
                            pathname === `/${locale}/profile`
                              ? "bg-pink-600/5 text-pink-600 font-medium" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <button
                          onClick={() => signOut({ callbackUrl: `/${locale}/home` })}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-md text-red-500 hover:text-red-600 hover:bg-red-500/5 transition-colors text-left w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </SheetClose>
                    </>
                  ) : status === "unauthenticated" && (
                    <SheetClose asChild>
                      <Link
                        href={`/${locale}/signin`}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-md bg-pink-600 text-white hover:bg-pink-700 transition-colors mt-2"
                      >
                        <User className="h-4 w-4" />
                        Sign In
                      </Link>
                    </SheetClose>
                  )}
                  
                  <div className="px-4 py-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start text-muted-foreground"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          {locale === 'en' ? 'English' : locale === 'es' ? 'Español' : '日本語'}
                          <ChevronDown className="h-3 w-3 ml-auto" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[160px]">
                        {locales.map((l) => (
                          <DropdownMenuItem key={l.code} asChild>
                            <Link 
                              href={`/${l.code}/home`} 
                              locale={l.code} 
                              className={cn(
                                locale === l.code && "text-pink-500 font-medium"
                              )}
                            >
                              {l.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="px-4 pt-2">
                    <Button 
                      className="w-full bg-pink-600 hover:bg-pink-700 gap-2"
                    >
                      <Download className="h-4 w-4" /> Download App
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
} 