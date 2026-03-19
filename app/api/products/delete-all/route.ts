import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate user with standard client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminError || !adminUser || !['owner', 'admin'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Use admin client to delete all products, bypassing RLS
    const supabaseAdmin = createAdminClient()
    const { error, count } = await supabaseAdmin
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletes all rows

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'All products deleted successfully', count })
  } catch (error) {
    console.error('Delete products error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
