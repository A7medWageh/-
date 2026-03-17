import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Arabic, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { CartProvider } from '@/lib/cart-context'
import { LightningIntroWrapper } from '@/components/store/lightning-intro-wrapper'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const notoSansArabic = Noto_Sans_Arabic({ 
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
})

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'فون زون | سماعات AirPods وأحدث الهواتف',
  description: 'فون زون - أفضل سماعات AirPods، الهواتف الذكية، وإكسسوارات الموبايل الأصلية بأسعار تنافسية في مصر.',
  keywords: ['ايربودز', 'AirPods', 'موبايلات', 'هواتف ذكية', 'اكسسوارات موبايل', 'مصر', 'سماعات'],
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9f7f4' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1714' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body 
        className={`${notoSansArabic.variable} ${geist.variable} font-arabic antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LightningIntroWrapper />
          <CartProvider>
            {children}
          </CartProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
