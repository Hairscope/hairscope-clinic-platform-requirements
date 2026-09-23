import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /internal routes
  if (pathname.startsWith('/internal')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Verify email domain
    if (!token.email?.toString().endsWith('@hairscope.ai')) {
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/internal/:path*']
}
