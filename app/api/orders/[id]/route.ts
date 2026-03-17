import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id)

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch order items' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      order,
      items: items || [],
    })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, customer_name, customer_phone, customer_city, customer_address, customer_email, items } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // تحديث بيانات الطلب
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (status) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updateData.status = status
    }

    if (customer_name) updateData.customer_name = customer_name
    if (customer_phone) updateData.customer_phone = customer_phone
    if (customer_city) updateData.customer_city = customer_city
    if (customer_address) updateData.customer_address = customer_address
    if (customer_email) updateData.customer_email = customer_email

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // تحديث المنتجات إذا تم توفيرها
    if (items && Array.isArray(items)) {
      // حذف المنتجات القديمة
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id)

      if (deleteError) {
        console.error('Delete items error:', deleteError)
        return NextResponse.json({ error: 'Failed to update items' }, { status: 500 })
      }

      // إضافة المنتجات الجديدة
      const itemsToInsert = items.map((item: any) => ({
        order_id: id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
      }))

      const { error: insertError } = await supabase
        .from('order_items')
        .insert(itemsToInsert)

      if (insertError) {
        console.error('Insert items error:', insertError)
        return NextResponse.json({ error: 'Failed to insert items' }, { status: 500 })
      }

      // حساب الإجمالي الجديد
      const newTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      
      // تحديث الإجمالي
      await supabase
        .from('orders')
        .update({ total: newTotal })
        .eq('id', id)
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
