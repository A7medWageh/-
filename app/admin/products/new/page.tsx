import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import { type Category } from '@/lib/types'
import { AdminGuard } from '@/components/admin/admin-guard'

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at')

  return (
    <AdminGuard>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">إضافة منتج جديد</h1>
        <ProductForm categories={(categories || []) as Category[]} />
      </div>
    </AdminGuard>
  )
}
