import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define supported locales
const locales = ['en', 'es', 'ja'];
const defaultLocale = 'en';

// Define a function to get the preferred locale from the request
function getPreferredLocale(request: NextRequest): string {
  // Check for locale in cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => {
        const [locale, priority] = lang.trim().split(';q=');
        return { locale: locale.split('-')[0], priority: priority ? Number(priority) : 1 };
      })
      .sort((a, b) => b.priority - a.priority)
      .find(({ locale }) => locales.includes(locale))?.locale;

    if (preferredLocale) {
      return preferredLocale;
    }
  }

  // Return default locale
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  // Get the pathname
  const { pathname } = request.nextUrl;

  // Skip middleware for non-HTML requests or static files
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('/api/') ||
    /\.(jpg|jpeg|png|gif|svg|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // If the root path or doesn't have locale, redirect to the preferred locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // For / path, redirect to the home page
    if (pathname === '/') {
      const locale = getPreferredLocale(request);
      const response = NextResponse.redirect(
        new URL(`/${locale}/home`, request.url)
      );
      return response;
    }

    // For any other path without locale, add the locale
    const locale = getPreferredLocale(request);
    const response = NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
    return response;
  }

  // For paths with only the locale (e.g., /en), redirect to /en/home
  const matchLocaleOnly = /^\/([a-z]{2})$/i.exec(pathname);
  if (matchLocaleOnly) {
    const locale = matchLocaleOnly[1];
    const response = NextResponse.redirect(
      new URL(`/${locale}/home`, request.url)
    );
    return response;
  }

  // Set cookie for future requests
  const currentLocale = pathname.split('/')[1];
  if (locales.includes(currentLocale)) {
    const response = NextResponse.next();
    if (request.cookies.get('NEXT_LOCALE')?.value !== currentLocale) {
      response.cookies.set('NEXT_LOCALE', currentLocale, { 
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/' 
      });
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 