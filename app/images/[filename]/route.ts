import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename

  // Fetch directly from your Supabase bucket server-side
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.storage
    .from('wizard-of-all-souls')
    .download(filename)

  if (error || !data) {
    return new NextResponse('Image not found', { status: 404 })
  }

  // Serve the image bytes with proper headers through your own domain
  return new NextResponse(data, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}