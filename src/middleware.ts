import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'es', 'ja'];
const defaultLocale = 'en';

function getPreferredLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

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

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') || 
    pathname.includes('/api/') ||
    /\.(jpg|jpeg|png|gif|svg|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    if (pathname === '/') {
      const locale = getPreferredLocale(request);
      const response = NextResponse.redirect(
        new URL(`/${locale}/home`, request.url)
      );
      return response;
    }

    const locale = getPreferredLocale(request);
    const response = NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
    return response;
  }

  const matchLocaleOnly = /^\/([a-z]{2})$/i.exec(pathname);
  if (matchLocaleOnly) {
    const locale = matchLocaleOnly[1];
    const response = NextResponse.redirect(
      new URL(`/${locale}/home`, request.url)
    );
    return response;
  }

  const currentLocale = pathname.split('/')[1];
  if (locales.includes(currentLocale)) {
    const response = NextResponse.next();
    if (request.cookies.get('NEXT_LOCALE')?.value !== currentLocale) {
      response.cookies.set('NEXT_LOCALE', currentLocale, { 
        maxAge: 60 * 60 * 24 * 365,
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