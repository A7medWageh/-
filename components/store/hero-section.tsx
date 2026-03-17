import { createClient } from '@/lib/supabase/server'
import { HeroSliderLayout } from './hero-slider-layout'

export async function HeroSection() {
  const supabase = await createClient()

  // Fetch featured products or latest products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!products || products.length === 0) {
    return (
      <section className="flex items-center justify-center h-[80vh] bg-muted">
        <p className="text-muted-foreground">لا توجد منتجات مميزة لعرضها حالياً.</p>
      </section>
    )
  }

  return (
    <section className="w-full" aria-label="Product Hero Carousel">
      <HeroSliderLayout products={products} />
    </section>
  )
}
