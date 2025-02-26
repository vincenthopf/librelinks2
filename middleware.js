import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export default async function middleware(req) {
  // Get the pathname of the request (e.g. /, /admin)
  const path = req.nextUrl.pathname;

  // A list of all protected pages
  const protectedPaths = [
    '/admin',
    '/admin/customize',
    '/admin/analytics',
    '/admin/settings',
    '/onboarding',
  ];

  // Admin-only paths
  const adminOnlyPaths = ['/admin/templates-admin'];

  // If it's the root path, just render it
  if (path === '/') {
    return NextResponse.next();
  }

  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check for protected paths
  if (!session && protectedPaths.includes(path)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Check for admin-only paths
  if (session && adminOnlyPaths.includes(path) && !session.isAdmin) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // Redirect logged in users trying to access login/register
  if (session && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}
