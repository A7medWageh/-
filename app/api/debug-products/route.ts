import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // جرب استعلام بسيط
    console.log('Attempting to fetch products...')
    const { data, error, status } = await supabase
      .from('products')
      .select('id, name_ar, price')
      .limit(5)

    console.log('Query status:', status)
    console.log('Query error:', error)
    console.log('Query data:', data)

    if (error) {
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message,
        status: status,
        hint: error.hint
      })
    }

    return NextResponse.json({
      success: true,
      totalProducts: data?.length || 0,
      products: data || [],
      message: 'Successfully connected to database'
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}
