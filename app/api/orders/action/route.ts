import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyEmailToken } from '@/lib/email-tokens'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const action = searchParams.get('action')
    const orderId = searchParams.get('orderId')
    const email = searchParams.get('email')

    console.log('🔐 Processing order action:', { action, orderId, email: email?.substring(0, 5) + '...' })

    if (!token || !action || !orderId || !email) {
      console.error('❌ Missing required parameters:', { token: !!token, action, orderId, email })
      return NextResponse.json(
        { error: 'Missing token, action, orderId, or email' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // التحقق من صحة التوكن
    const verified = verifyEmailToken(token, orderId, email)
    if (!verified.valid) {
      console.error('❌ Token verification failed:', verified.error)
      return NextResponse.json(
        { error: 'الرابط غير صحيح أو منتهي الصلاحية' },
        { status: 401 }
      )
    }

    // تحديث حالة الطلب في قاعدة البيانات
    const newStatus = action === 'confirm' ? 'confirmed' : action === 'cancel' ? 'cancelled' : null

    if (!newStatus) {
      console.error('❌ Invalid action:', action)
      return NextResponse.json(
        { error: 'إجراء غير صحيح' },
        { status: 400 }
      )
    }

    console.log(`📝 Updating order ${orderId} status to ${newStatus}`)

    // تحديث الطلب في قاعدة البيانات
    const { error: updateError, data: updateData } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Database error:', updateError)
      return NextResponse.json(
        { error: 'حدث خطأ في تحديث الطلب: ' + updateError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Order ${orderId} updated successfully`)

    // إرسال إيميل تأكيد الإجراء
    try {
      console.log('📧 Sending notification email...')
      const statusMessage = action === 'confirm' ? 'تم تأكيد طلبك بنجاح' : 'تم إلغاء طلبك'
      
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email-v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order_status_update',
          orderId,
          customerEmail: email,
          customerName: 'العميل',
          status: newStatus === 'confirmed' ? 'confirmed' : 'cancelled',
        }),
      })

      if (!emailResponse.ok) {
        console.warn('⚠️ Email notification failed:', await emailResponse.text())
      } else {
        console.log('✅ Email sent successfully')
      }
    } catch (emailError) {
      console.error('⚠️ Email notification error:', emailError)
    }

    // إعادة التوجيه إلى صفحة النجاح
    const successMessage = 
      action === 'confirm' 
        ? 'تم تأكيد طلبك بنجاح! سيتم معالجته قريباً' 
        : 'تم إلغاء طلبك بنجاح'

    console.log('🎉 Redirecting to success page...')
    return NextResponse.redirect(
      new URL(`/orders/${orderId}/success?message=${encodeURIComponent(successMessage)}`, request.url)
    )
  } catch (error) {
    console.error('❌ Action processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process action', details: String(error) },
      { status: 500 }
    )
  }
}
