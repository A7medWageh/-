import { AdminGuard } from '@/components/admin/admin-guard'
import SettingsClient from '@/components/admin/settings-client'

export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <SettingsClient />
    </AdminGuard>
  )
}
