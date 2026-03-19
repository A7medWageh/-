"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, UserPlus, Trash2, ShieldAlert, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type AdminUser } from '@/lib/types'
import { DeleteAllUsersButton } from '@/components/admin/delete-all-users-button'

export default function UsersClient() {
  const supabase = createClient()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    role: 'admin' as AdminUser['role'],
  })

  useEffect(() => {
    fetchInitData()
  }, [])

  const fetchInitData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single()
      setCurrentUserRole(adminData?.role || null)
    }
    fetchAdmins()
  }

  const fetchAdmins = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })
    
    setAdmins((data || []) as AdminUser[])
    setLoading(false)
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // تحقق من صحة الـ UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(formData.id)) {
      alert('❌ رقم User ID غير صحيح. يجب أن يكون بصيغة UUID صحيحة')
      return
    }

    setSaving(true)

    try {
      // تحقق من وجود المستخدم في auth.users أولاً
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([{
          id: formData.id,
          email: formData.email,
          role: formData.role
        }])

      if (insertError) {
        if (insertError.message?.includes('foreign key')) {
          throw new Error('❌ هذا User ID غير موجود في النظام. تأكد من تسجيل المستخدم أولاً!')
        }
        throw insertError
      }
      
      setDialogOpen(false)
      setFormData({ id: '', email: '', role: 'admin' })
      alert('✅ تم إضافة المدير بنجاح!')
      fetchAdmins()
    } catch (error: any) {
      console.error('Add admin error:', error)
      alert(error.message || 'حدث خطأ: تأكد من صحة البيانات المدخلة')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من سحب صلاحيات هذا المستخدم؟')) return
    
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAdmins()
    } catch (error) {
      console.error('Delete error:', error)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const updateRole = async (id: string, newRole: AdminUser['role']) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ role: newRole })
        .eq('id', id)

      if (error) throw error
      fetchAdmins()
    } catch (error) {
      console.error('Update role error:', error)
      alert('حدث خطأ أثناء تحديث الرتبة')
    }
  }

  if (loading && admins.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (currentUserRole !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive animate-bounce" />
        <h1 className="text-3xl font-bold">صلاحية غير كافية</h1>
        <p className="text-muted-foreground">فقط صاحب الموقع (Owner) يمكنه إدارة المديرين.</p>
        <Button asChild variant="outline">
          <a href="/admin">العودة للوحة التحكم</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-3xl font-bold">إدارة المديرين</h1>
        <div className="flex items-center gap-2">
          {admins.length > 1 && (
            <DeleteAllUsersButton />
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                إضافة مـدير جديد
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعيين مدير جديد للنظام</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAdmin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">User ID (من Supabase Auth)</Label>
                <Input
                  id="user_id"
                  required
                  placeholder="مثال: 550e8400-e29b-41d4-a716-446655440000"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">يجب أن يكون المستخدم مسجلاً في الموقع أولاً.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني للمدير</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الرتبة (الصلاحيات)</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val: any) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير (Admin)</SelectItem>
                    <SelectItem value="support">دعم فني (Support)</SelectItem>
                    <SelectItem value="owner">صاحب عمل (Owner)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1 gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  تـأكيد التعيين
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            قائمة المديرين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-lg border">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">المستخدم</th>
                  <th className="px-6 py-4 font-semibold">الرتبة</th>
                  <th className="px-6 py-4 font-semibold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {admins.map((admin) => (
                  <tr key={admin.id} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{admin.email}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{admin.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        disabled={admin.id === currentUserId}
                        defaultValue={admin.role}
                        onValueChange={(val: any) => updateRole(admin.id, val)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-left">
                      {admin.id !== currentUserId && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:text-destructive h-8 w-8"
                          onClick={() => handleDelete(admin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
