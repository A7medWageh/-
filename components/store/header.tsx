"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingBag, Moon, Sun, Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import dynamic from 'next/dynamic'

const CartSheet = dynamic(() => import('./cart-sheet').then(mod => mod.CartSheet), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" size="icon" className="relative" disabled>
      <ShoppingBag className="h-5 w-5 icon-visible" />
    </Button>
  ),
})

const navigation = [
  { name: 'الرئيسية', href: '/' },
  { name: 'كل المنتجات', href: '/products' },
  { name: 'هواتف ذكية', href: '/products?category=smartphones' },
  { name: 'اكسسوارات', href: '/products?category=accessories' },
  { name: 'رسائلي', href: '/messages' },
  { name: 'تواصل معنا', href: '/contact' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40" suppressHydrationWarning>
      <nav className="container mx-auto flex h-20 items-center justify-between px-6" suppressHydrationWarning>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-primary/20 group-hover:scale-110 transition-transform" suppressHydrationWarning>
            <span className="text-xl font-black text-primary-foreground italic">ف</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">فون زون</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden sm:flex"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 icon-visible" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 icon-visible" />
            <span className="sr-only">تبديل الوضع</span>
          </Button>

          <Link href="/products">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5 icon-visible" />
              <span className="sr-only">بحث</span>
            </Button>
          </Link>

          <CartSheet>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5 icon-visible" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {itemCount}
                </span>
              )}
              <span className="sr-only">السلة</span>
            </Button>
          </CartSheet>

          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6 icon-visible" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 pt-6">
                <Link href="/" className="text-2xl font-black text-primary italic tracking-tighter">
                  فون زون
                </Link>
                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4 ml-2" />
                        الوضع الفاتح
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 ml-2" />
                        الوضع الداكن
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
