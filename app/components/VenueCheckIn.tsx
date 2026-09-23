'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type CheckIn = {
  id: number
  user_id: string
  venue_id: number
}

type Match = {
  id: number
  venue_id: number
  created_at: string
}

export default function VenueCheckIn({ venueId }: { venueId: number }) {
  const [user, setUser] = useState<User | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [latestMatch, setLatestMatch] = useState<Match | null>(null)
  const [matchPlayerCount, setMatchPlayerCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchCheckIns()
    fetchLatestMatch()
  }, [])

  async function fetchCheckIns() {
    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .eq('venue_id', venueId)
    setCheckIns(data ?? [])
  }

  async function fetchLatestMatch() {
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      
    setLatestMatch(match ?? null)

    if(match) {
      const { count } = await supabase
        .from('match_players')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', match.id)
      setMatchPlayerCount(count ?? 0)
    }
  }

  async function handleCheckIn() {
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from('check_ins').insert({ user_id: user.id, venue_id: venueId })
    if (error) console.error('Check-in error:', error)
    await fetchCheckIns()
    setLoading(false)
  }

  async function handleStartMatch() {
    setLoading(true)

    const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({ venue_id: venueId })
        .select()
        .single()

    if (matchError || !match) {
      console.error('Match creation error:', matchError)
      setLoading(false)
      return
    }

    const playersForMatch = checkIns.slice(0, 4)
    const matchPlayerRows = playersForMatch.map((c) => ({
      match_id: match.id,
      user_id: c.user_id,
    }))

    const { error: playersError } = await supabase.from('match_players').insert(matchPlayerRows)
    if(playersError) console.error('Match players error:', playersError)
    
    await fetchLatestMatch()
    setLoading(false)
  }

  const alreadyCheckedIn = checkIns.some((c) => c.user_id === user?.id)
  const canStartMatch = checkIns.length >= 4

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

      {canStartMatch && user &&(
        <button
            onClick={handleStartMatch}
            disabled={loading}
            className="text-xs text-[#1A3A2E] underline mt-1"
        >
            Start a match ({checkIns.length} available)
        </button>
    )}

    {latestMatch && (
        <span className="text-xs text-[#6B7A6F] mt-1">
            Last Match: {matchPlayerCount} players
        </span>
    )}
    </div>
  )
}