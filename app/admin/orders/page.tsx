import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Eye } from 'lucide-react'
import { AdminGuard } from '@/components/admin/admin-guard'

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  }

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  }

  return (
    <AdminGuard>
      <div className="space-y-6" suppressHydrationWarning>
        <h1 className="text-3xl font-bold">الطلبات</h1>

        <Card suppressHydrationWarning>
          <CardHeader suppressHydrationWarning>
            <CardTitle>جميع الطلبات ({orders?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent suppressHydrationWarning>
            {!orders || orders.length === 0 ? (
              <div className="text-center py-12" suppressHydrationWarning>
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">لا توجد طلبات</p>
              </div>
            ) : (
              <div className="space-y-4" suppressHydrationWarning>
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border p-4"
                    suppressHydrationWarning
                  >
                    <div className="space-y-1" suppressHydrationWarning>
                      <div className="flex items-center gap-2" suppressHydrationWarning>
                        <h3 className="font-medium">{order.customer_name}</h3>
                        <Badge
                          className={statusColors[order.status] || statusColors.pending}
                        >
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_phone} • {order.customer_city}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4" suppressHydrationWarning>
                      <p className="font-bold text-primary text-lg">
                        {formatPrice(order.total)}
                      </p>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          التفاصيل
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
