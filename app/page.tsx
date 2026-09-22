import { supabase } from '@/lib/supabase';
import AuthStatus from './components/AuthStatus';

export default async function Home() {
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')

  if (error) {
    return <div className="p-8 text-red-500">Error: {error.message}</div>
  }
  console.log('Venues:', venues);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Badminton Venues</h1>
      <AuthStatus />
      <div className="space-y-4">
        {venues?.map((venue) => (
          <div key={venue.id} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold">{venue.name}</h2>
            <p className="text-gray-500">{venue.address}</p>
            <p className="text-sm text-gray-400">{venue.total_courts} courts</p>
          </div>
        ))}
      </div>
    </main>
  )
}