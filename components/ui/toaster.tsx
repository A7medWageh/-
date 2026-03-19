'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex items-center gap-4 w-full">
              <div className="flex-shrink-0">
                {variant === 'success' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                {variant === 'destructive' && <AlertCircle className="h-6 w-6 text-red-500" />}
                {variant === 'default' && <Info className="h-6 w-6 text-blue-500" />}
              </div>
              <div className="grid gap-1 flex-1 text-right">
                {title && <ToastTitle className="text-base font-bold">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
