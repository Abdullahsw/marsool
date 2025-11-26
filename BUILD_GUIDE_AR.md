# 📱 دليل بناء تطبيق مرسول (APK & IPA)

## ✅ الإعدادات المكتملة

### 1. الصور والأيقونات
- ✅ **icon.png** - أيقونة التطبيق الرئيسية (1024x1024)
- ✅ **adaptive-icon.png** - أيقونة Android التكيفية
- ✅ **splash-icon.png** - شعار شاشة التحميل
- ✅ **favicon.png** - أيقونة الويب

### 2. إعدادات app.json
- ✅ اسم التطبيق: "مرسول"
- ✅ Bundle Identifier (iOS): `com.marsooliq.app`
- ✅ Package Name (Android): `com.marsooliq.app`
- ✅ Version: 1.0.0
- ✅ Firebase Integration: ✅
- ✅ Permissions: Camera, Storage, Internet

### 3. الأنظمة المدعومة
- ✅ Android (الهواتف والتابلت)
- ✅ iOS (iPhone و iPad)
- ✅ التوافق مع جميع أحجام الشاشات

---

## 📋 طرق البناء

### الطريقة 1: بناء APK محلي (للتجربة السريعة)

#### الخطوات:
```bash
cd /app/frontend

# 1. تثبيت expo-dev-client إذا لم يكن مثبتاً
yarn add expo-dev-client

# 2. بناء APK للتطوير
npx expo run:android --variant release

# أو بناء APK باستخدام eas build (محلياً)
npx eas-cli build --platform android --profile preview --local
```

**الملف الناتج:** `android/app/build/outputs/apk/release/app-release.apk`

---

### الطريقة 2: بناء عبر EAS Build (موصى به)

#### المتطلبات:
1. حساب Expo (مجاني)
2. تسجيل الدخول عبر Expo CLI

#### الخطوات:

```bash
cd /app/frontend

# 1. تثبيت EAS CLI
npm install -g eas-cli

# 2. تسجيل الدخول
eas login

# 3. ربط المشروع
eas build:configure

# 4. بناء APK للأندرويد
eas build --platform android --profile preview

# 5. بناء IPA لـ iOS (يتطلب حساب Apple Developer)
eas build --platform ios --profile preview
```

**النتيجة:**
- سيتم رفع الكود إلى سيرفرات Expo
- بناء التطبيق سحابياً
- رابط تحميل APK/IPA جاهز خلال 10-15 دقيقة

---

### الطريقة 3: بناء Production كامل

```bash
# للأندرويد (AAB - Play Store)
eas build --platform android --profile production

# لـ iOS (IPA - App Store)
eas build --platform ios --profile production
```

---

## 🔧 إعدادات إضافية مهمة

### تحديث Firebase URLs
تأكد من تحديث URLs في ملف `.env`:

```env
# ملف frontend/.env
EXPO_PUBLIC_BACKEND_URL=https://your-production-backend-url.com
```

### تحديث Google Services
1. **Android:** تأكد من وجود `google-services.json` الصحيح
2. **iOS:** تأكد من وجود `GoogleService-Info.plist` الصحيح

---

## 📦 بعد البناء

### تثبيت APK على Android:
1. انقل ملف `.apk` إلى هاتفك
2. قم بتفعيل "التثبيت من مصادر غير معروفة"
3. انقر على الملف لتثبيته

### تثبيت IPA على iOS:
- يتطلب:
  - حساب Apple Developer (مدفوع)
  - شهادة Provisioning Profile
  - أو استخدام TestFlight للتوزيع

---

## 🐛 حل المشاكل الشائعة

### مشكلة: "Gradle build failed"
**الحل:**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android --variant release
```

### مشكلة: "Metro bundler error"
**الحل:**
```bash
# مسح Cache
yarn start --clear
# أو
npx expo start -c
```

### مشكلة: "Firebase not initialized"
**الحل:**
- تأكد من وجود `google-services.json` و `GoogleService-Info.plist`
- تأكد من صحة Firebase config في `frontend/config/firebase.ts`

---

## 📱 اختبار التطبيق

### على Expo Go (للتطوير):
```bash
cd /app/frontend
npx expo start
```
ثم امسح QR code من هاتفك

### على جهاز حقيقي (APK):
1. قم ببناء APK
2. ثبته على هاتفك
3. افتح التطبيق واختبر جميع الميزات

---

## 📊 معلومات البناء الحالية

- **اسم التطبيق:** مرسول
- **النسخة:** 1.0.0
- **Build Number (Android):** 1
- **Bundle ID:** com.marsooliq.app
- **Min SDK (Android):** 21
- **Target SDK (Android):** 34
- **iOS Deployment Target:** 13.4

---

## 🎨 الصور المطلوبة (المقاسات القياسية)

### تم التحقق منها:
- ✅ Icon: 1024x1024px
- ✅ Adaptive Icon: 1024x1024px
- ✅ Splash Screen: 1242x2436px
- ✅ Favicon: 48x48px

---

## 🚀 الخطوة التالية

لبناء APK الآن، نفذ:

```bash
cd /app/frontend
eas login
eas build --platform android --profile preview
```

سيُطلب منك:
1. تسجيل الدخول بحساب Expo
2. اختيار Project ID
3. الانتظار 10-15 دقيقة

ستحصل على رابط تحميل مباشر للـ APK!

---

## 📞 المساعدة

إذا واجهت أي مشكلة:
1. تحقق من logs: `npx expo start`
2. تحقق من Firebase config
3. تأكد من صحة package names في app.json

**ملاحظة مهمة:** 
- APK: للتوزيع المباشر والتجربة
- AAB: للنشر على Google Play Store
- IPA: للنشر على App Store
