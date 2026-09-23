import { supabase } from '@/lib/supabase'
import AuthStatus from './components/AuthStatus'
import VenueCheckIn from './components/VenueCheckIn'

export default async function Home() {
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')

  if (error) {
    return <div className="p-8 text-red-600">Error: {error.message}</div>
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#1A3A2E]/10 px-6 py-5 md:px-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs tracking-wide text-[#6B7A6F] mb-1">Live venues</p>
            <h1 className="text-2xl font-bold text-[#1A3A2E]">Where's everyone playing</h1>
          </div>
          <AuthStatus />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 md:px-10 py-8 space-y-3">
        {venues?.length === 0 && (
          <p className="text-[#6B7A6F]">No venues yet — check back soon.</p>
        )}
        {venues?.map((venue) => (
          <div
            key={venue.id}
            className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
          >
            <div>
              <h2 className="text-lg font-semibold text-[#1A3A2E]">{venue.name}</h2>
              <p className="text-sm text-[#6B7A6F]">{venue.address}</p>
              <p className="text-xs text-[#6B7A6F] mt-0.5">{venue.total_courts} courts</p>
            </div>
            <VenueCheckIn venueId={venue.id} />
          </div>
        ))}
      </div>
    </main>
  )
}