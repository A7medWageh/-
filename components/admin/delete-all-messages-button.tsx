'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

export function DeleteAllMessagesButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const closeTimeoutRef = useRef<NodeJS.Timeout>()

  const handleDeleteAll = async () => {
    setIsLoading(true)
    setDeleteStatus('idle')
    try {
      const response = await fetch('/api/messages/delete-all', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setDeleteStatus('success')
        // إغلق بعد 1.5 ثانية
        closeTimeoutRef.current = setTimeout(() => {
          setIsOpen(false)
          setDeleteStatus('idle')
          window.location.reload()
        }, 1500)
      } else {
        setDeleteStatus('error')
        setErrorMessage(data.error || 'حدث خطأ أثناء حذف الرسائل')
      }
    } catch (error) {
      console.error('Error deleting messages:', error)
      setDeleteStatus('error')
      setErrorMessage('خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    if (!open) {
      setDeleteStatus('idle')
      setErrorMessage('')
    }
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          حذف الجميع
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {deleteStatus === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-lg font-bold">تم الحذف بنجاح!</h2>
            <p className="text-sm text-muted-foreground mt-2">جميع الرسائل تم حذفها</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-right">حذف جميع الرسائل</DialogTitle>
              <DialogDescription className="text-right">
                هذا الإجراء غير قابل للتراجع
              </DialogDescription>
            </DialogHeader>

            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3 my-4">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-right">
                <p className="font-semibold text-sm text-destructive">تحذير</p>
                <p className="text-xs text-muted-foreground mt-1">
                  سيتم حذف جميع الرسائل المحفوظة بشكل نهائي. لا يمكن استرجاعها.
                </p>
              </div>
            </div>

            {deleteStatus === 'error' && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-right">
                <p className="text-sm text-red-700 dark:text-red-400">
                  ❌ {errorMessage}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    حذف نهائياً
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
