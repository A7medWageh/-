import { AdminGuard } from '@/components/admin/admin-guard'
import UsersClient from '@/components/admin/users-client'

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UsersClient />
    </AdminGuard>
  )
}
