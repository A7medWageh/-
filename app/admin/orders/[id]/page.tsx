import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Phone, MapPin, FileText } from 'lucide-react'
import { OrderStatusUpdate } from '@/components/admin/order-status-update'

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>
}

import { AdminGuard } from '@/components/admin/admin-guard'

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('order_items').select('*').eq('order_id', id),
  ])

  if (!order) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  }

  const whatsappMessage = encodeURIComponent(
    `مرحباً ${order.customer_name}،\n\n` +
    `بخصوص طلبك رقم #${order.id.slice(0, 8)}...\n` +
    `الإجمالي: ${formatPrice(order.total)}`
  )

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">تفاصيل الطلب</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>الطلب #{order.id.slice(0, 8)}</CardTitle>
                <Badge variant="outline">
                  {statusLabels[order.status] || order.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.created_at)}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">معلومات العميل</h3>
                <div className="space-y-2">
                  <p className="font-medium">{order.customer_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{order.customer_phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{order.customer_city} - {order.customer_address}</span>
                  </div>
                  {order.notes && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mt-0.5" />
                      <span>{order.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-semibold">المنتجات</h3>
                <div className="space-y-3">
                  {items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.size && `المقاس: ${item.size}`}
                          {item.size && item.color && ' • '}
                          {item.color && `اللون: ${item.color}`}
                          {(item.size || item.color) && ' • '}
                          الكمية: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-lg font-semibold">الإجمالي</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(order.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تحديث الحالة</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusUpdate 
                  orderId={order.id} 
                  currentStatus={order.status}
                  customerEmail={order.customer_email}
                  customerName={order.customer_name}
                  customerCity={order.customer_city}
                  customerAddress={order.customer_address}
                  total={order.total}
                  items={items}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التواصل مع العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#20bd5a]">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    تواصل عبر واتساب
                  </Button>
                </a>
                <a href={`tel:${order.customer_phone}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    اتصال هاتفي
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
