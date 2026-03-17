# 🚀 دليل البدء السريع - نظام الإيميلات

## 1️⃣ التثبيت والإعداد

### تثبيت المكتبات المطلوبة

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### إعداد متغيرات البيئة

افتح `.env.local` وأضف:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Token Encryption
ENCRYPTION_KEY=your-secret-key-min-32-chars-please
```

### الحصول على Gmail App Password:

1. افتح: https://myaccount.google.com/apppasswords
2. اختر "Mail" و "Windows Computer"
3. انسخ الـ 16 حرف password
4. ألصقها في `GMAIL_PASSWORD`

---

## 2️⃣ الملفات الرئيسية المُنشأة

| الملف                                         | الوصف                       |
| --------------------------------------------- | --------------------------- |
| `lib/email-tokens.ts`                         | توليد والتحقق من الـ tokens |
| `app/api/send-email-v2/route.ts`              | API الإيميلات الرئيسية      |
| `app/api/orders/action/route.ts`              | معالجة أزرار الإيميل        |
| `components/admin/order-status-update-v2.tsx` | مكون تحديث الحالة           |
| `app/orders/[id]/success/page.tsx`            | صفحة النجاح                 |
| `app/error/page.tsx`                          | صفحة الخطأ                  |

---

## 3️⃣ اختبار النظام

### الخطوة 1: تشغيل الخادم

```bash
npm run dev
```

### الخطوة 2: إنشاء طلب تجريبي

1. افتح: http://localhost:3000
2. أكمل عملية الشراء
3. قم بملء بيانات الطلب (الأهم: البريد الإلكتروني)
4. اضغط "إتمام الطلب"

### الخطوة 3: تحقق من البريد الإلكتروني

- تفقد بريد الإيميل (تحقق من Spam أيضاً)
- يجب أن تجد إيميل تأكيد الطلب
- اختبر الأزرار الثلاثة:
  - ✅ تأكيد الطلب
  - ✏️ تعديل الطلب
  - ❌ إلغاء الطلب

### الخطوة 4: اختبر تحديث الحالة من الأدمن

1. روح لـ: http://localhost:3000/admin/orders
2. اختر طلب
3. غيّر الحالة من قائمة "Confirmed" إلى "Shipped"
4. يجب أن تصل رسالة إيميل للعميل فوراً

---

## 4️⃣ دورة الإيميلات الكاملة

```
┌─────────────────────────────────────────────┐
│ العميل ينهي الشراء                          │
└──────────────┬──────────────────────────────┘
               │
               ▼
    📧 إيميل تأكيد الطلب يُرسل
       (مع 3 أزرار تفاعلية)
       ├─ ✅ تأكيد
       ├─ ✏️ تعديل
       └─ ❌ إلغاء
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    Confirmed    Cancelled
        │
        ▼
    الأدمن يحدث الحالة
    ├─ Processing
    ├─ Shipped
    ├─ Out for Delivery
    └─ Delivered
        │
        ▼
    📧 إيميل تحديث يُرسل
       (تلقائياً بحسب الحالة)
```

---

## 5️⃣ تخصيص الإيميلات

### تغيير الألوان

**الملف:** `app/api/send-email-v2/route.ts`

```typescript
const STATUS_CONFIG = {
  confirmed: {
    message: "تم تأكيد طلبك",
    color: "#3b82f6", // ← غيّر اللون (كود hex)
    // ...
  },
};
```

### تغيير الرسائل

```typescript
confirm: {
  message: 'تم تأكيد طلبك ✓',  // ← غيّر الرسالة
  icon: '✅',                // ← غيّر الرمز
  color: '#10b981',
  description: 'سيتم...'     // ← غيّر الوصف
}
```

### إضافة شعار الشركة

في دالة `getOrderConfirmationEmail`:

```html
<div class="header">
  <img
    src="https://your-domain.com/logo.png"
    alt="Logo"
    style="height: 60px; margin-bottom: 15px;"
  />
  <h1>تأكيد الطلب</h1>
</div>
```

---

## 6️⃣ استكشاف الأخطاء

### ❌ الإيميل لا يصل

**الحل:**

1. تحقق من console logs:

   ```bash
   # شغّل الخادم بـ verbose mode
   npm run dev -- --debug
   ```

2. تأكد من بيانات Gmail في `.env.local`

3. اختبر الإرسال يدوياً:
   ```bash
   curl -X POST http://localhost:3000/api/send-email-v2 \
     -H "Content-Type: application/json" \
     -d '{
       "type": "order_confirmation",
       "orderId": "test-id",
       "customerEmail": "your-email@gmail.com",
       "customerName": "Test Name",
       "customerCity": "Cairo",
       "customerAddress": "Test Address",
       "items": [{"product_name": "Test", "price": 100, "quantity": 1}],
       "total": 100
     }'
   ```

### ❌ أزرار الإيميل لا تعمل

**الحل:**

1. تحقق من أن `NEXT_PUBLIC_APP_URL` صحيحة
2. انسخ الـ token من الأيميل واختبره يدوياً:
   ```
   http://localhost:3000/api/orders/action?token=YOUR_TOKEN&action=confirm
   ```

### ❌ Token منتهي الصلاحية

**الحل:**

- الـ tokens تنتهي بعد 24 ساعة
- اطلب من العميل إعادة الطلب أو التأكيد من لوحة الحساب

---

## 7️⃣ API Reference

### إرسال إيميل تأكيد

```bash
POST /api/send-email-v2
Content-Type: application/json

{
  "type": "order_confirmation",
  "orderId": "uuid-123",
  "customerEmail": "user@gmail.com",
  "customerName": "أحمد",
  "customerCity": "Cairo",
  "customerAddress": "123 Street",
  "items": [
    {
      "product_name": "Phone",
      "quantity": 2,
      "size": "L",
      "color": "Red",
      "price": 99.99
    }
  ],
  "total": 199.98
}
```

### إرسال إيميل تحديث حالة

```bash
POST /api/send-email-v2
Content-Type: application/json

{
  "type": "order_status_update",
  "orderId": "uuid-123",
  "customerEmail": "user@gmail.com",
  "customerName": "أحمد",
  "status": "shipped"
}
```

### معالجة إجراء من الإيميل

```bash
GET /api/orders/action?token=TOKEN&action=confirm
```

### تحديث حالة الطلب

```bash
PATCH /api/orders/:id
Content-Type: application/json

{
  "status": "processing"
}
```

---

## 8️⃣ أفضل الممارسات

✅ **افعل:**

- استخدم Gmail مع App Password (ليس الكلمة الرئيسية)
- احفظ `ENCRYPTION_KEY` آمنة على السيرفر
- اختبر الإيميلات على أجهزة مختلفة
- راجع Spam folder عند الاختبار

❌ **لا تفعل:**

- لا تشاركِ `ENCRYPTION_KEY` مع أحد
- لا تستخدم Gmail password مباشرة
- لا تخزّن tokens في localStorage
- لا تعديل tokens في الـ URL

---

## 9️⃣ الخطوات التالية

### 🔄 Improvements المستقبلية

- [ ] إضافة SMS notifications
- [ ] إضافة Push notifications
- [ ] إضافة WhatsApp notifications
- [ ] تسجيل محاولات الإجراءات المشبوهة
- [ ] لوحة تحكم لسجل الإيميلات
- [ ] إعادة محاولة تلقائية للإيميلات الفاشلة

### 📊 Monitoring

- رصد الإيميلات المفتوحة
- تتبع معدل النقر (Click Rate)
- تتبع الإيميلات المرتدة (Bounced)

---

## 🆘 الدعم

إذا واجهت مشكلة:

1. تحقق من [دليل كامل الإيميلات](./EMAIL_SYSTEM_DOCUMENTATION.md)
2. راجع console logs للأخطاء
3. اختبر الـ APIs يدوياً
4. تواصل مع فريق الدعم

---

**آخر تحديث:** مارس 2026 ✨
