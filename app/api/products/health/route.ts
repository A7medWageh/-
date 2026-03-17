import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Try to check products count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    console.log('Product count:', count)

    if (count && count > 0) {
      return NextResponse.json({ 
        status: 'ok',
        message: `✅ ${count} منتج محمّل`,
        productCount: count
      })
    }

    // Products are empty - restore them
    return NextResponse.json({ 
      status: 'warning',
      message: '⚠️ لا توجد منتجات - يرجى الذهاب إلى /api/products/restore',
      productCount: 0
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({ 
      error: 'خطأ في الفحص',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

