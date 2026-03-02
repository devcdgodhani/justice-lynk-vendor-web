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
    '/professional',
    '/law-firm',
    '/plan-select',
];

function decodeJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

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
    const isStatusPage = ['/account-pending', '/account-suspended'].some((p) => pathname.startsWith(p));
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

    // ── 1. Unauthenticated ──────────────────────────────────────────────────
    if (!token) {
        if (isProtected || isStatusPage || pathname === '/org-select') {
            const url = new URL('/login', request.url);
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // ── 2. Authenticated ────────────────────────────────────────────────────
    const payload = decodeJwt(token);
    if (!payload) {
    // Corrupt token
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const { approvalStatus, userType, hasPlan } = payload;

    // A. Pending/Rejected Check
    if (approvalStatus === 'pending' || approvalStatus === 'rejected') {
        const allowedWhilePending = ['/account-pending', '/plan-select'];
        if (!allowedWhilePending.some(path => pathname === path)) {
            return NextResponse.redirect(new URL('/account-pending', request.url));
        }
        return NextResponse.next();
    }

    // B. Suspended Check
    if (approvalStatus === 'suspended') {
        if (pathname !== '/account-suspended') {
            return NextResponse.redirect(new URL('/account-suspended', request.url));
        }
        return NextResponse.next();
    }

    // C. Plan Check - Removed for partial access (disabled modules side menu handles this)
    /*
    const isAdmin = userType === 'admin' || userType === 'super_admin';
    if (!hasPlan && !isAdmin) {
        if (pathname !== '/plan-select') {
            return NextResponse.redirect(new URL('/plan-select', request.url));
        }
        return NextResponse.next();
    }
    */

    // D. Redirect away from Auth pages if logic above passed (Approved & Has Plan)
    // EXCLUDE verification/MFA routes from auto-redirect so new account verification works
    const authPagesToRedirect = ['/login', '/register', '/forgot-password'];
    const isAuthPage = authPagesToRedirect.some(p => pathname === p);

    if (isAuthPage || isStatusPage || (pathname === '/plan-select' && hasPlan)) {
        const dashboardMap: Record<string, string> = {
            client: '/dashboard',
            advocate: '/professional',
            law_firm_admin: '/law-firm',
        };
        const target = dashboardMap[userType] || '/dashboard';
        return NextResponse.redirect(new URL(target, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
