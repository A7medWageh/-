import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import { type Product, type Category } from '@/lib/types'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

import { AdminGuard } from '@/components/admin/admin-guard'

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('created_at'),
  ])

  if (!product) {
    notFound()
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">تعديل المنتج</h1>
        <ProductForm
          product={product as Product}
          categories={(categories || []) as Category[]}
        />
      </div>
    </AdminGuard>
  )
}
