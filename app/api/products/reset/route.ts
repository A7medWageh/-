import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check admin auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser || adminUser.role !== 'owner') {
      return NextResponse.json({ error: 'Only owner can reset data' }, { status: 403 })
    }

    // Step 1: Delete all existing products
    await supabase.from('products').delete().is('id', 'not null')

    // Step 2: Get or create smartphones category
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'smartphones')
      .single()

    let categoryId = existingCategory?.id

    if (!categoryId) {
      const { data: newCategory } = await supabase
        .from('categories')
        .insert([{
          name: 'Smartphones',
          name_ar: 'هواتف ذكية',
          slug: 'smartphones'
        }])
        .select()
        .single()
      
      categoryId = newCategory?.id
    }

    // Step 3: Insert sample products
    const { error: insertError } = await supabase
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

    if (insertError) throw insertError

    return NextResponse.json({ 
      message: 'Products reset successfully',
      productsCreated: 3
    })
  } catch (error) {
    console.error('Reset products error:', error)
    return NextResponse.json({ error: 'Failed to reset products' }, { status: 500 })
  }
}
