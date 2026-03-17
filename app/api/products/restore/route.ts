import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Get or create category
    let { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'smartphones')
      .single()

    let categoryId = category?.id

    if (!categoryId) {
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert([{
          name: 'Smartphones',
          name_ar: 'هواتف ذكية',
          slug: 'smartphones'
        }])
        .select('id')
        .single()

      if (catError) throw catError
      categoryId = newCat?.id
    }

    // Insert sample products
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: 'iPhone 15 Pro',
          name_ar: 'آيفون 15 برو',
          description: 'The latest iPhone with a powerful A17 Pro chip and a stunning ProMotion display.',
          description_ar: 'أحدث هاتف آيفون مع شريحة A17 Pro القوية وشاشة ProMotion مذهلة.',
          price: 45000,
          category_id: categoryId,
          images: ['/hero/hoodie.png'],
          is_featured: true,
          is_active: true
        },
        {
          name: 'Samsung Galaxy S24 Ultra',
          name_ar: 'سامسونج جالاكسي S24 ألترا',
          description: 'Experience the new era of mobile AI with Galaxy S24 Ultra.',
          description_ar: 'اختبر الحقبة الجديدة من الذكاء الاصطناعي مع جالاكسي S24 ألترا.',
          price: 42000,
          category_id: categoryId,
          images: ['/hero/streetwear.png'],
          is_featured: true,
          is_active: true
        },
        {
          name: 'Google Pixel 8 Pro',
          name_ar: 'جوجل بكسل 8 برو',
          description: 'The most powerful, personal, and secure Pixel phone yet.',
          description_ar: 'أقوى هاتف Pixel وأكثرها خصوصية وأمانًا حتى الآن.',
          price: 38000,
          category_id: categoryId,
          images: ['/hero/summer.png'],
          is_featured: true,
          is_active: true
        }
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ 
      status: 'success',
      message: '✅ تم استعادة المنتجات بنجاح',
      productsCreated: data?.length || 0
    })
  } catch (error) {
    console.error('Restore products error:', error)
    return NextResponse.json({ 
      status: 'error',
      message: '❌ فشل استعادة المنتجات',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
