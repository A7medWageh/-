import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductDetails } from '@/components/store/product-details'
import { FeaturedProducts } from '@/components/store/featured-products'
import { type Product } from '@/lib/types'

export const revalidate = 60

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    return { title: 'المنتج غير موجود' }
  }

  return {
    title: `${product.name_ar} | لبسك`,
    description: product.description_ar || `${product.name_ar} - متجر لبسك للملابس العصرية`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .neq('id', id)
    .eq('category_id', product.category_id)
    .limit(4)

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product as Product} />
      
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <FeaturedProducts key={p.id} products={[p as Product]} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
