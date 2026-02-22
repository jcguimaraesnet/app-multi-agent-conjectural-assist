'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthHashErrorHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('error=')) {
      const supabase = createClient()
      supabase.auth.signOut().then(() => {
        router.replace('/auth/error')
      })
    }
  }, [router])

  return null
}
