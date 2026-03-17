"use client"

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowRight, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'

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

export default function EditOrderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = params.id as string
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [addingQuantity, setAddingQuantity] = useState(1)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_city: '',
    customer_address: '',
  })

  useEffect(() => {
    if (!token || !email) {
      setError('رابط غير صحيح')
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) throw new Error('Failed to fetch order')
        const data = await response.json()
        setOrder(data.order)
        setItems(data.items || [])
        setFormData({
          customer_name: data.order.customer_name,
          customer_phone: data.order.customer_phone,
          customer_city: data.order.customer_city,
          customer_address: data.order.customer_address,
        })
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('لم نتمكن من فتح تفاصيل الطلب')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, token, email])

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.products || [])
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddProduct = () => {
    if (!selectedProduct || addingQuantity < 1) return

    const newItem = {
      id: `${selectedProduct.id}-${Date.now()}`,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name_ar,
      quantity: addingQuantity,
      price: selectedProduct.price,
      size: '',
      color: '',
    }

    setItems([...items, newItem])
    setSelectedProduct(null)
    setSearchQuery('')
    setSearchResults([])
    setAddingQuantity(1)
  }

  const handleSave = async () => {
    if (!formData.customer_name || !formData.customer_phone || !formData.customer_city || !formData.customer_address) {
      setError('الرجاء ملء جميع الحقول المطلوبة')
      return
    }

    if (items.length === 0) {
      setError('يجب أن يحتوي الطلب على منتج واحد على الأقل')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: email,
          ...formData,
          items: items,
        }),
      })

      if (!response.ok) {
        throw new Error('فشل تحديث الطلب')
      }

      // Send notification email
      try {
        await fetch('/api/send-email-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'order_status_update',
            orderId,
            customerEmail: email,
            customerName: formData.customer_name,
            status: 'confirmed',
            message: 'تم تحديث بيانات طلبك بنجاح',
          }),
        })
      } catch (emailError) {
        console.error('Email notification error:', emailError)
      }

      router.push(`/orders/${orderId}/success?message=تم تحديث الطلب بنجاح!`)
    } catch (err) {
      console.error('Error saving order:', err)
      setError('حدث خطأ أثناء حفظ التعديلات. الرجاء المحاولة مجدداً')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-4">جاري تحميل تفاصيل الطلب...</p>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-2">خطأ</h3>
                <p className="text-destructive">{error}</p>
                <div className="mt-4">
                  <Link href="/products">
                    <Button variant="outline">الرجوع للمتجر</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>لم نتمكن من العثور على الطلب</p>
        <Link href="/products" className="mt-4 inline-block">
          <Button>الرجوع للمتجر</Button>
        </Link>
      </div>
    )
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="h-4 w-4" />
        الرجوع
      </Link>

      <h1 className="text-3xl font-bold mb-8">تعديل الطلب #{orderId.substring(0, 8).toUpperCase()}</h1>

      {error && (
        <Card className="border-destructive/20 bg-destructive/10 mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>البيانات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">المحافظة</Label>
                <select
                  id="city"
                  value={formData.customer_city}
                  onChange={(e) => setFormData({ ...formData, customer_city: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">اختر المحافظة</option>
                  {egyptianCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان التفصيلي</Label>
                <Textarea
                  id="address"
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                  placeholder="الحي - الشارع - رقم المبنى - الشقة"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>المنتجات ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-muted-foreground">لا توجد منتجات</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {item.price.toFixed(2)} جنيه = {(item.quantity * item.price).toFixed(2)} جنيه
                        </p>
                        {item.size && <p className="text-sm text-muted-foreground">الحجم: {item.size}</p>}
                        {item.color && <p className="text-sm text-muted-foreground">اللون: {item.color}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Product Section */}
          <Card>
            <CardHeader>
              <CardTitle>إضافة منتج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">البحث عن منتج</Label>
                <Input
                  id="search"
                  placeholder="ابحث عن المنتج..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="relative"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border rounded-lg max-h-80 overflow-y-auto">
                  <div className="grid gap-2 p-2">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`flex gap-3 p-3 rounded-lg hover:bg-muted transition-all text-left ${
                          selectedProduct?.id === product.id ? 'bg-primary/10 border-2 border-primary' : 'border border-border'
                        }`}
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name_ar}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs text-muted-foreground">بدون صورة</div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{product.name_ar}</p>
                          <p className="text-xs text-muted-foreground mt-1">{product.name}</p>
                          <p className="text-sm font-bold text-primary mt-2">{product.price.toFixed(2)} جنيه</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct && (
                <div className="bg-muted border border-border rounded-lg p-4 space-y-3">
                  <div className="flex gap-4">
                    {/* Product Preview Image */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {selectedProduct.images && selectedProduct.images.length > 0 ? (
                        <img
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.name_ar}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">بدون صورة</div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{selectedProduct.name_ar}</p>
                      <p className="text-xs text-muted-foreground mt-1">{selectedProduct.name}</p>
                      <p className="text-lg font-bold text-foreground mt-2">{selectedProduct.price.toFixed(2)} جنيه</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">الكمية</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddingQuantity(Math.max(1, addingQuantity - 1))}
                      >
                        -
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={addingQuantity}
                        onChange={(e) => setAddingQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddingQuantity(addingQuantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddProduct}
                      className="flex-1"
                    >
                      إضافة للطلب
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedProduct(null)
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}

              {isSearching && (
                <div className="text-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">جاري البحث...</p>
                </div>
              )}

              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">لم تظهر نتائج للبحث عن "{searchQuery}"</p>
                  <p className="text-xs mt-2 text-muted-foreground/70">حاول البحث برسالة أخرى</p>
                </div>
              )}

              {searchQuery.length > 0 && searchQuery.length < 2 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">اكتب حرفين على الأقل للبحث</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>عدد المنتجات:</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الجزئي:</span>
                  <span>{total.toFixed(2)} جنيه</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>الإجمالي:</span>
                  <span className="text-primary text-lg">{total.toFixed(2)} جنيه</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ التعديلات'
                  )}
                </Button>
                <Link href="/products" className="block">
                  <Button variant="outline" className="w-full">
                    إلغاء
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                ℹ️ يمكنك تعديل البيانات الشخصية وحذف المنتجات. بعد الحفظ، سيتم إرسال إشعار بريد إلكتروني بالتعديلات.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
