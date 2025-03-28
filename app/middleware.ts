import { NextRequest, NextResponse } from 'next/server';

const defaultLocale = 'en';
const locales = ['en', 'fr'];

// Get the preferred locale from request headers
function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
  
  return locales.includes(preferredLocale) ? preferredLocale : defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // If pathname doesn't have locale, redirect to the default locale or detected locale
  if (!pathnameHasLocale) {
    // Skip for assets, api routes, etc.
    if (
      pathname.startsWith('/_next') ||
      pathname.includes('.') ||
      pathname.startsWith('/api/')
    ) {
      return NextResponse.next();
    }
    
    const locale = getLocale(request);
    
    // For English (default), no need for prefix in URL
    if (locale === defaultLocale) {
      return NextResponse.next();
    }
    
    // For other languages, redirect to the locale path
    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    '/((?!_next|api|favicon.ico).*)'
  ],
};