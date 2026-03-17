"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
  customerEmail?: string
  customerName?: string
  customerCity?: string
  customerAddress?: string
  total?: number
  items?: any[]
}

const statuses = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'delivered', label: 'تم التوصيل' },
  { value: 'cancelled', label: 'ملغي' },
]

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  customerEmail,
  customerName,
  customerCity,
  customerAddress,
  total,
  items,
}: OrderStatusUpdateProps) {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (status === currentStatus) return

    setLoading(true)
    try {
      // Update order status in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      // Send status update email to customer (only for admin status changes)
      if (status !== 'pending') {
        try {
          const response = await fetch('/api/orders-update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              status,
              customerEmail,
              customerName,
              customerCity,
              customerAddress,
              items: items || [],
              total,
            }),
          })

          if (!response.ok) {
            console.error('Failed to send email')
            // Still consider it success since order was updated
          } else {
            toast.success('تم تحديث الحالة وإرسال إشعار للعميل')
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError)
          toast.success('تم تحديث الحالة (لم يتم إرسال الإشعار)')
        }
      } else {
        toast.success('تم تحديث الحالة')
      }
      router.refresh()
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('حدث خطأ أثناء تحديث الحالة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري التحديث...
          </>
        ) : (
          'تحديث الحالة'
        )}
      </Button>
    </div>
  )
}
