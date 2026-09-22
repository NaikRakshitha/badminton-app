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
    await supabase.from('check_ins').insert({ user_id: user.id, venue_id: venueId })
    await fetchCheckIns()
    setLoading(false)
  }

  const alreadyCheckedIn = checkIns.some((c) => c.user_id === user?.id)

  return (
    <div className="mt-2">
      <p className="text-sm text-gray-500 mb-2">
        {checkIns.length} checked in
      </p>
      {user && !alreadyCheckedIn && (
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="bg-green-600 text-white text-sm rounded px-3 py-1"
        >
          {loading ? 'Checking in...' : 'Check In'}
        </button>
      )}
      {alreadyCheckedIn && (
        <p className="text-sm text-green-600">You're checked in ✓</p>
      )}
      {!user && (
        <p className="text-sm text-gray-400">Log in to check in</p>
      )}
    </div>
  )
}