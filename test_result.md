#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  تطبيق متجر Drop Shipping للموبايل - إصلاح نظام الطلبات (Orders) والدفع (Checkout)
  
  المشاكل المطلوب إصلاحها:
  1. زر "إتمام الطلب" لا يعمل في صفحة السلة (Cart)
  2. التحقق من صحة النموذج غير متطابق مع المتطلبات:
     - الحقول الإلزامية: المحافظة (city) والمنطقة (region) ورقم الهاتف الأول
     - الحقول الاختيارية: الاسم، رقم الهاتف الثاني، أقرب نقطة دالة، الملاحظات
  3. دمج مكون IraqiPhoneInput في نموذج معلومات العميل
  4. إصلاح عرض الطلبات في صفحة Orders عند التصفية حسب الحالة

frontend:
  - task: "IraqiPhoneInput Component Integration"
    implemented: true
    working: "pending_test"
    file: "frontend/components/IraqiPhoneInput.tsx, frontend/components/ShippingForm.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "pending_test"
        agent: "main"
        comment: |
          ✅ تم إنشاء مكون IraqiPhoneInput لإدخال أرقام الهواتف العراقية بصيغة صحيحة (+964)
          ✅ تم دمج المكون في ShippingForm لكل من الهاتف الأول والثاني
          ✅ يتم التحقق من أن الرقم يبدأ بـ 7 ويتكون من 10 أرقام
          ✅ عرض رسالة مساعدة عند الإدخال الخاطئ

  - task: "Shipping Form Validation - Labels Update"
    implemented: true
    working: "pending_test"
    file: "frontend/components/ShippingForm.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "pending_test"
        agent: "main"
        comment: |
          ✅ تم تحديث تسميات الحقول لتتطابق مع منطق التحقق:
             - الحقول الإلزامية (*): المحافظة، المنطقة، رقم الهاتف الأول
             - الحقول الاختيارية: الاسم، رقم الهاتف الثاني، أقرب نقطة دالة، الملاحظات

  - task: "Cart Form Validation Logic"
    implemented: true
    working: "pending_test"
    file: "frontend/app/cart.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "pending_test"
        agent: "main"
        comment: |
          ✅ تم تحديث منطق التحقق من صحة النموذج (validateForm):
             - phone1: إلزامي + التحقق من الصيغة العراقية (+9647XXXXXXXXX)
             - phone2: اختياري + التحقق من الصيغة إذا تم إدخاله
             - city: إلزامي
             - area: إلزامي
             - customerName, landmark, notes: اختيارية
          ✅ إضافة رسائل خطأ واضحة بالعربية

  - task: "Complete Order Button - Order Creation"
    implemented: true
    working: "pending_test"
    file: "frontend/app/cart.tsx, frontend/hooks/useOrders.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "pending_test"
        agent: "main"
        comment: |
          ✅ منطق إنشاء الطلب موجود ويحتوي على:
             - التحقق من صحة النموذج
             - إنشاء رقم طلب تلقائي من counter
             - حفظ جميع تفاصيل الطلب في Firestore
             - مسح السلة بعد النجاح
             - عرض رسالة نجاح مع تفاصيل الطلب
          ⚠️ يحتاج لاختبار فعلي للتأكد من عمله بشكل صحيح

  - task: "Orders List - Filter by Status"
    implemented: true
    working: "pending_test"
    file: "frontend/hooks/useOrders.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "pending_test"
        agent: "main"
        comment: |
          ✅ تم إصلاح منطق بناء الـ query في useOrders:
             - الآن يتم بناء query واحد صحيح بدلاً من محاولة تعديل query موجود
             - عند التصفية: query مع where + orderBy
             - بدون تصفية: query مع orderBy فقط
          ✅ يجب أن تعمل التصفية حسب الحالة الآن

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: true

test_plan:
  current_focus:
    - "Advanced Product Variants - Color Selection with Images"
    - "Advanced Product Variants - Nested Size Options"
    - "Dynamic Price and Stock Updates"
    - "Firebase Data Parsing - variantSchema"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      تم إكمال تطوير نظام اختيار المتغيرات المعقدة في صفحة تفاصيل المنتج.
      
      التحديثات المنفذة:
      1. ✅ تحسين parseVariants في [id].tsx لمعالجة البيانات المتداخلة
      2. ✅ إضافة أنماط للألوان مع صور بحجم 100x100
      3. ✅ تحديث سعر الجملة ديناميكياً حسب الاختيار
      4. ✅ تحديث الكمية المتوفرة ديناميكياً
      5. ✅ إضافة console.log للتصحيح
      6. ✅ دعم الأسماء المترجمة (ar/en/ku)
      
      يرجى الاختبار في Expo Go:
      - فتح صفحة منتج له variants
      - اختيار لون (يجب أن يظهر صورة واضحة)
      - التحقق من ظهور المقاسات
      - اختيار مقاس والتحقق من تحديث السعر والكمية
      - محاولة الإضافة للسلة بدون اختيار (يجب ظهور تنبيه)