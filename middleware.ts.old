import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece ana dizine (/) gelindiğinde çalış
  if (pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    
    // Varsayılan dil
    let locale = 'en'; 
    
    if (acceptLanguage.includes('tr')) {
      locale = 'tr';
    } else if (acceptLanguage.includes('de')) {
      locale = 'de';
    } else if (acceptLanguage.includes('uk')) {
      locale = 'uk';
    } else if (acceptLanguage.includes('es')) { // ✅ İspanyolca kontrolü eklendi
      locale = 'es';
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