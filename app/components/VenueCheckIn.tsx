'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type CheckIn = {
  id: number
  user_id: string
  venue_id: number
}

export default function VenueCheckIn({ venueId }: { venueId: number }) {
  const [user, setUser] = useState<User | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchCheckIns()
  }, [])

  async function fetchCheckIns() {
    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .eq('venue_id', venueId)
    setCheckIns(data ?? [])
  }

  async function handleCheckIn() {
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from('check_ins').insert({ user_id: user.id, venue_id: venueId })
    if (error) console.error('Check-in error:', error)
    await fetchCheckIns()
    setLoading(false)
  }

  const alreadyCheckedIn = checkIns.some((c) => c.user_id === user?.id)

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <span className="text-xs text-[#6B7A6F]">
        {checkIns.length} {checkIns.length === 1 ? 'player' : 'players'} here
      </span>

      {user && !alreadyCheckedIn && (
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="bg-[#1A3A2E] text-white text-sm font-medium rounded-full px-4 py-1.5 hover:bg-[#24503F] transition-colors disabled:opacity-50"
        >
          {loading ? 'Checking in…' : 'Check in'}
        </button>
      )}

      {alreadyCheckedIn && (
        <span className="bg-[#E8C547] text-[#1A3A2E] text-sm font-semibold rounded-full px-4 py-1.5">
          You're in ✓
        </span>
      )}

      {!user && (
        <a href="/login" className="text-sm text-[#1A3A2E] underline">
          Log in to check in
        </a>
      )}
    </div>
  )
}