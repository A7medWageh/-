"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  FolderTree,
  Users,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  role?: string
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
    { name: 'المنتجات', href: '/admin/products', icon: Package },
    { name: 'الطلبات', href: '/admin/orders', icon: ShoppingCart },
    { name: 'الرسائل', href: '/admin/messages', icon: MessageSquare },
    { name: 'الفئات', href: '/admin/categories', icon: FolderTree },
    ...(role === 'owner' ? [{ name: 'المديرين', href: '/admin/users', icon: Users }] : []),
    { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
  ]

  return (
    <aside className="hidden w-64 flex-shrink-0 border-l bg-card lg:block" suppressHydrationWarning>
      <div className="flex h-16 items-center border-b px-6" suppressHydrationWarning>
        <Link href="/admin" className="text-xl font-bold text-primary">
          لبسك - الإدارة
        </Link>
      </div>
      <nav className="p-4 space-y-1" suppressHydrationWarning>
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
