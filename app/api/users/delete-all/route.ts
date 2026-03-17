import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (only owner can delete users)
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser || adminUser.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden - Only owner can delete users' }, { status: 403 })
    }

    // Delete all users except the current one
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .neq('id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'All users deleted successfully' })
  } catch (error) {
    console.error('Delete users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
