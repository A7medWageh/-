"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type User } from '@supabase/supabase-js'
import { Menu, LogOut, ExternalLink, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  FolderTree,
  Settings,
} from 'lucide-react'

const navigation = [
  { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
  { name: 'المنتجات', href: '/admin/products', icon: Package },
  { name: 'الطلبات', href: '/admin/orders', icon: ShoppingCart },
  { name: 'الرسائل', href: '/admin/messages', icon: MessageSquare },
  { name: 'الفئات', href: '/admin/categories', icon: FolderTree },
  { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
]

interface AdminHeaderProps {
  user: User
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const initials = user.email?.slice(0, 2).toUpperCase() || 'AD'

  return (
    <header className="h-16 border-b bg-card px-4 flex items-center justify-between" suppressHydrationWarning>
      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" suppressHydrationWarning>
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64" suppressHydrationWarning>
          <div className="py-4" suppressHydrationWarning>
            <Link href="/admin" className="text-xl font-bold text-primary">
              لبسك - الإدارة
            </Link>
          </div>
          <nav className="space-y-1" suppressHydrationWarning>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block" />

      {/* Actions */}
      <div className="flex items-center gap-2" suppressHydrationWarning>
        <Link href="/" target="_blank">
          <Button variant="ghost" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            عرض المتجر
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2" suppressHydrationWarning>
              <Avatar className="h-8 w-8" suppressHydrationWarning>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block text-sm">
                {user.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" suppressHydrationWarning>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">
                <Settings className="ml-2 h-4 w-4" />
                الإعدادات
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
