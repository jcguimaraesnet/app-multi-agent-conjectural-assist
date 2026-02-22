import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getRedirectUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return new URL(path, baseUrl).toString()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')

  const supabase = await createClient()

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sign out so the user is not auto-logged in
      await supabase.auth.signOut()
      return NextResponse.redirect(getRedirectUrl('/auth/login?confirmed=true'))
    }
  }

  // Handle OTP flow (token_hash verification)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // Sign out so the user is not auto-logged in
      await supabase.auth.signOut()
      return NextResponse.redirect(getRedirectUrl('/auth/login?confirmed=true'))
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(getRedirectUrl('/auth/error'))
}
