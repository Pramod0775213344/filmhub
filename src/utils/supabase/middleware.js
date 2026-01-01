import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/admin') ||
     request.nextUrl.pathname.startsWith('/profile') ||
     request.nextUrl.pathname.startsWith('/my-list'))
  ) {
    // This is a protected route, and the user is not logged in.
    // Redirect them to the login page.
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    
    // We must pass the cookies from supabaseResponse to the redirect response
    const redirectResponse = NextResponse.redirect(url)
    
    // Copy all cookies from supabaseResponse to redirectResponse
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options)
    })
    
    return redirectResponse
  }

  return supabaseResponse
}
