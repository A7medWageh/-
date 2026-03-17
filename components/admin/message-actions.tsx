"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Check, Trash2, MessageCircle, Reply } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Message {
  id: string
  name: string
  phone: string
  message: string
  is_read: boolean
  admin_reply?: string
  replied_at?: string
}

interface MessageActionsProps {
  message: Message
}

interface Message {
  id: string
  name: string
  phone: string
  message: string
  is_read: boolean
}

interface MessageActionsProps {
  message: Message
}

export function MessageActions({ message }: MessageActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  const handleMarkAsRead = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', message.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Mark as read error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!replyText.trim()) return

    setLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('User auth error:', userError)
        throw new Error('يجب تسجيل الدخول أولاً')
      }

      if (!user) {
        throw new Error('المستخدم غير مصدق عليه')
      }

      console.log('User ID:', user.id)
      console.log('Message ID:', message.id)
      console.log('Reply text:', replyText)

      const { error } = await supabase
        .from('messages')
        .update({
          admin_reply: replyText.trim(),
          replied_at: new Date().toISOString(),
          replied_by: user.id,
          is_read: true
        })
        .eq('id', message.id)

      if (error) {
        console.error('Database update error:', error)
        throw error
      }

      console.log('Reply saved successfully')
      setReplyDialogOpen(false)
      setReplyText('')
      router.refresh()
    } catch (error) {
      console.error('Reply error:', error)
      alert(`حدث خطأ: ${error.message || 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', message.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  const whatsappMessage = encodeURIComponent(
    `مرحباً ${message.name}،\n\nشكراً لتواصلك معنا...`
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setReplyDialogOpen(true)}>
            <Reply className="ml-2 h-4 w-4" />
            رد على الرسالة
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={`https://wa.me/${message.phone.replace(/\D/g, '')}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="ml-2 h-4 w-4" />
              رد عبر واتساب
            </a>
          </DropdownMenuItem>
          {!message.is_read && (
            <DropdownMenuItem onClick={handleMarkAsRead}>
              <Check className="ml-2 h-4 w-4" />
              تحديد كمقروء
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="ml-2 h-4 w-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>رد على رسالة {message.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">الرسالة الأصلية:</Label>
              <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                {message.message}
              </div>
            </div>
            <div>
              <Label htmlFor="reply" className="text-sm font-medium">الرد:</Label>
              <Textarea
                id="reply"
                placeholder="اكتب ردك هنا..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReplyDialogOpen(false)}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button onClick={handleReply} disabled={loading || !replyText.trim()}>
                {loading ? 'جاري الإرسال...' : 'إرسال الرد'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
