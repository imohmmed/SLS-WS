# ربط ورشة سلس بـ Google Sheets بدون Replit

يتلقى `server.mjs` التسجيلات على الـVPS، ثم يرسلها إلى Apps Script. Apps Script يكتبها في تبويب `التسجيلات` داخل الشيت؛ لا يوضع أي مفتاح Google في متصفح الزائر.

## إعداد Apps Script

1. افتح [script.google.com](https://script.google.com) بحساب Google الذي يملك الشيت، وأنشئ مشروعاً جديداً.
2. استبدل محتوى `Code.gs` بالكود الموجود في هذا المجلد واحفظه.
3. افتح **Project Settings** ثم **Script properties**، وأضف:
   - Property: `WORKSHOP_SHARED_SECRET`
   - Value: السر الموجود في `/etc/sls-workshop-api.env` على الـVPS. اعرضه محلياً من جهازك بأمر SSH، ولا تلصقه في هذه المحادثة.
4. شغّل `authorizeSheetAccess` مرة واحدة من المحرر ووافق على صلاحية الوصول إلى Google Sheets.
5. من **Deploy → New deployment → Web app** اختر:
   - **Execute as:** حسابك
   - **Who has access:** Anyone
6. أكمل النشر وانسخ رابط الويب الذي ينتهي بـ`/exec`. أرسل الرابط فقط؛ لا ترسل السر.

إذا لم يظهر خيار **Anyone** في حسابك، لا تنشره للعامة ولا تشارك بيانات دخولك؛ أخبرني لنستخدم إعداداً بديلاً.

## بيئة الـVPS

يقرأ الخادم:

- `APPS_SCRIPT_URL`: رابط Apps Script المنشور الذي ينتهي بـ`/exec`
- `APPS_SCRIPT_SECRET`: نفس قيمة `WORKSHOP_SHARED_SECRET`
- `PORT`: المنفذ المحلي، `8081` افتراضياً

## مسار الفورمة

بعد إعداد الواجهة على `https://sls-iq.com/workshop-api`:

- فحص الصحة: `GET /workshop-api/api/healthz`
- إرسال التسجيل: `POST /workshop-api/api/registrations`
- يضيف Apps Script عموداً مستقلاً باسم `نوع الاشتراك` في العمود I، مع بقاء الأعمدة الحالية A:H كما هي.
- بعد تحديث `Code.gs`، عدّل النشر الحالي إلى إصدار جديد من **Deploy → Manage deployments** حتى يبدأ حفظ الخيار في العمود I.

