'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SKILL_LEVELS = [
  { label: 'Beginner', value: 800 },
  { label: 'Intermediate', value: 1000 },
  { label: 'Advanced', value: 1200 },
  { label: 'Pro', value: 1400 },
]

export default function ProfileSetup() {
  const [displayName, setDisplayName] = useState('')
  const [skillRating, setSkillRating] = useState(1000)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('You must be logged in.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('profiles').insert({
      user_id: user.id,
      display_name: displayName,
      skill_rating: skillRating,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <div>
          <p className="text-xs tracking-wide text-[#6B7A6F] mb-1">One more step</p>
          <h1 className="text-2xl font-bold text-[#1A3A2E]">Set up your profile</h1>
        </div>

        <div>
          <label className="text-sm text-[#6B7A6F] block mb-1">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-[#1A3A2E]/15 rounded-lg p-2 bg-white"
            placeholder="e.g. Sam"
            required
          />
        </div>

        <div>
          <label className="text-sm text-[#6B7A6F] block mb-2">Skill level</label>
          <div className="grid grid-cols-2 gap-2">
            {SKILL_LEVELS.map((level) => (
              <button
                type="button"
                key={level.value}
                onClick={() => setSkillRating(level.value)}
                className={`rounded-lg py-2 text-sm font-medium border transition-colors ${
                  skillRating === level.value
                    ? 'bg-[#1A3A2E] text-white border-[#1A3A2E]'
                    : 'bg-white text-[#1A3A2E] border-[#1A3A2E]/15'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A3A2E] text-white rounded-lg py-2.5 font-medium hover:bg-[#24503F] transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>

        {message && <p className="text-sm text-red-600">{message}</p>}
      </form>
    </main>
  )
}