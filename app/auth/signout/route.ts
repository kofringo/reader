import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Sign out the user on Supabase
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  
  // Redirect back to the homepage after signout
  return NextResponse.redirect(new URL('/', req.url), {
    status: 302,
  })
}