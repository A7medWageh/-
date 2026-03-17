'use client'

import { useState, useEffect } from 'react'
import { Gift, Clock, Flame, Percent } from 'lucide-react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    // Set end date to 7 days from now
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)

    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-card shadow-lg flex items-center justify-center border border-primary/20 overflow-hidden">
          <span className="text-2xl md:text-3xl font-bold text-foreground">{value.toString().padStart(2, '0')}</span>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      </div>
      <span className="text-xs md:text-sm text-muted-foreground mt-2 font-medium">{label}</span>
    </div>
  )

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary to-accent/90" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
      
      {/* Floating decorations */}
      <div className="absolute top-10 right-10 animate-float">
        <Gift className="h-12 w-12 text-white/20" />
      </div>
      <div className="absolute bottom-10 left-10 animate-float-delayed">
        <Percent className="h-16 w-16 text-white/20" />
      </div>
      <div className="absolute top-1/2 right-1/4 animate-bounce-soft">
        <Flame className="h-8 w-8 text-white/20" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            <Flame className="h-4 w-4 animate-bounce-soft" />
            <span className="text-sm font-semibold">عرض محدود</span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white text-balance">
              خصم يصل إلى
              <span className="block text-3xl sm:text-5xl md:text-7xl mt-2 text-amber-300 animate-bounce-soft">
                50%
              </span>
            </h2>
            <p className="text-sm sm:text-lg md:text-xl text-white/80 max-w-lg mx-auto">
              على جميع سماعات AirPods وإكسسوارات الموبايل - العرض ينتهي قريباً!
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 md:gap-6 flex-wrap">
            <TimeBlock value={timeLeft.days} label="يوم" />
            <span className="text-xl md:text-4xl font-bold text-white/50 mt-[-20px]">:</span>
            <TimeBlock value={timeLeft.hours} label="ساعة" />
            <span className="text-xl md:text-4xl font-bold text-white/50 mt-[-20px]">:</span>
            <TimeBlock value={timeLeft.minutes} label="دقيقة" />
            <span className="text-xl md:text-4xl font-bold text-white/50 mt-[-20px]">:</span>
            <TimeBlock value={timeLeft.seconds} label="ثانية" />
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-4 w-full px-4">
            <a
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 sm:px-8 py-2 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm sm:text-base"
            >
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              تسوق الآن
            </a>
            <span className="text-white/60 text-xs sm:text-sm">
              استخدم كود: <span className="font-bold text-white bg-white/20 px-2 py-1 rounded">SALE50</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
