import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Phone } from 'lucide-react'
import { MessageActions } from '@/components/admin/message-actions'
import { DeleteAllMessagesButton } from '@/components/admin/delete-all-messages-button'
import { AdminGuard } from '@/components/admin/admin-guard'

export default async function AdminMessagesPage() {
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <AdminGuard>
      <div className="space-y-6" suppressHydrationWarning>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-3xl font-bold">الرسائل</h1>
          {messages && messages.length > 0 && (
            <DeleteAllMessagesButton />
          )}
        </div>

        <Card suppressHydrationWarning>
          <CardHeader suppressHydrationWarning>
            <CardTitle>جميع الرسائل ({messages?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent suppressHydrationWarning>
            {!messages || messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">لا توجد رسائل</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`rounded-lg border p-4 ${
                      !message.is_read ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{message.name}</h3>
                          {!message.is_read && (
                            <Badge variant="default" className="text-xs">
                              جديد
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span dir="ltr">{message.phone}</span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                        {message.admin_reply && (
                          <div className="mt-3 p-3 bg-primary/10 rounded-lg border-r-4 border-primary">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                رد الإدارة
                              </Badge>
                              {message.replied_at && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(message.replied_at)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-primary">{message.admin_reply}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                      <MessageActions message={message} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
