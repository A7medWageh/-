import { AdminGuard } from '@/components/admin/admin-guard'
import CategoriesClient from '@/components/admin/categories-client'

export default function AdminCategoriesPage() {
  return (
    <AdminGuard>
      <CategoriesClient />
    </AdminGuard>
  )
}
