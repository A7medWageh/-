"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { type Product, type Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { ImageUploader } from './ImageUploader'

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState('')

  const [formData, setFormData] = useState({
    name: product?.name || '',
    name_ar: product?.name_ar || '',
    description: product?.description || '',
    description_ar: product?.description_ar || '',
    price: product?.price?.toString() || '',
    discount_price: product?.discount_price?.toString() || '',
    category_id: product?.category_id || '',
    stock: product?.stock?.toString() || '0',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    images: product?.images || [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (!formData.name_ar) {
      alert('الرجاء إدخال اسم المنتج بالعربي')
      setLoading(false)
      return
    }

    if (!formData.name) {
      alert('الرجاء إدخال اسم المنتج بالإنجليزي')
      setLoading(false)
      return
    }

    if (!formData.price || isNaN(parseFloat(formData.price))) {
      alert('الرجاء إدخال سعر صحيح')
      setLoading(false)
      return
    }

    if (!formData.stock || isNaN(parseInt(formData.stock))) {
      alert('الرجاء إدخال كمية صحيحة')
      setLoading(false)
      return
    }

    try {
      const data = {
        name: formData.name,
        name_ar: formData.name_ar,
        description: formData.description || null,
        description_ar: formData.description_ar || null,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        category_id: formData.category_id || null,
        stock: parseInt(formData.stock),
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        sizes: formData.sizes,
        colors: formData.colors,
        images: formData.images,
      }

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', product.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert(data)

        if (error) throw error
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      console.error('Product save error:', error.message, error.stack, error)
      alert(`حدث خطأ أثناء حفظ المنتج: ${error.message || 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize] })
      setNewSize('')
    }
  }

  const removeSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter((s) => s !== size) })
  }

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData({ ...formData, colors: [...formData.colors, newColor] })
      setNewColor('')
    }
  }

  const removeColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors.filter((c) => c !== color) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات المنتج</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name_ar">اسم المنتج (عربي) *</Label>
              <Input
                id="name_ar"
                required
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">اسم المنتج (إنجليزي) *</Label>
              <Input
                id="name"
                dir="ltr"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_ar">الوصف (عربي)</Label>
              <Textarea
                id="description_ar"
                rows={3}
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف (إنجليزي)</Label>
              <Textarea
                id="description"
                dir="ltr"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Category */}
        <Card>
          <CardHeader>
            <CardTitle>السعر والفئة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">السعر (ج.م) *</Label>
                <Input
                  id="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  dir="ltr"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_price">سعر الخصم (اختياري)</Label>
                <Input
                  id="discount_price"
                  type="number"
                  min="0"
                  step="0.01"
                  dir="ltr"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">الفئة</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">المخزون *</Label>
              <Input
                id="stock"
                type="number"
                required
                min="0"
                dir="ltr"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_featured">منتج مميز</Label>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">نشط (معروض في المتجر)</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>المقاسات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="مثال: S, M, L, XL"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
              />
              <Button type="button" onClick={addSize} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.sizes.map((size) => (
                <Badge key={size} variant="secondary" className="gap-1">
                  {size}
                  <button type="button" onClick={() => removeSize(size)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle>الألوان</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="مثال: أسود، أبيض، أزرق"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
              />
              <Button type="button" onClick={addColor} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.colors.map((color) => (
                <Badge key={color} variant="secondary" className="gap-1">
                  {color}
                  <button type="button" onClick={() => removeColor(color)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>صور المنتج</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              value={formData.images}
              onChange={(newImages) =>
                setFormData({ ...formData, images: newImages })
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {product ? 'حفظ التعديلات' : 'إضافة المنتج'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
