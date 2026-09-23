'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user)
        if (data.user) { fetchProfile(data.user.id)
    }
  })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if(session?.user) { fetchProfile(session.user.id) }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', userId)
      .maybeSingle()
    setDisplayName(data?.display_name ?? null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (!user) {
    return (
      <div className="text-sm flex gap-4">
        <a href="/login" className="text-[#1A3A2E] font-medium">Log in</a>
        <a href="/signup" className="text-[#6B7A6F]">Sign up</a>
      </div>
    )
  }

  return (
    <div className="text-sm flex items-center gap-3">
      <span className="text-[#6B7A6F]">{displayName ?? user.email}</span>
      <button onClick={handleLogout} className="text-[#1A3A2E] font-medium">
        Log out
      </button>
    </div>
  )
}