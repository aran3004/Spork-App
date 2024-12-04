// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      
      // Exchange the code for a session
      const { error: signInError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (signInError) {
        console.error('Error exchanging code for session:', signInError)
        return NextResponse.redirect(
          new URL('/auth/sign-in?error=Could not verify email', requestUrl.origin)
        )
      }

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Error getting user:', userError)
        return NextResponse.redirect(
          new URL('/auth/sign-in?error=Authentication failed', requestUrl.origin)
        )
      }

      // Successfully verified, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    }

    // No code present, redirect to home
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      new URL('/auth/sign-in?error=Verification failed', request.url)
    )
  }
}