import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch role if user exists
  let role = null
  if (user) {
    const { data } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = data?.role
  }

  return (
    <div className="flex min-h-screen" dir="rtl" suppressHydrationWarning>
      {user && role && <AdminSidebar role={role} />}
      <div className="flex-1 flex flex-col" suppressHydrationWarning>
        {user && <AdminHeader user={user} />}
        <main className="flex-1 p-6 bg-muted/30" suppressHydrationWarning>
          {children}
        </main>
      </div>
    </div>
  )
}
