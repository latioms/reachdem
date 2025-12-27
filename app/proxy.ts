import { NextRequest, NextResponse } from 'next/server';

const defaultLocale = 'en';
const locales = ['en', 'fr'];

function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
  
  return locales.includes(preferredLocale) ? preferredLocale : defaultLocale;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (!pathnameHasLocale) {
    if (
      pathname.startsWith('/_next') ||
      pathname.includes('.') ||
      pathname.startsWith('/api/')
    ) {
      return NextResponse.next();
    }
    
    const locale = getLocale(request);
    
    if (locale === defaultLocale) {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)']
};
