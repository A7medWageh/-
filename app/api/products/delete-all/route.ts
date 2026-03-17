import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser || !['owner', 'admin'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete all products
    const { error } = await supabase
      .from('products')
      .delete()
      .is('id', 'not null')

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'All products deleted successfully' })
  } catch (error) {
    console.error('Delete products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
