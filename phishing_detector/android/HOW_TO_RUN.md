# تشغيل تطبيق الأندرويد في Android Studio — خطوة بخطوة

## المشروع
`phishing_detector/android/PhishGuard`  (المجلد الذي يحتوي `settings.gradle.kts`)

---

## ١) فتح المشروع
1. افتحي **Android Studio**.
2. اضغطي **Open** (ليس New Project).
3. اختاري مجلد **`PhishGuard`** ثم **OK**.

## ٢) مزامنة Gradle (أول مرة فقط، تحتاج إنترنت)
- يبدأ **Gradle Sync** تلقائياً وينزّل أدوات Android SDK.
- إن ظهر **Accept licenses** → اقبليها.
- إن ظهر **Upgrade Android Gradle Plugin** → **Upgrade** أو **Do it later** (كلاهما يعمل).
- انتظري حتى ينتهي (قد يستغرق ٥–١٠ دقائق أول مرة).

## ٣) التشغيل

### أ) على محاكٍ أو جوال حقيقي (لرؤيته يعمل)
1. فوق، اختاري جهازاً (محاكٍ، أو جوالك عبر USB مع تفعيل **USB debugging**).
2. اضغطي الزر الأخضر **▶ Run**  (أو `Shift + F10`).

### ب) إنتاج ملف APK (للقرص / للأستاذ)
1. من القائمة: **Build ▸ Build App Bundle(s) / APK(s) ▸ Build APK(s)**.
2. عند الانتهاء اضغطي **locate** للوصول إلى:
```
PhishGuard/app/build/outputs/apk/debug/app-debug.apk
```
3. انسخي `app-debug.apk` على القرص. على الجوال فعّلي «تثبيت من مصادر غير معروفة» ثم ثبّتيه.

### أو من الطرفية (Terminal)
داخل مجلد `PhishGuard`:
```bash
./gradlew assembleDebug
```

---

## حلّ المشاكل الشائعة
- **"SDK location not found"**: Android Studio ينشئ `local.properties` تلقائياً. إن لم يحدث، أنشئيه داخل `PhishGuard` بسطر واحد يشير لمسار SDK عندك، مثل:
  `sdk.dir=C\:\\Users\\<اسمك>\\AppData\\Local\\Android\\Sdk`
- **"Gradle sync failed" بسبب الإصدار**: اقبلي اقتراح Android Studio بترقية Gradle/AGP.
- **لا يظهر جهاز**: أنشئي محاكياً من **Device Manager ▸ Create Device**.

## مواصفات المشروع
- الحد الأدنى: أندرويد 8.0 (API 26) — **بدون أي صلاحيات، بدون إنترنت**.
- منطق الكشف كامل داخل `app/src/main/assets/` (الواجهة + النموذج).
