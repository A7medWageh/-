import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

const STATUS_CONFIG = {
  confirmed: {
    message: 'تم تأكيد طلبك وجاري التحضير',
    icon: '✅',
    color: '#3b82f6',
  },
  shipped: {
    message: 'طلبك في الطريق إليك',
    icon: '🚚',
    color: '#f59e0b',
  },
  delivered: {
    message: 'تم توصيل طلبك بنجاح!',
    icon: '📦',
    color: '#10b981',
  },
  cancelled: {
    message: 'تم إلغاء طلبك',
    icon: '❌',
    color: '#ef4444',
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { 
      orderId, 
      status, 
      customerEmail,
      customerName,
      customerCity,
      customerAddress,
      items = [],
      total = 0
    } = body

    console.log('📊 Order update request:', { orderId, status, customerEmail })

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get order items if not provided
    let orderItems = items
    if (!items || items.length === 0) {
      const { data: fetchedItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      if (!itemsError && fetchedItems) {
        orderItems = fetchedItems
      }
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (updateError) {
      console.error('❌ Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log('✅ Order status updated to:', status)

    // Send status update email
    const email = customerEmail || order.customer_email
    const name = customerName || order.customer_name
    const city = customerCity || order.customer_city
    const address = customerAddress || order.customer_address
    const orderTotal = total || order.total

    if (email && STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]) {
      try {
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
        
        // Build items table HTML
        const itemsHtml = orderItems && Array.isArray(orderItems)
          ? orderItems
              .map(
                (item: any) => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-align: right;">${item.product_name}</td>
            <td style="padding: 12px; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; text-align: center;">${item.size || '-'}</td>
            <td style="padding: 12px; text-align: center;">${item.color || '-'}</td>
            <td style="padding: 12px; text-align: left;">${(item.price * item.quantity).toFixed(2)} جنيه</td>
          </tr>
        `
              )
              .join('')
          : ''

        const htmlContent = `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تحديث حالة الطلب</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
            <div style="background-color: #f9fafb; padding: 40px 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%); padding: 30px 20px; text-align: center; color: white;">
                  <div style="font-size: 32px; margin-bottom: 10px;">${config.icon}</div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${config.message}</h1>
                </div>

                <!-- Content -->
                <div style="padding: 30px 20px;">
                  <p style="margin: 0 0 20px 0; font-size: 14px;">مرحباً ${name},</p>
                  
                  <!-- Order Number -->
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280;">رقم الطلب</p>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">#${orderId.substring(0, 8).toUpperCase()}</p>
                  </div>

                  ${itemsHtml ? `
                  <!-- Items Table -->
                  <div style="margin-bottom: 20px; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                      <thead>
                        <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                          <th style="padding: 12px; text-align: right; font-weight: 600;">المنتج</th>
                          <th style="padding: 12px; text-align: center; font-weight: 600;">الكمية</th>
                          <th style="padding: 12px; text-align: center; font-weight: 600;">المقاس</th>
                          <th style="padding: 12px; text-align: center; font-weight: 600;">اللون</th>
                          <th style="padding: 12px; text-align: left; font-weight: 600;">السعر</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>
                  </div>

                  <!-- Total -->
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background-color: #f3f4f6; border-radius: 6px; margin-bottom: 20px;">
                    <span style="font-weight: 600;">الإجمالي:</span>
                    <span style="font-size: 18px; font-weight: bold; color: #3b82f6;">${orderTotal.toFixed(2)} جنيه</span>
                  </div>
                  ` : ''}

                  <!-- Address Info -->
                  <div style="background-color: #f0f9ff; padding: 15px; border-right: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #1e40af; font-weight: 600;">عنوان التوصيل</p>
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #1f2937;">${city}</p>
                    <p style="margin: 0; font-size: 14px; color: #1f2937;">${address}</p>
                  </div>

                  <!-- Footer Message -->
                  <p style="margin: 20px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                    إذا كان لديك أي استفسار، يرجى الرد على هذا البريد الإلكتروني أو التواصل معنا عبر الموقع.
                  </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                  <p style="margin: 0;">© 2026 متجرنا. جميع الحقوق محفوظة.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `

        console.log('📧 Sending email to:', email)
        const info = await transporter.sendMail({
          from: `"متجرنا" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: `${config.icon} ${config.message}`,
          html: htmlContent,
        })

        console.log('✅ Email sent:', info.messageId)
      } catch (emailError) {
        console.error('⚠️ Email sending error:', emailError)
        // Don't fail the order update if email fails
      }
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('❌ Order update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
