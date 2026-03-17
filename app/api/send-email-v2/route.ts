import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { generateEmailToken } from '@/lib/email-tokens'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

interface OrderItem {
  product_name: string
  quantity: number
  size?: string
  color?: string
  price: number
}

interface EmailRequest {
  type: 'order_confirmation' | 'order_status_update' | 'order_cancelled'
  orderId: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  customerCity?: string
  customerAddress?: string
  items?: OrderItem[]
  total?: number
  status?: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
}

const STATUS_CONFIG = {
  confirmed: {
    message: 'تم تأكيد طلبك وجاري التحضير',
    icon: '✅',
    color: '#3b82f6',
    description: 'سيتم إرسال طلبك إليك قريباً'
  },
  processing: {
    message: 'طلبك قيد المعالجة والتحضير',
    icon: '⚙️',
    color: '#8b5cf6',
    description: 'فريقنا يقوم بتحضير طلبك بعناية'
  },
  shipped: {
    message: 'طلبك في الطريق إليك',
    icon: '🚚',
    color: '#f59e0b',
    description: 'سيتم التواصل معك من قبل شركة الشحن لتحديد موعد التسليم'
  },
  out_for_delivery: {
    message: 'طلبك وصل إلى محطة التوزيع في منطقتك',
    icon: '📍',
    color: '#06b6d4',
    description: 'سيصل إليك اليوم أو غداً بإذن الله'
  },
  delivered: {
    message: 'تم توصيل طلبك بنجاح!',
    icon: '📦',
    color: '#10b981',
    description: 'شكراً لك على تسوقك معنا نتمنى أن تكون راضياً'
  },
  cancelled: {
    message: 'تم إلغاء طلبك',
    icon: '❌',
    color: '#ef4444',
    description: 'سيتم استرجاع المبلغ خلال 3-5 أيام عمل'
  }
}

/**
 * إيميل تأكيد الطلب الأولي مع ثلاثة أزرار
 */
function getOrderConfirmationEmail(
  orderId: string,
  customerName: string,
  customerEmail: string,
  customerCity: string,
  customerAddress: string,
  items: OrderItem[],
  total: number,
  baseUrl: string
) {
  const confirmToken = generateEmailToken(orderId, 'confirm', customerEmail)
  const editToken = generateEmailToken(orderId, 'edit', customerEmail)
  const cancelToken = generateEmailToken(orderId, 'cancel', customerEmail)

  const itemsHtml = items
    .map(
      (item) => `
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

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; line-height: 1.6; }
        .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 8px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #1f2937; }
        .order-number { background-color: #f0f4ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #667eea; }
        .order-number p { margin: 8px 0; color: #1f2937; }
        .order-number strong { color: #667eea; font-size: 18px; }
        h3 { color: #1f2937; margin: 20px 0 15px; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f9fafb; padding: 12px; text-align: right; font-weight: 600; border-bottom: 2px solid #e5e7eb; color: #374151; }
        .total-row { background-color: #f9fafb; font-weight: bold; }
        .total-row td { padding: 15px 12px; border-top: 2px solid #e5e7eb; color: #1f2937; }
        .delivery-info { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #f59e0b; }
        .delivery-info p { color: #92400e; margin: 8px 0; }
        .action-section { background-color: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center; }
        .action-section h3 { margin-top: 0; color: #1f2937; }
        .button-group { display: flex; gap: 12px; justify-content: center; margin-top: 15px; flex-wrap: wrap; }
        .button { display: inline-block; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.3s; border: none; cursor: pointer; }
        .button-confirm { background-color: #10b981; color: white; }
        .button-confirm:hover { background-color: #059669; }
        .button-edit { background-color: #f59e0b; color: white; }
        .button-edit:hover { background-color: #d97706; }
        .button-cancel { background-color: #ef4444; color: white; }
        .button-cancel:hover { background-color: #dc2626; }
        .warning { background-color: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #991b1b; border-right: 4px solid #ef4444; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { color: #6b7280; font-size: 13px; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛍️ تأكيد الطلب</h1>
          <p>شكراً لك على تسوقك معنا</p>
        </div>

        <div class="content">
          <p class="greeting">السلام عليكم ورحمة الله وبركاته <strong>${customerName}</strong>,</p>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            نشكرك على ثقتك بنا! لقد استلمنا طلبك وهو الآن في انتظار تأكيدك. يرجى مراجعة التفاصيل أدناه والتأكد من صحتها.
          </p>

          <div class="order-number">
            <p>🔔 <strong>رقم الطلب:</strong> <strong>${orderId.substring(0, 8).toUpperCase()}</strong></p>
            <p>📅 <strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>

          <h3>📦 تفاصيل الطلب</h3>
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>الحجم</th>
                <th>اللون</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">💰 إجمالي الطلب</td>
                <td style="text-align: left;"><strong>${total.toFixed(2)} جنيه</strong></td>
              </tr>
            </tbody>
          </table>

          <h3>📍 معلومات التوصيل</h3>
          <div class="delivery-info">
            <p><strong>المحافظة:</strong> ${customerCity}</p>
            <p><strong>العنوان:</strong> ${customerAddress}</p>
          </div>

          <div class="action-section">
            <h3 style="margin-top: 0;">⚠️ يرجى تأكيد طلبك</h3>
            <p style="color: #4b5563; margin-bottom: 15px;">حدد واحدة من الخيارات التالية:</p>
            <div class="button-group">
              <a href="${baseUrl}/api/orders/action?token=${confirmToken}&orderId=${orderId}&email=${encodeURIComponent(customerEmail)}&action=confirm" class="button button-confirm">✅ تأكيد الطلب</a>
              <a href="${baseUrl}/orders/${orderId}/edit?token=${editToken}&email=${encodeURIComponent(customerEmail)}" class="button button-edit">✏️ تعديل الطلب</a>
              <a href="${baseUrl}/api/orders/action?token=${cancelToken}&orderId=${orderId}&email=${encodeURIComponent(customerEmail)}&action=cancel" class="button button-cancel">❌ إلغاء الطلب</a>
            </div>
          </div>

          <div class="warning">
            ⏰ <strong>ملاحظة مهمة:</strong> يرجى تأكيد طلبك في أسرع وقت. لن نتمكن من معالجة الطلب بدون تأكيدك.
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            إذا واجهت أي مشكلة أو كان لديك أي استفسارات، يرجى التواصل معنا عبر البريد الإلكتروني أو رقم الهاتف الموجود في نهاية الإيميل.
          </p>
        </div>

        <div class="footer">
          <p>© 2024 فون زون - جميع الحقوق محفوظة</p>
          <p>للتواصل معنا: <strong>support@phonzone.com</strong> | ☎️ +20-XXX-XXXX-XXXX</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * إيميل تحديث حالة الطلب
 */
function getOrderStatusUpdateEmail(
  orderId: string,
  customerName: string,
  status: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
) {
  const config = STATUS_CONFIG[status]

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, ${config.color} 0%, ${config.color} 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { font-size: 32px; margin-bottom: 8px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .status-box { background-color: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid ${config.color}; text-align: center; }
        .status-icon { font-size: 48px; margin-bottom: 15px; }
        .status-message { font-size: 24px; font-weight: bold; color: ${config.color}; margin-bottom: 10px; }
        .status-description { color: #6b7280; font-size: 16px; }
        .info-box { background-color: #f0f4ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-right: 4px solid #667eea; }
        .info-box p { color: #1f2937; margin: 8px 0; }
        .highlight { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #92400e; border-right: 4px solid #f59e0b; }
        .highlight strong { display: block; margin-bottom: 8px; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { color: #6b7280; font-size: 13px; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${config.icon}</h1>
          <p>تحديث جديد على طلبك</p>
        </div>

        <div class="content">
          <p style="margin-bottom: 20px; color: #1f2937;">السلام عليكم ورحمة الله وبركاته <strong>${customerName}</strong>,</p>

          <div class="status-box">
            <div class="status-icon">${config.icon}</div>
            <div class="status-message">${config.message}</div>
            <div class="status-description">${config.description}</div>
          </div>

          <div class="info-box">
            <p>🔔 <strong>رقم الطلب:</strong> ${orderId.substring(0, 8).toUpperCase()}</p>
            <p>📅 <strong>وقت التحديث:</strong> ${new Date().toLocaleDateString('ar-SA')} ${new Date().toLocaleTimeString('ar-SA')}</p>
          </div>

          ${status === 'shipped' ? `
            <div class="highlight">
              <strong>🚚 ملاحظة مهمة:</strong>
              سيتم التواصل معك من قبل شركة الشحن لتحديد موعد التسليم. تأكد من توفر شخص لاستقبال الطلب.
            </div>
          ` : ''}

          ${status === 'delivered' ? `
            <div class="highlight">
              <strong>🎉 شكراً لك!</strong>
              نتمنى أن تكون راضياً عن طلبك. يرجى إخبارنا برأيك من خلال موقعنا.
            </div>
          ` : ''}

          ${status === 'cancelled' ? `
            <div class="highlight">
              <strong>💳 استرجاع المبلغ:</strong>
              سيتم استرجاع المبلغ الكامل إلى حسابك البنكي خلال 3-5 أيام عمل.
            </div>
          ` : ''}

          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            يمكنك تتبع طلبك في أي وقت من خلال موقعنا. للمساعدة والاستفسارات، لا تتردد في التواصل معنا.
          </p>
        </div>

        <div class="footer">
          <p>© 2024 فون زون - جميع الحقوق محفوظة</p>
          <p>للتواصل معنا: <strong>support@phonzone.com</strong> | ☎️ +20-XXX-XXXX-XXXX</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: Request) {
  try {
    const body: EmailRequest = await request.json()
    console.log('📧 Email API received:', JSON.stringify(body, null, 2))
    
    const { type, orderId, customerEmail, customerName, customerCity, customerAddress, items, total, status } = body

    if (!customerEmail || !orderId) {
      console.error('❌ Missing core fields:', { customerEmail, orderId })
      return NextResponse.json({ error: 'Missing required fields: email or orderId' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // إرسال إيميل تأكيد الطلب الأولي
    if (type === 'order_confirmation') {
      const missingFields = []
      if (!items) missingFields.push('items')
      if (!items || items.length === 0) missingFields.push('items_empty')
      if (!total) missingFields.push('total')
      if (!customerCity) missingFields.push('customerCity')
      if (!customerAddress) missingFields.push('customerAddress')
      
      if (missingFields.length > 0) {
        console.error('❌ Missing order details:', { missingFields, items, total, customerCity, customerAddress })
        return NextResponse.json({ 
          error: 'Missing order details', 
          missingFields: missingFields 
        }, { status: 400 })
      }

      const htmlContent = getOrderConfirmationEmail(
        orderId,
        customerName,
        customerEmail,
        customerCity || 'محافظة',
        customerAddress || 'عنوان',
        items as OrderItem[],
        total,
        baseUrl
      )

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: customerEmail,
        subject: `📦 تأكيد الطلب #${orderId.substring(0, 8).toUpperCase()} - فون زون`,
        html: htmlContent,
      })

      console.log(`✅ Order confirmation email sent to ${customerEmail}`)
      return NextResponse.json({ success: true, message: 'Order confirmation email sent' })
    }

    // إرسال إيميل تحديث الحالة
    if (type === 'order_status_update' && status) {
      const htmlContent = getOrderStatusUpdateEmail(orderId, customerName, status)

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: customerEmail,
        subject: `${STATUS_CONFIG[status].icon} تحديث حالة طلبك #${orderId.substring(0, 8).toUpperCase()}`,
        html: htmlContent,
      })

      console.log(`✅ Status update email sent to ${customerEmail}`)
      return NextResponse.json({ success: true, message: 'Status update email sent' })
    }

    return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Failed to send email', details: String(error) }, { status: 500 })
  }
}
