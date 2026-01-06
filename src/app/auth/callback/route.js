import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const getBaseURL = () => {
        let url =
          process?.env?.NEXT_PUBLIC_SITE_URL ?? 
          process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
          'http://localhost:3000/'
        url = url.includes('http') ? url : `https://${url}`
        url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
        return url
      }

      const baseURL = getBaseURL()
      const redirectPath = next.startsWith('/') ? next.slice(1) : next
      return NextResponse.redirect(`${baseURL}${redirectPath}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
