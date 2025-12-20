'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// Module-level cache to persist session between navigations
let cachedSession: Session | null = null

interface AuthContextType {
  session: Session | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(cachedSession)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    // Only fetch if we don't have a cached session
    if (!cachedSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        cachedSession = session
        setSession(session)
      })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        cachedSession = session
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    cachedSession = null
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  const user = context.session?.user ?? null
  
  return {
    session: context.session,
    user,
    signOut: context.signOut,
  }
}
