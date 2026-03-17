import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    console.log('Test delete products started')
    const supabase = await createClient()
    console.log('Supabase client created')

    // Delete all products directly without auth check
    const { error, count } = await supabase
      .from('products')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000')

    console.log('Delete query executed:', { error, count })

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        code: error.code 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'All products deleted successfully',
      deleted: count
    })
  } catch (error) {
    console.error('Delete products error:', error)
    return NextResponse.json({ 
      error: String(error),
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
