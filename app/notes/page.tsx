import { createClient } from '@/utils/supabase/server'
import { Database } from '@/utils/supabase/database.types'

type Note = Database['public']['Tables']['notes']['Row']

export default async function Notes() {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      console.error('Failed to initialize Supabase client')
      return <div>Error: Failed to initialize database connection</div>
    }

    // Get the current session to ensure we're authenticated
    const { data: { session } } = await supabase.auth.getSession()

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')

    if (error) {
      console.error('Error fetching notes:', error.message, error.details, error.hint)
      return <div>Error loading notes: {error.message}</div>
    }

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Notes</h1>
        <div className="space-y-4">
          {notes?.map((note) => (
            <div key={note.id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{note.title}</h2>
              <p className="mt-2">{note.content}</p>
            </div>
          ))}
          {(!notes || notes.length === 0) && (
            <p className="text-gray-500">No notes found. Create your first note!</p>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return <div>An unexpected error occurred</div>
  }
}