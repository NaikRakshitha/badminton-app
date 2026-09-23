'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

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
      <span className="text-[#6B7A6F]">{user.email}</span>
      <button onClick={handleLogout} className="text-[#1A3A2E] font-medium">
        Log out
      </button>
    </div>
  )
}