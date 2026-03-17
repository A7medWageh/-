import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

// إعداد بيانات البريد
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, orderId, status, customerEmail, customerName, customerCity, customerAddress, items, total } = body

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      )
    }

    // Order placed - send confirmation email to customer
    if (type === 'order_placed') {
      const itemsHtml = items?.map(
        (item: any) =>
          `<tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px;">${item.product_name}</td>
            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px;">${item.size || '-'}</td>
            <td style="padding: 10px;">${item.color || '-'}</td>
            <td style="padding: 10px; text-align: right;">${item.price} جنيه</td>
          </tr>`
      ).join('')

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .order-number { background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .order-number p { margin: 0; color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f3f4f6; padding: 12px; text-align: right; font-weight: bold; border-bottom: 2px solid #e5e7eb; }
            .total-row { background-color: #f9fafb; font-weight: bold; }
            .total-row td { padding: 15px; border-top: 2px solid #e5e7eb; }
            .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>تم استلام طلبك ✓</h1>
              <p>شكراً لك على تسوقك معنا</p>
            </div>

            <div class="content">
              <p>السلام عليكم <strong>${customerName}</strong>,</p>

              <p>نعلمك بأن طلبك قد تم استلامه بنجاح وهو الآن في انتظار تأكيدك.</p>

              <div class="order-number">
                <p>🔔 رقم الطلب: <strong>${orderId.substring(0, 8).toUpperCase()}</strong></p>
                <p>📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
              </div>

              <h3>تفاصيل الطلب:</h3>
              <table>
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>الحجم</th>
                    <th>اللون</th>
                    <th>السعر</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="4" style="text-align: left;">إجمالي الطلب</td>
                    <td style="text-align: right;">${total.toFixed(2)} جنيه</td>
                  </tr>
                </tbody>
              </table>

              <h3>معلومات التوصيل:</h3>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px;">
                <p><strong>المحافظة:</strong> ${customerCity}</p>
                <p><strong>العنوان:</strong> ${customerAddress}</p>
              </div>

              <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; color: #92400e;">
                  ⚠️ <strong>يرجى تأكيد الطلب:</strong> يرجى الضغط على الرابط أدناه لتأكيد طلبك أو إلغائه
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/confirm-order?id=${orderId}" class="button" style="display: inline-block; margin-top: 15px;">تأكيد أو إلغاء الطلب</a>
              </div>

              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                إذا لم تقم بتأكيد الطلب خلال 24 ساعة، سيتم إلغاؤه تلقائياً.
              </p>
            </div>

            <div class="footer">
              <p>© 2024 فون زون. جميع الحقوق محفوظة</p>
              <p>للتواصل معنا: support@phonzone.com</p>
            </div>
          </div>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: customerEmail,
        subject: `✓ تم استلام طلبك #${orderId.substring(0, 8).toUpperCase()}`,
        html: htmlContent,
      })

      return NextResponse.json({ success: true })
    }

    // Customer confirmed order - send to admin
    if (type === 'customer_confirmed') {
      const adminHtmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .order-number { background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .order-number p { margin: 0; color: #065f46; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f3f4f6; padding: 12px; text-align: right; font-weight: bold; border-bottom: 2px solid #e5e7eb; }
            .total-row { background-color: #f9fafb; font-weight: bold; }
            .total-row td { padding: 15px; border-top: 2px solid #e5e7eb; }
            .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ العميل أكد الطلب!</h1>
              <p>ابدأ في تحضير الطلب فوراً</p>
            </div>

            <div class="content">
              <p>مرحباً مدير فون زون،</p>

              <p>لقد أكد العميل طلبه وهو جاهز للتحضير والشحن.</p>

              <div class="order-number">
                <p>🔔 رقم الطلب: <strong>${orderId.substring(0, 8).toUpperCase()}</strong></p>
                <p>👤 العميل: <strong>${customerName}</strong></p>
                <p>📧 البريد: <strong>${customerEmail}</strong></p>
              </div>

              <h3>تفاصيل الطلب:</h3>
              <table>
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>الحجم</th>
                    <th>اللون</th>
                    <th>السعر</th>
                  </tr>
                </thead>
                <tbody>
                  ${items?.map((item: any) =>
                    `<tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px;">${item.product_name}</td>
                      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                      <td style="padding: 10px;">${item.size || '-'}</td>
                      <td style="padding: 10px;">${item.color || '-'}</td>
                      <td style="padding: 10px; text-align: right;">${item.price} جنيه</td>
                    </tr>`
                  ).join('') || ''}
                  <tr class="total-row">
                    <td colspan="4" style="text-align: left;">إجمالي الطلب</td>
                    <td style="text-align: right;">${total.toFixed(2)} جنيه</td>
                  </tr>
                </tbody>
              </table>

              <h3>معلومات التوصيل:</h3>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px;">
                <p><strong>المحافظة:</strong> ${customerCity}</p>
                <p><strong>العنوان:</strong> ${customerAddress}</p>
              </div>

              <p style="margin-top: 30px; color: #059669; font-weight: bold;">
                🎯 الخطوة التالية: غيّر حالة الطلب لـ "تم الشحن" عند إرسال الطلب
              </p>
            </div>

            <div class="footer">
              <p>© 2024 فون زون - لوحة التحكم</p>
            </div>
          </div>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER, // Send to admin
        subject: `✅ العميل أكد الطلب #${orderId.substring(0, 8).toUpperCase()}`,
        html: adminHtmlContent,
      })

      return NextResponse.json({ success: true })
    }

    // Customer cancelled order - send to admin
    if (type === 'customer_cancelled') {
      const adminHtmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .order-number { background-color: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .order-number p { margin: 0; color: #991b1b; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ العميل ألغى الطلب</h1>
              <p>تم إلغاء الطلب من قبل العميل</p>
            </div>

            <div class="content">
              <p>مرحباً مدير فون زون،</p>

              <p>للأسف قام العميل بإلغاء طلبه.</p>

              <div class="order-number">
                <p>🔔 رقم الطلب: <strong>${orderId.substring(0, 8).toUpperCase()}</strong></p>
                <p>👤 العميل: <strong>${customerName}</strong></p>
                <p>📧 البريد: <strong>${customerEmail}</strong></p>
                <p>💰 قيمة الطلب: <strong>${total.toFixed(2)} جنيه</strong></p>
              </div>

              <p style="margin-top: 30px; color: #dc2626; font-weight: bold;">
                ⚠️ يرجى التواصل مع العميل لمعرفة سبب الإلغاء
              </p>
            </div>

            <div class="footer">
              <p>© 2024 فون زون - لوحة التحكم</p>
            </div>
          </div>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER, // Send to admin
        subject: `❌ العميل ألغى الطلب #${orderId.substring(0, 8).toUpperCase()}`,
        html: adminHtmlContent,
      })

      return NextResponse.json({ success: true })
    }

    // Admin status updates - send to customer
    if (status) {
      let statusMessage = '';
      let statusColor = '';
      let statusIcon = '';

      switch (status) {
        case 'confirmed':
          statusMessage = 'تم تأكيد طلبك وجاري التحضير';
          statusColor = '#3b82f6';
          statusIcon = '✅';
          break;
        case 'shipped':
          statusMessage = 'طلبك في طريقه إليك';
          statusColor = '#8b5cf6';
          statusIcon = '🚚';
          break;
        case 'delivered':
          statusMessage = 'تم توصيل طلبك بنجاح';
          statusColor = '#10b981';
          statusIcon = '📦';
          break;
        case 'cancelled':
          statusMessage = 'تم إلغاء طلبك';
          statusColor = '#ef4444';
          statusIcon = '❌';
          break;
        default:
          statusMessage = `تم تحديث حالة طلبك إلى: ${status}`;
          statusColor = '#6b7280';
          statusIcon = 'ℹ️';
      }

      const customerHtmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor} 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .status-box { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-right: 4px solid ${statusColor}; }
            .status-box .icon { font-size: 48px; margin-bottom: 10px; }
            .order-number { background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .order-number p { margin: 0; color: #1e40af; }
            .button { display: inline-block; background-color: ${statusColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusIcon} تحديث حالة الطلب</h1>
              <p>تحديث جديد على طلبك</p>
            </div>

            <div class="content">
              <p>السلام عليكم <strong>${customerName}</strong>,</p>

              <div class="status-box">
                <div class="icon">${statusIcon}</div>
                <h2 style="color: ${statusColor}; margin: 0; font-size: 24px;">${statusMessage}</h2>
              </div>

              <div class="order-number">
                <p>🔔 رقم الطلب: <strong>${orderId.substring(0, 8).toUpperCase()}</strong></p>
                <p>📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
              </div>

              ${status === 'shipped' ? `
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 0; color: #92400e;">
                    🚚 <strong>ملاحظة:</strong> سيتم التواصل معك من قبل شركة الشحن لتحديد موعد التسليم
                  </p>
                </div>
              ` : ''}

              ${status === 'delivered' ? `
                <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 0; color: #065f46;">
                    🎉 شكراً لك على تسوقك معنا! نتمنى أن تكون راضياً عن منتجاتنا
                  </p>
                </div>` : ''}

              ${status === 'cancelled' ? `
                <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 0; color: #991b1b;">
                    💳 سيتم استرداد المبلغ خلال 3-5 أيام عمل في حسابك البنكي
                  </p>
                </div>
              ` : ''}

              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                يمكنك تتبع طلبك في أي وقت من خلال صفحة "رسائلي" في الموقع
              </p>
            </div>

            <div class="footer">
              <p>© 2024 فون زون. جميع الحقوق محفوظة</p>
              <p>للتواصل معنا: support@phonzone.com</p>
            </div>
          </div>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: customerEmail,
        subject: `${statusIcon} تحديث حالة طلبك #${orderId.substring(0, 8).toUpperCase()}`,
        html: customerHtmlContent,
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid email type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}