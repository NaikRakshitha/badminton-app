'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Venue = {
  id: number
  name: string
  address: string
  total_courts: number
  active_courts: number
}

type CheckIn = {
  id: number
  user_id: string
  venue_id: number
}

type Match = {
  id: number
  venue_id: number
  status: string
  created_at: string
}

type Profile = {
  user_id: string
  display_name: string
}

export default function VenueSession({ venue }: { venue: Venue }) {
  const [user, setUser] = useState<User | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [activeMatches, setActiveMatches] = useState<Match[]>([])
  const [matchedUserIds, setMatchedUserIds] = useState<Set<string>>(new Set())
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [courtsToday, setCourtsToday] = useState(venue.active_courts)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchAll()
  }, [])

  async function fetchAll() {
    const { data: checkInData } = await supabase
      .from('check_ins')
      .select('*')
      .eq('venue_id', venue.id)
    setCheckIns(checkInData ?? [])

    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .eq('venue_id', venue.id)
      .eq('status', 'in_progress')
    setActiveMatches(matchData ?? [])

    if (matchData && matchData.length > 0) {
      const matchIds = matchData.map((m) => m.id)
      const { data: playerRows } = await supabase
        .from('match_players')
        .select('user_id')
        .in('match_id', matchIds)
      setMatchedUserIds(new Set(playerRows?.map((p) => p.user_id) ?? []))
    } else {
      setMatchedUserIds(new Set())
    }

    if (checkInData && checkInData.length > 0) {
      const userIds = checkInData.map((c) => c.user_id)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds)
      const profileMap: Record<string, string> = {}
      profileData?.forEach((p: Profile) => { profileMap[p.user_id] = p.display_name })
      setProfiles(profileMap)
    }
  }

  async function handleCheckIn() {
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from('check_ins').insert({ user_id: user.id, venue_id: venue.id })
    if (error) console.error('Check-in error:', error)
    await fetchAll()
    setLoading(false)
  }

  async function handleUpdateCourts(newCount: number) {
    if (newCount < 1) return
    setCourtsToday(newCount)
    await supabase.from('venues').update({ active_courts: newCount }).eq('id', venue.id)
  }

  async function handleStartMatch() {
    if (courtsFree <= 0) return
    setLoading(true)

    const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({ venue_id: venue.id, status: 'in_progress' })
        .select()
        .single()

    if (matchError || !match) {
        console.error('Match creation error:', matchError)
        setLoading(false)
        return
    }

    const playersForMatch = availablePlayers.slice(0, 4)
    const matchPlayerRows = playersForMatch.map((c) => ({
        match_id: match.id,
        user_id: c.user_id,
    }))

    const { error: playersError } = await supabase.from('match_players').insert(matchPlayerRows)
    if (playersError) console.error('Match players error:', playersError)

    await fetchAll()
    setLoading(false)
 }

  const alreadyCheckedIn = checkIns.some((c) => c.user_id === user?.id)
  const availablePlayers = checkIns.filter((c) => !matchedUserIds.has(c.user_id))
  const courtsInUse = activeMatches.length
  const courtsFree = Math.max(courtsToday - courtsInUse, 0)

  function nameFor(userId: string) {
    return profiles[userId] ?? 'Player'
  }

  return (
    <div className="space-y-6">
      {/* Courts setting */}
      <div className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#1A3A2E]">Courts today</p>
          <p className="text-xs text-[#6B7A6F]">{courtsFree} free · {courtsInUse} in use</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleUpdateCourts(courtsToday - 1)}
            className="w-7 h-7 rounded-full bg-[#F7F5F0] text-[#1A3A2E] font-medium"
          >
            −
          </button>
          <span className="w-6 text-center font-semibold text-[#1A3A2E]">{courtsToday}</span>
          <button
            onClick={() => handleUpdateCourts(courtsToday + 1)}
            className="w-7 h-7 rounded-full bg-[#F7F5F0] text-[#1A3A2E] font-medium"
          >
            +
          </button>
        </div>
      </div>

      {/* Check-in */}
      <div className="bg-white rounded-2xl px-5 py-4">
        {user && !alreadyCheckedIn && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="bg-[#1A3A2E] text-white text-sm font-medium rounded-full px-4 py-1.5 hover:bg-[#24503F] transition-colors disabled:opacity-50"
          >
            {loading ? 'Checking in…' : "I'm playing today"}
          </button>
        )}
        {alreadyCheckedIn && (
          <span className="bg-[#E8C547] text-[#1A3A2E] text-sm font-semibold rounded-full px-4 py-1.5">
            You're in ✓
          </span>
        )}
        {!user && (
          <a href="/login" className="text-sm text-[#1A3A2E] underline">Log in to check in</a>
        )}
      </div>

      {/* Waiting list */}
      <div>
        <p className="text-sm font-medium text-[#1A3A2E] mb-2">
          Waiting ({availablePlayers.length})
        </p>
        {availablePlayers.length >= 4 && courtsFree > 0 && (
          <button
            onClick={handleStartMatch}
            disabled={loading}
            className="text-xs bg-[#1A3A2E] text-white rounded-full px-3 py-1 font-medium"
          >
            Start match
          </button>
        )}
        <div className="flex flex-wrap gap-2">
          {availablePlayers.map((c) => (
            <span key={c.id} className="bg-white rounded-full px-3 py-1 text-sm text-[#1A3A2E]">
              {nameFor(c.user_id)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}