import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // البحث عن المنتجات
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, name_ar, price, images')
      .ilike('name_ar', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Failed to search products' },
        { status: 500 }
      )
    }

    console.log(`🔍 Search results for "${query}":`, products?.length || 0, 'products')
    return NextResponse.json({ products: products || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
