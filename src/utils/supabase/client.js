import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client or handle it gracefully to avoid build-time crashes
    console.warn("Supabase credentials missing. Client initialization skipped (likely during build).")
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
