import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from '@/config';
import { roleRoutes, defaultRouteByRole } from '@/lib/roleRoutes';

function normalizeRole(role: string | undefined | null): string | null {
  if (!role) return null;
  const lower = role.toLowerCase();
  if (lower === 'admin') return 'Admin';
  if (lower === 'inventory') return 'Inventory';
  if (lower === 'sales') return 'sales';
  if (lower === 'representative' || lower === 'Preparation representative') return 'representative';
  return null;
}

function getLocaleFromPath(pathname: string): string | null {
  const pathnameSegments = pathname.split('/');
  const firstSegment = pathnameSegments[1];
  return locales.includes(firstSegment) ? firstSegment : null;
}

function isRouteAllowed(pathname: string, role: string): boolean {
  const allowedRoutes = roleRoutes[role] || [];

  return allowedRoutes.some(route => {

    if (route === "*") return true;

    if (route === pathname) return true;

    if (pathname.startsWith(route) && !route.includes(":")) return true;

    if (route.includes(":")) {
      const pattern = "^" + route
        .replace(/:[^/]+/g, "[^/]+")
        .replace(/\//g, "\\/")
        + "$";
      return new RegExp(pattern).test(pathname);
    }

    return false;
  });
}

export default async function middleware(request: NextRequest) {
  const config = request.cookies.get('config');
  let isRtl = false;

  try {
    isRtl = config ? JSON.parse(config.value || '{}').isRtl : false;
  } catch (_) {
    isRtl = false;
  }

  const preferredLocale = isRtl ? 'ar' : 'en';
  const headerLocale = request.headers.get('dashcode-locale');
  const defaultLocale = headerLocale && locales.includes(headerLocale) ? headerLocale : preferredLocale;

  const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
  });

  const { pathname } = request.nextUrl;
  const urlLocale = getLocaleFromPath(pathname);
  const currentLocale = urlLocale || defaultLocale;

  const token = request.cookies.get('authToken')?.value;
  const rawUserRole = request.cookies.get('userRole')?.value;
  const userRole = normalizeRole(rawUserRole);
  const userId = request.cookies.get('userId')?.value;

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  if (urlLocale && pathname === `/${urlLocale}` && token && userRole && userId) {
    const defaultRoute = defaultRouteByRole[userRole];
    if (defaultRoute) {
      return NextResponse.redirect(new URL(`/${currentLocale}${defaultRoute}`, request.url));
    }
  }

  if (token && userRole) {
    try {
      // Let the client-side PermissionGuard check route authorization dynamically 
      // based on real-time permissions fetched from the backend API.
      const response = await intlMiddleware(request);
      response.headers.set('dashcode-locale', currentLocale);
      return response;
    } catch (_) {
      return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
    }
  }

  const response = await intlMiddleware(request);
  response.headers.set('dashcode-locale', currentLocale);
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/scripts|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot|pdf|zip|rar|7z|mp4|mp3|avi|mov|wmv|flv|webm|ogg|wav)$).*)',
  ],
};