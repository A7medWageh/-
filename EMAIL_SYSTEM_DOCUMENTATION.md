# 📧 نظام الإيميلات الاحترافي المتكامل

## نظرة عامة

نظام إيميلات احترافي وآمن للمتجر الإلكتروني يدير دورة حياة الطلب من التأكيد إلى التسليم مع إيميلات تنبيه تلقائية.

---

## 🎯 المميزات الرئيسية

### 1. **إيميل تأكيد الطلب الأولي**

- تفاصيل كاملة للطلب (المنتجات، الأسعار، الكميات)
- معلومات التوصيل
- **ثلاثة أزرار عملية:**
  - ✅ **تأكيد الطلب** - تحديث الحالة إلى `confirmed`
  - ✏️ **تعديل الطلب** - نقل العميل لصفحة التعديل
  - ❌ **إلغاء الطلب** - تحديث الحالة إلى `cancelled`

### 2. **إيميلات تحديث الحالة التلقائية**

عند تغيير حالة الطلب من قبل الأدمن، يتم إرسال إيميل فوري للعميل:

| الحالة           | الرمز | الرسالة                     |
| ---------------- | ----- | --------------------------- |
| Confirmed        | ✅    | تم تأكيد طلبك وجاري التحضير |
| Processing       | ⚙️    | طلبك قيد المعالجة والتحضير  |
| Shipped          | 🚚    | طلبك في الطريق إليك         |
| Out for Delivery | 📍    | طلبك وصل إلى محطة التوزيع   |
| Delivered        | 📦    | تم توصيل طلبك بنجاح         |
| Cancelled        | ❌    | تم إلغاء طلبك               |

### 3. **نظام Tokens آمن**

- توليد tokens محمية بتشفير HMAC-SHA256
- صلاحية الـ token: 24 ساعة
- التحقق من صحة البيانات والتوقيع
- منع إساءة الاستخدام

### 4. **تصميم إيميلات احترافي**

- متجاوب مع الموبايل (Responsive)
- ألوان متناسقة حسب حالة الطلب
- تصميم RTL (Right-to-Left) للعربية
- ألوان مميزة لكل حالة

---

## 🔧 المكونات التقنية

### APIs الرئيسية

#### 1. **إرسال الإيميلات** (`/api/send-email-v2`)

```typescript
POST /api/send-email-v2
Content-Type: application/json

// لإرسال إيميل تأكيد الطلب
{
  "type": "order_confirmation",
  "orderId": "uuid",
  "customerEmail": "customer@example.com",
  "customerName": "اسم العميل",
  "customerCity": "القاهرة",
  "customerAddress": "العنوان",
  "items": [
    {
      "product_name": "منتج",
      "quantity": 1,
      "size": "L",
      "color": "أحمر",
      "price": 100
    }
  ],
  "total": 100
}

// لإرسال إيميل تحديث حالة
{
  "type": "order_status_update",
  "orderId": "uuid",
  "customerEmail": "customer@example.com",
  "customerName": "اسم العميل",
  "status": "shipped" | "processing" | "confirmed" | ...
}
```

#### 2. **معالجة إجراءات الإيميل** (`/api/orders/action`)

```
GET /api/orders/action?token=xxxxx&action=confirm|cancel
```

- يتحقق من صحة الـ token
- يحدث حالة الطلب
- يرجع رسالة نجاح أو خطأ

#### 3. **تحديث حالة الطلب** (`/api/orders/[id]`)

```typescript
PATCH /api/orders/:id
Content-Type: application/json
{
  "status": "shipped|processing|confirmed|..."
}
```

---

## 🛠️ إعدادات البيئة

أضف المتغيرات التالية إلى `.env.local`:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-specific-password

# URL Base للتطبيق
NEXT_PUBLIC_APP_URL=http://localhost:3000

# مفتاح التشفير للـ tokens (يجب أن يكون 32 حرف على الأقل)
ENCRYPTION_KEY=your-secret-encryption-key-min-32-chars-long-please!

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### إعداد Gmail:

1. فعّل "2-Step Verification" في حسابك
2. انسخ "App Password" من `https://myaccount.google.com/apppasswords`
3. استخدم الـ password في `GMAIL_PASSWORD`

---

## 📤 دورة الطلب الكاملة

```
┌─────────────────────────────────────────┐
│ 1. العميل ينهي الشراء ويضع الطلب        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ 2. إرسال إيميل تأكيد الطلب               │
│    (مع 3 أزرار: تأكيد/تعديل/إلغاء)      │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    ✅ تأكيد      ❌ إلغاء
        │             │
        ▼             ▼
    Confirmed     Cancelled
        │             │
        └─────┬───────┘
              │
        ┌─────▼────────────────────┐
        │ 3. الأدمن يحدث الحالة:  │
        │ - Processing            │
        │ - Shipped               │
        │ - Out for Delivery      │
        │ - Delivered             │
        └──────────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │ 4. إرسال إيميل تحديث     │
        │    (تلقائي لكل تغيير)    │
        └──────────────────────────┘
```

---

## 📁 هيكل الملفات

```
app/
├── api/
│   ├── send-email-v2/
│   │   └── route.ts           # API الإيميلات الرئيسية
│   ├── orders/
│   │   ├── action/
│   │   │   └── route.ts       # معالجة الأزرار في الإيميل
│   │   └── [id]/
│   │       └── route.ts       # GET/PATCH لتفاصيل الطلب
│
├── (store)/
│   └── checkout/
│       └── page.tsx           # صفحة الشراء (تُرسل الإيميل)
│
├── orders/
│   └── [id]/
│       └── success/
│           └── page.tsx       # صفحة نجاح الطلب
│
├── error/
│   └── page.tsx               # صفحة الخطأ
│
lib/
├── email-tokens.ts            # توليد والتحقق من الـ tokens
└── ...

components/
├── admin/
│   └── order-status-update-v2.tsx  # مكون تحديث الحالة
└── ...
```

---

## 🔐 الأمان

### Token Security

- يتم توليد token فريد لكل إجراء
- يحتوي على timestamp وبيانات العميل
- يتم التحقق من التوقيع HMAC
- ينتهي بعد 24 ساعة
- يتم القيام بالإجراء مرة واحدة فقط

### Email Validation

- التحقق من صحة البريد الإلكتروني
- منع الأزرار المزيفة
- التوثيق عند استلام الطلب

---

## 🎨 تخصيص الإيميلات

### تغيير الألوان

في `app/api/send-email-v2/route.ts`:

```typescript
const STATUS_CONFIG = {
  shipped: {
    message: "طلبك في الطريق إليك",
    icon: "🚚",
    color: "#f59e0b", // ← غيّر اللون هنا
    description: "سيتم التواصل معك...",
  },
};
```

### إضافة شعار المتجر

في دوال الإيميل، أضف:

```html
<div class="header">
  <img
    src="https://your-domain.com/logo.png"
    alt="Logo"
    style="height: 50px; margin-bottom: 10px;"
  />
  <h1>...</h1>
</div>
```

### تخصيص الرسائل

غيّر الرسائل العربية في `STATUS_CONFIG` أو دوال الإيميل.

---

## 🐛 استكشاف الأخطاء

### الإيميل لا يُرسل

1. تحقق من بيانات Gmail في `.env.local`
2. تأكد من فعالية "App Password"
3. تحقق من console logs في خادم الـ API

### الأزرار في الإيميل لا تعمل

1. تحقق من أن `NEXT_PUBLIC_APP_URL` صحيحة
2. تحقق من صحة الـ token في الـ URL
3. تأكد من أن قاعدة البيانات محدثة

### الـ Token منتهي الصلاحية

```
الرابط غير صحيح أو منتهي الصلاحية
```

→ اطلب من العميل تأكيد الطلب من جديد من صفحة حسابه

---

## 📊 مثال على الاستخدام

### 1. عند إنهاء الشراء:

```typescript
// checkout/page.tsx
await fetch("/api/send-email-v2", {
  method: "POST",
  body: JSON.stringify({
    type: "order_confirmation",
    orderId: order.id,
    customerEmail: email,
    customerName: name,
    items: cartItems,
    total: cartTotal,
    customerCity: city,
    customerAddress: address,
  }),
});
```

### 2. عند تحديث الحالة من الأدمن:

```typescript
// component: OrderStatusUpdate
const updateStatus = async (newStatus) => {
  // تحديث في DB
  await fetch(`/api/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus }),
  });

  // إرسال إيميل
  await fetch("/api/send-email-v2", {
    method: "POST",
    body: JSON.stringify({
      type: "order_status_update",
      orderId,
      status: newStatus,
      customerEmail: email,
      customerName: name,
    }),
  });
};
```

---

## ✅ Checklist للنشر

- [ ] تعديل `ENCRYPTION_KEY` إلى قيمة آمنة في الإنتاج
- [ ] التحقق من بيانات Gmail
- [ ] تحديث `NEXT_PUBLIC_APP_URL` للـ production URL
- [ ] اختبار الإيميلات الكاملة
- [ ] اختبار أزرار الإيميل على أجهزة مختلفة
- [ ] إضافة شعار الشركة
- [ ] تخصيص الألوان والرسائل
- [ ] اختبار على Gmail و Outlook و Apple Mail

---

## 📞 الدعم والمساعدة

للمزيد من المعلومات أو الدعم الفني، تواصل مع فريق الدعم.

---

**تم إنشاؤه بواسطة GitHub Copilot**
**آخر تحديث: مارس 2026**
