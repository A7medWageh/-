# ✉️ متطلبات إعداد نظام البريد الإلكتروني

لتفعيل إرسال رسائل البريد الإلكتروني عند تأكيد الأوردرز، تحتاج إلى إضافة:

## 1. المكتبات المطلوبة

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

## 2. متغيرات البيئة في `.env.local`

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-specific-password

# Base URL for API calls
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 3. إعداد Gmail

للحصول على كلمة مرور التطبيق:

1. تفعيل المصادقة الثنائية على حسابك
2. الذهاب إلى [App Passwords](https://myaccount.google.com/apppasswords)
3. اختيار "Mail" و "Windows Computer"
4. نسخ كلمة المرور وحفظها في `.env.local`

## 4. إضافة الحقل للجدول

قم بتشغيل هذا الـ SQL في Supabase:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
```

## 5. الآن عند تغيير حالة الأوردر إلى "مؤكد":

- ✅ يتم تحديث الحالة في قاعدة البيانات
- ✅ يتم إرسال بريد تأكيد مفصّل للعميل بمحتويات الطلب
- ✅ يظهر إشعار على صفحة الأدمن بنجاح الإرسال

## 📋 محتوى البريد يتضمن:

- رقم الطلب وتاريخ الأمر
- قائمة المنتجات (اسم، كمية، حجم، لون، سعر)
- الإجمالي
- معلومات التوصيل
