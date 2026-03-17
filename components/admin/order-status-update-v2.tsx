'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Order {
  id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
  customer_email: string
  customer_name: string
}

interface OrderStatusUpdateProps {
  order: Order
  onStatusUpdated?: (newStatus: string) => void
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-muted text-foreground' },
  confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'قيد المعالجة', color: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'تم الشحن', color: 'bg-orange-100 text-orange-800' },
  out_for_delivery: { label: 'في الطريق', color: 'bg-cyan-100 text-cyan-800' },
  delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'ملغى', color: 'bg-red-100 text-red-800' },
}

const STATUS_ORDER = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
]

export function OrderStatusUpdate({ order, onStatusUpdated }: OrderStatusUpdateProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>(order.status)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async () => {
    if (selectedStatus === order.status) {
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      // تحديث حالة الطلب في قاعدة البيانات
      const updateResponse = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update order status')
      }

      // إرسال إيميل التحديث للعميل
      try {
        const emailResponse = await fetch('/api/send-email-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'order_status_update',
            orderId: order.id,
            customerEmail: order.customer_email,
            customerName: order.customer_name,
            status: selectedStatus,
          }),
        })

        if (!emailResponse.ok) {
          console.error('Email notification failed')
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError)
      }

      toast.success(
        `تم تحديث حالة الطلب إلى ${STATUS_LABELS[selectedStatus].label}`
      )
      onStatusUpdated?.(selectedStatus)
      setIsOpen(false)
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('حدث خطأ في تحديث حالة الطلب')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`${STATUS_LABELS[order.status].color} border-none`}
      >
        {STATUS_LABELS[order.status].label}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>تحديث حالة الطلب</DialogTitle>
            <DialogDescription>
              طلب #{order.id.substring(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                الحالة الحالية
              </label>
              <div className={`p-3 rounded-lg ${STATUS_LABELS[order.status].color}`}>
                {STATUS_LABELS[order.status].label}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                تحديث إلى
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status].label}
                    </SelectItem>
                  ))}
                  <SelectItem value="cancelled">ملغى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 border border-border/50 p-3 rounded-lg text-sm text-muted-foreground">
              ℹ️ سيتم إرسال إيميل تلقائي للعميل يخبره بالحالة الجديدة
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isLoading || selectedStatus === order.status}
            >
              {isLoading ? 'جاري التحديث...' : 'تحديث'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
