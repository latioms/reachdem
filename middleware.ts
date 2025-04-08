import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['en', 'fr'];
const DEFAULT_LOCALE = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname already has a locale
  const pathnameHasLocale = LOCALES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Get locale from cookie or default
  let locale = DEFAULT_LOCALE;
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    locale = cookieLocale;
  }

  // Redirect to the locale version of the page
  return NextResponse.redirect(
    new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
  );
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
