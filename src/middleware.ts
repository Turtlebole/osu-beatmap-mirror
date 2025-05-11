import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define supported locales
const locales = ['en', 'es', 'ja'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Skip middleware for non-HTML requests or static files
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('/api/') ||
    /\.(jpg|jpeg|png|gif|svg|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if we already redirected (to prevent loops)
  const redirectMark = request.headers.get('x-middleware-redirect');
  if (redirectMark === 'processed') {
    return NextResponse.next();
  }

  // Check if the pathname already starts with a locale prefix
  const hasLocalePrefix = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If it doesn't have a locale prefix, add one
  if (!hasLocalePrefix && pathname !== '/') {
    // Redirect to same path but with locale prefix
    const response = NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
    response.headers.set('x-middleware-redirect', 'processed');
    return response;
  }

  // For the root path, redirect to the default locale
  if (pathname === '/') {
    const response = NextResponse.redirect(
      new URL(`/${defaultLocale}`, request.url)
    );
    response.headers.set('x-middleware-redirect', 'processed');
    return response;
  }

  // Otherwise, continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 