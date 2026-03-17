'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import { type Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ChevronRight, ChevronLeft, Sparkles, Star } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeroSliderLayoutProps {
  products: Product[]
}

export function HeroSliderLayout({ products }: HeroSliderLayoutProps) {
  const [api, setApi] = React.useState<CarouselApi | undefined>()
  const [current, setCurrent] = React.useState(0)

  const plugins = React.useMemo(() => [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ], [])

  const opts = React.useMemo(() => ({
    loop: products.length > 1,
    align: 'start' as const,
    direction: 'rtl' as const,
  }), [products.length])

  React.useEffect(() => {
    if (!api) return
    
    const onSelect = () => {
      const snap = api.selectedScrollSnap()
      setCurrent((prev) => (prev !== snap ? snap : prev))
    }

    api.on('select', onSelect)
    api.on('reInit', onSelect)
    
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  if (!products || products.length === 0) return null

  return (
    <div className="relative w-full min-h-screen lg:h-screen flex flex-col lg:grid lg:grid-cols-2 bg-[#050505] overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/15 blur-[150px] rounded-full animate-pulse delay-700 pointer-events-none" />

      {/* Side 1: Product Showcase (Carousel) - TOP on Mobile, LEFT in RTL Desktop */}
      <div className="relative h-[70vh] md:h-[65vh] lg:h-full order-1 lg:order-2 flex-shrink-0 bg-black/40 z-20 border-b lg:border-b-0 border-white/5 overflow-hidden">
        <Carousel 
          setApi={setApi}
          plugins={plugins}
          className="w-full h-full"
          opts={opts}
        >
          <CarouselContent className="h-full ml-0">
            {products.map((product, idx) => (
              <CarouselItem key={`slide-${product.id}-${idx}`} className="h-full w-full basis-full relative pl-0">
                <div className="w-full h-full relative bg-black" suppressHydrationWarning>
                  <Image
                    src={product.images && product.images[0] ? product.images[0] : '/placeholder.svg'}
                    alt={product.name_ar}
                    fill
                    priority={idx === 0}
                    key={`hero-img-${product.id}`}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 pointer-events-none" suppressHydrationWarning />
                  
                  {/* Product Details */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md rounded-lg p-4 border border-white/20" suppressHydrationWarning>
                    <h3 className="text-lg font-bold text-foreground mb-2">{product.name_ar}</h3>
                    <p className="text-foreground/80 text-sm mb-3 line-clamp-2">{product.description_ar || 'منتج مميز'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-foreground">{product.price} ج.م</span>
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                          تسوق
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Side 2: Welcome Content - Right on Desktop, Bottom on Mobile */}
      <div className="relative flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12 lg:py-20 z-10 order-2 lg:order-1 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-[2px]" suppressHydrationWarning>
        <motion.div
           initial={{ opacity: 0, x: 50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:border-primary/50 transition-colors cursor-default group">
            <Sparkles className="h-4 w-4 text-primary animate-pulse group-hover:scale-125 transition-transform" />
            <span className="text-[10px] lg:text-xs font-bold text-foreground/80 uppercase tracking-[0.2em]">منتج مميز</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground leading-[1.1] tracking-tighter mb-8 italic pt-4">
            {products[current]?.name_ar || 'منتج مميز'}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-foreground/60 mb-12 max-w-xl leading-relaxed">
            {products[current]?.description_ar || 'اكتشف هذا المنتج المميز من تشكيلتنا الجديدة.'}
          </p>

          <div className="flex items-center gap-8 mb-12" suppressHydrationWarning>
            <div className="flex flex-col" suppressHydrationWarning>
              <span className="text-xs text-foreground/40 uppercase tracking-widest mb-2">السعر</span>
              <div className="flex items-baseline gap-2" suppressHydrationWarning>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">{products[current]?.price || '0'}</span>
                <span className="text-lg font-bold text-primary">ج.م</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Star className="h-6 w-6 text-primary fill-primary" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-4" suppressHydrationWarning>
             <Link href={`/products/${products[current]?.id || '#'}`}>
               <Button size="lg" className="h-10 sm:h-14 lg:h-16 px-6 sm:px-10 lg:px-12 rounded-2xl bg-primary text-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)] font-bold text-sm sm:text-lg relative overflow-hidden group">
                  <span className="relative z-10">تسوق الآن</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
               </Button>
             </Link>
             <Link href="/products">
               <Button variant="outline" size="lg" className="h-10 sm:h-14 lg:h-16 px-6 sm:px-10 lg:px-12 rounded-2xl border-white/10 bg-white/5 text-foreground backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all text-sm sm:text-lg font-bold">
                  جميع المنتجات
               </Button>
             </Link>
          </div>
        </motion.div>

        {/* Desktop Indicators */}
        <div className="hidden lg:flex absolute bottom-12 left-24 items-center gap-8" suppressHydrationWarning>
           <div className="flex gap-3" suppressHydrationWarning>
              {products.map((_, i) => (
                <button 
                  key={`dot-${i}`}
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    "h-1.5 transition-all duration-500 rounded-full",
                    current === i ? "w-16 bg-primary" : "w-4 bg-white/20 hover:bg-white/40"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}

