import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getRedirectUrl(request: NextRequest, pathname: string): URL {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')

  if (forwardedHost) {
    const protocol = forwardedProto || 'https'
    return new URL(pathname, `${protocol}://${forwardedHost}`)
  }

  const url = request.nextUrl.clone()
  url.pathname = pathname
  return url
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isPublicApiRoute = request.nextUrl.pathname.startsWith('/api/copilotkit')
  const isProtectedRoute = !isAuthRoute && !isPublicApiRoute

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(getRedirectUrl(request, '/auth/login'))
  }

  // Redirect authenticated users away from auth pages (except signout)
  if (user && isAuthRoute && !request.nextUrl.pathname.includes('/signout')) {
    return NextResponse.redirect(getRedirectUrl(request, '/'))
  }

  return supabaseResponse
}
