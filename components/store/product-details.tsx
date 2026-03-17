"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Minus, Plus, Check, ChevronRight } from 'lucide-react'
import { type Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '')
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const hasDiscount = product.discount_price && product.discount_price < product.price
  const currentPrice = hasDiscount ? product.discount_price! : product.price

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.name_ar,
      price: currentPrice,
      image: product.images[0] || '',
      quantity,
      size: selectedSize,
      color: selectedColor,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const whatsappMessage = encodeURIComponent(
    `مرحباً، أريد الاستفسار عن المنتج: ${product.name_ar}\n` +
    `الرابط: ${typeof window !== 'undefined' ? window.location.href : ''}`
  )

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">الرئيسية</Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <Link href="/products" className="hover:text-primary">المنتجات</Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4 rotate-180" />
            <Link 
              href={`/products?category=${product.category.slug}`}
              className="hover:text-primary"
            >
              {product.category.name_ar}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-foreground">{product.name_ar}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name_ar}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingBag className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="absolute top-4 right-4 text-lg px-3 py-1">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name_ar} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{product.name_ar}</h1>
            {product.category && (
              <p className="mt-1 text-muted-foreground">{product.category.name_ar}</p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.description_ar && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description_ar}
            </p>
          )}

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">المقاس</Label>
              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="flex flex-wrap gap-2"
              >
                {product.sizes.map((size) => (
                  <div key={size}>
                    <RadioGroupItem
                      value={size}
                      id={`size-${size}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`size-${size}`}
                      className="flex h-10 w-12 cursor-pointer items-center justify-center rounded-md border-2 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-colors hover:bg-muted"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">اللون</Label>
              <RadioGroup
                value={selectedColor}
                onValueChange={setSelectedColor}
                className="flex flex-wrap gap-2"
              >
                {product.colors.map((color) => (
                  <div key={color}>
                    <RadioGroupItem
                      value={color}
                      id={`color-${color}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`color-${color}`}
                      className="flex h-10 cursor-pointer items-center justify-center rounded-md border-2 px-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-colors hover:bg-muted"
                    >
                      {color}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Quantity */}
          <div>
            <Label className="text-sm font-medium mb-3 block">الكمية</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-lg font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-green-600">متوفر في المخزون</span>
              </>
            ) : (
              <span className="text-destructive">غير متوفر حالياً</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || added}
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" />
                  تمت الإضافة
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  أضف للسلة
                </>
              )}
            </Button>
            <a
              href={`https://wa.me/201000000000?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button size="lg" variant="outline" className="w-full gap-2 bg-[#25D366] text-white border-[#25D366] hover:bg-[#20bd5a] hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                استفسر عبر واتساب
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
