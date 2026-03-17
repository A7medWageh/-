"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Heart, Eye, Check, Sparkles } from 'lucide-react'
import { type Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/cart-context'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const hasDiscount = product.discount_price && product.discount_price < product.price

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

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.name_ar,
      price: hasDiscount ? product.discount_price! : product.price,
      image: product.images[0] || '',
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0],
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  return (
    <Link 
      href={`/products/${product.id}`} 
      className="group block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-md transition-all duration-300 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] hover:border-primary/50 hover:-translate-y-3 group" suppressHydrationWarning>
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" suppressHydrationWarning>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 animate-pulse" suppressHydrationWarning />
        </div>

        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted" suppressHydrationWarning>
          {product.images[0] ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.name_ar}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-110"
                onError={(e) => {
                  // fallback to default image if error
                  (e.currentTarget as HTMLImageElement).src = '/no-image.png'
                }}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Image src="/no-image.png" alt="no image" width={120} height={160} className="object-contain opacity-60" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2" suppressHydrationWarning>
            {hasDiscount && (
              <Badge 
                variant="destructive" 
                className="font-bold shadow-lg animate-bounce-soft px-3 py-1"
              >
                <Sparkles className="h-3 w-3 ml-1" />
                -{discountPercentage}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg">
                مميز
              </Badge>
            )}
            {product.stock && product.stock < 5 && product.stock > 0 && (
              <Badge variant="secondary" className="bg-amber-500/90 text-white">
                آخر {product.stock} قطع
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" suppressHydrationWarning>
            <button
              onClick={handleLike}
              className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-500 text-white scale-110' 
                  : 'bg-white/80 hover:bg-white text-foreground hover:scale-110'
              }`}
              aria-label="أضف للمفضلة"
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-110">
              <Eye className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3" suppressHydrationWarning>
          <h3 className="font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {product.name_ar}
          </h3>
          
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-bold text-primary">
              {formatPrice(hasDiscount ? product.discount_price! : product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through decoration-2">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">الألوان:</span>
              <div className="flex gap-1">
                {product.colors.slice(0, 4).map((color) => (
                  <span
                    key={color}
                    className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                  >
                    {color}
                  </span>
                ))}
                {product.colors.length > 4 && (
                  <span className="text-xs text-primary font-medium">
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Add Button */}
          <div className="pt-4">
            <Button
              onClick={handleQuickAdd}
              disabled={isAdded}
              className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                isAdded 
                  ? 'bg-emerald-500 hover:bg-emerald-500' 
                  : 'bg-primary/95 hover:bg-primary'
              }`}
              size="lg"
            >
              {isAdded ? (
                <>
                  <Check className="ml-2 h-5 w-5" />
                  تمت الإضافة
                </>
              ) : (
                <>
                  <ShoppingBag className="ml-2 h-5 w-5" />
                  أضف للسلة
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
