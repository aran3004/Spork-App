// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Debug log
  console.log('Session status:', !!session, 'Path:', req.nextUrl.pathname);

  // If no session and trying to access protected routes
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('No session, redirecting to sign-in');
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  // Add session user to response headers
  if (session) {
    console.log('Session found, allowing access');
  }
  return res;
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*']
};
// // middleware.ts
// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = createMiddlewareClient({ req, res })
  
//   const {
//     data: { session },
//   } = await supabase.auth.getSession()

//   // Allow access to auth callback URL
//   if (req.nextUrl.pathname.startsWith('/auth/callback')) {
//     return res
//   }

//   // If no session and trying to access protected routes
//   if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
//     return NextResponse.redirect(new URL('/auth/sign-in', req.url))
//   }

//   return res
// }

// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/auth/callback'
//   ]
// }