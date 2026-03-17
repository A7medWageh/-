"use client"

import { useState } from 'react'
import { Loader2, Eye, EyeOff, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsClient() {
  const supabase = createClient()
  
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const [adminLoading, setAdminLoading] = useState(false)
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
  })
  const [adminError, setAdminError] = useState('')
  const [adminSuccess, setAdminSuccess] = useState('')

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('كلمات المرور غير متطابقة')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setPasswordLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      setPasswordSuccess('تم تغيير كلمة المرور بنجاح')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Password change error:', error)
      setPasswordError('حدث خطأ أثناء تغيير كلمة المرور')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError('')
    setAdminSuccess('')

    if (adminData.password.length < 6) {
      setAdminError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setAdminLoading(true)

    try {
      // Sign up new user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Add to admin_users table
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            id: data.user.id,
            email: adminData.email,
            role: 'admin',
          })

        if (insertError) throw insertError

        setAdminSuccess('تم إضافة المسؤول بنجاح. سيتلقى رسالة تأكيد على البريد الإلكتروني.')
        setAdminData({ email: '', password: '' })
      }
    } catch (error) {
      console.error('Add admin error:', error)
      setAdminError('حدث خطأ أثناء إضافة المسؤول')
    } finally {
      setAdminLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">الإعدادات</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>تغيير كلمة المرور</CardTitle>
            <CardDescription>قم بتحديث كلمة المرور الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="rounded-lg bg-green-500/10 border border-green-200/30 p-3 text-sm text-green-600">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    dir="ltr"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  dir="ltr"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                />
              </div>

              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  'تغيير كلمة المرور'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Add Admin */}
        <Card>
          <CardHeader>
            <CardTitle>إضافة مسؤول جديد</CardTitle>
            <CardDescription>أضف مسؤول جديد للوحة التحكم</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              {adminError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {adminError}
                </div>
              )}
              {adminSuccess && (
                <div className="rounded-lg bg-green-500/10 border border-green-200/30 p-3 text-sm text-green-600">
                  {adminSuccess}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="adminEmail">البريد الإلكتروني</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  required
                  dir="ltr"
                  value={adminData.email}
                  onChange={(e) =>
                    setAdminData({ ...adminData, email: e.target.value })
                  }
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">كلمة المرور</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  required
                  dir="ltr"
                  value={adminData.password}
                  onChange={(e) =>
                    setAdminData({ ...adminData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" disabled={adminLoading} className="gap-2">
                {adminLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    إضافة مسؤول
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
