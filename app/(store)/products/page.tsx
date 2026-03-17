import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/product-card'
import { ProductFilters } from '@/components/store/product-filters'
import { type Category, type Product } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

export const revalidate = 60

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    featured?: string
    search?: string
    sort?: string
  }>
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[3/4] rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

async function ProductsGrid({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)

  if (params.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()
    
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  if (params.featured === 'true') {
    query = query.eq('is_featured', true)
  }

  if (params.search) {
    query = query.or(`name_ar.ilike.%${params.search}%,name.ilike.%${params.search}%`)
  }

  switch (params.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data: products } = await query

  if (!products || products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted-foreground">لا توجد منتجات</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product as Product} />
      ))}
    </div>
  )
}

export default async function ProductsPage(props: ProductsPageProps) {
  const supabase = await createClient()
  const params = await props.searchParams

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at')

  const currentCategory = params.category
    ? (categories || []).find((c: Category) => c.slug === params.category)
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {currentCategory ? currentCategory.name_ar : 'جميع المنتجات'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {params.featured === 'true'
            ? 'منتجاتنا المميزة'
            : 'تصفح أحدث الهواتف الذكية والإكسسوارات'}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters
            categories={(categories || []) as Category[]}
            currentCategory={params.category}
            currentSort={params.sort}
          />
        </aside>

        <div className="flex-1">
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsGrid searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
