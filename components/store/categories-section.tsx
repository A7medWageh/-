'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Smartphone, Headphones, Watch, ShoppingBag, Laptop, Speaker } from 'lucide-react'
import { type Category } from '@/lib/types'

interface CategoriesSectionProps {
  categories: Category[]
}

const categoryConfig: Record<string, { icon: any; gradient: string; hoverGradient: string }> = {
  'airpods': { 
    icon: Headphones, 
    gradient: 'from-blue-500/10 to-cyan-500/10',
    hoverGradient: 'from-blue-500/20 to-cyan-500/20'
  },
  'phones': { 
    icon: Smartphone, 
    gradient: 'from-purple-500/10 to-indigo-500/10',
    hoverGradient: 'from-purple-500/20 to-indigo-500/20'
  },
  'watches': { 
    icon: Watch, 
    gradient: 'from-amber-500/10 to-orange-500/10',
    hoverGradient: 'from-amber-500/20 to-orange-500/20'
  },
  'speakers': { 
    icon: Speaker, 
    gradient: 'from-emerald-500/10 to-teal-500/10',
    hoverGradient: 'from-emerald-500/20 to-teal-500/20'
  },
  'accessories': { 
    icon: Laptop, 
    gradient: 'from-rose-500/10 to-red-500/10',
    hoverGradient: 'from-rose-500/20 to-red-500/20'
  },
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section ref={sectionRef} className="py-20 bg-background relative overflow-hidden" suppressHydrationWarning>
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10" suppressHydrationWarning>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" suppressHydrationWarning />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" suppressHydrationWarning />
      </div>

      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="text-center mb-16" suppressHydrationWarning>
          <span className="inline-block text-sm font-medium text-primary mb-3 tracking-wider">
            تصفح الأقسام
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            تسوق حسب الفئة
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            اكتشف تشكيلتنا المتنوعة واختر ما يناسب ذوقك
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5" suppressHydrationWarning>
          {categories.map((category, index) => {
            const config = categoryConfig[category.slug] || { 
              icon: ShoppingBag, 
              gradient: 'from-muted to-muted',
              hoverGradient: 'from-muted/80 to-muted/80'
            }
            const Icon = config.icon

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${config.gradient} p-8 text-center transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-3 group-hover:bg-gradient-to-br group-hover:${config.hoverGradient}`}>
                  {/* Animated background circles */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-accent/5 transition-transform duration-500 group-hover:scale-150" />
                  
                  {/* Icon container */}
                  <div className="relative mb-5">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card shadow-md transition-all duration-500 group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                  
                  <h3 className="relative font-bold text-lg text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {category.name_ar}
                  </h3>
                  
                  {/* Hover arrow */}
                  <div className="relative mt-4 flex items-center justify-center gap-2 text-sm font-medium text-primary opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span>اكتشف المزيد</span>
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
