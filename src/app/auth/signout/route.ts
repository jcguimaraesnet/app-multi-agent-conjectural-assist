import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')

  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto')
  let redirectUrl: URL

  if (forwardedHost) {
    const protocol = forwardedProto || 'https'
    redirectUrl = new URL('/auth/login', `${protocol}://${forwardedHost}`)
  } else {
    redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
  }

  return NextResponse.redirect(redirectUrl, {
    status: 302,
  })
}
