import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece ana dizine (/) gelindiğinde çalış
  if (pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    
    // Tarayıcı dilini kontrol et (A1-A2 seviyesi için basit mantık)
    let locale = 'en'; // Hiçbir şey bulunamazsa İngilizce
    
    if (acceptLanguage.includes('tr')) {
      locale = 'tr';
    } else if (acceptLanguage.includes('de')) {
      locale = 'de';
    } else if (acceptLanguage.includes('uk')) {
      locale = 'uk';
    }

    // Seçilen dile yönlendir
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Middleware'in hangi yollarda çalışacağını belirtir
  matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};