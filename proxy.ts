import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['en', 'fr'];
const DEFAULT_LOCALE = 'en';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const pathnameHasLocale = LOCALES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  let locale = DEFAULT_LOCALE;
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    locale = cookieLocale;
  }

  return NextResponse.redirect(
    new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
  );
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images/*).*)']
};
