import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import AdminUsersClient from '@/components/admin/AdminUsersClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Verify admin role via FastAPI backend
  try {
    const response = await fetch(`${API_BASE_URL}/api/profiles/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.id}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) redirect('/home')

    const profile = await response.json()
    if (profile?.role !== 'admin') redirect('/home')
  } catch {
    redirect('/home')
  }

  return (
    <AppLayout>
      <AdminUsersClient />
    </AppLayout>
  )
}
