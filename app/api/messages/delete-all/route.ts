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

    // Delete all messages
    const { error, count } = await supabase
      .from('messages')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'All messages deleted successfully' })
  } catch (error) {
    console.error('Delete messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
