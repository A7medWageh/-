'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'تم معالجة طلبك بنجاح'

  return (
    <div className="container mx-auto px-4 py-16" suppressHydrationWarning>
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="bg-muted text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">نجح ✓</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-xl font-semibold mb-4">{message}</p>
            <p className="text-muted-foreground mb-8">
              شكراً لك على تسوقك معنا. سيتم إرسال جميع التحديثات إلى بريدك الإلكتروني.
            </p>

            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full">العودة للرئيسية</Button>
              </Link>
              <Link href="/messages" className="block">
                <Button variant="outline" className="w-full">
                  تابع طلبك
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
