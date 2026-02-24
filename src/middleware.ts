import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/verify-email',
    '/mfa-verify',
    '/mfa-backup-code',
    '/forgot-password',
];

const PROTECTED_PREFIXES = [
    '/dashboard',
    '/cases',
    '/chat',
    '/organization',
    '/billing',
    '/settings',
    '/notifications',
    '/professionals',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public assets & API
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/icons') ||
        pathname.startsWith('/images')
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('jl-access-token')?.value;
    const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '?'));
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

    // Redirect authenticated users away from auth pages
    if (token && isPublic) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect unauthenticated users from protected pages
    if (!token && isProtected) {
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // Require token for org-select
    if (!token && pathname === '/org-select') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
