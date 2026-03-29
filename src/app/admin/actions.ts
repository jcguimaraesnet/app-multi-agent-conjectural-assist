'use server'

import { createClient } from '@/lib/supabase/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface AdminUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  role: string
  is_approved: boolean
  created_at: string | null
}

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export async function fetchAllUsers(): Promise<{ data?: AdminUser[]; error?: string }> {
  try {
    const userId = await getAuthUserId()

    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userId}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return { error: body.detail || 'Failed to fetch users' }
    }

    const data = await response.json()
    return { data: data as AdminUser[] }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch users' }
  }
}

export async function approveUsers(userIds: string[]): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getAuthUserId()

    const response = await fetch(`${API_BASE_URL}/api/admin/users/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_ids: userIds }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return { error: body.detail || 'Failed to approve users' }
    }

    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to approve users' }
  }
}

export async function revokeApproval(userIds: string[]): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getAuthUserId()

    const response = await fetch(`${API_BASE_URL}/api/admin/users/revoke`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_ids: userIds }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return { error: body.detail || 'Failed to revoke approval' }
    }

    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to revoke approval' }
  }
}

export async function promoteToAdmin(userIds: string[]): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getAuthUserId()

    const response = await fetch(`${API_BASE_URL}/api/admin/users/promote-to-admin`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_ids: userIds }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return { error: body.detail || 'Failed to promote users' }
    }

    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to promote users' }
  }
}

export async function demoteToUser(userIds: string[]): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getAuthUserId()

    const response = await fetch(`${API_BASE_URL}/api/admin/users/demote-to-user`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_ids: userIds }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return { error: body.detail || 'Failed to demote users' }
    }

    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to demote users' }
  }
}
