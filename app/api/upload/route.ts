import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Note: This API route is designed for trusted users (admins) and does not
// perform extensive validation on file types or sizes. For a public-facing
// upload endpoint, you would want to add more robust security checks.

export async function POST(req: NextRequest) {
  // Note: This endpoint uses the service role key for storage operations so
  // it can bypass RLS restrictions on the internal storage tables.
  //
  // In a production app, you should protect this route (e.g. with middleware)
  // to ensure only authenticated admins can upload files.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
    return new NextResponse(
      JSON.stringify({ error: 'Server is misconfigured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const storageSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
  )

  // Parse the incoming form data
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return new NextResponse(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Generate a unique file name to prevent overwrites
  const fileExtension = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExtension}`
  const filePath = `public/${fileName}`

  // Upload the file to the 'product-images' bucket
  const { error: uploadError } = await storageSupabase.storage
    .from('product-images')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Supabase Upload Error:', uploadError)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to upload file.', details: uploadError.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // Get the public URL of the uploaded file
  const { data: publicUrlData } = storageSupabase.storage
    .from('product-images')
    .getPublicUrl(filePath)
    
  if (!publicUrlData) {
     return new NextResponse(
      JSON.stringify({ error: 'Failed to get public URL.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Return the public URL to the client
  return NextResponse.json({ publicUrl: publicUrlData.publicUrl })
}
