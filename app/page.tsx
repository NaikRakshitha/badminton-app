import { supabase } from '@/lib/supabase'
import AuthStatus from './components/AuthStatus'
import VenueSession from './components/VenueSession'

export default async function Home() {
  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .limit(1)
    .single()

  if (error || !venue) {
    return <div className="p-8 text-red-600">No venue set up yet.</div>
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#1A3A2E]/10 px-6 py-5 md:px-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs tracking-wide text-[#6B7A6F] mb-1">Today's session</p>
            <h1 className="text-2xl font-bold text-[#1A3A2E]">{venue.name}</h1>
          </div>
          <AuthStatus />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 md:px-10 py-8">
        <VenueSession venue={venue} />
      </div>
    </main>
  )
}