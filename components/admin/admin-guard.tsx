import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function AdminGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
