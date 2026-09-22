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
      <div className="text-sm">
        <a href="/login" className="underline mr-4">Log In</a>
        <a href="/signup" className="underline">Sign Up</a>
      </div>
    )
  }

  return (
    <div className="text-sm flex items-center gap-4">
      <span>Logged in as {user.email}</span>
      <button onClick={handleLogout} className="underline">Log Out</button>
    </div>
  )
}