'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  product_name: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

function ConfirmOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('رابط غير صحيح - لا يحتوي على رقم الطلب');
      setLoading(false);
      return;
    }

    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الطلب');
      }
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError('حدث خطأ في جلب بيانات الطلب');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error('فشل في تأكيد الطلب');
      }

      setSuccess('تم تأكيد طلبك بنجاح! سيتم التواصل معك قريباً.');
      setOrder(prev => prev ? { ...prev, status: 'confirmed' } : null);
    } catch (err) {
      setError('حدث خطأ في تأكيد الطلب');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/orders/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error('فشل في إلغاء الطلب');
      }

      setSuccess('تم إلغاء طلبك. سيتم استرداد المبلغ خلال 3-5 أيام عمل.');
      setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (err) {
      setError('حدث خطأ في إلغاء الطلب');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'في انتظار التأكيد', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
      case 'confirmed':
        return { label: 'مؤكد', color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
      case 'shipped':
        return { label: 'تم الشحن', color: 'bg-purple-100 text-purple-800', icon: CheckCircle };
      case 'delivered':
        return { label: 'تم التوصيل', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'cancelled':
        return { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { label: status, color: 'bg-muted text-foreground', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">خطأ في الطلب</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/">
              <Button>العودة للرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-primary/20">
              <span className="text-xl font-black text-primary-foreground italic">ف</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">فون زون</h1>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">تأكيد الطلب</h2>
          <p className="text-muted-foreground mt-2">يرجى مراجعة طلبك وتأكيده</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Card className="mb-8 border-green-200/20 bg-green-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-600">{success}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8 border-red-200/20 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>حالة الطلب</CardTitle>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  رقم الطلب: #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  تاريخ الطلب: {formatDate(order.created_at)}
                </p>
              </CardHeader>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">الاسم</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium" dir="ltr">{order.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium" dir="ltr">{order.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المحافظة</p>
                    <p className="font-medium">{order.customer_city}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">العنوان التفصيلي</p>
                  <p className="font-medium">{order.customer_address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>محتويات الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>الكمية: {item.quantity}</span>
                          {item.size && <span>الحجم: {item.size}</span>}
                          {item.color && <span>اللون: {item.color}</span>}
                        </div>
                      </div>
                      <p className="font-semibold text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            {order.status === 'pending' && !success && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">تأكيد الطلب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      اضغط تأكيد للموافقة على الطلب والبدء في التحضير
                    </p>
                    <Button
                      onClick={handleConfirm}
                      disabled={actionLoading}
                      className="w-full"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          جاري التأكيد...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          تأكيد الطلب
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">إلغاء الطلب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      إذا كان هناك خطأ في الطلب أو تريد إلغاؤه
                    </p>
                    <Button
                      onClick={handleReject}
                      disabled={actionLoading}
                      variant="destructive"
                      className="w-full"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          جاري الإلغاء...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          إلغاء الطلب
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {order.status !== 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle>حالة الطلب</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <StatusIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{statusInfo.label}</p>
                    {order.status === 'confirmed' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن
                      </p>
                    )}
                    {order.status === 'shipped' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        طلبك في طريقه إليك
                      </p>
                    )}
                    {order.status === 'delivered' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        تم توصيل طلبك بنجاح
                      </p>
                    )}
                    {order.status === 'cancelled' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        تم إلغاء الطلب
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>تحتاج مساعدة؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  إذا كان لديك أي استفسارات حول طلبك
                </p>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    تواصل معنا
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    }>
      <ConfirmOrderContent />
    </Suspense>
  );
}
