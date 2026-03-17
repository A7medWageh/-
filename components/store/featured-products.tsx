'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, TrendingUp } from 'lucide-react'
import { type Product } from '@/lib/types'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [rotation, setRotation] = useState(0)
  const lastX = useRef<number | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isInteracting) {
        setRotation((rot) => rot - 0.2)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [isInteracting])

  if (products.length === 0) return null

  const radius = 420
  const angleStep = 360 / products.length

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsInteracting(true)
    lastX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (lastX.current === null) return
    const delta = e.clientX - lastX.current
    lastX.current = e.clientX
    setRotation((rot) => rot + delta * 0.35)
  }

  const handlePointerUp = () => {
    setIsInteracting(false)
    lastX.current = null
  }

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden" suppressHydrationWarning>
      {/* Animated background */}
      <div className="absolute inset-0 -z-10" suppressHydrationWarning>
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" suppressHydrationWarning />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" suppressHydrationWarning />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-glow stagger-2" suppressHydrationWarning />
      </div>

      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6" suppressHydrationWarning>
          <div className="text-center md:text-right">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-3 tracking-wider">
              <TrendingUp className="h-4 w-4" />
              <span>الأكثر طلباً</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              منتجات مميزة
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              تشكيلة مختارة بعناية من أفضل منتجاتنا
            </p>
          </div>
          <Link href="/products?featured=true">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 rounded-xl px-6 py-6 text-base font-medium border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            >
              <Sparkles className="h-5 w-5" />
              عرض جميع المنتجات
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* 3D Carousel */}
        <div
          className="relative mx-auto h-[400px] w-full max-w-[1200px] touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ perspective: 1200 }}
          suppressHydrationWarning
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translateZ(-${radius}px) rotateY(${rotation}deg)`,
              transformStyle: 'preserve-3d',
              transition: lastX.current === null ? 'transform 0.3s ease' : 'none',
            }}
            suppressHydrationWarning
          >
            {products.map((product, index) => {
              const angle = angleStep * index
              // Calculate zIndex based on the current rotation and item angle
              // Items closer to the front (angle + rotation around 0, 360, etc.) should have higher zIndex
              const currentAngle = (angle + rotation) % 360
              const normalizedAngle = currentAngle < 0 ? currentAngle + 360 : currentAngle
              // The closer normalizedAngle is to 0 or 360, the closer it is to the front
              const distanceToFront = Math.min(normalizedAngle, 360 - normalizedAngle)
              const zIndex = Math.round(1000 - distanceToFront * 2)
              
              return (
                <div
                  key={product.id}
                  className="absolute top-1/2 left-1/2 h-80 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    zIndex,
                  }}
                >
                  <ProductCard product={product} index={index} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Sparkles className="h-6 w-6 text-primary animate-bounce-soft" />
              <span>لا تفوت عروضنا الحصرية</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              تابعنا على واتساب لتصلك أحدث العروض والخصومات
            </p>
            <a
              href="https://wa.me/201000000000?text=أريد الاشتراك في العروض"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-white font-semibold hover:bg-[#20bd5a] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#25D366]/30"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
