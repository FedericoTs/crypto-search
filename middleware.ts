import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/utils/supabase/database.types'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient<Database>({ req, res })
    
    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}
