@echo off
echo ============================================
echo   بناء APK لتطبيق مرسول - تلقائي
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [خطأ] Node.js غير مثبت!
    echo يرجى تثبيت Node.js من: https://nodejs.org
    pause
    exit /b 1
)

echo [✓] Node.js مثبت
echo.

:: Navigate to frontend directory
cd /d "%~dp0frontend"
if %errorlevel% neq 0 (
    echo [خطأ] لم يتم العثور على مجلد frontend
    pause
    exit /b 1
)

echo [1/5] تثبيت EAS CLI...
call npm install -g eas-cli
if %errorlevel% neq 0 (
    echo [خطأ] فشل تثبيت EAS CLI
    pause
    exit /b 1
)
echo [✓] تم تثبيت EAS CLI
echo.

echo [2/5] تسجيل الدخول إلى Expo...
echo البريد الإلكتروني: ryyyjk@gmail.com
echo.
set /p "dummy=اضغط Enter للمتابعة..."
call eas login -u ryyyjk@gmail.com -p Abdullah2001@
if %errorlevel% neq 0 (
    echo [تنبيه] فشل تسجيل الدخول التلقائي
    echo يرجى تسجيل الدخول يدوياً:
    call eas login
)
echo [✓] تم تسجيل الدخول
echo.

echo [3/5] ربط المشروع...
call eas project:init
echo [✓] تم ربط المشروع
echo.

echo [4/5] تهيئة البناء...
call eas build:configure
echo [✓] تم تهيئة البناء
echo.

echo [5/5] بدء بناء APK...
echo هذه الخطوة ستستغرق 15-20 دقيقة...
echo.
call eas build --platform android --profile preview
echo.

if %errorlevel% equ 0 (
    echo ============================================
    echo   [✓] تم بناء APK بنجاح!
    echo ============================================
    echo.
    echo ستجد رابط التحميل في الأعلى
    echo أو في لوحة التحكم: https://expo.dev
) else (
    echo ============================================
    echo   [×] فشل البناء
    echo ============================================
    echo.
    echo يرجى التحقق من الأخطاء في الأعلى
)

echo.
pause
