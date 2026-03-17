'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'حدث خطأ ما'

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="bg-muted text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">خطأ</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-xl font-semibold mb-4 text-destructive">{message}</p>
            <p className="text-muted-foreground mb-8">
              يرجى المحاولة مجدداً أو التواصل مع فريق الدعم.
            </p>

            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full">العودة للرئيسية</Button>
              </Link>
              <Link href="mailto:support@phonzone.com" className="block">
                <Button variant="outline" className="w-full">
                  التواصل مع الدعم
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <Card className="w-full max-w-lg">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground mt-2">جاري التحميل...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
