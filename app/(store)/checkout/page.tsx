"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const egyptianCities = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الشرقية',
  'الدقهلية',
  'البحيرة',
  'المنيا',
  'القليوبية',
  'الغربية',
  'سوهاج',
  'أسيوط',
  'المنوفية',
  'الفيوم',
  'كفر الشيخ',
  'بني سويف',
  'قنا',
  'الأقصر',
  'أسوان',
  'دمياط',
  'الإسماعيلية',
  'بورسعيد',
  'السويس',
  'شمال سيناء',
  'جنوب سيناء',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: formData.email,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_city: formData.city,
          customer_address: formData.address,
          notes: formData.notes,
          total,
          items: items.map((item) => ({
            product_id: item.productId,
            product_name: item.nameAr,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.price,
          })),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create order: ${response.status} ${errorText}`)
      }

      const orderData = await response.json()
      console.log('✅ Order created successfully:', orderData)

      // Send confirmation email using new email system
      try {
        const emailPayload = {
          type: 'order_confirmation',
          orderId: orderData.orderId,
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerCity: formData.city,
          customerAddress: formData.address,
          items: items.map((item) => ({
            product_name: item.nameAr,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.price,
          })),
          total,
        }
        
        console.log('📧 Sending email with payload:', JSON.stringify(emailPayload, null, 2))
        
        const emailResponse = await fetch('/api/send-email-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPayload),
        })
        
        if (!emailResponse.ok) {
          const emailError = await emailResponse.json()
          console.error('❌ Email API error:', emailError)
        } else {
          console.log('✅ Email sent successfully')
        }
      } catch (emailError) {
        console.error('Confirmation email error:', emailError)
        // Don't fail the order if email fails
      }

      clearCart()
      router.push('/checkout/success')
    } catch (error) {
      console.error('Order error:', error)
      alert(`حدث خطأ: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">السلة فارغة</h1>
        <p className="mt-2 text-muted-foreground">
          أضف بعض المنتجات للسلة أولاً
        </p>
        <Link href="/products">
          <Button className="mt-6">تصفح المنتجات</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="h-4 w-4" />
        متابعة التسوق
      </Link>

      <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

      <div className="grid gap-8 lg:grid-cols-2" suppressHydrationWarning>
        {/* Order Form */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات التوصيل</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="ايميلك@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="01xxxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">المحافظة *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) =>
                    setFormData({ ...formData, city: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {egyptianCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان التفصيلي *</Label>
                <Textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="الحي - الشارع - رقم المبنى - الشقة"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="أي ملاحظات إضافية للطلب"
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || !formData.city}
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري إرسال الطلب...
                  </>
                ) : (
                  `تأكيد الطلب - ${formatPrice(total)}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الطلب ({items.length} منتج)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.nameAr}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-1">{item.nameAr}</h4>
                    <div className="text-sm text-muted-foreground">
                      {item.size && <span>المقاس: {item.size}</span>}
                      {item.size && item.color && <span> • </span>}
                      {item.color && <span>اللون: {item.color}</span>}
                    </div>
                    <div className="text-sm">الكمية: {item.quantity}</div>
                  </div>
                  <div className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>الشحن</span>
                  <span className="text-green-600">مجاني</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                الدفع عند الاستلام • شحن مجاني لجميع المحافظات
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
