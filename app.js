// ================================================================
// app.js - Pharmacy Management System v3.0 FINAL
// Designed by Ahmed Hassan | WhatsApp: +249125000574
// Features: Barcode, Refund System, IndexedDB, PWA
// Security: Password Hashing, Admin Protection
// i18n: Arabic/English Support with RTL/LTR
// UI: Modern 2026 Design with Animations
// ================================================================

// ================================================================
// Constants & Configuration
// ================================================================
const DB_NAME = 'pharmacyDB';
const DB_VERSION = 4;
const BACKUP_KEY = 'pharmacy_backup_';

// ================================================================
// Password Hashing Utility (SHA-256)
// ================================================================
async function hashPassword(password) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
    // Fallback for older browsers
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'FALLBACK_' + Math.abs(hash).toString(16) + '_' + btoa(password).slice(0, 20);
}

// ================================================================
// Internationalization (i18n) System
// ================================================================
const translations = {
    ar: {
        // General
        'app_name': 'صيدلية الشفاء',
        'loading': 'جاري التحميل...',
        'save': 'حفظ',
        'cancel': 'إلغاء',
        'delete': 'حذف',
        'edit': 'تعديل',
        'close': 'إغلاق',
        'confirm': 'تأكيد',
        'search': 'بحث',
        'filter': 'فلتر',
        'reset': 'إعادة تعيين',
        'export': 'تصدير',
        'import': 'استيراد',
        'print': 'طباعة',
        'refresh': 'تحديث',
        'update': 'تحديث',
        'install': 'تثبيت',
        'menu': 'القائمة',
        
        // Login
        'login_title': 'نظام إدارة الصيدليات المتكامل',
        'username': 'اسم المستخدم',
        'password': 'كلمة المرور',
        'user_role': 'نوع المستخدم',
        'login_button': 'تسجيل الدخول',
        'login_error': 'اسم المستخدم أو كلمة المرور غير صحيحة',
        'demo_credentials': 'بيانات تجريبية للدخول:',
        'admin_credentials': '👤 مدير: Pharmacy / Ahmed0125#',
        'welcome': 'مرحباً',
        
        // Navigation
        'dashboard': 'لوحة التحكم',
        'pos': 'نقطة البيع',
        'medicines': 'إدارة الأدوية',
        'inventory': 'تتبع المخزون',
        'suppliers': 'الموردين',
        'customers': 'العملاء',
        'sales': 'سجل المبيعات',
        'reports': 'التقارير',
        'settings': 'الإعدادات',
        'logout': 'تسجيل الخروج',
        'language': 'اللغة',
        
        // Dashboard
        'total_medicines': 'إجمالي الأدوية',
        'inventory_value': 'قيمة المخزون',
        'today_sales': 'مبيعات اليوم',
        'net_profit': 'الربح الصافي',
        'returns': 'المرتجعات',
        'low_stock': 'مخزون منخفض',
        'out_of_stock': 'نفذ من المخزون',
        'expiring_soon': 'قاربة الانتهاء',
        'expired': 'منتهية الصلاحية',
        'sales_analytics': 'تحليلات المبيعات',
        'important_alerts': 'تنبيهات هامة',
        'recent_activities': 'آخر العمليات',
        'all_good': 'جميع الأدوية بحالة جيدة',
        'alert_days': 'خلال',
        'days_remaining': 'يوم',
        
        // POS
        'available_medicines': 'الأدوية المتوفرة',
        'scan_barcode': 'مسح الباركود...',
        'search_medicine': 'بحث عن دواء...',
        'shopping_cart': 'سلة المشتريات',
        'clear_cart': 'مسح السلة',
        'cart_empty': 'السلة فارغة',
        'items_count': 'عدد الأصناف',
        'subtotal': 'الإجمالي الفرعي',
        'discount': 'الخصم',
        'total': 'الإجمالي النهائي',
        'expected_profit': 'الربح المتوقع',
        'customer': 'العميل',
        'cash_customer': 'نقدي (بدون عميل)',
        'payment_method': 'طريقة الدفع',
        'cash': 'نقداً',
        'bank_transfer': 'تحويل بنكي',
        'debt': 'دين',
        'paid_amount': 'المبلغ المدفوع',
        'due_date': 'تاريخ الاستحقاق',
        'remaining': 'المتبقي',
        'checkout': 'إتمام البيع',
        'add_to_cart': 'أضف للسلة',
        'manufacturer': 'الشركة المصنعة',
        'stock': 'المخزون',
        'low_stock_warning': 'مخزون منخفض',
        'reference': 'رقم الإحالة',
        
        // Medicines
        'add_medicine': 'إضافة دواء جديد',
        'edit_medicine': 'تعديل دواء',
        'scientific_name': 'الاسم العلمي',
        'trade_name': 'الاسم التجاري',
        'barcode': 'الباركود',
        'generate_barcode': 'توليد باركود',
        'category': 'التصنيف',
        'custom_category': 'تصنيف مخصص',
        'custom_category_hint': 'سيتم إضافة هذا التصنيف تلقائياً إلى قائمة التصنيفات',
        'batch_number': 'رقم التشغيلة',
        'purchase_price': 'سعر الشراء',
        'selling_price': 'سعر البيع',
        'quantity': 'الكمية',
        'min_stock': 'حد التنبيه',
        'production_date': 'تاريخ الإنتاج',
        'expiry_date': 'تاريخ الانتهاء',
        'description': 'الوصف',
        'status': 'الحالة',
        'in_stock': 'متوفر',
        'all_categories': 'جميع التصنيفات',
        'select_supplier': '-- اختر المورد --',
        'actions': 'إجراءات',
        'current': 'الحالي',
        'enter_new_quantity': 'أدخل الكمية الجديدة',
        'manual_update': 'تحديث يدوي',
        
        // Inventory
        'inventory_tracking': 'تتبع المخزون',
        'stock_value': 'قيمة المخزون',
        'stock_cost': 'تكلفة المخزون',
        'movement_log': 'سجل الحركة',
        'bulk_update': 'تحديث المخزون للمحدد',
        'adjust_min_stock': 'تعديل الحد الأدنى',
        'reset_inventory': 'مسح المخزون',
        'select_all': 'تحديد الكل',
        'items_selected': 'تم تحديد',
        'and_more': 'و',
        'select_items': 'يرجى تحديد عناصر',
        'no_changes': 'لا توجد تغييرات',
        'set_new_quantity': 'تحديد كمية جديدة',
        'add_quantity': 'إضافة للكمية',
        'subtract_quantity': 'طرح من الكمية',
        'type': 'النوع',
        'balance': 'الرصيد',
        'notes': 'ملاحظات',
        'user': 'المستخدم',
        'update_inventory': 'تحديث المخزون',
        
        // Suppliers
        'supplier_management': 'إدارة الموردين',
        'add_supplier': 'إضافة مورد جديد',
        'edit_supplier': 'تعديل مورد',
        'delete_supplier': 'حذف مورد',
        'company_name': 'اسم الشركة',
        'contact_person': 'اسم المندوب',
        'phone': 'رقم الهاتف',
        'email': 'البريد الإلكتروني',
        'address': 'العنوان',
        'related_medicines': 'الأدوية المرتبطة',
        'no_suppliers': 'لا يوجد موردين',
        'confirm_delete_related': 'المورد مرتبط بـ',
        
        // Customers
        'customer_management': 'إدارة العملاء',
        'add_customer': 'إضافة عميل جديد',
        'edit_customer': 'تعديل عميل',
        'delete_customer': 'حذف عميل',
        'customer_name': 'اسم العميل',
        'join_date': 'تاريخ الانضمام',
        'total_debts': 'إجمالي الديون',
        'no_customers': 'لا يوجد عملاء',
        'confirm_delete_with_debt': 'العميل عليه ديون. متأكد من حذفه',
        
        // Sales
        'sales_record': 'سجل المبيعات',
        'invoice_number': 'رقم الفاتورة',
        'date': 'التاريخ',
        'from_date': 'من تاريخ',
        'to_date': 'إلى تاريخ',
        'items_count_sold': 'عدد الأصناف',
        'paid': 'المدفوع',
        'remaining_debt': 'المتبقي',
        'refund_amount': 'المرتجعات',
        'view_invoice': 'عرض الفاتورة',
        'process_refund': 'مرتجع',
        'refund_reason': 'سبب الإرجاع',
        'damaged': 'تالف',
        'confirm_refund': 'تأكيد المرتجع',
        'no_invoices': 'لا توجد فواتير',
        'total_sales': 'إجمالي المبيعات',
        'invoices': 'عدد الفواتير',
        'profit_loss': 'خسارة ربح',
        'quantity_sold': 'الكمية المباعة',
        'refund_quantity': 'كمية الإرجاع',
        'no_items_selected': 'لم يتم تحديد أي أصناف للإرجاع',
        'gross_profit': 'إجمالي الربح',
        'already_refunded': 'تم استرجاع هذه الفاتورة بالكامل',
        'items_returned': 'أصناف مرتجعة',
        'medicine': 'الدواء',
        'price': 'السعر',
        
        // Reports
        'reports_statistics': 'التقارير والإحصائيات',
        'sales_report': 'تقرير المبيعات',
        'inventory_report': 'تقرير المخزون',
        'profit_report': 'تقرير الأرباح',
        'top_products': 'الأكثر مبيعاً',
        'expiry_report': 'تقرير الصلاحية',
        'total_revenue': 'إجمالي الإيرادات',
        'total_cost': 'تكلفة المبيعات',
        'gross_profit': 'إجمالي الربح',
        'net_profit_report': 'صافي الربح',
        'expenses': 'المصروفات',
        'returns_profit_loss': 'المرتجعات (خسارة ربح)',
        'pdf_export': 'PDF',
        'excel_export': 'Excel',
        'quick_view': 'عرض سريع',
        'today': 'اليوم',
        'yesterday': 'أمس',
        'this_week': 'هذا الأسبوع',
        'this_month': 'هذا الشهر',
        'last_month': 'الشهر الماضي',
        'this_year': 'هذه السنة',
        'all': 'كل الفترة',
        'distribution': 'التوزيع',
        'total_quantity': 'الكمية الإجمالية',
        'revenue': 'الإيراد',
        'value': 'القيمة',
        'no_expiry_issues': 'لا توجد مشاكل صلاحية',
        'pdf_error': 'خطأ في تصدير PDF',
        
        // Settings
        'system_settings': 'إعدادات النظام',
        'pharmacy_info': 'معلومات الصيدلية',
        'pharmacy_name': 'اسم الصيدلية',
        'license_number': 'رقم الترخيص',
        'general_settings': 'الإعدادات العامة',
        'currency': 'العملة',
        'alert_days_setting': 'أيام التنبيه',
        'enable_low_stock_alerts': 'تفعيل تنبيهات المخزون',
        'enable_expiry_alerts': 'تفعيل تنبيهات الصلاحية',
        'enable_auto_backup': 'تفعيل النسخ الاحتياطي التلقائي',
        'user_management': 'إدارة المستخدمين',
        'add_user': 'إضافة مستخدم',
        'edit_user': 'تعديل مستخدم',
        'full_name': 'الاسم الكامل',
        'role': 'الدور',
        'admin': 'مدير',
        'pharmacist': 'صيدلي',
        'staff': 'موظف',
        'account_status': 'حالة الحساب',
        'active': 'نشط',
        'inactive': 'غير نشط',
        'change_password': 'تغيير كلمة المرور',
        'current_password': 'كلمة المرور الحالية',
        'new_password': 'كلمة المرور الجديدة',
        'confirm_password': 'تأكيد كلمة المرور',
        'categories_management': 'إدارة التصنيفات',
        'add_category': 'إضافة تصنيف',
        'backup_restore': 'النسخ الاحتياطي',
        'last_backup': 'آخر نسخة',
        'export_backup': 'تصدير',
        'import_backup': 'استيراد',
        'system_info': 'معلومات النظام',
        'version': 'الإصدار',
        'danger_zone': 'منطقة الخطر',
        'reset_all_data': 'إعادة تعيين',
        'reset_warning': 'تحذير: الاستيراد يستبدل جميع البيانات',
        'reset_confirm': 'للتأكيد، اكتب "محو البيانات"',
        'switch_to': 'تبديل إلى',
        'language_hint': 'تغيير اللغة يؤثر على واجهة المستخدم فقط',
        'default': 'افتراضي',
        'never': 'أبداً',
        'about': 'حول',
        'pharmacy_management_system': 'نظام إدارة الصيدليات',
        'all_rights_reserved': 'جميع الحقوق محفوظة',
        'whatsapp': 'واتساب',
        'update_pharmacy_info': 'تحديث معلومات الصيدلية',
        'update_settings': 'تحديث الإعدادات',
        'password_min_length': 'كلمة المرور يجب أن تكون 4 أحرف على الأقل',
        'username_exists': 'اسم المستخدم موجود مسبقاً',
        'leave_blank_to_keep': 'اتركه فارغاً للإبقاء على الحالي',
        'cant_change_admin_role': 'لا يمكن تغيير دور المدير الأساسي',
        'cant_disable_admin': 'لا يمكن تعطيل حساب المدير الأساسي',
        'cant_delete_self': 'لا يمكن حذف حسابك الحالي',
        'cant_delete_admin': 'لا يمكن حذف حساب المدير الأساسي',
        'reset_password_confirm': 'هل تريد إعادة تعيين كلمة المرور للمستخدم',
        'passwords_not_match': 'كلمتا المرور غير متطابقتين',
        'current_password_wrong': 'كلمة المرور الحالية غير صحيحة',
        'category_exists': 'التصنيف موجود مسبقاً',
        'cant_delete_default_category': 'لا يمكن حذف التصنيفات الافتراضية',
        'confirm_import': 'هل أنت متأكد من استيراد البيانات؟',
        'import_success': 'تم الاستيراد بنجاح',
        'reset_success': 'تمت إعادة التعيين بنجاح',
        'reset_confirm_message': 'سيتم حذف جميع البيانات نهائياً',
        'audit_log': 'سجل التدقيق',
        'update_available': 'يتوفر تحديث جديد',
        
        // Invoice / Receipt
        'invoice': 'فاتورة',
        'thank_you': 'شكراً لتعاملكم معنا',
        'health_wishes': 'نتمنى لكم دوام الصحة والعافية',
        'license': 'ترخيص رقم',
        
        // Notifications
        'success': 'نجاح',
        'error': 'خطأ',
        'warning': 'تحذير',
        'info': 'معلومات',
        'save_success': 'تم الحفظ بنجاح',
        'delete_success': 'تم الحذف بنجاح',
        'update_success': 'تم التحديث بنجاح',
        'invalid_input': 'إدخال غير صالح',
        'field_required': 'هذا الحقل مطلوب',
        'no_data': 'لا توجد بيانات',
        'permission_denied': 'غير مصرح لك بالوصول',
        'confirm_delete': 'هل أنت متأكد من الحذف؟',
        'confirm_logout': 'هل أنت متأكد من تسجيل الخروج؟'
    },
    en: {
        // General
        'app_name': 'Al Shifa Pharmacy',
        'loading': 'Loading...',
        'save': 'Save',
        'cancel': 'Cancel',
        'delete': 'Delete',
        'edit': 'Edit',
        'close': 'Close',
        'confirm': 'Confirm',
        'search': 'Search',
        'filter': 'Filter',
        'reset': 'Reset',
        'export': 'Export',
        'import': 'Import',
        'print': 'Print',
        'refresh': 'Refresh',
        'update': 'Update',
        'install': 'Install',
        'menu': 'Menu',
        
        // Login
        'login_title': 'Integrated Pharmacy Management System',
        'username': 'Username',
        'password': 'Password',
        'user_role': 'User Role',
        'login_button': 'Login',
        'login_error': 'Invalid username or password',
        'demo_credentials': 'Demo credentials:',
        'admin_credentials': '👤 Admin: Pharmacy / Ahmed0125#',
        'welcome': 'Welcome',
        
        // Navigation
        'dashboard': 'Dashboard',
        'pos': 'Point of Sale',
        'medicines': 'Medicines',
        'inventory': 'Inventory',
        'suppliers': 'Suppliers',
        'customers': 'Customers',
        'sales': 'Sales Record',
        'reports': 'Reports',
        'settings': 'Settings',
        'logout': 'Logout',
        'language': 'Language',
        
        // Dashboard
        'total_medicines': 'Total Medicines',
        'inventory_value': 'Inventory Value',
        'today_sales': 'Today\'s Sales',
        'net_profit': 'Net Profit',
        'returns': 'Returns',
        'low_stock': 'Low Stock',
        'out_of_stock': 'Out of Stock',
        'expiring_soon': 'Expiring Soon',
        'expired': 'Expired',
        'sales_analytics': 'Sales Analytics',
        'important_alerts': 'Important Alerts',
        'recent_activities': 'Recent Activities',
        'all_good': 'All medicines are in good condition',
        'alert_days': 'within',
        'days_remaining': 'days',
        
        // POS
        'available_medicines': 'Available Medicines',
        'scan_barcode': 'Scan barcode...',
        'search_medicine': 'Search medicine...',
        'shopping_cart': 'Shopping Cart',
        'clear_cart': 'Clear Cart',
        'cart_empty': 'Cart is empty',
        'items_count': 'Items Count',
        'subtotal': 'Subtotal',
        'discount': 'Discount',
        'total': 'Total',
        'expected_profit': 'Expected Profit',
        'customer': 'Customer',
        'cash_customer': 'Cash Customer',
        'payment_method': 'Payment Method',
        'cash': 'Cash',
        'bank_transfer': 'Bank Transfer',
        'debt': 'Debt',
        'paid_amount': 'Paid Amount',
        'due_date': 'Due Date',
        'remaining': 'Remaining',
        'checkout': 'Checkout',
        'add_to_cart': 'Add to Cart',
        'manufacturer': 'Manufacturer',
        'stock': 'Stock',
        'low_stock_warning': 'Low Stock',
        'reference': 'Reference No.',
        
        // Medicines
        'add_medicine': 'Add New Medicine',
        'edit_medicine': 'Edit Medicine',
        'scientific_name': 'Scientific Name',
        'trade_name': 'Trade Name',
        'barcode': 'Barcode',
        'generate_barcode': 'Generate Barcode',
        'category': 'Category',
        'custom_category': 'Custom Category',
        'custom_category_hint': 'This category will be added automatically',
        'batch_number': 'Batch Number',
        'purchase_price': 'Purchase Price',
        'selling_price': 'Selling Price',
        'quantity': 'Quantity',
        'min_stock': 'Min Stock Alert',
        'production_date': 'Production Date',
        'expiry_date': 'Expiry Date',
        'description': 'Description',
        'status': 'Status',
        'in_stock': 'In Stock',
        'all_categories': 'All Categories',
        'select_supplier': '-- Select Supplier --',
        'actions': 'Actions',
        'current': 'Current',
        'enter_new_quantity': 'Enter new quantity',
        'manual_update': 'Manual Update',
        
        // Inventory
        'inventory_tracking': 'Inventory Tracking',
        'stock_value': 'Stock Value',
        'stock_cost': 'Stock Cost',
        'movement_log': 'Movement Log',
        'bulk_update': 'Bulk Update Stock',
        'adjust_min_stock': 'Adjust Min Stock',
        'reset_inventory': 'Reset Inventory',
        'select_all': 'Select All',
        'items_selected': 'items selected',
        'and_more': 'and',
        'select_items': 'Please select items',
        'no_changes': 'No changes',
        'set_new_quantity': 'Set new quantity',
        'add_quantity': 'Add quantity',
        'subtract_quantity': 'Subtract quantity',
        'type': 'Type',
        'balance': 'Balance',
        'notes': 'Notes',
        'user': 'User',
        'update_inventory': 'Update Inventory',
        
        // Suppliers
        'supplier_management': 'Supplier Management',
        'add_supplier': 'Add New Supplier',
        'edit_supplier': 'Edit Supplier',
        'delete_supplier': 'Delete Supplier',
        'company_name': 'Company Name',
        'contact_person': 'Contact Person',
        'phone': 'Phone',
        'email': 'Email',
        'address': 'Address',
        'related_medicines': 'Related Medicines',
        'no_suppliers': 'No suppliers found',
        'confirm_delete_related': 'This supplier has',
        
        // Customers
        'customer_management': 'Customer Management',
        'add_customer': 'Add New Customer',
        'edit_customer': 'Edit Customer',
        'delete_customer': 'Delete Customer',
        'customer_name': 'Customer Name',
        'join_date': 'Join Date',
        'total_debts': 'Total Debts',
        'no_customers': 'No customers found',
        'confirm_delete_with_debt': 'This customer has debts. Are you sure',
        
        // Sales
        'sales_record': 'Sales Record',
        'invoice_number': 'Invoice Number',
        'date': 'Date',
        'from_date': 'From Date',
        'to_date': 'To Date',
        'items_count_sold': 'Items Count',
        'paid': 'Paid',
        'remaining_debt': 'Remaining',
        'refund_amount': 'Refunds',
        'view_invoice': 'View Invoice',
        'process_refund': 'Refund',
        'refund_reason': 'Refund Reason',
        'damaged': 'Damaged',
        'confirm_refund': 'Confirm Refund',
        'no_invoices': 'No invoices found',
        'total_sales': 'Total Sales',
        'invoices': 'Invoices',
        'profit_loss': 'Profit Loss',
        'quantity_sold': 'Quantity Sold',
        'refund_quantity': 'Refund Quantity',
        'no_items_selected': 'No items selected for refund',
        'gross_profit': 'Gross Profit',
        'already_refunded': 'This invoice has been fully refunded',
        'items_returned': 'Items returned',
        'medicine': 'Medicine',
        'price': 'Price',
        
        // Reports
        'reports_statistics': 'Reports & Statistics',
        'sales_report': 'Sales Report',
        'inventory_report': 'Inventory Report',
        'profit_report': 'Profit Report',
        'top_products': 'Top Products',
        'expiry_report': 'Expiry Report',
        'total_revenue': 'Total Revenue',
        'total_cost': 'Total Cost',
        'gross_profit': 'Gross Profit',
        'net_profit_report': 'Net Profit',
        'expenses': 'Expenses',
        'returns_profit_loss': 'Returns (Profit Loss)',
        'pdf_export': 'PDF',
        'excel_export': 'Excel',
        'quick_view': 'Quick View',
        'today': 'Today',
        'yesterday': 'Yesterday',
        'this_week': 'This Week',
        'this_month': 'This Month',
        'last_month': 'Last Month',
        'this_year': 'This Year',
        'all': 'All Time',
        'distribution': 'Distribution',
        'total_quantity': 'Total Quantity',
        'revenue': 'Revenue',
        'value': 'Value',
        'no_expiry_issues': 'No expiry issues',
        'pdf_error': 'PDF export error',
        
        // Settings
        'system_settings': 'System Settings',
        'pharmacy_info': 'Pharmacy Information',
        'pharmacy_name': 'Pharmacy Name',
        'license_number': 'License Number',
        'general_settings': 'General Settings',
        'currency': 'Currency',
        'alert_days_setting': 'Alert Days',
        'enable_low_stock_alerts': 'Enable Low Stock Alerts',
        'enable_expiry_alerts': 'Enable Expiry Alerts',
        'enable_auto_backup': 'Enable Auto Backup',
        'user_management': 'User Management',
        'add_user': 'Add User',
        'edit_user': 'Edit User',
        'full_name': 'Full Name',
        'role': 'Role',
        'admin': 'Admin',
        'pharmacist': 'Pharmacist',
        'staff': 'Staff',
        'account_status': 'Account Status',
        'active': 'Active',
        'inactive': 'Inactive',
        'change_password': 'Change Password',
        'current_password': 'Current Password',
        'new_password': 'New Password',
        'confirm_password': 'Confirm Password',
        'categories_management': 'Categories Management',
        'add_category': 'Add Category',
        'backup_restore': 'Backup & Restore',
        'last_backup': 'Last Backup',
        'export_backup': 'Export',
        'import_backup': 'Import',
        'system_info': 'System Information',
        'version': 'Version',
        'danger_zone': 'Danger Zone',
        'reset_all_data': 'Reset All Data',
        'reset_warning': 'Warning: Import will replace all data',
        'reset_confirm': 'To confirm, type "reset data"',
        'switch_to': 'Switch to',
        'language_hint': 'Changing language affects UI only',
        'default': 'Default',
        'never': 'Never',
        'about': 'About',
        'pharmacy_management_system': 'Pharmacy Management System',
        'all_rights_reserved': 'All rights reserved',
        'whatsapp': 'WhatsApp',
        'update_pharmacy_info': 'Update Pharmacy Information',
        'update_settings': 'Update Settings',
        'password_min_length': 'Password must be at least 4 characters',
        'username_exists': 'Username already exists',
        'leave_blank_to_keep': 'Leave blank to keep current',
        'cant_change_admin_role': 'Cannot change main admin role',
        'cant_disable_admin': 'Cannot disable main admin account',
        'cant_delete_self': 'Cannot delete your own account',
        'cant_delete_admin': 'Cannot delete main admin account',
        'reset_password_confirm': 'Reset password for user',
        'passwords_not_match': 'Passwords do not match',
        'current_password_wrong': 'Current password is incorrect',
        'category_exists': 'Category already exists',
        'cant_delete_default_category': 'Cannot delete default categories',
        'confirm_import': 'Are you sure you want to import data?',
        'import_success': 'Import successful',
        'reset_success': 'Reset successful',
        'reset_confirm_message': 'This will permanently delete all data',
        'audit_log': 'Audit Log',
        'update_available': 'Update available',
        
        // Invoice / Receipt
        'invoice': 'Invoice',
        'thank_you': 'Thank you for your business',
        'health_wishes': 'Wishing you continued health and wellness',
        'license': 'License No.',
        
        // Notifications
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'info': 'Info',
        'save_success': 'Saved successfully',
        'delete_success': 'Deleted successfully',
        'update_success': 'Updated successfully',
        'invalid_input': 'Invalid input',
        'field_required': 'This field is required',
        'no_data': 'No data found',
        'permission_denied': 'Permission denied',
        'confirm_delete': 'Are you sure you want to delete?',
        'confirm_logout': 'Are you sure you want to logout?'
    }
};

// Current language (default: 'ar')
let currentLanguage = localStorage.getItem('app_language') || 'ar';

// Translation function
function t(key) {
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    if (translations.ar && translations.ar[key]) {
        return translations.ar[key];
    }
    return key;
}

// Update UI direction based on language
function updateUIDirection() {
    const htmlElement = document.documentElement;
    if (currentLanguage === 'ar') {
        htmlElement.setAttribute('dir', 'rtl');
        htmlElement.setAttribute('lang', 'ar');
    } else {
        htmlElement.setAttribute('dir', 'ltr');
        htmlElement.setAttribute('lang', 'en');
    }
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
            if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
                el.value = t(key);
            } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t(key);
            } else {
                el.textContent = t(key);
            }
        }
    });
    document.title = t('app_name') + ' - ' + t('login_title');
}

// Change language and reload UI
async function setLanguage(lang) {
    if (lang !== 'ar' && lang !== 'en') return;
    
    currentLanguage = lang;
    localStorage.setItem('app_language', lang);
    updateUIDirection();
    applyTranslations();
    
    const activeSection = document.querySelector('.section.active');
    if (activeSection && activeSection.id) {
        const moduleMap = {
            'dashboard': 'DashboardModule',
            'pos': 'POSModule',
            'medicines': 'MedicinesModule',
            'inventory': 'InventoryModule',
            'suppliers': 'SuppliersModule',
            'customers': 'CustomersModule',
            'sales': 'SalesModule',
            'reports': 'ReportsModule',
            'settings': 'SettingsModule'
        };
        const moduleName = moduleMap[activeSection.id];
        if (moduleName && window[moduleName] && window[moduleName].render) {
            await window[moduleName].render();
        }
    }
    
    showToast(t('update_success'), 'success');
}

// Toggle between Arabic and English
function toggleLanguage() {
    const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
}

// ================================================================
// IndexedDB Database Layer
// ================================================================
const IDB = {
    db: null,
    
    open: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('medicines')) {
                    const store = db.createObjectStore('medicines', { keyPath: 'id' });
                    store.createIndex('barcode', 'barcode', { unique: false });
                    store.createIndex('category', 'category', { unique: false });
                }
                if (!db.objectStoreNames.contains('sales')) db.createObjectStore('sales', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('returns')) db.createObjectStore('returns', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('suppliers')) db.createObjectStore('suppliers', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('customers')) db.createObjectStore('customers', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('debts')) db.createObjectStore('debts', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('expenses')) db.createObjectStore('expenses', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('movements')) db.createObjectStore('movements', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('audit')) db.createObjectStore('audit', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
                if (!db.objectStoreNames.contains('pharmacyInfo')) db.createObjectStore('pharmacyInfo', { keyPath: 'key' });
                if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('categories')) db.createObjectStore('categories', { keyPath: 'id' });
            };
            
            request.onsuccess = (e) => { 
                IDB.db = e.target.result; 
                console.log('[IDB] Database opened successfully'); 
                resolve(IDB.db); 
            };
            request.onerror = (e) => { 
                console.error('[IDB] Database error:', e.target.error); 
                reject(e.target.error); 
            };
        });
    },
    
    getAll: function(storeName) {
        return new Promise((resolve) => {
            if (!IDB.db) { resolve([]); return; }
            const tx = IDB.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve([]);
        });
    },
    
    get: function(storeName, id) {
        return new Promise((resolve) => {
            if (!IDB.db) { resolve(null); return; }
            const tx = IDB.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    },
    
    put: function(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!IDB.db) { resolve(null); return; }
            const tx = IDB.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.put(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },
    
    delete: function(storeName, id) {
        return new Promise((resolve) => {
            if (!IDB.db) { resolve(false); return; }
            const tx = IDB.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.delete(id);
            req.onsuccess = () => resolve(true);
            req.onerror = () => resolve(false);
        });
    },
    
    clear: function(storeName) {
        return new Promise((resolve) => {
            if (!IDB.db) { resolve(false); return; }
            const tx = IDB.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.clear();
            req.onsuccess = () => resolve(true);
            req.onerror = () => resolve(false);
        });
    },
    
    getByIndex: function(storeName, indexName, value) {
        return new Promise((resolve) => {
            if (!IDB.db) { resolve(null); return; }
            const tx = IDB.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const index = store.index(indexName);
            const req = index.get(value);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    }
};

// ================================================================
// Global Application Data (In-memory cache)
// ================================================================
let AppData = {
    pharmacyInfo: { name: 'صيدلية الشفاء', phone: '', address: '', license: '', email: '' },
    users: [
        { 
            id: 'USER_ADMIN_001', 
            username: 'Pharmacy', 
            name: 'مدير الصيدلية', 
            pass: '',
            role: 'admin', 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true
        }
    ],
    currentUser: null,
    medicines: [],
    suppliers: [],
    customers: [],
    sales: [],
    returns: [],
    debts: [],
    expenses: [],
    movements: [],
    categories: ['مسكنات', 'مضادات حيوية', 'فيتامينات', 'أدوية ضغط', 'أدوية سكر', 'أدوية المعدة', 'مراهم', 'قطرات', 'أخرى'],
    settings: { currency: 'SDG', lowStockAlert: true, expiryAlert: true, alertDays: 30, darkMode: false, language: 'ar', autoBackup: true },
    audit: [],
    version: '3.0.0',
    lastBackup: null
};

let chartsInstances = {};

// ================================================================
// Data Access Layer (DAL)
// ================================================================
const DAL = {
    getMedicines: function() { return AppData.medicines || []; },
    getMedicineById: function(id) { return (AppData.medicines || []).find(m => m.id === id); },
    getMedicineByBarcode: function(barcode) { if (!barcode) return null; return (AppData.medicines || []).find(m => m.barcode === barcode); },
    
    addMedicine: async function(medicine) { 
        if (!AppData.medicines) AppData.medicines = []; 
        medicine.id = medicine.id || generateId('MED'); 
        medicine.createdAt = medicine.createdAt || new Date().toISOString(); 
        medicine.updatedAt = new Date().toISOString(); 
        if (!medicine.barcode) medicine.barcode = generateBarcode(); 
        AppData.medicines.push(medicine); 
        await IDB.put('medicines', medicine); 
        return medicine; 
    },
    
    updateMedicine: async function(id, data) { 
        const index = (AppData.medicines || []).findIndex(m => m.id === id); 
        if (index === -1) return null; 
        data.id = id; 
        data.updatedAt = new Date().toISOString(); 
        data.createdAt = AppData.medicines[index].createdAt; 
        AppData.medicines[index] = data; 
        await IDB.put('medicines', data); 
        return AppData.medicines[index]; 
    },
    
    deleteMedicine: async function(id) { 
        const index = (AppData.medicines || []).findIndex(m => m.id === id); 
        if (index === -1) return false; 
        AppData.medicines.splice(index, 1); 
        await IDB.delete('medicines', id); 
        return true; 
    },
    
    getSales: function() { return AppData.sales || []; },
    getSaleById: function(id) { return (AppData.sales || []).find(s => s.id === id); },
    
    addSale: async function(sale) { 
        if (!AppData.sales) AppData.sales = []; 
        sale.id = sale.id || generateId('SALE'); 
        sale.date = sale.date || new Date().toISOString(); 
        AppData.sales.push(sale); 
        await IDB.put('sales', sale); 
        return sale; 
    },
    
    updateSale: async function(id, data) { 
        const index = (AppData.sales || []).findIndex(s => s.id === id); 
        if (index === -1) return null; 
        AppData.sales[index] = data; 
        await IDB.put('sales', data); 
        return AppData.sales[index]; 
    },
    
    getReturns: function() { return AppData.returns || []; },
    
    addReturn: async function(ret) { 
        if (!AppData.returns) AppData.returns = []; 
        ret.id = ret.id || generateId('RET'); 
        ret.date = ret.date || new Date().toISOString(); 
        AppData.returns.push(ret); 
        await IDB.put('returns', ret); 
        return ret; 
    },
    
    getCustomers: function() { return AppData.customers || []; },
    getCustomerById: function(id) { return (AppData.customers || []).find(c => c.id === id); },
    
    addCustomer: async function(customer) { 
        if (!AppData.customers) AppData.customers = []; 
        customer.id = customer.id || generateId('CUST'); 
        customer.joined = customer.joined || new Date().toISOString(); 
        AppData.customers.push(customer); 
        await IDB.put('customers', customer); 
        return customer; 
    },
    
    updateCustomer: async function(id, data) { 
        const index = (AppData.customers || []).findIndex(c => c.id === id); 
        if (index === -1) return null; 
        data.id = id; 
        AppData.customers[index] = data; 
        await IDB.put('customers', data); 
        return AppData.customers[index]; 
    },
    
    deleteCustomer: async function(id) { 
        const index = (AppData.customers || []).findIndex(c => c.id === id); 
        if (index === -1) return false; 
        AppData.customers.splice(index, 1); 
        await IDB.delete('customers', id); 
        return true; 
    },
    
    getSuppliers: function() { return AppData.suppliers || []; },
    getSupplierById: function(id) { return (AppData.suppliers || []).find(s => s.id === id); },
    
    addSupplier: async function(supplier) { 
        if (!AppData.suppliers) AppData.suppliers = []; 
        supplier.id = supplier.id || generateId('SUPP'); 
        supplier.createdAt = supplier.createdAt || new Date().toISOString(); 
        supplier.updatedAt = new Date().toISOString(); 
        AppData.suppliers.push(supplier); 
        await IDB.put('suppliers', supplier); 
        return supplier; 
    },
    
    updateSupplier: async function(id, data) { 
        const index = (AppData.suppliers || []).findIndex(s => s.id === id); 
        if (index === -1) return null; 
        data.id = id; 
        data.updatedAt = new Date().toISOString(); 
        data.createdAt = AppData.suppliers[index].createdAt; 
        AppData.suppliers[index] = data; 
        await IDB.put('suppliers', data); 
        return AppData.suppliers[index]; 
    },
    
    deleteSupplier: async function(id) { 
        const index = (AppData.suppliers || []).findIndex(s => s.id === id); 
        if (index === -1) return false; 
        AppData.suppliers.splice(index, 1); 
        await IDB.delete('suppliers', id); 
        return true; 
    }
};

// ================================================================
// Barcode Generator
// ================================================================
function generateBarcode() { 
    const prefix = '89'; 
    const timestamp = Date.now().toString().slice(-8); 
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); 
    return prefix + timestamp + random; 
}

// ================================================================
// ID Generator with Crypto support
// ================================================================
function generateId(prefix) {
    prefix = prefix || '';
    const timestamp = Date.now();
    let random;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        random = crypto.randomUUID().replace(/-/g, '').substring(0, 10);
    } else {
        random = Math.random().toString(36).substring(2, 11);
    }
    return prefix ? prefix + '_' + timestamp + '_' + random : timestamp + '_' + random;
}

// ================================================================
// Utility Functions
// ================================================================
function formatMoney(amount) { 
    if (amount === null || amount === undefined) amount = 0; 
    if (isNaN(amount)) amount = 0; 
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SDG'; 
}

function formatDate(date) { 
    if (!date) return '-'; 
    try { 
        const d = new Date(date); 
        if (isNaN(d.getTime())) return date; 
        const locale = (AppData.settings && AppData.settings.language === 'ar') ? 'ar' : 'ar-EG';
        return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' }); 
    } catch (e) { 
        return date; 
    } 
}

function formatDateTime(date) { 
    if (!date) return '-'; 
    try { 
        const d = new Date(date); 
        if (isNaN(d.getTime())) return date; 
        const locale = (AppData.settings && AppData.settings.language === 'ar') ? 'ar' : 'ar-EG';
        return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + 
               d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }); 
    } catch (e) { 
        return date; 
    } 
}

function formatDateShort(date) { 
    if (!date) return '-'; 
    try { 
        const d = new Date(date); 
        if (isNaN(d.getTime())) return date; 
        const locale = (AppData.settings && AppData.settings.language === 'ar') ? 'ar' : 'ar-EG';
        return d.toLocaleDateString(locale); 
    } catch (e) { 
        return date; 
    } 
}

function showToast(message, type, isKey) {
    type = type || 'info';
    const toast = document.getElementById('toast');
    if (!toast) { 
        console.log('[Toast]', message); 
        return; 
    }
    
    const finalMessage = isKey ? t(message) : message;
    
    let icon = '';
    switch(type) {
        case 'success': icon = '✅ '; break;
        case 'error': icon = '❌ '; break;
        case 'warning': icon = '⚠️ '; break;
        default: icon = 'ℹ️ ';
    }
    
    toast.textContent = icon + finalMessage;
    toast.className = 'toast-notification ' + type;
    toast.style.display = 'block';
    toast.style.animation = 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.animation = '';
        }, 300);
    }, 3000);
}

function showLoading(show) { 
    if (show === undefined) show = true; 
    const overlay = document.getElementById('loadingOverlay'); 
    if (overlay) { 
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    } 
}

function safeOpenModal(modalId) { 
    if (typeof bootstrap === 'undefined') return false; 
    const modalEl = document.getElementById(modalId); 
    if (!modalEl) return false; 
    try { 
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove()); 
        document.body.classList.remove('modal-open'); 
        document.body.style.overflow = ''; 
        const existing = bootstrap.Modal.getInstance(modalEl); 
        if (existing) existing.hide(); 
        new bootstrap.Modal(modalEl).show(); 
        return true; 
    } catch (e) { 
        console.error('[Modal] Error opening:', modalId, e);
        return false; 
    } 
}

function safeCloseModal(modalId) { 
    if (typeof bootstrap === 'undefined') return false; 
    const modalEl = document.getElementById(modalId); 
    if (!modalEl) return false; 
    try { 
        const modal = bootstrap.Modal.getInstance(modalEl); 
        if (modal) { 
            modal.hide(); 
            return true; 
        } 
    } catch (e) {
        console.error('[Modal] Error closing:', modalId, e);
    } 
    return false; 
}

function getDaysUntilExpiry(expiryDate) { 
    if (!expiryDate) return 999; 
    try { 
        const today = new Date(); 
        today.setHours(0, 0, 0, 0); 
        const expiry = new Date(expiryDate); 
        expiry.setHours(0, 0, 0, 0); 
        return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)); 
    } catch (e) { 
        return 999; 
    } 
}

function getMovementTypeText(type) { 
    const types = { 
        'add': 'إضافة', 
        'subtract': 'سحب', 
        'sell': 'بيع', 
        'return': 'مرتجع', 
        'refund': 'مرتجع مبيعات', 
        'refund_damaged': 'مرتجع تالف', 
        'adjust': 'تسوية' 
    }; 
    return types[type] || type; 
}

function destroyChart(canvasId) { 
    if (chartsInstances[canvasId]) { 
        chartsInstances[canvasId].destroy(); 
        delete chartsInstances[canvasId]; 
    } 
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ================================================================
// Data Management Functions
// ================================================================
async function loadData() {
    try {
        await IDB.open();
        const meds = await IDB.getAll('medicines');
        const sales = await IDB.getAll('sales');
        const returns = await IDB.getAll('returns');
        const suppliers = await IDB.getAll('suppliers');
        const customers = await IDB.getAll('customers');
        const debts = await IDB.getAll('debts');
        const expenses = await IDB.getAll('expenses');
        const movements = await IDB.getAll('movements');
        const audit = await IDB.getAll('audit');
        const categories = await IDB.getAll('categories');
        const users = await IDB.getAll('users');
        
        if (meds.length > 0 || sales.length > 0 || customers.length > 0) {
            AppData.medicines = meds.length > 0 ? meds : [];
            AppData.sales = sales;
            AppData.returns = returns;
            AppData.suppliers = suppliers.length > 0 ? suppliers : [];
            AppData.customers = customers.length > 0 ? customers : [];
            AppData.debts = debts;
            AppData.expenses = expenses;
            AppData.movements = movements;
            AppData.audit = audit;
            AppData.categories = categories.length > 0 ? categories.map(c => c.name) : AppData.categories;
            if (users.length > 0) AppData.users = users;
            AppData.medicines.forEach(m => { if (!m.barcode) m.barcode = generateBarcode(); });
        } else {
            await seedDefaultData();
        }
        
        // Ensure admin user exists with hashed password
        const adminUser = AppData.users.find(u => u.username === 'Pharmacy');
        if (adminUser) {
            if (!adminUser.pass || adminUser.pass.length < 40) {
                adminUser.pass = await hashPassword('Ahmed0125#');
                await IDB.put('users', adminUser);
            }
            adminUser.isActive = true;
            adminUser.role = 'admin';
        } else {
            const hashedPass = await hashPassword('Ahmed0125#');
            const newAdmin = {
                id: 'USER_ADMIN_001',
                username: 'Pharmacy',
                name: 'مدير الصيدلية',
                pass: hashedPass,
                role: 'admin',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
            };
            AppData.users.push(newAdmin);
            await IDB.put('users', newAdmin);
        }
        
        const settingsData = await IDB.get('settings', 'appSettings');
        if (settingsData) AppData.settings = { ...AppData.settings, ...settingsData.value };
        const pharmacyData = await IDB.get('pharmacyInfo', 'main');
        if (pharmacyData) AppData.pharmacyInfo = { ...AppData.pharmacyInfo, ...pharmacyData.value };
        
        return AppData;
    } catch (e) { 
        console.error('[Data] Error loading:', e); 
        showToast(t('error') + ': ' + t('loading'), 'error');
        return AppData; 
    }
}

async function seedDefaultData() {
    const defaultMeds = [
        { id: 'MED_001', scientificName: 'Paracetamol', tradeName: 'بنادول أزرق', barcode: '8901234567890', category: 'مسكنات', manufacturer: 'GSK', batchNumber: 'BATCH-2024-001', cost: 50, price: 100, quantity: 45, minStock: 10, productionDate: '2024-01-15', expiryDate: '2026-01-15', supplierId: null, description: 'مسكن للآلام وخافض للحرارة', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'MED_002', scientificName: 'Ibuprofen', tradeName: 'بروفين 400', barcode: '8901234567891', category: 'مسكنات', manufacturer: 'الحكمة', batchNumber: 'BATCH-2024-002', cost: 60, price: 120, quantity: 28, minStock: 5, productionDate: '2024-02-01', expiryDate: '2025-08-01', supplierId: null, description: 'مضاد للالتهابات ومسكن للآلام', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'MED_003', scientificName: 'Amoxicillin', tradeName: 'أموكسيل 500', barcode: '8901234567892', category: 'مضادات حيوية', manufacturer: 'سانوفي', batchNumber: 'BATCH-2024-003', cost: 80, price: 150, quantity: 18, minStock: 5, productionDate: '2024-03-10', expiryDate: '2025-09-10', supplierId: null, description: 'مضاد حيوي واسع المجال', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'MED_004', scientificName: 'Vitamin C 1000mg', tradeName: 'فيتامين سي 1000', barcode: '8901234567893', category: 'فيتامينات', manufacturer: 'سانوفي', batchNumber: 'BATCH-2024-004', cost: 70, price: 140, quantity: 35, minStock: 10, productionDate: '2024-01-20', expiryDate: '2026-01-20', supplierId: null, description: 'مكمل غذائي لدعم المناعة', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'MED_005', scientificName: 'Omeprazole', tradeName: 'أوميبرازول 20', barcode: '8901234567894', category: 'أدوية المعدة', manufacturer: 'الحكمة', batchNumber: 'BATCH-2024-005', cost: 55, price: 110, quantity: 8, minStock: 10, productionDate: '2024-02-15', expiryDate: '2025-02-15', supplierId: null, description: 'لعلاج قرحة المعدة والحموضة', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    const defaultSuppliers = [
        { id: 'SUPP_001', name: 'شركة الأدوية العربية', contactPerson: 'أحمد محمد', phone: '0912345678', email: 'info@arabpharma.com', address: 'الخرطوم - السودان', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'SUPP_002', name: 'GSK السودان', contactPerson: 'محمد علي', phone: '0923456789', email: 'sudan@gsk.com', address: 'الخرطوم بحري', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    const defaultCustomers = [
        { id: 'CUST_001', name: 'عميل نقدي', phone: '0912345678', email: '', address: '', joined: new Date().toISOString() },
        { id: 'CUST_002', name: 'أحمد عمر', phone: '0923456789', email: 'ahmed@example.com', address: 'الخرطوم', joined: new Date().toISOString() }
    ];
    
    for (const med of defaultMeds) { AppData.medicines.push(med); await IDB.put('medicines', med); }
    for (const supp of defaultSuppliers) { AppData.suppliers.push(supp); await IDB.put('suppliers', supp); }
    for (const cust of defaultCustomers) { AppData.customers.push(cust); await IDB.put('customers', cust); }
    
    // Use a properly scoped variable name to avoid redeclaration conflict
    const adminPasswordHash = await hashPassword('Ahmed0125#');
    const defaultUsers = [
        { id: 'USER_ADMIN_001', username: 'Pharmacy', name: 'مدير الصيدلية', pass: adminPasswordHash, role: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isActive: true }
    ];
    for (const user of defaultUsers) {
        // تأكد إن المستخدم مش موجود قبل الإضافة
        const exists = AppData.users.find(u => u.username === user.username);
        if (!exists) {
            AppData.users.push(user);
            await IDB.put('users', user);
        }
    }
    
    for (const cat of AppData.categories) { await IDB.put('categories', { id: 'CAT_' + cat, name: cat }); }
    await IDB.put('settings', { key: 'appSettings', value: AppData.settings });
    await IDB.put('pharmacyInfo', { key: 'main', value: AppData.pharmacyInfo });
    console.log('[Data] Default data seeded');
}

async function saveData() {
    try {
        await IDB.put('settings', { key: 'appSettings', value: AppData.settings });
        await IDB.put('pharmacyInfo', { key: 'main', value: AppData.pharmacyInfo });
        if (AppData.settings && AppData.settings.autoBackup) await autoBackup();
        return true;
    } catch (e) { 
        console.error('[Data] Error saving:', e); 
        return false; 
    }
}

async function autoBackup() {
    const now = new Date();
    const lastBackup = AppData.lastBackup ? new Date(AppData.lastBackup) : null;
    if (!lastBackup || (now - lastBackup) > 86400000) {
        try {
            const backupData = { 
                version: AppData.version, 
                timestamp: now.toISOString(), 
                medicines: AppData.medicines, 
                sales: AppData.sales, 
                returns: AppData.returns, 
                suppliers: AppData.suppliers, 
                customers: AppData.customers, 
                debts: AppData.debts, 
                expenses: AppData.expenses, 
                movements: AppData.movements, 
                categories: AppData.categories, 
                settings: AppData.settings, 
                audit: AppData.audit.slice(0, 200) 
            };
            localStorage.setItem(BACKUP_KEY + now.toISOString().split('T')[0], JSON.stringify(backupData));
            AppData.lastBackup = now.toISOString();
            const allKeys = Object.keys(localStorage).filter(k => k.startsWith(BACKUP_KEY)).sort().reverse();
            for (let j = 7; j < allKeys.length; j++) localStorage.removeItem(allKeys[j]);
        } catch (e) { 
            console.warn('[Backup] Failed:', e); 
        }
    }
}

async function addAuditLog(action, details) {
    details = details || '';
    const log = { 
        id: 'AUDIT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), 
        timestamp: new Date().toISOString(), 
        user: AppData.currentUser ? AppData.currentUser.name : 'نظام', 
        role: AppData.currentUser ? AppData.currentUser.role : 'نظام', 
        action, 
        details 
    };
    AppData.audit.unshift(log);
    if (AppData.audit.length > 200) AppData.audit = AppData.audit.slice(0, 200);
    try { await IDB.put('audit', log); } catch(e) {}
}

async function addMovement(medicineId, medicineName, type, qty, balance, notes) {
    notes = notes || '';
    const movement = { 
        id: 'MOV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), 
        date: new Date().toISOString(), 
        medicineId, 
        medicineName, 
        type, 
        qty, 
        balance, 
        notes, 
        user: AppData.currentUser ? AppData.currentUser.name : 'نظام' 
    };
    AppData.movements.unshift(movement);
    if (AppData.movements.length > 500) AppData.movements = AppData.movements.slice(0, 500);
    try { await IDB.put('movements', movement); } catch(e) {}
}

// ================================================================
// Dashboard Stats (FIXED: Returns now correctly impact profits)
// ================================================================
function getDashboardStats() {
    const today = new Date().toDateString();
    const totalMedicines = AppData.medicines.length;
    const lowStockCount = AppData.medicines.filter(m => m.quantity <= m.minStock && m.quantity > 0).length;
    const outOfStockCount = AppData.medicines.filter(m => m.quantity === 0).length;
    const expiringCount = AppData.medicines.filter(m => m.expiryDate && getDaysUntilExpiry(m.expiryDate) >= 0 && getDaysUntilExpiry(m.expiryDate) <= 30).length;
    const expiredCount = AppData.medicines.filter(m => m.expiryDate && getDaysUntilExpiry(m.expiryDate) < 0).length;
    const todaySales = AppData.sales.filter(s => new Date(s.date).toDateString() === today);
    const todaySalesTotal = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
    const todayGrossProfit = todaySales.reduce((sum, s) => sum + (s.profit || 0), 0);
    const todayInvoices = todaySales.length;
    
    const todayReturns = (AppData.returns || []).filter(r => new Date(r.date).toDateString() === today);
    const todayReturnsTotal = todayReturns.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    const todayReturnsProfitLoss = todayReturns.reduce((sum, r) => sum + (r.totalProfit || 0), 0);
    
    const todaySalesIds = todaySales.map(s => s.id);
    const todayLinkedReturns = (AppData.returns || []).filter(r => 
        r.date && new Date(r.date).toDateString() === today && 
        r.saleId && todaySalesIds.includes(r.saleId)
    );
    const todayLinkedReturnsProfitLoss = todayLinkedReturns.reduce((sum, r) => sum + (r.totalProfit || 0), 0);
    
    const todaySalesWithRefunds = todaySales.filter(s => s.hasRefund && s.refundProfitLoss > 0);
    const todayRefundProfitLoss = todaySalesWithRefunds.reduce((sum, s) => sum + (s.refundProfitLoss || 0), 0);
    
    const totalReturnsProfitLoss = todayReturnsProfitLoss + todayLinkedReturnsProfitLoss + todayRefundProfitLoss;
    const todayProfit = todayGrossProfit - totalReturnsProfitLoss;
    
    const inventoryValue = AppData.medicines.reduce((sum, m) => sum + (m.price * m.quantity), 0);
    const inventoryCost = AppData.medicines.reduce((sum, m) => sum + ((m.cost || 0) * m.quantity), 0);
    const activeDebts = (AppData.debts || []).filter(d => d.status === 'active');
    const totalDebts = activeDebts.reduce((sum, d) => sum + (d.remaining || 0), 0);
    const todayExpenses = (AppData.expenses || []).filter(e => new Date(e.date).toDateString() === today).reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = todayProfit - todayExpenses;
    const combinedReturnsTotal = Math.max(todayReturnsTotal, todayLinkedReturns.reduce((sum, r) => sum + (r.totalAmount || 0), 0), todayRefundProfitLoss);
    
    return { 
        totalMedicines, lowStockCount, outOfStockCount, expiringCount, expiredCount, 
        todaySalesTotal, todayProfit, todayInvoices, 
        todayReturnsTotal: combinedReturnsTotal, 
        inventoryValue, inventoryCost, 
        totalSuppliers: AppData.suppliers.length, 
        totalCustomers: AppData.customers.length, 
        totalDebts, todayExpenses, netProfit 
    };
}

// ================================================================
// Authentication Functions
// ================================================================
function getUserRoleName(role) { 
    const names = { 'admin': 'مدير الصيدلية', 'pharmacist': 'صيدلي', 'staff': 'موظف' }; 
    return names[role] || role; 
}

function checkPermission(action) { 
    if (!AppData.currentUser) return false; 
    if (AppData.currentUser.role === 'admin') return true; 
    const allowed = ['view_dashboard', 'view_pos', 'create_sale', 'view_medicines', 'edit_medicines', 'view_inventory', 'update_inventory', 'view_sales', 'view_reports', 'view_customers', 'create_customer', 'edit_customer', 'process_refund']; 
    if (allowed.includes(action)) return true; 
    showToast(t('permission_denied'), 'error'); 
    return false; 
}

function updateUIPermissions() { 
    if (!AppData.currentUser) return; 
    const isAdmin = AppData.currentUser.role === 'admin'; 
    document.querySelectorAll('.admin-only').forEach(el => { 
        el.style.display = isAdmin ? '' : 'none'; 
    }); 
    const suppliersSection = document.getElementById('suppliers');
    if (suppliersSection && !isAdmin) {
        suppliersSection.style.display = 'none';
    }
    const settingsSection = document.getElementById('settings');
    if (settingsSection && !isAdmin) {
        settingsSection.style.display = 'none';
    }
}

function checkExistingSession() { 
    try { 
        const saved = sessionStorage.getItem('currentUser'); 
        if (saved) { 
            const user = JSON.parse(saved); 
            const userExists = AppData.users.find(u => u.id === user.id && u.username === user.username && u.role === user.role && u.isActive !== false); 
            if (userExists) { 
                AppData.currentUser = user; 
                updateUIWithCurrentUser(); 
                updateUIPermissions(); 
                return true; 
            } else { 
                sessionStorage.removeItem('currentUser'); 
            } 
        } 
    } catch (e) { 
        sessionStorage.removeItem('currentUser'); 
    } 
    return false; 
}

function updateUIWithCurrentUser() {
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRoleBadge');
    if (userNameEl && AppData.currentUser) userNameEl.textContent = AppData.currentUser.name;
    if (userRoleEl && AppData.currentUser) userRoleEl.textContent = getUserRoleName(AppData.currentUser.role);
    updatePharmacyNameInUI();
}

function updatePharmacyNameInUI() {
    const sidebarTitle = document.querySelector('.sidebar-header h5');
    if (sidebarTitle) sidebarTitle.innerHTML = '<i class="fas fa-prescription-bottle"></i> ' + (AppData.pharmacyInfo.name || t('app_name'));
    const loginTitle = document.querySelector('.login-card h2');
    if (loginTitle) loginTitle.textContent = AppData.pharmacyInfo.name || t('app_name');
    document.title = (AppData.pharmacyInfo.name || t('app_name')) + ' - ' + t('login_title');
}

async function doLogin() {
    console.log('[Auth] doLogin called');
    const username = document.getElementById('username')?.value.trim() || '';
    const password = document.getElementById('password')?.value || '';
    const role = document.getElementById('userRole')?.value || '';
    const errorEl = document.getElementById('loginError');
    
    if (!username || !password) { 
        if (errorEl) { 
            errorEl.textContent = t('field_required'); 
            errorEl.style.display = 'block'; 
        } 
        return; 
    }
    
    const hashedInput = await hashPassword(password);
    const user = AppData.users.find(u => 
        u.username === username && 
        u.role === role &&
        (u.pass === hashedInput || u.pass === password) &&
        u.isActive !== false
    );
    
    if (user) {
        if (user.pass === password && password !== hashedInput) {
            user.pass = hashedInput;
            await IDB.put('users', user);
            console.log('[Auth] Password upgraded for user:', username);
        }
        
        AppData.currentUser = { 
            id: user.id, 
            username: user.username, 
            name: user.name, 
            role: user.role, 
            loginTime: new Date().toISOString()
        };
        sessionStorage.setItem('currentUser', JSON.stringify(AppData.currentUser));
        saveData();
        document.getElementById('loginScreen').style.display = 'none';
        updateUIWithCurrentUser();
        updateUIPermissions();
        addAuditLog(t('login_button'), user.name);
        showToast('👋 ' + t('welcome') + ' ' + user.name + '!', 'success');
        goTo('dashboard');
        if (window.DashboardModule) window.DashboardModule.render();
        if (errorEl) { 
            errorEl.textContent = ''; 
            errorEl.style.display = 'none'; 
        }
    } else {
        if (errorEl) { 
            errorEl.textContent = t('login_error'); 
            errorEl.style.display = 'block'; 
        }
        document.getElementById('password').value = '';
        showToast(t('login_error'), 'error');
    }
}

function doLogout() {
    if (confirm(t('confirm_logout'))) {
        if (AppData.currentUser) addAuditLog(t('logout'), AppData.currentUser.name);
        sessionStorage.removeItem('currentUser');
        AppData.currentUser = null;
        saveData();
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        showToast('👋 ' + t('logout'), 'info');
    }
}

// ================================================================
// Navigation Functions
// ================================================================
function goTo(sectionId) {
    console.log('[UI] Navigating to:', sectionId);
    
    const currentSection = document.querySelector('.section.active');
    const targetSection = document.getElementById(sectionId);
    
    if (!targetSection) return;
    
    if (currentSection && currentSection !== targetSection) {
        currentSection.style.animation = 'fadeOut 0.15s ease forwards';
        setTimeout(() => {
            currentSection.classList.remove('active');
            currentSection.style.animation = '';
        }, 150);
    } else if (!currentSection) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    } else if (currentSection === targetSection) {
        return;
    }
    
    setTimeout(() => {
        targetSection.classList.add('active');
        targetSection.style.animation = 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    }, 160);
    
    document.querySelectorAll('.nav-item, .nav-item-bottom').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('[data-section="' + sectionId + '"]').forEach(el => el.classList.add('active'));
    
    if (window.innerWidth <= 768) { 
        const sidebar = document.getElementById('sidebar'); 
        if (sidebar) sidebar.classList.remove('active'); 
    }
    
    const moduleMap = { 
        'dashboard': 'DashboardModule', 
        'pos': 'POSModule', 
        'medicines': 'MedicinesModule', 
        'inventory': 'InventoryModule', 
        'suppliers': 'SuppliersModule', 
        'customers': 'CustomersModule', 
        'sales': 'SalesModule', 
        'reports': 'ReportsModule', 
        'settings': 'SettingsModule' 
    };
    const moduleName = moduleMap[sectionId];
    if (moduleName && window[moduleName] && window[moduleName].render) {
        setTimeout(() => window[moduleName].render(), 200);
    }
}

function toggleMenu() { 
    const sidebar = document.getElementById('sidebar'); 
    if (sidebar) sidebar.classList.toggle('active'); 
}

function toggleDarkMode() { 
    document.body.classList.toggle('dark-mode'); 
    const icon = document.querySelector('#themeToggle i'); 
    if (icon) icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon'; 
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'); 
    AppData.settings.darkMode = document.body.classList.contains('dark-mode'); 
    saveData(); 
}

function loadDarkMode() { 
    if (localStorage.getItem('darkMode') === 'enabled') { 
        document.body.classList.add('dark-mode'); 
        const icon = document.querySelector('#themeToggle i'); 
        if (icon) icon.className = 'fas fa-sun'; 
        AppData.settings.darkMode = true; 
    } 
}

// ================================================================
// Category Functions with Custom "Other" Support
// ================================================================
function updateCategorySelects() {
    document.querySelectorAll('#medicineCategory, #categoryFilter, #inventoryCategoryFilter').forEach(select => {
        if (select) {
            const current = select.value;
            select.innerHTML = AppData.categories.map(c => '<option value="' + c + '">' + c + '</option>').join('');
            if (current && AppData.categories.includes(current)) select.value = current;
            else if (current === 'أخرى' || current === 'Other') select.value = 'أخرى';
        }
    });
    setupCustomCategoryInput();
}

function setupCustomCategoryInput() {
    const categorySelect = document.getElementById('medicineCategory');
    const customCategoryGroup = document.getElementById('customCategoryGroup');
    const customCategoryInput = document.getElementById('customCategoryInput');
    
    if (categorySelect && customCategoryGroup && customCategoryInput) {
        const toggleCustomInput = function() {
            if (categorySelect.value === 'أخرى') {
                customCategoryGroup.style.display = 'block';
                customCategoryInput.focus();
            } else {
                customCategoryGroup.style.display = 'none';
                customCategoryInput.value = '';
            }
        };
        
        categorySelect.removeEventListener('change', toggleCustomInput);
        categorySelect.addEventListener('change', toggleCustomInput);
        toggleCustomInput();
    }
}

function getEffectiveCategory() {
    const categorySelect = document.getElementById('medicineCategory');
    const customCategoryInput = document.getElementById('customCategoryInput');
    
    if (!categorySelect) return 'مسكنات';
    
    const selectedCategory = categorySelect.value;
    
    if (selectedCategory === 'أخرى' && customCategoryInput) {
        const customValue = customCategoryInput.value.trim();
        if (customValue) {
            const sanitized = customValue.replace(/<[^>]*>/g, '').substring(0, 50);
            return sanitized || 'أخرى';
        }
        return 'أخرى';
    }
    
    return selectedCategory;
}

function addCustomCategoryIfNew(categoryName) {
    if (!categoryName || categoryName === 'أخرى') return;
    if (AppData.categories.indexOf(categoryName) === -1) {
        AppData.categories.push(categoryName);
        IDB.put('categories', { id: 'CAT_' + categoryName, name: categoryName }).catch(function(e) {});
        updateCategorySelects();
    }
}

function updateSupplierSelect() { 
    const select = document.getElementById('medicineSupplier'); 
    if (select) { 
        const current = select.value; 
        select.innerHTML = '<option value="">' + t('select_supplier') + '</option>' + 
            AppData.suppliers.map(s => '<option value="' + s.id + '">' + s.name + '</option>').join(''); 
        if (current) select.value = current; 
    } 
}

// ================================================================
// Dashboard Module
// ================================================================
window.DashboardModule = {
    async render() {
        const section = document.getElementById('dashboard'); 
        if (!section) return;
        const stats = getDashboardStats();
        
        section.innerHTML = `
            <h4 style="color:white; font-weight:900; margin-bottom:20px;">
                <i class="fas fa-chart-pie"></i> <span data-i18n="dashboard">لوحة التحكم</span>
            </h4>
            <div class="stats-grid">
                <div class="stat-card" style="border-right-color:#0d9488;" onclick="goTo('medicines')">
                    <div class="stat-icon"><i class="fas fa-pills"></i></div>
                    <div class="stat-info">
                        <h3 data-i18n="total_medicines">إجمالي الأدوية</h3>
                        <p>${stats.totalMedicines}</p>
                        <small><span data-i18n="inventory_value">قيمة المخزون</span>: ${formatMoney(stats.inventoryValue)}</small>
                    </div>
                </div>
                <div class="stat-card success" style="border-right-color:#10b981;">
                    <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                    <div class="stat-info">
                        <h3 data-i18n="today_sales">مبيعات اليوم</h3>
                        <p>${formatMoney(stats.todaySalesTotal)}</p>
                        <small><span data-i18n="net_profit">الربح الصافي</span>: ${formatMoney(stats.netProfit)} | <span data-i18n="returns">مرتجعات</span>: ${formatMoney(stats.todayReturnsTotal)}</small>
                    </div>
                </div>
                <div class="stat-card warning" style="border-right-color:#f59e0b;" onclick="goTo('inventory')">
                    <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="stat-info">
                        <h3 data-i18n="low_stock">مخزون منخفض</h3>
                        <p>${stats.lowStockCount}</p>
                        <small><span data-i18n="min_stock">أقل من الحد الأدنى</span></small>
                    </div>
                </div>
                <div class="stat-card danger" style="border-right-color:#ef4444;" onclick="goTo('inventory')">
                    <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                    <div class="stat-info">
                        <h3 data-i18n="out_of_stock">نفذ من المخزون</h3>
                        <p>${stats.outOfStockCount}</p>
                        <small><span data-i18n="min_stock">يحتاج إعادة طلب</span></small>
                    </div>
                </div>
                <div class="stat-card warning" style="border-right-color:#e67e22;" onclick="goTo('inventory')">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-info">
                        <h3 data-i18n="expiring_soon">قاربة الانتهاء</h3>
                        <p>${stats.expiringCount}</p>
                        <small><span data-i18n="alert_days">خلال</span> ${AppData.settings.alertDays} <span data-i18n="days_remaining">يوم</span></small>
                    </div>
                </div>
                <div class="stat-card danger" style="border-right-color:#dc2626;" onclick="goTo('inventory')">
                    <div class="stat-icon"><i class="fas fa-skull"></i></div>
                    <div class="stat-info">
                        <h3 data-i18n="expired">منتهية الصلاحية</h3>
                        <p>${stats.expiredCount}</p>
                        <small><span data-i18n="expired">يجب التخلص منها</span></small>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-8">
                    <div class="card-modern">
                        <div class="card-header">
                            <h5><i class="fas fa-chart-line"></i> <span data-i18n="sales_analytics">تحليلات المبيعات</span></h5>
                        </div>
                        <div class="chart-container"><canvas id="salesChart"></canvas></div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card-modern">
                        <div class="card-header">
                            <h5><i class="fas fa-bell"></i> <span data-i18n="important_alerts">تنبيهات هامة</span></h5>
                        </div>
                        <div id="dashboardAlerts"></div>
                    </div>
                </div>
            </div>
            <div class="card-modern mt-3">
                <div class="card-header">
                    <h5><i class="fas fa-history"></i> <span data-i18n="recent_activities">آخر العمليات</span></h5>
                </div>
                <div id="recentActivities"></div>
            </div>
        `;
        
        applyTranslations();
        this.renderAlerts(); 
        this.renderActivities(); 
        this.renderChart();
    },
    
    renderAlerts() { 
        const container = document.getElementById('dashboardAlerts'); 
        if (!container) return; 
        const alerts = []; 
        
        AppData.medicines.forEach(function(m) { 
            if (m.quantity === 0) alerts.push({ type: 'danger', icon: 'times-circle', message: m.tradeName + ' - ' + t('out_of_stock') }); 
            else if (m.quantity <= m.minStock) alerts.push({ type: 'warning', icon: 'exclamation-triangle', message: m.tradeName + ' - ' + t('low_stock') + ' (' + m.quantity + ')' }); 
            if (m.expiryDate) { 
                const days = getDaysUntilExpiry(m.expiryDate); 
                if (days < 0) alerts.push({ type: 'danger', icon: 'skull', message: m.tradeName + ' - ' + t('expired') }); 
                else if (days <= AppData.settings.alertDays) alerts.push({ type: 'warning', icon: 'clock', message: m.tradeName + ' - ' + t('expiring_soon') + ' ' + days + ' ' + t('days_remaining') }); 
            } 
        }); 
        
        if (alerts.length === 0) {
            container.innerHTML = '<p class="text-success text-center py-3"><i class="fas fa-check-circle"></i> <span data-i18n="all_good">جميع الأدوية بحالة جيدة</span></p>';
        } else {
            container.innerHTML = alerts.slice(0, 5).map(function(a) {
                return '<div class="alert alert-' + a.type + ' d-flex align-items-center gap-2 mb-2"><i class="fas fa-' + a.icon + '"></i><span>' + a.message + '</span></div>';
            }).join('');
        }
        applyTranslations();
    },
    
    renderActivities() { 
        const container = document.getElementById('recentActivities'); 
        if (!container) return; 
        const recentAudit = AppData.audit.slice(0, 8); 
        if (recentAudit.length === 0) {
            container.innerHTML = '<p class="text-center text-muted py-3">' + t('no_data') + '</p>';
        } else {
            container.innerHTML = recentAudit.map(function(log) {
                return '<div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2"><div><i class="fas fa-history me-2 text-muted"></i><span>' + log.action + '</span>' + (log.details ? '<br><small class="text-muted">' + log.details + '</small>' : '') + '</div><div class="text-muted small"><i class="far fa-clock"></i> ' + formatDateTime(log.timestamp) + '</div></div>';
            }).join('');
        }
    },
    
    renderChart() {
        const canvas = document.getElementById('salesChart');
        if (!canvas) return;
        destroyChart('salesChart');
        
        const months = [], values = [], now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(d.toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' }));
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            const monthSales = AppData.sales.filter(function(s) { const sd = new Date(s.date); return sd >= start && sd <= end; }).reduce(function(sum, s) { return sum + (s.total || 0); }, 0);
            const monthReturns = (AppData.returns || []).filter(function(r) { const rd = new Date(r.date); return rd >= start && rd <= end; }).reduce(function(sum, r) { return sum + (r.totalAmount || 0); }, 0);
            values.push(monthSales - monthReturns);
        }
        
        const ctx = canvas.getContext('2d');
        chartsInstances['salesChart'] = new Chart(ctx, { 
            type: 'line', 
            data: { 
                labels: months, 
                datasets: [{ 
                    label: t('net_profit') + ' (SDG)', 
                    data: values, 
                    borderColor: '#0d9488', 
                    backgroundColor: 'rgba(13, 148, 136, 0.1)', 
                    borderWidth: 3, 
                    tension: 0.4, 
                    fill: true, 
                    pointBackgroundColor: '#0d9488', 
                    pointBorderColor: '#ffffff', 
                    pointBorderWidth: 2, 
                    pointRadius: 6, 
                    pointHoverRadius: 9 
                }] 
            }, 
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } }, 
                scales: { y: { beginAtZero: true, ticks: { callback: function(value) { return formatMoney(value).replace(' SDG', ''); } } } } 
            } 
        });
    }
};

// ================================================================
// POS Module (Point of Sale) - With Barcode Support
// ================================================================
window.POSModule = {
    cart: [], lastSale: null, searchTerm: '', currentCategory: 'all', checkoutData: null,
    
    async render() {
        const section = document.getElementById('pos'); 
        if (!section) return;
        
        section.innerHTML = `
            <div class="pos-container">
                <div class="pos-products-section">
                    <div class="section-header">
                        <h2><i class="fas fa-pills"></i> <span data-i18n="available_medicines">الأدوية المتوفرة</span></h2>
                        <div class="search-box">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-barcode"></i></span>
                                <input type="text" id="posBarcode" class="form-control" placeholder="${t('scan_barcode')}" style="max-width:200px;">
                                <input type="text" id="posSearch" class="form-control" placeholder="${t('search_medicine')}">
                            </div>
                        </div>
                    </div>
                    <div class="category-filter" id="posCategoryFilters"></div>
                    <div class="products-grid" id="posProductsGrid" style="max-height: calc(100vh - 350px);"></div>
                </div>
                <div class="pos-cart-section">
                    <div class="cart-header">
                        <h2><i class="fas fa-shopping-cart"></i> <span data-i18n="shopping_cart">سلة المشتريات</span></h2>
                        <button class="btn btn-sm btn-outline-danger" id="clearCartBtn">
                            <i class="fas fa-trash"></i> <span data-i18n="clear_cart">مسح السلة</span>
                        </button>
                    </div>
                    <div class="cart-items" id="cartItems"></div>
                    <div class="cart-summary">
                        <div class="summary-row">
                            <span data-i18n="items_count">عدد الأصناف:</span>
                            <span id="cartItemCount">0</span>
                        </div>
                        <div class="summary-row">
                            <span data-i18n="subtotal">الإجمالي الفرعي:</span>
                            <span id="cartSubtotal">0 SDG</span>
                        </div>
                        <div class="summary-row discount-row">
                            <span><i class="fas fa-tags"></i> <span data-i18n="discount">الخصم:</span></span>
                            <div class="discount-controls">
                                <input type="number" id="discountValue" min="0" value="0" class="form-control form-control-sm" style="width:80px">
                                <select id="discountType" class="form-select form-select-sm" style="width:80px;">
                                    <option value="fixed">SDG</option>
                                    <option value="percent">%</option>
                                </select>
                                <span id="discountAmount">0 SDG</span>
                            </div>
                        </div>
                        <div class="summary-row total-row">
                            <span data-i18n="total">الإجمالي النهائي:</span>
                            <span id="cartTotal">0 SDG</span>
                        </div>
                        <div class="summary-row text-success">
                            <span data-i18n="expected_profit">الربح المتوقع:</span>
                            <span id="cartProfit">0 SDG</span>
                        </div>
                    </div>
                    <div class="checkout-options">
                        <div class="form-group mb-2">
                            <label><i class="fas fa-user"></i> <span data-i18n="customer">العميل</span></label>
                            <select id="posCustomer" class="form-select">
                                <option value="">-- <span data-i18n="cash_customer">نقدي (بدون عميل)</span> --</option>
                            </select>
                        </div>
                        <div id="newCustomerFields" style="display:none;">
                            <div class="row g-2 mb-2">
                                <div class="col-6"><input type="text" id="newCustomerName" class="form-control" placeholder="${t('customer_name')}"></div>
                                <div class="col-6"><input type="tel" id="newCustomerPhone" class="form-control" placeholder="${t('phone')}"></div>
                            </div>
                        </div>
                        <div class="form-group mb-2">
                            <label><i class="fas fa-credit-card"></i> <span data-i18n="payment_method">طريقة الدفع</span></label>
                            <select id="posPaymentMethod" class="form-select">
                                <option value="cash" data-i18n="cash">💵 نقداً</option>
                                <option value="bank" data-i18n="bank_transfer">🏦 تحويل بنكي</option>
                                <option value="debt" data-i18n="debt">📝 دين</option>
                            </select>
                        </div>
                        <div id="bankFields" style="display:none;">
                            <div class="row g-2 mb-2">
                                <div class="col-6">
                                    <select id="bankName" class="form-select">
                                        <option>بنك الخرطوم</option><option>بنك النيلين</option><option>فوري</option>
                                    </select>
                                </div>
                                <div class="col-6"><input type="text" id="bankRef" class="form-control" placeholder="${t('reference')}"></div>
                            </div>
                        </div>
                        <div id="paidAmountField" style="display:none;">
                            <div class="form-group mb-2">
                                <label><i class="fas fa-money-bill"></i> <span data-i18n="paid_amount">المبلغ المدفوع</span></label>
                                <input type="number" id="paidAmount" class="form-control" min="0" value="0">
                            </div>
                            <div class="form-group mb-2">
                                <label><i class="fas fa-calendar"></i> <span data-i18n="due_date">تاريخ الاستحقاق</span></label>
                                <input type="date" id="debtDueDate" class="form-control">
                            </div>
                            <div id="remainingAmount" class="alert alert-warning" style="display:none;">
                                <i class="fas fa-info-circle"></i> <span data-i18n="remaining">المتبقي</span>: <strong id="debtRemaining">0 SDG</strong>
                            </div>
                        </div>
                    </div>
                    <div class="cart-actions">
                        <button class="btn-modern btn-modern-success w-100" id="checkoutBtn" style="padding:18px; font-size:18px;">
                            <i class="fas fa-check-circle"></i> <span data-i18n="checkout">إتمام البيع</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        applyTranslations();
        this.loadCart(); 
        this.renderProducts(); 
        this.renderCart(); 
        this.updateCustomerSelect(); 
        this.setDefaultDueDate();
        
        document.getElementById('posSearch').onkeyup = () => this.searchProducts();
        document.getElementById('posBarcode').onkeyup = (e) => { if (e.key === 'Enter') this.searchByBarcode(); };
        document.getElementById('clearCartBtn').onclick = () => this.clearCart();
        document.getElementById('posCustomer').onchange = () => this.toggleNewCustomer();
        document.getElementById('posPaymentMethod').onchange = () => this.togglePaymentFields();
        document.getElementById('paidAmount').oninput = () => this.updateDebtRemaining();
        document.getElementById('discountValue').oninput = () => this.updateCartSummary();
        document.getElementById('discountType').onchange = () => this.updateCartSummary();
        document.getElementById('checkoutBtn').onclick = () => this.checkout();
    },
    
    searchByBarcode() { 
        const barcode = document.getElementById('posBarcode')?.value.trim() || ''; 
        if (!barcode) return; 
        const medicine = DAL.getMedicineByBarcode(barcode); 
        if (medicine) { 
            if (medicine.quantity > 0) { 
                this.addToCart(medicine.id); 
                document.getElementById('posBarcode').value = ''; 
                document.getElementById('posBarcode').focus(); 
            } else { 
                showToast(medicine.tradeName + ' - ' + t('out_of_stock'), 'error'); 
            } 
        } else { 
            showToast(t('no_data'), 'error'); 
        } 
    },
    
    renderProducts() { 
        const grid = document.getElementById('posProductsGrid'); 
        if (!grid) return; 
        let products = AppData.medicines.filter(function(m) { return m.quantity > 0; }); 
        
        if (this.searchTerm) { 
            const term = this.searchTerm.toLowerCase(); 
            products = products.filter(function(m) { 
                return (m.tradeName || '').toLowerCase().indexOf(term) !== -1 ||
                    (m.scientificName || '').toLowerCase().indexOf(term) !== -1 ||
                    (m.manufacturer || '').toLowerCase().indexOf(term) !== -1 ||
                    (m.barcode || '').toLowerCase().indexOf(term) !== -1;
            }); 
        } 
        
        if (this.currentCategory !== 'all') products = products.filter(function(m) { return m.category === this.currentCategory; }.bind(this)); 
        
        if (products.length === 0) { 
            grid.innerHTML = '<div class="no-products text-center py-4 w-100"><i class="fas fa-box-open fa-3x"></i><p class="mt-2">' + t('no_data') + '</p></div>'; 
            return; 
        } 
        
        const self = this;
        grid.innerHTML = products.map(function(m) {
            return `
                <div class="product-card" onclick="window.POSModule.addToCart('${m.id}')">
                    <div class="product-icon"><i class="fas fa-prescription-bottle"></i></div>
                    <h4 class="product-name">${escapeHtml(m.tradeName)}</h4>
                    <p class="product-manufacturer">${escapeHtml(m.manufacturer || '-')}</p>
                    <p class="product-price">${formatMoney(m.price)}</p>
                    <p class="product-stock ${m.quantity <= m.minStock ? 'text-warning' : 'text-success'}">
                        <i class="fas fa-box"></i> ${m.quantity}${m.quantity <= m.minStock ? '<br><small>' + t('low_stock_warning') + '</small>' : ''}
                    </p>
                    <small class="text-muted">${escapeHtml(m.barcode || '')}</small>
                    <button class="btn-add-to-cart"><i class="fas fa-cart-plus"></i> ${t('add_to_cart')}</button>
                </div>
            `;
        }).join(''); 
        
        this.renderCategoryFilters(); 
    },
    
    renderCategoryFilters() { 
        const container = document.getElementById('posCategoryFilters'); 
        if (!container) return; 
        const cats = []; 
        const seen = {}; 
        
        AppData.medicines.filter(function(m) { return m.quantity > 0; }).forEach(function(m) { 
            if (m.category && !seen[m.category]) { 
                seen[m.category] = true; 
                cats.push(m.category); 
            } 
        }); 
        
        const self = this;
        container.innerHTML = '<button class="filter-chip' + (this.currentCategory === 'all' ? ' active' : '') + '" onclick="window.POSModule.filterByCategory(\'all\')">' + t('all_categories') + '</button>' + 
            cats.slice(0, 6).map(function(cat) {
                return '<button class="filter-chip' + (self.currentCategory === cat ? ' active' : '') + '" onclick="window.POSModule.filterByCategory(\'' + cat.replace(/'/g, "\\'") + '\')">' + escapeHtml(cat) + '</button>';
            }).join(''); 
    },
    
    renderCart() { 
        const container = document.getElementById('cartItems'); 
        if (!container) return; 
        
        if (this.cart.length === 0) { 
            container.innerHTML = '<div class="empty-cart-message"><i class="fas fa-shopping-basket fa-3x"></i><p>' + t('cart_empty') + '</p><p class="text-muted">' + t('available_medicines') + '</p></div>'; 
            document.getElementById('cartItemCount').textContent = '0'; 
            document.getElementById('cartSubtotal').textContent = '0 SDG'; 
            document.getElementById('cartTotal').textContent = '0 SDG'; 
            document.getElementById('cartProfit').textContent = '0 SDG'; 
            document.getElementById('discountAmount').textContent = '0 SDG'; 
            return; 
        } 
        
        var self = this;
        container.innerHTML = this.cart.map(function(item, i) {
            return `
                <div class="cart-item">
                    <div class="cart-item-info"><strong>${escapeHtml(item.name)}</strong><small>${formatMoney(item.price)}</small></div>
                    <div class="cart-item-controls">
                        <button class="btn-qty" onclick="window.POSModule.updateCartQty(${i}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-qty" onclick="window.POSModule.updateCartQty(${i}, 1)">+</button>
                        <button class="btn-remove" onclick="window.POSModule.removeFromCart(${i})"><i class="fas fa-trash"></i></button>
                    </div>
                    <div class="cart-item-subtotal">${formatMoney(item.price * item.quantity)}</div>
                </div>
            `;
        }).join(''); 
        this.updateCartSummary(); 
    },
    
    addToCart(medicineId) { 
        const m = DAL.getMedicineById(medicineId); 
        if (!m || m.quantity <= 0) { 
            showToast(t('out_of_stock'), 'error'); 
            return; 
        } 
        
        const existing = this.cart.find(function(i) { return i.id === medicineId; }); 
        if (existing) { 
            if (existing.quantity < m.quantity) existing.quantity++; 
            else { 
                showToast(t('low_stock_warning') + ': ' + m.quantity, 'warning'); 
                return; 
            } 
        } else {
            this.cart.push({ id: m.id, name: m.tradeName, price: m.price, cost: m.cost || 0, quantity: 1, maxStock: m.quantity }); 
        }
        this.saveCart(); 
        this.renderCart(); 
        showToast('✅ ' + t('add_to_cart') + ': ' + m.tradeName, 'success'); 
    },
    
    updateCartQty(index, delta) { 
        const item = this.cart[index]; 
        if (!item) return; 
        const m = DAL.getMedicineById(item.id); 
        const max = m ? m.quantity : item.maxStock; 
        const nq = item.quantity + delta; 
        if (nq <= 0) { this.removeFromCart(index); return; } 
        if (nq > max) { showToast(t('low_stock_warning') + ': ' + max, 'warning'); return; } 
        item.quantity = nq; 
        this.saveCart(); 
        this.renderCart(); 
    },
    
    removeFromCart(index) { 
        const item = this.cart[index]; 
        this.cart.splice(index, 1); 
        this.saveCart(); 
        this.renderCart(); 
        if (item) showToast('🗑️ ' + t('delete') + ' ' + item.name, 'info'); 
    },
    
    clearCart() { 
        if (this.cart.length && confirm(t('clear_cart') + '?')) { 
            this.cart = []; 
            this.saveCart(); 
            this.renderCart(); 
            showToast('🧹 ' + t('clear_cart'), 'info'); 
        } 
    },
    
    updateCartSummary() { 
        const sub = this.cart.reduce(function(s, i) { return s + (i.price * i.quantity); }, 0); 
        const cost = this.cart.reduce(function(s, i) { return s + (i.cost * i.quantity); }, 0); 
        let dv = parseFloat(document.getElementById('discountValue')?.value || 0) || 0; 
        const dt = document.getElementById('discountType')?.value || 'fixed'; 
        let disc = dt === 'percent' ? sub * (Math.min(dv, 100) / 100) : Math.min(dv, sub); 
        const total = Math.max(0, sub - disc); 
        const profit = total - cost; 
        
        document.getElementById('cartItemCount').textContent = this.cart.length; 
        document.getElementById('cartSubtotal').textContent = formatMoney(sub); 
        document.getElementById('discountAmount').textContent = formatMoney(disc); 
        document.getElementById('cartTotal').textContent = formatMoney(total); 
        document.getElementById('cartProfit').textContent = formatMoney(profit); 
        this.updateDebtRemaining(total); 
    },
    
    searchProducts() { 
        this.searchTerm = document.getElementById('posSearch')?.value.trim().toLowerCase() || ''; 
        this.renderProducts(); 
    },
    
    filterByCategory(c) { this.currentCategory = c; this.renderProducts(); },
    
    updateCustomerSelect() { 
        const select = document.getElementById('posCustomer'); 
        if (select) {
            select.innerHTML = '<option value="">-- ' + t('cash_customer') + ' --</option>' + 
                AppData.customers.map(function(c) { return '<option value="' + c.id + '">' + escapeHtml(c.name) + ' (' + escapeHtml(c.phone || '') + ')</option>'; }).join('');
        }
    },
    
    toggleNewCustomer() { 
        const fields = document.getElementById('newCustomerFields'); 
        if (fields) fields.style.display = document.getElementById('posCustomer')?.value === '' ? 'block' : 'none'; 
    },
    
    togglePaymentFields() { 
        const method = document.getElementById('posPaymentMethod')?.value || 'cash'; 
        const bankFields = document.getElementById('bankFields'); 
        const paidField = document.getElementById('paidAmountField'); 
        if (bankFields) bankFields.style.display = method === 'bank' ? 'block' : 'none'; 
        if (paidField) paidField.style.display = method === 'debt' ? 'block' : 'none'; 
        if (method === 'debt') this.updateDebtRemaining(); 
    },
    
    updateDebtRemaining(total) { 
        const totalEl = document.getElementById('cartTotal');
        const paidEl = document.getElementById('paidAmount');
        const remainingEl = document.getElementById('debtRemaining');
        const remainingDiv = document.getElementById('remainingAmount');
        
        if (!totalEl || !paidEl || !remainingEl || !remainingDiv) return; 
        
        const ct = total !== undefined ? total : parseFloat(totalEl.textContent.replace(/[^0-9.-]+/g, '')) || 0; 
        const paid = parseFloat(paidEl.value) || 0; 
        const rem = Math.max(0, ct - paid); 
        remainingEl.textContent = formatMoney(rem); 
        remainingDiv.style.display = rem > 0 ? 'block' : 'none'; 
        if (!paidEl.value && ct > 0) paidEl.value = ct; 
    },
    
    setDefaultDueDate() { 
        const dueDateInput = document.getElementById('debtDueDate'); 
        if (dueDateInput) { 
            const dt = new Date(); 
            dt.setMonth(dt.getMonth() + 1); 
            dueDateInput.value = dt.toISOString().split('T')[0]; 
        } 
    },
    
    saveCart() { localStorage.setItem('pharmacy_cart', JSON.stringify(this.cart)); },
    
    loadCart() { 
        const saved = localStorage.getItem('pharmacy_cart'); 
        if (saved) { 
            try { 
                this.cart = JSON.parse(saved); 
                this.cart.forEach(function(i) { 
                    const m = DAL.getMedicineById(i.id); 
                    if (m) { i.maxStock = m.quantity; if (i.quantity > m.quantity) i.quantity = m.quantity; } 
                }); 
            } catch(e) { this.cart = []; } 
        } 
    },
    
    checkout() { 
        if (this.cart.length === 0) { showToast(t('cart_empty'), 'warning'); return; } 
        
        for (let idx = 0; idx < this.cart.length; idx++) { 
            const item = this.cart[idx]; 
            const med = DAL.getMedicineById(item.id); 
            if (!med || med.quantity < item.quantity) { 
                showToast(t('out_of_stock') + ': ' + item.name, 'error'); 
                return; 
            } 
        } 
        
        const sub = this.cart.reduce(function(s, i) { return s + (i.price * i.quantity); }, 0); 
        const cost = this.cart.reduce(function(s, i) { return s + (i.cost * i.quantity); }, 0); 
        let dv = parseFloat(document.getElementById('discountValue')?.value || 0) || 0; 
        const dt = document.getElementById('discountType')?.value || 'fixed'; 
        let disc = dt === 'percent' ? sub * (dv / 100) : dv; 
        disc = Math.min(disc, sub); 
        const total = sub - disc; 
        const profit = total - cost; 
        const method = document.getElementById('posPaymentMethod')?.value || 'cash'; 
        const customerSelect = document.getElementById('posCustomer'); 
        const custName = customerSelect ? (customerSelect.options[customerSelect.selectedIndex]?.text || t('cash_customer')) : t('cash_customer'); 
        
        this.checkoutData = { sub, cost, disc, dv, dt, total, profit, method, custName }; 
        this.showCheckoutModal(); 
    },
    
    showCheckoutModal() { 
        const d = this.checkoutData; 
        const pharmacyName = AppData.pharmacyInfo.name || t('app_name');
        
        const h = `
            <div class="modal fade" id="checkoutConfirmModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5><i class="fas fa-check-double"></i> ${t('checkout')} - ${pharmacyName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <h6>${t('medicines')}:</h6>
                            <table class="table table-sm">
                                <thead><tr><th>${t('medicine')}</th><th>${t('quantity')}</th><th>${t('price')}</th><th>${t('total')}</th></tr></thead>
                                <tbody>
                                    ${this.cart.map(function(i) { return '<tr><td>' + escapeHtml(i.name) + '</td><td>' + i.quantity + '</td><td>' + formatMoney(i.price) + '</td><td>' + formatMoney(i.price * i.quantity) + '</td></tr>'; }).join('')}
                                </tbody>
                            </table>
                            <div class="checkout-summary">
                                <div class="d-flex justify-content-between"><span>${t('subtotal')}:</span><span>${formatMoney(d.sub)}</span></div>
                                ${d.disc > 0 ? '<div class="d-flex justify-content-between"><span>' + t('discount') + ':</span><span>-' + formatMoney(d.disc) + '</span></div>' : ''}
                                <div class="d-flex justify-content-between fw-bold"><span>${t('total')}:</span><span>${formatMoney(d.total)}</span></div>
                                <div class="d-flex justify-content-between text-success"><span>${t('expected_profit')}:</span><span>${formatMoney(d.profit)}</span></div>
                            </div>
                            <hr>
                            <p><strong>${t('customer')}:</strong> ${d.custName}</p>
                            <p><strong>${t('payment_method')}:</strong> ${d.method === 'cash' ? t('cash') : d.method === 'bank' ? t('bank_transfer') : t('debt')}</p>
                            ${this.getPaymentDetailsText()}
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-bs-dismiss="modal">${t('cancel')}</button>
                            <button class="btn btn-primary" onclick="window.POSModule.confirmCheckout()">${t('confirm')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existing = document.getElementById('checkoutConfirmModal'); 
        if (existing) existing.remove(); 
        document.body.insertAdjacentHTML('beforeend', h); 
        new bootstrap.Modal(document.getElementById('checkoutConfirmModal')).show(); 
    },
    
    getPaymentDetailsText() { 
        const method = document.getElementById('posPaymentMethod')?.value || 'cash'; 
        
        if (method === 'bank') { 
            const bank = document.getElementById('bankName')?.value || '-'; 
            const ref = document.getElementById('bankRef')?.value || '-'; 
            return '<p><strong>' + t('bank_transfer') + ':</strong> ' + bank + '<br><strong>' + t('reference') + ':</strong> ' + ref + '</p>'; 
        } 
        
        if (method === 'debt') { 
            const paid = parseFloat(document.getElementById('paidAmount')?.value || 0) || 0; 
            const total = this.checkoutData ? this.checkoutData.total : 0; 
            const rem = total - paid; 
            const due = document.getElementById('debtDueDate')?.value || '-'; 
            return '<p><strong>' + t('paid_amount') + ':</strong> ' + formatMoney(paid) + '<br><strong>' + t('remaining') + ':</strong> ' + formatMoney(rem) + '<br><strong>' + t('due_date') + ':</strong> ' + formatDate(due) + '</p>'; 
        } 
        return ''; 
    },
    
    async confirmCheckout() { 
        const d = this.checkoutData; 
        if (!d) return; 
        
        const method = document.getElementById('posPaymentMethod')?.value || 'cash'; 
        let cust = null; 
        const cid = document.getElementById('posCustomer')?.value || ''; 
        
        if (cid) { 
            cust = DAL.getCustomerById(cid); 
        } else { 
            const nn = document.getElementById('newCustomerName')?.value.trim() || ''; 
            const phone = document.getElementById('newCustomerPhone')?.value.trim() || ''; 
            if (nn) { 
                const existing = AppData.customers.find(function(c) { return c.name === nn || (phone && c.phone === phone); });
                if (existing) {
                    cust = existing;
                    showToast(t('customer') + ': ' + existing.name, 'info');
                } else {
                    cust = { id: generateId('CUST'), name: nn, phone: phone, email: '', address: '', joined: new Date().toISOString() }; 
                    await DAL.addCustomer(cust); 
                }
            } 
        } 
        
        let paid = d.total, debt = 0, bank = null; 
        if (method === 'bank') bank = { bank: document.getElementById('bankName')?.value || '', ref: document.getElementById('bankRef')?.value || '' }; 
        if (method === 'debt') { paid = parseFloat(document.getElementById('paidAmount')?.value || 0) || 0; debt = d.total - paid; } 
        
        const invoiceNumber = this.generateInvoiceNumber(); 
        
        for (let i = 0; i < this.cart.length; i++) { 
            const item = this.cart[i]; 
            const m = DAL.getMedicineById(item.id); 
            if (m) { 
                m.quantity -= item.quantity; 
                m.updatedAt = new Date().toISOString(); 
                await IDB.put('medicines', m); 
                await addMovement(m.id, m.tradeName, 'sell', item.quantity, m.quantity, t('invoice') + ' #' + invoiceNumber); 
            } 
        } 
        
        const sale = { 
            id: generateId('SALE'), 
            invoiceNumber, 
            date: new Date().toISOString(), 
            customer: cust ? cust.name : t('cash_customer'), 
            customerId: cust ? cust.id : null, 
            customerPhone: cust ? cust.phone : '', 
            items: JSON.parse(JSON.stringify(this.cart)), 
            subtotal: d.sub, 
            discount: d.disc, 
            discountType: d.dt, 
            discountValue: d.dv, 
            total: d.total, 
            cost: d.cost, 
            profit: d.profit, 
            paid, 
            debt, 
            method, 
            bankDetails: bank, 
            createdBy: AppData.currentUser ? AppData.currentUser.name : '', 
            hasRefund: false, 
            refundTotal: 0, 
            refundProfitLoss: 0 
        }; 
        
        await DAL.addSale(sale); 
        this.lastSale = sale; 
        
        if (debt > 0 && cust) { 
            if (!AppData.debts) AppData.debts = []; 
            const debtRecord = { 
                id: generateId('DEBT'), 
                type: 'customer', 
                customerId: cust.id, 
                name: cust.name, 
                originalAmount: debt, 
                remaining: debt, 
                date: new Date().toISOString(), 
                dueDate: document.getElementById('debtDueDate')?.value || '', 
                payments: [], 
                status: 'active', 
                saleId: sale.id 
            }; 
            AppData.debts.push(debtRecord); 
            await IDB.put('debts', debtRecord); 
        } 
        
        await addAuditLog(t('checkout'), t('invoice') + ' #' + sale.invoiceNumber + ' - ' + formatMoney(d.total)); 
        await saveData(); 
        
        const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutConfirmModal')); 
        if (checkoutModal) checkoutModal.hide(); 
        this.showSuccessModal(sale); 
        this.cart = []; 
        this.saveCart(); 
        document.getElementById('discountValue').value = '0'; 
        document.getElementById('posCustomer').value = ''; 
        const ncf = document.getElementById('newCustomerFields'); 
        if (ncf) ncf.style.display = 'none'; 
        document.getElementById('paidAmount').value = ''; 
        this.renderProducts(); 
        this.renderCart(); 
        this.updateCustomerSelect(); 
    },
    
    generateInvoiceNumber() { 
        const d = new Date(); 
        return 'INV-' + d.getFullYear().toString().slice(-2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + String(AppData.sales.length + 1).padStart(4, '0'); 
    },
    
    showSuccessModal(sale) { 
        const pharmacyName = AppData.pharmacyInfo.name || t('app_name');
        const h = `
            <div class="modal fade" id="saleSuccessModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5><i class="fas fa-check-circle"></i> ${t('checkout')} - ${pharmacyName}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <i class="fas fa-check-circle text-success fa-4x mb-3"></i>
                            <h4>${t('invoice')} #${sale.invoiceNumber}</h4>
                            <p class="fs-5">${t('total')}: <strong>${formatMoney(sale.total)}</strong></p>
                            ${sale.debt > 0 ? '<p class="text-warning">' + t('remaining_debt') + ': ' + formatMoney(sale.debt) + '</p>' : ''}
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-info" onclick="window.POSModule.printInvoice('${sale.id}')"><i class="fas fa-print"></i> ${t('print')}</button>
                            <button class="btn btn-success" onclick="window.POSModule.sendWhatsApp('${sale.id}')"><i class="fab fa-whatsapp"></i> WhatsApp</button>
                            <button class="btn btn-primary" data-bs-dismiss="modal">${t('close')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existing = document.getElementById('saleSuccessModal'); 
        if (existing) existing.remove(); 
        document.body.insertAdjacentHTML('beforeend', h); 
        new bootstrap.Modal(document.getElementById('saleSuccessModal')).show(); 
        showToast('✅ ' + t('checkout') + ' - ' + formatMoney(sale.total), 'success'); 
    },
    
    printInvoice(saleId) { 
        const sale = saleId ? DAL.getSaleById(saleId) : this.lastSale; 
        if (!sale) return; 
        const pharmacyName = AppData.pharmacyInfo.name || t('app_name');
        const pharmacyPhone = AppData.pharmacyInfo.phone || '';
        const pharmacyAddress = AppData.pharmacyInfo.address || '';
        const pharmacyLicense = AppData.pharmacyInfo.license || '';
        
        const phoneHtml = pharmacyPhone ? '<p>📞 ' + escapeHtml(pharmacyPhone) + '</p>' : '';
        const addressHtml = pharmacyAddress ? '<p>📍 ' + escapeHtml(pharmacyAddress) + '</p>' : '';
        const licenseHtml = pharmacyLicense ? '<p>📋 ' + t('license') + ': ' + escapeHtml(pharmacyLicense) + '</p>' : '';
        const discountHtml = sale.discount > 0 ? '<p><strong>' + t('discount') + ':</strong> -' + formatMoney(sale.discount) + '</p>' : '';
        const debtHtml = sale.debt > 0 ? '<p><strong>' + t('remaining') + ':</strong> ' + formatMoney(sale.debt) + '</p>' : '<p style="color:green">✓ ' + t('paid') + '</p>';
        
        const w = window.open('', '_blank'); 
        w.document.write(`
            <!DOCTYPE html>
            <html dir="${currentLanguage === 'ar' ? 'rtl' : 'ltr'}">
            <head>
                <meta charset="UTF-8">
                <title>${t('invoice')} ${sale.invoiceNumber}</title>
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body{font-family:Tajawal;padding:20px}
                    .invoice-header{text-align:center;margin-bottom:30px;border-bottom:2px solid #0d9488;padding-bottom:20px}
                    .invoice-header h1{color:#0d9488;margin-bottom:5px}
                    .invoice-header p{margin:5px 0;color:#555}
                    table{width:100%;border-collapse:collapse;margin:20px 0}
                    th,td{border:1px solid #ddd;padding:12px;text-align:${currentLanguage === 'ar' ? 'right' : 'left'}}
                    th{background:#0d9488;color:#fff}
                    .total-row{font-size:18px;font-weight:bold;margin-top:20px}
                    .footer{margin-top:30px;text-align:center;color:#888;font-size:12px;border-top:1px solid #ddd;padding-top:15px}
                </style>
            </head>
            <body>
                <div class="invoice-header">
                    <h1>🏥 ${escapeHtml(pharmacyName)}</h1>
                    ${phoneHtml}
                    ${addressHtml}
                    ${licenseHtml}
                    <hr>
                    <p><strong>${t('invoice')} #${sale.invoiceNumber}</strong></p>
                    <p>${t('date')}: ${formatDateTime(sale.date)}</p>
                    <p>${t('customer')}: ${escapeHtml(sale.customer || t('cash_customer'))}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>${t('medicine')}</th>
                            <th>${t('quantity')}</th>
                            <th>${t('price')}</th>
                            <th>${t('total')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items.map(function(i) {
                            return '<tr><td>' + escapeHtml(i.name) + '</td><td>' + i.quantity + '</td><td>' + formatMoney(i.price) + '</td><td>' + formatMoney(i.price * i.quantity) + '</td></tr>';
                        }).join('')}
                    </tbody>
                </table>
                ${discountHtml}
                <div class="total-row">
                    <p><strong>${t('total')}:</strong> ${formatMoney(sale.total)}</p>
                    <p><strong>${t('paid')}:</strong> ${formatMoney(sale.paid)}</p>
                    ${debtHtml}
                </div>
                <div class="footer">
                    <p>${t('thank_you')} ${escapeHtml(pharmacyName)} 🙏</p>
                    <p>${t('health_wishes')}</p>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(window.close, 1000);
                    };
                <\/script>
            </body>
            </html>
        `); 
        w.document.close(); 
    },
    
    sendWhatsApp(saleId) { 
        const sale = saleId ? DAL.getSaleById(saleId) : this.lastSale; 
        if (!sale) return; 
        const phone = prompt(t('phone') + ':', '249'); 
        if (!phone) return;
        
        const pharmacyName = AppData.pharmacyInfo.name || t('app_name');
        const pharmacyPhone = AppData.pharmacyInfo.phone || '';
        const pharmacyAddress = AppData.pharmacyInfo.address || '';
        
        let msg = '🏥 *' + pharmacyName + '*\n';
        if (pharmacyPhone) msg += '📞 ' + pharmacyPhone + '\n';
        if (pharmacyAddress) msg += '📍 ' + pharmacyAddress + '\n';
        msg += '━━━━━━━━━━━━━━━\n';
        msg += '📋 ' + t('invoice') + ' #' + sale.invoiceNumber + '\n';
        msg += '📅 ' + formatDateTime(sale.date) + '\n';
        msg += '👤 ' + sale.customer + '\n\n';
        msg += '📦 *' + t('medicines') + ':*\n';
        
        sale.items.forEach(function(i) { 
            msg += '• ' + i.name + ' ×' + i.quantity + ' = ' + formatMoney(i.price * i.quantity) + '\n'; 
        });
        
        msg += '\n';
        if (sale.discount > 0) msg += '🔖 ' + t('discount') + ': -' + formatMoney(sale.discount) + '\n';
        msg += '💰 *' + t('total') + ':* ' + formatMoney(sale.total) + '\n';
        msg += '✅ *' + t('paid') + ':* ' + formatMoney(sale.paid) + '\n';
        if (sale.debt > 0) msg += '⏳ *' + t('remaining') + ':* ' + formatMoney(sale.debt) + '\n';
        msg += '\n━━━━━━━━━━━━━━━\n';
        msg += '🙏 ' + t('thank_you') + ' ' + pharmacyName + '\n';
        msg += '💊 ' + t('health_wishes');
        
        window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank'); 
        showToast('📱 ' + t('whatsapp'), 'success'); 
    }
};

// ================================================================
// Medicines Module
// ================================================================
window.MedicinesModule = {
    currentFilter: 'all', currentCategory: 'all', searchTerm: '', currentPage: 1, itemsPerPage: 15,
    
    async render() {
        const section = document.getElementById('medicines'); 
        if (!section) return;
        
        section.innerHTML = `
            <h4 style="color:white; font-weight:900; margin-bottom:20px;">
                <i class="fas fa-pills"></i> <span data-i18n="medicines">إدارة الأدوية</span>
            </h4>
            <div class="stats-grid" id="medicinesStats"></div>
            <div class="card-modern">
                <div class="action-bar">
                    <button class="btn-modern btn-modern-success" id="openAddMedicineBtn">
                        <i class="fas fa-plus-circle"></i> <span data-i18n="add_medicine">إضافة دواء جديد</span>
                    </button>
                    <button class="btn-modern btn-modern-info" id="exportMedicinesBtn">
                        <i class="fas fa-download"></i> <span data-i18n="export">تصدير CSV</span>
                    </button>
                    <button class="btn-modern btn-modern-warning" id="refreshMedicinesBtn">
                        <i class="fas fa-sync-alt"></i> <span data-i18n="refresh">تحديث</span>
                    </button>
                </div>
            </div>
            <div class="card-modern">
                <div class="filter-row">
                    <div class="filter-group flex-grow-1">
                        <label><i class="fas fa-search"></i> <span data-i18n="search">بحث</span></label>
                        <input type="text" id="medicineSearch" class="form-control" placeholder="${t('search_medicine')}">
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-filter"></i> <span data-i18n="status">الحالة</span></label>
                        <select id="statusFilter" class="form-select">
                            <option value="all" data-i18n="all">الكل</option>
                            <option value="inStock" data-i18n="in_stock">متوفر</option>
                            <option value="lowStock" data-i18n="low_stock">مخزون منخفض</option>
                            <option value="outOfStock" data-i18n="out_of_stock">نفذ</option>
                            <option value="expiring" data-i18n="expiring_soon">قاربة الانتهاء</option>
                            <option value="expired" data-i18n="expired">منتهية</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-tags"></i> <span data-i18n="category">التصنيف</span></label>
                        <select id="categoryFilter" class="form-select">
                            <option value="all" data-i18n="all_categories">جميع التصنيفات</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>&nbsp;</label>
                        <button class="btn btn-outline-secondary" id="resetFiltersBtn">
                            <i class="fas fa-redo"></i> <span data-i18n="reset">إعادة تعيين</span>
                        </button>
                    </div>
                </div>
                <div class="category-chips" id="categoryChips"></div>
            </div>
            <div class="card-modern">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th data-i18n="medicine">الدواء</th>
                                <th data-i18n="barcode">الباركود</th>
                                <th data-i18n="category">التصنيف</th>
                                <th data-i18n="manufacturer">الشركة</th>
                                <th data-i18n="batch_number">رقم التشغيلة</th>
                                <th data-i18n="quantity">الكمية</th>
                                <th data-i18n="min_stock">الحد الأدنى</th>
                                <th data-i18n="selling_price">سعر البيع</th>
                                <th data-i18n="expiry_date">تاريخ الانتهاء</th>
                                <th data-i18n="status">الحالة</th>
                                <th data-i18n="actions">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="medicinesTableBody"></tbody>
                    </table>
                </div>
                <div class="pagination-modern" id="medicinesPagination"></div>
            </div>
        `;
        
        applyTranslations();
        this.updateStats(); 
        this.updateCategoryFilter(); 
        this.renderTable();
        
        document.getElementById('openAddMedicineBtn').onclick = () => this.openAddModal();
        document.getElementById('exportMedicinesBtn').onclick = () => this.exportToCSV();
        document.getElementById('refreshMedicinesBtn').onclick = () => this.render();
        
        const searchInput = document.getElementById('medicineSearch');
        if (searchInput) {
            const debouncedSearch = this.debounce(() => this.search(), 300);
            searchInput.onkeyup = debouncedSearch;
        }
        
        document.getElementById('statusFilter').onchange = () => this.filterByStatus();
        document.getElementById('categoryFilter').onchange = () => this.filterByCategory();
        document.getElementById('resetFiltersBtn').onclick = () => this.resetFilters();
    },
    
    debounce(fn, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },
    
    updateStats() { 
        const container = document.getElementById('medicinesStats'); 
        if (!container) return; 
        const stats = { 
            total: AppData.medicines.length, 
            inStock: AppData.medicines.filter(function(m) { return m.quantity > m.minStock; }).length, 
            lowStock: AppData.medicines.filter(function(m) { return m.quantity > 0 && m.quantity <= m.minStock; }).length, 
            outOfStock: AppData.medicines.filter(function(m) { return m.quantity === 0; }).length, 
            expiring: AppData.medicines.filter(function(m) { return m.expiryDate && getDaysUntilExpiry(m.expiryDate) >= 0 && getDaysUntilExpiry(m.expiryDate) <= 30; }).length, 
            expired: AppData.medicines.filter(function(m) { return m.expiryDate && getDaysUntilExpiry(m.expiryDate) < 0; }).length, 
            totalValue: AppData.medicines.reduce(function(sum, m) { return sum + (m.price * m.quantity); }, 0) 
        }; 
        
        container.innerHTML = `
            <div class="stat-card" style="border-right-color:#0d9488;">
                <div class="stat-icon"><i class="fas fa-pills"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="total_medicines">إجمالي الأدوية</h3>
                    <p>${stats.total}</p>
                    <small data-i18n="in_stock">متوفر: ${stats.inStock}</small>
                </div>
            </div>
            <div class="stat-card warning" style="border-right-color:#f59e0b;">
                <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="low_stock">مخزون منخفض</h3>
                    <p>${stats.lowStock}</p>
                </div>
            </div>
            <div class="stat-card danger" style="border-right-color:#ef4444;">
                <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="out_of_stock">نفذ من المخزون</h3>
                    <p>${stats.outOfStock}</p>
                </div>
            </div>
            <div class="stat-card warning" style="border-right-color:#e67e22;">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="expiring_soon">قاربة الانتهاء</h3>
                    <p>${stats.expiring}</p>
                </div>
            </div>
            <div class="stat-card danger" style="border-right-color:#dc2626;">
                <div class="stat-icon"><i class="fas fa-skull"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="expired">منتهية الصلاحية</h3>
                    <p>${stats.expired}</p>
                </div>
            </div>
            <div class="stat-card success" style="border-right-color:#10b981;">
                <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="inventory_value">قيمة المخزون</h3>
                    <p>${formatMoney(stats.totalValue)}</p>
                </div>
            </div>
        `;
        applyTranslations();
    },
    
    getMedicineStatus(m) { 
        const days = m.expiryDate ? getDaysUntilExpiry(m.expiryDate) : 999; 
        if (days < 0) return { text: t('expired'), badgeClass: 'bg-danger', rowClass: 'table-danger', stockClass: 'text-danger', expiryWarning: t('expired') + '!', expiryClass: 'text-danger' }; 
        if (m.quantity === 0) return { text: t('out_of_stock'), badgeClass: 'bg-secondary', rowClass: 'table-secondary', stockClass: 'text-danger', expiryWarning: days <= 30 ? days + ' ' + t('days_remaining') : '', expiryClass: 'text-warning' }; 
        if (m.quantity <= m.minStock) return { text: t('low_stock'), badgeClass: 'bg-warning', rowClass: 'table-warning', stockClass: 'text-warning', expiryWarning: days <= 30 ? days + ' ' + t('days_remaining') : '', expiryClass: 'text-warning' }; 
        if (days <= 30) return { text: t('in_stock'), badgeClass: 'bg-success', rowClass: '', stockClass: 'text-success', expiryWarning: days + ' ' + t('days_remaining'), expiryClass: 'text-warning' }; 
        return { text: t('in_stock'), badgeClass: 'bg-success', rowClass: '', stockClass: 'text-success', expiryWarning: '', expiryClass: '' }; 
    },
    
    applyFilters() { 
        let filtered = DAL.getMedicines().slice(); 
        if (this.currentFilter !== 'all') { 
            const self = this;
            filtered = filtered.filter(function(m) { 
                const days = m.expiryDate ? getDaysUntilExpiry(m.expiryDate) : 999; 
                const isLow = m.quantity > 0 && m.quantity <= m.minStock; 
                const isOut = m.quantity === 0; 
                const isExpiring = days >= 0 && days <= 30; 
                const isExpired = days < 0; 
                const isInStock = m.quantity > m.minStock; 
                switch (self.currentFilter) { 
                    case 'inStock': return isInStock; 
                    case 'lowStock': return isLow; 
                    case 'outOfStock': return isOut; 
                    case 'expiring': return isExpiring; 
                    case 'expired': return isExpired; 
                    default: return true; 
                } 
            }); 
        } 
        if (this.currentCategory !== 'all') filtered = filtered.filter(function(m) { return m.category === this.currentCategory; }.bind(this)); 
        if (this.searchTerm) { 
            const term = this.searchTerm.toLowerCase(); 
            filtered = filtered.filter(function(m) { 
                return (m.tradeName || '').toLowerCase().indexOf(term) !== -1 || 
                    (m.scientificName || '').toLowerCase().indexOf(term) !== -1 || 
                    (m.manufacturer || '').toLowerCase().indexOf(term) !== -1 || 
                    (m.batchNumber || '').toLowerCase().indexOf(term) !== -1 || 
                    (m.barcode || '').toLowerCase().indexOf(term) !== -1;
            }); 
        } 
        return filtered; 
    },
    
    renderTable() { 
        const tbody = document.getElementById('medicinesTableBody'); 
        if (!tbody) return; 
        const filtered = this.applyFilters(); 
        const total = Math.ceil(filtered.length / this.itemsPerPage); 
        const start = (this.currentPage - 1) * this.itemsPerPage; 
        const paginated = filtered.slice(start, start + this.itemsPerPage); 
        
        if (paginated.length === 0) { 
            tbody.innerHTML = '<tr><td colspan="12" class="text-center py-4">' + t('no_data') + '</td></tr>'; 
            this.renderPagination(0); 
            return; 
        } 
        
        const self = this;
        tbody.innerHTML = paginated.map(function(m, i) { 
            const s = self.getMedicineStatus(m); 
            return `
                <tr class="${s.rowClass}">
                    <td>${start + i + 1}</td>
                    <td><strong>${escapeHtml(m.tradeName)}</strong>${m.scientificName ? '<br><small>' + escapeHtml(m.scientificName) + '</small>' : ''}</td>
                    <td><code>${escapeHtml(m.barcode || '-')}</code></td>
                    <td>${escapeHtml(m.category || '-')}</td>
                    <td>${escapeHtml(m.manufacturer || '-')}</td>
                    <td><code>${escapeHtml(m.batchNumber || '-')}</code></td>
                    <td class="fw-bold ${s.stockClass}">${m.quantity}</td>
                    <td>${m.minStock || 10}</td>
                    <td>${formatMoney(m.price)}</td>
                    <td>${m.expiryDate ? formatDate(m.expiryDate) : '-'}${s.expiryWarning ? '<br><small class="' + s.expiryClass + '">' + s.expiryWarning + '</small>' : ''}</td>
                    <td><span class="badge ${s.badgeClass}">${s.text}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.MedicinesModule.openEditModal('${m.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-success" onclick="window.MedicinesModule.openStockModal('${m.id}')"><i class="fas fa-boxes"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="window.MedicinesModule.deleteMedicine('${m.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `; 
        }).join(''); 
        this.renderPagination(total); 
    },
    
    renderPagination(total) { 
        const container = document.getElementById('medicinesPagination'); 
        if (!container) return; 
        if (total <= 1) { container.innerHTML = ''; return; } 
        
        const self = this;
        let html = '<ul class="pagination">';
        html += '<li class="page-item' + (this.currentPage === 1 ? ' disabled' : '') + '"><span class="page-link" onclick="window.MedicinesModule.goToPage(' + (this.currentPage - 1) + ')">«</span></li>';
        
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += '<li class="page-item' + (i === this.currentPage ? ' active' : '') + '"><span class="page-link" onclick="window.MedicinesModule.goToPage(' + i + ')">' + i + '</span></li>';
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        html += '<li class="page-item' + (this.currentPage === total ? ' disabled' : '') + '"><span class="page-link" onclick="window.MedicinesModule.goToPage(' + (this.currentPage + 1) + ')">»</span></li></ul>';
        container.innerHTML = html;
    },
    
    updateCategoryFilter() { 
        const select = document.getElementById('categoryFilter'); 
        const chips = document.getElementById('categoryChips'); 
        
        if (select) { 
            const current = select.value; 
            select.innerHTML = '<option value="all" data-i18n="all_categories">جميع التصنيفات</option>' + 
                AppData.categories.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join(''); 
            if (current && AppData.categories.includes(current)) select.value = current; 
        } 
        
        if (chips) {
            const self = this;
            chips.innerHTML = AppData.categories.slice(0, 6).map(function(c) {
                return '<span class="filter-chip' + (self.currentCategory === c ? ' active' : '') + '" onclick="window.MedicinesModule.filterByCategory(\'' + c.replace(/'/g, "\\'") + '\')">' + escapeHtml(c) + '</span>';
            }).join('');
        }
        applyTranslations();
    },
    
    search() { 
        this.searchTerm = document.getElementById('medicineSearch')?.value.trim().toLowerCase() || ''; 
        this.currentPage = 1; 
        this.renderTable(); 
    },
    
    filterByStatus(s) { 
        this.currentFilter = s || document.getElementById('statusFilter')?.value || 'all'; 
        this.currentPage = 1; 
        this.renderTable(); 
        this.updateStats(); 
    },
    
    filterByCategory(c) { 
        this.currentCategory = c || document.getElementById('categoryFilter')?.value || 'all'; 
        this.currentPage = 1; 
        this.renderTable(); 
        this.updateCategoryFilter(); 
    },
    
    resetFilters() { 
        this.currentFilter = 'all'; 
        this.currentCategory = 'all'; 
        this.searchTerm = ''; 
        this.currentPage = 1; 
        if (document.getElementById('statusFilter')) document.getElementById('statusFilter').value = 'all'; 
        if (document.getElementById('categoryFilter')) document.getElementById('categoryFilter').value = 'all'; 
        if (document.getElementById('medicineSearch')) document.getElementById('medicineSearch').value = ''; 
        this.renderTable(); 
        this.updateCategoryFilter(); 
        showToast(t('reset'), 'info'); 
    },
    
    goToPage(p) { this.currentPage = p; this.renderTable(); },
    
    generateBarcode() { 
        const barcode = generateBarcode(); 
        const barcodeInput = document.getElementById('medicineBarcode'); 
        if (barcodeInput) barcodeInput.value = barcode; 
        showToast(t('generate_barcode') + ': ' + barcode, 'success'); 
    },
    
    openAddModal() { 
        if (!checkPermission('edit_medicines')) return; 
        
        document.getElementById('medicineId').value = ''; 
        document.getElementById('medicineScientificName').value = ''; 
        document.getElementById('medicineTradeName').value = ''; 
        document.getElementById('medicineBarcode').value = ''; 
        document.getElementById('medicineManufacturer').value = ''; 
        document.getElementById('medicineBatchNumber').value = ''; 
        document.getElementById('medicineCost').value = ''; 
        document.getElementById('medicinePrice').value = ''; 
        document.getElementById('medicineQuantity').value = ''; 
        document.getElementById('medicineMinStock').value = '10'; 
        document.getElementById('medicineProductionDate').value = ''; 
        document.getElementById('medicineDescription').value = ''; 
        
        const customInput = document.getElementById('customCategoryInput');
        if (customInput) customInput.value = '';
        const customGroup = document.getElementById('customCategoryGroup');
        if (customGroup) customGroup.style.display = 'none';
        
        const expiryInput = document.getElementById('medicineExpiryDate'); 
        if (expiryInput) { 
            const future = new Date(); 
            future.setFullYear(future.getFullYear() + 2); 
            expiryInput.value = future.toISOString().split('T')[0]; 
        } 
        
        document.getElementById('medicineModalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> ' + t('add_medicine'); 
        updateCategorySelects(); 
        updateSupplierSelect(); 
        safeOpenModal('medicineModal'); 
    },
    
    openEditModal(id) { 
        if (!checkPermission('edit_medicines')) return; 
        const m = DAL.getMedicineById(id); 
        if (!m) { showToast(t('no_data'), 'error'); return; } 
        
        document.getElementById('medicineId').value = m.id; 
        document.getElementById('medicineScientificName').value = m.scientificName || ''; 
        document.getElementById('medicineTradeName').value = m.tradeName || ''; 
        document.getElementById('medicineBarcode').value = m.barcode || ''; 
        document.getElementById('medicineManufacturer').value = m.manufacturer || ''; 
        document.getElementById('medicineBatchNumber').value = m.batchNumber || ''; 
        document.getElementById('medicineCost').value = m.cost || ''; 
        document.getElementById('medicinePrice').value = m.price || ''; 
        document.getElementById('medicineQuantity').value = m.quantity || 0; 
        document.getElementById('medicineMinStock').value = m.minStock || 10; 
        document.getElementById('medicineProductionDate').value = m.productionDate || ''; 
        document.getElementById('medicineExpiryDate').value = m.expiryDate || ''; 
        document.getElementById('medicineDescription').value = m.description || ''; 
        document.getElementById('medicineModalTitle').innerHTML = '<i class="fas fa-edit"></i> ' + t('edit_medicine'); 
        
        updateCategorySelects(); 
        updateSupplierSelect(); 
        if (m.supplierId) document.getElementById('medicineSupplier').value = m.supplierId; 
        
        const customInput = document.getElementById('customCategoryInput');
        const customGroup = document.getElementById('customCategoryGroup');
        
        if (AppData.categories.indexOf(m.category) === -1 && m.category && m.category !== 'أخرى') {
            if (customInput) customInput.value = m.category;
            if (customGroup) customGroup.style.display = 'block';
            document.getElementById('medicineCategory').value = 'أخرى';
        } else {
            if (customInput) customInput.value = '';
            if (customGroup) customGroup.style.display = 'none';
        }
        // Set category select value
        if (document.getElementById('medicineCategory') && AppData.categories.includes(m.category)) {
            document.getElementById('medicineCategory').value = m.category;
        }
        safeOpenModal('medicineModal'); 
    },
    
    async saveMedicine() { 
        if (!checkPermission('edit_medicines')) return; 
        
        const id = document.getElementById('medicineId')?.value || ''; 
        const tradeName = document.getElementById('medicineTradeName')?.value.trim() || ''; 
        const price = parseFloat(document.getElementById('medicinePrice')?.value || 0); 
        
        if (!tradeName) { showToast(t('field_required'), 'error'); return; } 
        if (!price || price <= 0) { showToast(t('field_required'), 'error'); return; } 
        
        const category = getEffectiveCategory();
        addCustomCategoryIfNew(category);
        
        const data = { 
            scientificName: document.getElementById('medicineScientificName')?.value.trim() || '', 
            tradeName, 
            barcode: document.getElementById('medicineBarcode')?.value.trim() || '', 
            category, 
            manufacturer: document.getElementById('medicineManufacturer')?.value.trim() || '', 
            batchNumber: document.getElementById('medicineBatchNumber')?.value.trim() || '', 
            cost: parseFloat(document.getElementById('medicineCost')?.value || 0) || 0, 
            price, 
            quantity: parseInt(document.getElementById('medicineQuantity')?.value || 0) || 0, 
            minStock: parseInt(document.getElementById('medicineMinStock')?.value || 10) || 10, 
            productionDate: document.getElementById('medicineProductionDate')?.value || null, 
            expiryDate: document.getElementById('medicineExpiryDate')?.value || null, 
            supplierId: document.getElementById('medicineSupplier')?.value || null, 
            description: document.getElementById('medicineDescription')?.value.trim() || '', 
            updatedAt: new Date().toISOString() 
        }; 
        
        if (!data.barcode) data.barcode = generateBarcode(); 
        
        if (id) { 
            const oldMedicine = DAL.getMedicineById(id); 
            const oldQuantity = oldMedicine ? oldMedicine.quantity : 0; 
            const result = await DAL.updateMedicine(id, data); 
            if (result) { 
                if (oldQuantity !== data.quantity) await addMovement(id, tradeName, data.quantity > oldQuantity ? 'add' : 'subtract', Math.abs(data.quantity - oldQuantity), data.quantity, t('edit_medicine')); 
                await addAuditLog(t('edit_medicine'), tradeName); 
                await saveData(); 
                showToast(t('update_success') + ' ' + tradeName, 'success'); 
            } 
        } else { 
            const newMedicine = await DAL.addMedicine(data); 
            if (newMedicine && data.quantity > 0) await addMovement(newMedicine.id, tradeName, 'add', data.quantity, data.quantity, t('add_medicine')); 
            await addAuditLog(t('add_medicine'), tradeName); 
            await saveData(); 
            showToast(t('save_success') + ' ' + tradeName, 'success'); 
        } 
        safeCloseModal('medicineModal'); 
        this.render(); 
    },
    
    openStockModal(id) { 
        const m = DAL.getMedicineById(id); 
        if (!m) return; 
        const q = prompt(t('quantity') + ': ' + m.tradeName + '\n' + t('current') + ': ' + m.quantity + '\n\n' + t('enter_new_quantity'), m.quantity); 
        if (q === null) return; 
        const nq = parseInt(q); 
        if (isNaN(nq) || nq < 0) { showToast(t('invalid_input'), 'error'); return; } 
        const old = m.quantity; 
        m.quantity = nq; 
        m.updatedAt = new Date().toISOString(); 
        IDB.put('medicines', m); 
        addMovement(id, m.tradeName, nq > old ? 'add' : 'subtract', Math.abs(nq - old), nq, t('manual_update')); 
        addAuditLog(t('update_inventory'), m.tradeName + ': ' + old + ' → ' + nq); 
        saveData(); 
        this.render(); 
        showToast(t('update_success') + ' ' + m.tradeName, 'success'); 
    },
    
    async deleteMedicine(id) { 
        if (!checkPermission('delete_medicines')) return; 
        const m = DAL.getMedicineById(id); 
        if (!m) return; 
        if (!confirm(t('confirm_delete') + ' "' + m.tradeName + '"?')) return; 
        await DAL.deleteMedicine(id); 
        await addAuditLog(t('delete'), m.tradeName); 
        await saveData(); 
        this.render(); 
        showToast(t('delete_success') + ' ' + m.tradeName, 'success'); 
    },
    
    exportToCSV() { 
        let csv = '\uFEFFالاسم العلمي,الاسم التجاري,الباركود,التصنيف,الشركة,رقم التشغيلة,الكمية,الحد الأدنى,سعر الشراء,سعر البيع,تاريخ الإنتاج,تاريخ الانتهاء,الحالة\n'; 
        const self = this;
        AppData.medicines.forEach(function(m) { 
            const s = self.getMedicineStatus(m).text; 
            csv += '"' + (m.scientificName || '') + '","' + m.tradeName + '","' + (m.barcode || '') + '","' + (m.category || '') + '","' + (m.manufacturer || '') + '","' + (m.batchNumber || '') + '",' + m.quantity + ',' + m.minStock + ',' + (m.cost || 0) + ',' + m.price + ',"' + (m.productionDate || '') + '","' + (m.expiryDate || '') + '","' + s + '"\n'; 
        }); 
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); 
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = 'medicines_' + new Date().toISOString().slice(0,10) + '.csv'; 
        a.click(); 
        showToast(t('export'), 'success'); 
    }
};

// ================================================================
// Inventory Module
// ================================================================
window.InventoryModule = {
    currentFilter: 'all', currentCategory: 'all', searchTerm: '', currentPage: 1, itemsPerPage: 15, selectedItems: new Set(),
    
    async render() {
        const section = document.getElementById('inventory'); 
        if (!section) return;
        
        section.innerHTML = `
            <h4 style="color:white; font-weight:900; margin-bottom:20px;">
                <i class="fas fa-clipboard-list"></i> <span data-i18n="inventory_tracking">تتبع المخزون</span>
            </h4>
            <div class="stats-grid" id="inventoryStats"></div>
            <div class="alerts-section" id="inventoryAlerts"></div>
            <div class="card-modern">
                <div class="filter-row">
                    <div class="filter-group flex-grow-1">
                        <label><i class="fas fa-search"></i> <span data-i18n="search">بحث</span></label>
                        <input type="text" id="inventorySearch" class="form-control" placeholder="${t('search_medicine')}">
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-filter"></i> <span data-i18n="status">الحالة</span></label>
                        <select id="inventoryStatusFilter" class="form-select">
                            <option value="all" data-i18n="all">الكل</option>
                            <option value="inStock" data-i18n="in_stock">متوفر</option>
                            <option value="lowStock" data-i18n="low_stock">مخزون منخفض</option>
                            <option value="outOfStock" data-i18n="out_of_stock">نفذ</option>
                            <option value="expiring" data-i18n="expiring_soon">قاربة الانتهاء</option>
                            <option value="expired" data-i18n="expired">منتهية</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-tags"></i> <span data-i18n="category">التصنيف</span></label>
                        <select id="inventoryCategoryFilter" class="form-select">
                            <option value="all" data-i18n="all_categories">جميع التصنيفات</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>&nbsp;</label>
                        <button class="btn btn-outline-secondary" id="resetInventoryFiltersBtn">
                            <i class="fas fa-redo"></i> <span data-i18n="reset">إعادة تعيين</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-modern">
                <div class="action-bar">
                    <button class="btn-modern btn-modern-success" id="bulkUpdateStockBtn">
                        <i class="fas fa-boxes"></i> <span data-i18n="bulk_update">تحديث المخزون للمحدد</span>
                    </button>
                    <button class="btn-modern btn-modern-info" id="showMovementsBtn">
                        <i class="fas fa-history"></i> <span data-i18n="movement_log">سجل الحركة</span>
                    </button>
                    <button class="btn-modern btn-modern-warning" id="exportInventoryBtn">
                        <i class="fas fa-download"></i> <span data-i18n="export">تصدير CSV</span>
                    </button>
                    <button class="btn-modern btn-modern-danger" id="resetInventoryBtn">
                        <i class="fas fa-trash"></i> <span data-i18n="reset_inventory">مسح المخزون</span>
                    </button>
                </div>
            </div>
            <div class="card-modern">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="selectAllInventory"></th>
                                <th data-i18n="medicine">الدواء</th>
                                <th data-i18n="barcode">الباركود</th>
                                <th data-i18n="category">التصنيف</th>
                                <th data-i18n="manufacturer">الشركة</th>
                                <th data-i18n="batch_number">رقم التشغيلة</th>
                                <th data-i18n="quantity">الكمية</th>
                                <th data-i18n="min_stock">الحد الأدنى</th>
                                <th data-i18n="expiry_date">تاريخ الانتهاء</th>
                                <th data-i18n="days_remaining">الأيام المتبقية</th>
                                <th data-i18n="status">الحالة</th>
                                <th data-i18n="actions">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="inventoryTableBody"></tbody>
                    </table>
                </div>
                <div class="pagination-modern" id="inventoryPagination"></div>
                <div class="bulk-actions" id="bulkActions" style="display:none;">
                    <span><i class="fas fa-check-square"></i> <span data-i18n="items_selected">تم تحديد</span> <span id="selectedCount">0</span></span>
                    <div>
                        <button class="btn btn-sm btn-success" id="bulkUpdateBtn"><i class="fas fa-edit"></i> <span data-i18n="bulk_update">تحديث المخزون</span></button>
                        <button class="btn btn-sm btn-warning" id="bulkMinStockBtn"><i class="fas fa-bell"></i> <span data-i18n="adjust_min_stock">تعديل الحد الأدنى</span></button>
                    </div>
                </div>
            </div>
        `;
        
        applyTranslations();
        this.renderStats(); 
        this.renderAlerts(); 
        this.renderTable(); 
        this.updateCategoryFilter();
        
        document.getElementById('inventorySearch').onkeyup = () => this.search();
        document.getElementById('inventoryStatusFilter').onchange = () => this.filterByStatus();
        document.getElementById('inventoryCategoryFilter').onchange = () => this.filterByCategory();
        document.getElementById('resetInventoryFiltersBtn').onclick = () => this.resetFilters();
        document.getElementById('bulkUpdateStockBtn').onclick = () => this.bulkUpdateStock();
        document.getElementById('showMovementsBtn').onclick = () => this.showMovementsModal();
        document.getElementById('exportInventoryBtn').onclick = () => this.exportToCSV();
        document.getElementById('resetInventoryBtn').onclick = () => this.resetAllInventory();
        document.getElementById('selectAllInventory').onchange = () => this.toggleSelectAll();
        document.getElementById('bulkUpdateBtn').onclick = () => this.bulkUpdateStock();
        document.getElementById('bulkMinStockBtn').onclick = () => this.bulkAdjustMinStock();
    },
    
    renderStats() { 
        const container = document.getElementById('inventoryStats'); 
        if (!container) return; 
        const stats = { 
            total: AppData.medicines.length, 
            inStock: AppData.medicines.filter(function(m) { return m.quantity > m.minStock; }).length, 
            lowStock: AppData.medicines.filter(function(m) { return m.quantity > 0 && m.quantity <= m.minStock; }).length, 
            outOfStock: AppData.medicines.filter(function(m) { return m.quantity === 0; }).length, 
            expiring: AppData.medicines.filter(function(m) { return m.expiryDate && getDaysUntilExpiry(m.expiryDate) >= 0 && getDaysUntilExpiry(m.expiryDate) <= 30; }).length, 
            expired: AppData.medicines.filter(function(m) { return m.expiryDate && getDaysUntilExpiry(m.expiryDate) < 0; }).length, 
            totalValue: AppData.medicines.reduce(function(sum, m) { return sum + (m.price * m.quantity); }, 0), 
            totalCost: AppData.medicines.reduce(function(sum, m) { return sum + ((m.cost || 0) * m.quantity); }, 0) 
        }; 
        
        container.innerHTML = `
            <div class="stat-card" style="border-right-color:#0d9488;">
                <div class="stat-icon"><i class="fas fa-pills"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="total_medicines">إجمالي الأدوية</h3>
                    <p>${stats.total}</p>
                    <small data-i18n="in_stock">متوفر: ${stats.inStock}</small>
                </div>
            </div>
            <div class="stat-card warning" style="border-right-color:#f59e0b;">
                <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="low_stock">مخزون منخفض</h3>
                    <p>${stats.lowStock}</p>
                </div>
            </div>
            <div class="stat-card danger" style="border-right-color:#ef4444;">
                <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="out_of_stock">نفذ من المخزون</h3>
                    <p>${stats.outOfStock}</p>
                </div>
            </div>
            <div class="stat-card warning" style="border-right-color:#e67e22;">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="expiring_soon">قاربة الانتهاء</h3>
                    <p>${stats.expiring}</p>
                </div>
            </div>
            <div class="stat-card danger" style="border-right-color:#dc2626;">
                <div class="stat-icon"><i class="fas fa-skull"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="expired">منتهية الصلاحية</h3>
                    <p>${stats.expired}</p>
                </div>
            </div>
            <div class="stat-card success" style="border-right-color:#10b981;">
                <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="inventory_value">قيمة المخزون</h3>
                    <p>${formatMoney(stats.totalValue)}</p>
                    <small data-i18n="stock_cost">التكلفة: ${formatMoney(stats.totalCost)}</small>
                </div>
            </div>
        `;
        applyTranslations();
    },
    
    renderAlerts() { 
        const container = document.getElementById('inventoryAlerts'); 
        if (!container) return; 
        const alerts = []; 
        
        AppData.medicines.forEach(function(m) { 
            if (m.quantity === 0) alerts.push({ type: 'danger', icon: 'times-circle', title: t('out_of_stock'), message: m.tradeName + ' - ' + t('out_of_stock'), id: m.id }); 
            else if (m.quantity <= m.minStock) alerts.push({ type: 'warning', icon: 'exclamation-triangle', title: t('low_stock'), message: m.tradeName + ' - ' + t('quantity') + ': ' + m.quantity, id: m.id }); 
            if (m.expiryDate) { 
                const d = getDaysUntilExpiry(m.expiryDate); 
                if (d < 0) alerts.push({ type: 'danger', icon: 'skull', title: t('expired'), message: m.tradeName + ' - ' + t('expired'), id: m.id }); 
                else if (d <= 30) alerts.push({ type: 'warning', icon: 'clock', title: t('expiring_soon'), message: m.tradeName + ' - ' + d + ' ' + t('days_remaining'), id: m.id }); 
            } 
        }); 
        
        if (alerts.length === 0) { 
            container.innerHTML = '<div class="card-modern"><div class="alert alert-success mb-0"><i class="fas fa-check-circle"></i> ' + t('all_good') + '</div></div>'; 
        } else { 
            const dangerAlerts = alerts.filter(function(a) { return a.type === 'danger'; }); 
            const warningAlerts = alerts.filter(function(a) { return a.type === 'warning'; }); 
            container.innerHTML = `
                <div class="card-modern">
                    <h5><i class="fas fa-bell"></i> ${t('important_alerts')} (${alerts.length})</h5>
                    ${dangerAlerts.length > 0 ? `
                        <div class="mb-3">
                            <h6 class="text-danger"><i class="fas fa-exclamation-circle"></i> ${t('out_of_stock')}</h6>
                            ${dangerAlerts.slice(0, 3).map(function(a) {
                                return '<div class="alert alert-danger d-flex align-items-center gap-2 mb-2"><i class="fas fa-' + a.icon + '"></i><div><strong>' + a.title + ':</strong> ' + a.message + '</div></div>';
                            }).join('')}
                            ${dangerAlerts.length > 3 ? '<p class="text-muted">' + t('and_more') + ' ' + (dangerAlerts.length - 3) + '</p>' : ''}
                        </div>
                    ` : ''}
                    ${warningAlerts.length > 0 ? `
                        <div>
                            <h6 class="text-warning"><i class="fas fa-exclamation-triangle"></i> ${t('low_stock')}</h6>
                            ${warningAlerts.slice(0, 3).map(function(a) {
                                return '<div class="alert alert-warning d-flex align-items-center gap-2 mb-2" onclick="window.InventoryModule.scrollToMedicine(\'' + a.id + '\')"><i class="fas fa-' + a.icon + '"></i><div><strong>' + a.title + ':</strong> ' + a.message + '</div></div>';
                            }).join('')}
                            ${warningAlerts.length > 3 ? '<p class="text-muted">' + t('and_more') + ' ' + (warningAlerts.length - 3) + '</p>' : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        applyTranslations();
    },
    
    getMedicineStatus(m) { 
        const d = m.expiryDate ? getDaysUntilExpiry(m.expiryDate) : 999; 
        if (d < 0) return { text: t('expired'), badgeClass: 'bg-danger', rowClass: 'table-danger', stockClass: 'text-danger' }; 
        if (m.quantity === 0) return { text: t('out_of_stock'), badgeClass: 'bg-secondary', rowClass: 'table-secondary', stockClass: 'text-danger' }; 
        if (m.quantity <= m.minStock) return { text: t('low_stock'), badgeClass: 'bg-warning', rowClass: 'table-warning', stockClass: 'text-warning' }; 
        return { text: t('in_stock'), badgeClass: 'bg-success', rowClass: '', stockClass: 'text-success' }; 
    },
    
    getDaysClass(days) { 
        if (days === null) return ''; 
        if (days < 0) return 'text-danger fw-bold'; 
        if (days <= 7) return 'text-danger'; 
        if (days <= 30) return 'text-warning'; 
        return 'text-success'; 
    },
    
    applyFilters() { 
        let filtered = DAL.getMedicines().slice(); 
        if (this.currentFilter !== 'all') { 
            const self = this;
            filtered = filtered.filter(function(m) { 
                const days = m.expiryDate ? getDaysUntilExpiry(m.expiryDate) : 999; 
                const isLow = m.quantity > 0 && m.quantity <= m.minStock; 
                const isOut = m.quantity === 0; 
                const isExpiring = days >= 0 && days <= 30; 
                const isExpired = days < 0; 
                const isInStock = m.quantity > m.minStock; 
                switch (self.currentFilter) { 
                    case 'inStock': return isInStock; 
                    case 'lowStock': return isLow; 
                    case 'outOfStock': return isOut; 
                    case 'expiring': return isExpiring; 
                    case 'expired': return isExpired; 
                    default: return true; 
                } 
            }); 
        } 
        if (this.currentCategory !== 'all') filtered = filtered.filter(function(m) { return m.category === this.currentCategory; }.bind(this)); 
        if (this.searchTerm) { 
            const term = this.searchTerm.toLowerCase(); 
            filtered = filtered.filter(function(m) { 
                return (m.tradeName || '').toLowerCase().indexOf(term) !== -1 || 
                    (m.scientificName || '').toLowerCase().indexOf(term) !== -1 || 
                    (m.manufacturer || '').toLowerCase().indexOf(term) !== -1 || 
                    (m.batchNumber || '').toLowerCase().indexOf(term) !== -1 || 
                    (m.barcode || '').toLowerCase().indexOf(term) !== -1;
            }); 
        } 
        return filtered; 
    },
    
    renderTable() { 
        const tbody = document.getElementById('inventoryTableBody'); 
        if (!tbody) return; 
        const filtered = this.applyFilters(); 
        const total = Math.ceil(filtered.length / this.itemsPerPage); 
        const start = (this.currentPage - 1) * this.itemsPerPage; 
        const paginated = filtered.slice(start, start + this.itemsPerPage); 
        
        if (paginated.length === 0) { 
            tbody.innerHTML = '<tr><td colspan="12" class="text-center py-4">' + t('no_data') + '</td></tr>'; 
            this.renderPagination(0); 
            return; 
        } 
        
        const self = this;
        tbody.innerHTML = paginated.map(function(m) { 
            const s = self.getMedicineStatus(m); 
            const days = m.expiryDate ? getDaysUntilExpiry(m.expiryDate) : null; 
            const sel = self.selectedItems.has(m.id); 
            return `
                <tr class="${s.rowClass}" id="medicine-row-${m.id}">
                    <td><input type="checkbox" ${sel ? 'checked' : ''} onchange="window.InventoryModule.toggleSelect('${m.id}')"></td>
                    <td><strong>${escapeHtml(m.tradeName)}</strong>${m.scientificName ? '<br><small>' + escapeHtml(m.scientificName) + '</small>' : ''}</td>
                    <td><code>${escapeHtml(m.barcode || '-')}</code></td>
                    <td>${escapeHtml(m.category || '-')}</td>
                    <td>${escapeHtml(m.manufacturer || '-')}</td>
                    <td><code>${escapeHtml(m.batchNumber || '-')}</code></td>
                    <td class="fw-bold ${s.stockClass}">${m.quantity}</td>
                    <td>${m.minStock || 10}</td>
                    <td>${m.expiryDate ? formatDate(m.expiryDate) : '-'}</td>
                    <td class="${self.getDaysClass(days)}">${days !== null ? (days < 0 ? t('expired') : days + ' ' + t('days_remaining')) : '-'}</td>
                    <td><span class="badge ${s.badgeClass}">${s.text}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="window.InventoryModule.openStockUpdate('${m.id}')"><i class="fas fa-boxes"></i></button>
                        <button class="btn btn-sm btn-info" onclick="window.InventoryModule.showMedicineMovements('${m.id}')"><i class="fas fa-history"></i></button>
                        <button class="btn btn-sm btn-warning" onclick="window.InventoryModule.editMedicine('${m.id}')"><i class="fas fa-edit"></i></button>
                    </td>
                </tr>
            `; 
        }).join(''); 
        this.renderPagination(total); 
        this.updateBulkActions(); 
        
        const selectAll = document.getElementById('selectAllInventory');
        if (selectAll) selectAll.checked = paginated.length > 0 && paginated.every(function(m) { return self.selectedItems.has(m.id); });
    },
    
    renderPagination(total) { 
        const container = document.getElementById('inventoryPagination'); 
        if (!container || total <= 1) { if (container) container.innerHTML = ''; return; } 
        
        const self = this;
        let html = '<ul class="pagination">';
        html += '<li class="page-item' + (this.currentPage === 1 ? ' disabled' : '') + '"><span class="page-link" onclick="window.InventoryModule.goToPage(' + (this.currentPage - 1) + ')">«</span></li>';
        
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += '<li class="page-item' + (i === this.currentPage ? ' active' : '') + '"><span class="page-link" onclick="window.InventoryModule.goToPage(' + i + ')">' + i + '</span></li>';
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        html += '<li class="page-item' + (this.currentPage === total ? ' disabled' : '') + '"><span class="page-link" onclick="window.InventoryModule.goToPage(' + (this.currentPage + 1) + ')">»</span></li></ul>';
        container.innerHTML = html;
    },
    
    updateCategoryFilter() { 
        const select = document.getElementById('inventoryCategoryFilter'); 
        if (select) { 
            const current = select.value; 
            select.innerHTML = '<option value="all" data-i18n="all_categories">جميع التصنيفات</option>' + 
                AppData.categories.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join(''); 
            if (current && AppData.categories.includes(current)) select.value = current; 
        } 
        applyTranslations();
    },
    
    search() { 
        this.searchTerm = document.getElementById('inventorySearch')?.value.trim().toLowerCase() || ''; 
        this.currentPage = 1; 
        this.renderTable(); 
    },
    
    filterByStatus(s) { 
        this.currentFilter = s || document.getElementById('inventoryStatusFilter')?.value || 'all'; 
        this.currentPage = 1; 
        this.renderTable(); 
        this.renderStats(); 
    },
    
    filterByCategory(c) { 
        this.currentCategory = c || document.getElementById('inventoryCategoryFilter')?.value || 'all'; 
        this.currentPage = 1; 
        this.renderTable(); 
    },
    
    resetFilters() { 
        this.currentFilter = 'all'; 
        this.currentCategory = 'all'; 
        this.searchTerm = ''; 
        this.currentPage = 1; 
        this.selectedItems.clear(); 
        if (document.getElementById('inventoryStatusFilter')) document.getElementById('inventoryStatusFilter').value = 'all'; 
        if (document.getElementById('inventoryCategoryFilter')) document.getElementById('inventoryCategoryFilter').value = 'all'; 
        if (document.getElementById('inventorySearch')) document.getElementById('inventorySearch').value = ''; 
        this.renderTable(); 
        this.renderStats(); 
        showToast(t('reset'), 'info'); 
    },
    
    goToPage(p) { this.currentPage = p; this.renderTable(); },
    
    toggleSelectAll() { 
        const sa = document.getElementById('selectAllInventory'); 
        const self = this;
        const paginated = this.applyFilters().slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage); 
        if (sa.checked) paginated.forEach(function(m) { self.selectedItems.add(m.id); }); 
        else paginated.forEach(function(m) { self.selectedItems.delete(m.id); }); 
        this.renderTable(); 
    },
    
    toggleSelect(id) { 
        if (this.selectedItems.has(id)) this.selectedItems.delete(id); 
        else this.selectedItems.add(id); 
        this.updateBulkActions(); 
    },
    
    updateBulkActions() { 
        const actionsDiv = document.getElementById('bulkActions'); 
        const countSpan = document.getElementById('selectedCount'); 
        if (actionsDiv && countSpan) { 
            actionsDiv.style.display = this.selectedItems.size > 0 ? 'flex' : 'none'; 
            countSpan.textContent = this.selectedItems.size; 
        } 
    },
    
    openStockUpdate(id) { 
        const m = DAL.getMedicineById(id); 
        if (!m) return; 
        const q = prompt(t('quantity') + ': ' + m.tradeName + '\n' + t('current') + ': ' + m.quantity + '\n\n' + t('enter_new_quantity'), m.quantity); 
        if (q === null) return; 
        const nq = parseInt(q); 
        if (isNaN(nq) || nq < 0) { showToast(t('invalid_input'), 'error'); return; } 
        const old = m.quantity; 
        m.quantity = nq; 
        m.updatedAt = new Date().toISOString(); 
        IDB.put('medicines', m); 
        addMovement(id, m.tradeName, nq > old ? 'add' : 'subtract', Math.abs(nq - old), nq, t('manual_update')); 
        addAuditLog(t('update_inventory'), m.tradeName + ': ' + old + ' → ' + nq); 
        saveData(); 
        this.render(); 
        showToast(t('update_success') + ' ' + m.tradeName, 'success'); 
    },
    
    async resetAllInventory() { 
        if (!confirm(t('reset_warning'))) return;
        
        const userInput = prompt(t('reset_confirm'));
        if (!userInput || userInput.trim() !== t('reset_confirm')) {
            showToast(t('cancel'), 'info');
            return;
        }
        
        showLoading(true); 
        try { 
            await IDB.clear('medicines'); 
            await IDB.clear('movements'); 
            AppData.medicines = []; 
            AppData.movements = []; 
            this.currentPage = 1; 
            this.selectedItems.clear(); 
            this.currentFilter = 'all'; 
            this.currentCategory = 'all'; 
            this.searchTerm = ''; 
            await addAuditLog(t('reset_inventory'), t('reset_inventory')); 
            await saveData(); 
            this.render(); 
            showLoading(false); 
            showToast(t('reset_inventory'), 'success'); 
        } catch(e) { 
            showLoading(false); 
            showToast(t('error'), 'error'); 
        } 
    },
    
    bulkUpdateStock() { 
        if (this.selectedItems.size === 0) { showToast(t('select_items'), 'warning'); return; } 
        const op = prompt(t('bulk_update') + ' (' + this.selectedItems.size + ' ' + t('medicines') + ')\n\n1. ' + t('set_new_quantity') + '\n2. ' + t('add_quantity') + ' (+10)\n3. ' + t('subtract_quantity') + ' (-5)'); 
        if (!op) return; 
        
        let isAdd = false, isSub = false, val = op; 
        if (op.startsWith('+')) { isAdd = true; val = op.substring(1); } 
        else if (op.startsWith('-')) { isSub = true; val = op.substring(1); } 
        const qty = parseInt(val); 
        if (isNaN(qty) || qty < 0) { showToast(t('invalid_input'), 'error'); return; } 
        
        let count = 0; 
        const self = this;
        this.selectedItems.forEach(function(id) { 
            const m = DAL.getMedicineById(id); 
            if (!m) return; 
            const old = m.quantity; 
            const nq = isAdd ? old + qty : isSub ? Math.max(0, old - qty) : qty; 
            if (nq !== old) { 
                m.quantity = nq; 
                m.updatedAt = new Date().toISOString(); 
                IDB.put('medicines', m); 
                addMovement(id, m.tradeName, nq > old ? 'add' : 'subtract', Math.abs(nq - old), nq, t('bulk_update')); 
                count++; 
            } 
        }); 
        
        if (count > 0) { 
            addAuditLog(t('bulk_update'), count + ' ' + t('medicines')); 
            saveData(); 
            showToast(t('update_success') + ' ' + count + ' ' + t('medicines'), 'success'); 
        } else showToast(t('no_changes'), 'info'); 
        this.selectedItems.clear(); 
        this.render(); 
    },
    
    bulkAdjustMinStock() { 
        if (this.selectedItems.size === 0) { showToast(t('select_items'), 'warning'); return; } 
        const ms = prompt(t('adjust_min_stock') + ':', '10'); 
        if (!ms) return; 
        const min = parseInt(ms); 
        if (isNaN(min) || min < 1) { showToast(t('invalid_input'), 'error'); return; } 
        
        let count = 0; 
        const self = this;
        this.selectedItems.forEach(function(id) { 
            const m = DAL.getMedicineById(id); 
            if (m) { 
                m.minStock = min; 
                m.updatedAt = new Date().toISOString(); 
                IDB.put('medicines', m); 
                count++; 
            } 
        }); 
        
        if (count > 0) { 
            addAuditLog(t('adjust_min_stock'), count + ' ' + t('medicines') + ' - ' + min); 
            saveData(); 
            showToast(t('update_success') + ' ' + count + ' ' + t('medicines'), 'success'); 
        } 
        this.selectedItems.clear(); 
        this.render(); 
    },
    
    showMedicineMovements(id) { 
        const m = DAL.getMedicineById(id); 
        if (!m) return; 
        const movements = AppData.movements.filter(function(x) { return x.medicineId === id; }); 
        
        const h = `
            <div class="modal fade" id="movementsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5><i class="fas fa-history"></i> ${t('movement_log')}: ${escapeHtml(m.tradeName)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${movements.length === 0 ? '<p class="text-center py-4">' + t('no_data') + '</p>' : `
                                <table class="table table-sm">
                                    <thead><tr><th>${t('date')}</th><th>${t('type')}</th><th>${t('quantity')}</th><th>${t('balance')}</th><th>${t('user')}</th><th>${t('notes')}</th></tr></thead>
                                    <tbody>
                                        ${movements.map(function(x) { 
                                            return '<tr><td>' + formatDateTime(x.date) + '</td><td><span class="badge ' + (x.type==='add'?'bg-success':x.type==='subtract'?'bg-danger':x.type==='sell'?'bg-info':'bg-warning') + '">' + getMovementTypeText(x.type) + '</span></td><td class="' + (x.qty>0?'text-success':'text-danger') + ' fw-bold">' + (x.qty>0?'+':'') + x.qty + '</td><td>' + x.balance + '</td><td>' + (x.user||'-') + '</td><td>' + (x.notes||'-') + '</td></tr>'; 
                                        }).join('')}
                                    </tbody>
                                </table>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existing = document.getElementById('movementsModal'); 
        if (existing) existing.remove(); 
        document.body.insertAdjacentHTML('beforeend', h); 
        new bootstrap.Modal(document.getElementById('movementsModal')).show(); 
    },
    
    showMovementsModal() { 
        const movements = AppData.movements.slice(0, 100); 
        const h = `
            <div class="modal fade" id="allMovementsModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5><i class="fas fa-history"></i> ${t('movement_log')}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <button class="btn btn-sm btn-success mb-3" onclick="window.InventoryModule.exportMovementsToCSV()"><i class="fas fa-download"></i> ${t('export')}</button>
                            ${movements.length === 0 ? '<p class="text-center py-4">' + t('no_data') + '</p>' : `
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead><tr><th>${t('date')}</th><th>${t('medicine')}</th><th>${t('type')}</th><th>${t('quantity')}</th><th>${t('balance')}</th><th>${t('user')}</th><th>${t('notes')}</th></tr></thead>
                                        <tbody>
                                            ${movements.map(function(x) { 
                                                return '<tr><td>' + formatDateTime(x.date) + '</td><td>' + escapeHtml(x.medicineName) + '</td><td><span class="badge ' + (x.type==='add'?'bg-success':x.type==='subtract'?'bg-danger':x.type==='sell'?'bg-info':'bg-warning') + '">' + getMovementTypeText(x.type) + '</span></td><td class="' + (x.qty>0?'text-success':'text-danger') + ' fw-bold">' + (x.qty>0?'+':'') + x.qty + '</td><td>' + x.balance + '</td><td>' + (x.user||'-') + '</td><td>' + (x.notes||'-') + '</td></tr>'; 
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existing = document.getElementById('allMovementsModal'); 
        if (existing) existing.remove(); 
        document.body.insertAdjacentHTML('beforeend', h); 
        new bootstrap.Modal(document.getElementById('allMovementsModal')).show(); 
    },
    
    scrollToMedicine(id) { 
        const row = document.getElementById('medicine-row-' + id); 
        if (row) { 
            row.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
            row.style.backgroundColor = 'rgba(13,148,136,0.1)'; 
            setTimeout(function() { row.style.backgroundColor = ''; }, 2000); 
        } 
    },
    
    editMedicine(id) { 
        goTo('medicines'); 
        setTimeout(function() { if (window.MedicinesModule) window.MedicinesModule.openEditModal(id); }, 100); 
    },
    
    exportToCSV() { 
        let csv = '\uFEFFالاسم العلمي,الاسم التجاري,الباركود,التصنيف,الشركة,رقم التشغيلة,الكمية,الحد الأدنى,سعر البيع,تاريخ الانتهاء,الأيام المتبقية,الحالة\n'; 
        const self = this;
        AppData.medicines.forEach(function(m) { 
            const s = self.getMedicineStatus(m).text; 
            const d = m.expiryDate ? getDaysUntilExpiry(m.expiryDate) : '-'; 
            csv += '"' + (m.scientificName||'') + '","' + m.tradeName + '","' + (m.barcode||'') + '","' + (m.category||'') + '","' + (m.manufacturer||'') + '","' + (m.batchNumber||'') + '",' + m.quantity + ',' + m.minStock + ',' + m.price + ',"' + (m.expiryDate||'') + '",' + d + ',"' + s + '"\n'; 
        }); 
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); 
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = 'inventory_' + new Date().toISOString().slice(0,10) + '.csv'; 
        a.click(); 
        showToast(t('export'), 'success'); 
    },
    
    exportMovementsToCSV() { 
        let csv = '\uFEFFالتاريخ,الدواء,النوع,الكمية,الرصيد,المستخدم,ملاحظات\n'; 
        AppData.movements.forEach(function(m) { 
            csv += '"' + formatDateTime(m.date) + '","' + m.medicineName + '","' + getMovementTypeText(m.type) + '",' + m.qty + ',' + m.balance + ',"' + (m.user||'') + '","' + (m.notes||'') + '"\n'; 
        }); 
        const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' }); 
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = 'movements_' + new Date().toISOString().slice(0,10) + '.csv'; 
        a.click(); 
        showToast(t('export'), 'success'); 
    }
};

// ================================================================
// Suppliers Module
// ================================================================
window.SuppliersModule = {
    searchTerm: '', currentPage: 1, itemsPerPage: 12,
    
    async render() {
        const section = document.getElementById('suppliers'); 
        if (!section) return;
        
        if (!checkPermission('manage_suppliers')) { 
            section.innerHTML = `
                <h4 style="color:white; font-weight:900; margin-bottom:20px;">
                    <i class="fas fa-truck"></i> <span data-i18n="suppliers">الموردين</span>
                </h4>
                <div class="card-modern text-center py-5">
                    <i class="fas fa-lock fa-4x mb-3" style="color:var(--danger-color);"></i>
                    <h5 data-i18n="permission_denied">غير مصرح لك بالوصول</h5>
                </div>
            `;
            applyTranslations();
            return; 
        }
        
        section.innerHTML = `
            <h4 style="color:white; font-weight:900; margin-bottom:20px;">
                <i class="fas fa-truck"></i> <span data-i18n="supplier_management">إدارة الموردين</span>
            </h4>
            <div class="stats-grid" id="suppliersStats"></div>
            <div class="card-modern">
                <div class="action-bar">
                    <button class="btn-modern btn-modern-success" id="openAddSupplierBtn">
                        <i class="fas fa-plus-circle"></i> <span data-i18n="add_supplier">إضافة مورد جديد</span>
                    </button>
                    <button class="btn-modern btn-modern-info" id="exportSuppliersBtn">
                        <i class="fas fa-download"></i> <span data-i18n="export">تصدير CSV</span>
                    </button>
                    <div class="search-box ms-auto">
                        <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                            <input type="text" id="supplierSearch" class="form-control" placeholder="${t('search')}...">
                        </div>
                    </div>
                </div>
            </div>
            <div class="suppliers-grid" id="suppliersGrid"></div>
            <div class="pagination-modern" id="suppliersPagination"></div>
        `;
        
        applyTranslations();
        this.renderStats(); 
        this.renderSuppliers();
        
        document.getElementById('openAddSupplierBtn').onclick = () => this.openAddModal();
        document.getElementById('exportSuppliersBtn').onclick = () => this.exportToCSV();
        document.getElementById('supplierSearch').onkeyup = () => this.search();
    },
    
    renderStats() { 
        const total = AppData.suppliers.length; 
        const meds = {}; 
        AppData.medicines.forEach(function(m) { if (m.supplierId) meds[m.supplierId] = (meds[m.supplierId] || 0) + 1; }); 
        
        document.getElementById('suppliersStats').innerHTML = `
            <div class="stat-card" style="border-right-color:#0d9488;">
                <div class="stat-icon"><i class="fas fa-truck"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="suppliers">الموردين</h3>
                    <p>${total}</p>
                </div>
            </div>
            <div class="stat-card success" style="border-right-color:#10b981;">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="active">موردين نشطين</h3>
                    <p>${Object.keys(meds).length}</p>
                </div>
            </div>
            <div class="stat-card info" style="border-right-color:#3b82f6;">
                <div class="stat-icon"><i class="fas fa-pills"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="related_medicines">الأدوية المرتبطة</h3>
                    <p>${Object.values(meds).reduce(function(a,b){return a+b;},0)}</p>
                </div>
            </div>
        `;
        applyTranslations();
    },
    
    renderSuppliers() { 
        const grid = document.getElementById('suppliersGrid'); 
        if (!grid) return; 
        let f = DAL.getSuppliers().slice(); 
        
        if (this.searchTerm) { 
            const term = this.searchTerm.toLowerCase(); 
            f = f.filter(function(s) { return (s.name||'').toLowerCase().indexOf(term) !== -1 || (s.contactPerson||'').toLowerCase().indexOf(term) !== -1; }); 
        } 
        
        f.sort(function(a,b) { return (a.name||'').localeCompare(b.name||''); }); 
        const total = Math.ceil(f.length / this.itemsPerPage);
        const start = (this.currentPage-1)*this.itemsPerPage;
        const paginated = f.slice(start, start+this.itemsPerPage); 
        
        if (paginated.length === 0) { 
            grid.innerHTML = '<div class="no-data-message"><i class="fas fa-truck fa-3x"></i><p data-i18n="no_suppliers">لا يوجد موردين</p></div>'; 
            applyTranslations();
            return; 
        } 
        
        grid.innerHTML = paginated.map(function(s) { 
            const mc = AppData.medicines.filter(function(m) { return m.supplierId === s.id; }).length; 
            return `
                <div class="supplier-card">
                    <div class="supplier-header">
                        <div class="supplier-icon"><i class="fas fa-building"></i></div>
                        <div class="supplier-info">
                            <h4>${escapeHtml(s.name)}</h4>
                            ${s.contactPerson ? '<p class="contact-person"><i class="fas fa-user"></i> ' + escapeHtml(s.contactPerson) + '</p>' : ''}
                        </div>
                    </div>
                    <div class="supplier-body">
                        ${s.phone ? '<p><i class="fas fa-phone"></i> ' + escapeHtml(s.phone) + '</p>' : ''}
                        ${s.email ? '<p><i class="fas fa-envelope"></i> ' + escapeHtml(s.email) + '</p>' : ''}
                        ${s.address ? '<p><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(s.address) + '</p>' : ''}
                        <div class="supplier-stats"><span class="badge bg-info"><i class="fas fa-pills"></i> ${mc} ${t('related_medicines')}</span></div>
                    </div>
                    <div class="supplier-footer">
                        <button class="btn btn-sm btn-info" onclick="window.SuppliersModule.openEditModal('${s.id}')"><i class="fas fa-edit"></i> ${t('edit')}</button>
                        <button class="btn btn-sm btn-success" onclick="window.SuppliersModule.showSupplierMedicines('${s.id}')"><i class="fas fa-pills"></i> ${t('medicines')}</button>
                        <button class="btn btn-sm btn-danger" onclick="window.SuppliersModule.deleteSupplier('${s.id}')"><i class="fas fa-trash"></i> ${t('delete')}</button>
                    </div>
                </div>
            `; 
        }).join(''); 
        this.renderPagination(total);
        applyTranslations();
    },
    
    renderPagination(total) { 
        const container = document.getElementById('suppliersPagination'); 
        if (!container || total <= 1) { if (container) container.innerHTML = ''; return; } 
        
        const self = this;
        let html = '<ul class="pagination">';
        html += '<li class="page-item' + (this.currentPage === 1 ? ' disabled' : '') + '"><span class="page-link" onclick="window.SuppliersModule.goToPage(' + (this.currentPage - 1) + ')">«</span></li>';
        
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += '<li class="page-item' + (i === this.currentPage ? ' active' : '') + '"><span class="page-link" onclick="window.SuppliersModule.goToPage(' + i + ')">' + i + '</span></li>';
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        html += '<li class="page-item' + (this.currentPage === total ? ' disabled' : '') + '"><span class="page-link" onclick="window.SuppliersModule.goToPage(' + (this.currentPage + 1) + ')">»</span></li></ul>';
        container.innerHTML = html;
    },
    
    search() { 
        this.searchTerm = document.getElementById('supplierSearch')?.value.trim().toLowerCase() || ''; 
        this.currentPage = 1; 
        this.renderSuppliers(); 
    },
    
    goToPage(p) { this.currentPage = p; this.renderSuppliers(); },
    
    openAddModal() { 
        document.getElementById('supplierId').value = ''; 
        document.getElementById('supplierName').value = ''; 
        document.getElementById('supplierContactPerson').value = ''; 
        document.getElementById('supplierPhone').value = ''; 
        document.getElementById('supplierEmail').value = ''; 
        document.getElementById('supplierAddress').value = ''; 
        document.querySelector('#supplierModal .modal-title').innerHTML = '<i class="fas fa-plus-circle"></i> ' + t('add_supplier');
        applyTranslations();
        safeOpenModal('supplierModal'); 
    },
    
    openEditModal(id) { 
        const s = DAL.getSupplierById(id); 
        if (!s) return; 
        document.getElementById('supplierId').value = s.id; 
        document.getElementById('supplierName').value = s.name || ''; 
        document.getElementById('supplierContactPerson').value = s.contactPerson || ''; 
        document.getElementById('supplierPhone').value = s.phone || ''; 
        document.getElementById('supplierEmail').value = s.email || ''; 
        document.getElementById('supplierAddress').value = s.address || ''; 
        document.querySelector('#supplierModal .modal-title').innerHTML = '<i class="fas fa-edit"></i> ' + t('edit_supplier');
        applyTranslations();
        safeOpenModal('supplierModal'); 
    },
    
    async saveSupplier() { 
        const id = document.getElementById('supplierId')?.value || ''; 
        const name = document.getElementById('supplierName')?.value.trim() || ''; 
        if (!name) { showToast(t('field_required'), 'error'); return; } 
        
        const data = { 
            name, 
            contactPerson: document.getElementById('supplierContactPerson')?.value.trim() || '', 
            phone: document.getElementById('supplierPhone')?.value.trim() || '', 
            email: document.getElementById('supplierEmail')?.value.trim() || '', 
            address: document.getElementById('supplierAddress')?.value.trim() || '', 
            updatedAt: new Date().toISOString() 
        }; 
        
        if (id) { 
            const existing = DAL.getSupplierById(id); 
            if (existing) { 
                data.createdAt = existing.createdAt; 
                await DAL.updateSupplier(id, data); 
                await addAuditLog(t('edit_supplier'), name); 
                await saveData(); 
                showToast(t('update_success') + ' ' + name, 'success'); 
            } 
        } else { 
            data.createdAt = new Date().toISOString(); 
            await DAL.addSupplier(data); 
            await addAuditLog(t('add_supplier'), name); 
            await saveData(); 
            showToast(t('save_success') + ' ' + name, 'success'); 
        } 
        safeCloseModal('supplierModal'); 
        this.render(); 
        updateSupplierSelect(); 
    },
    
    async deleteSupplier(id) { 
        const s = DAL.getSupplierById(id); 
        if (!s) return; 
        const linked = AppData.medicines.filter(function(m) { return m.supplierId === id; }); 
        if (linked.length && !confirm(t('confirm_delete_related') + ' ' + linked.length + ' ' + t('medicines') + '?')) return; 
        if (!linked.length && !confirm(t('confirm_delete') + ' "' + s.name + '"?')) return; 
        linked.forEach(function(m) { m.supplierId = null; IDB.put('medicines', m); }); 
        await DAL.deleteSupplier(id); 
        await addAuditLog(t('delete_supplier'), s.name); 
        await saveData(); 
        this.render(); 
        showToast(t('delete_success') + ' ' + s.name, 'success'); 
    },
    
    showSupplierMedicines(id) { 
        const s = DAL.getSupplierById(id); 
        if (!s) return; 
        const meds = AppData.medicines.filter(function(m) { return m.supplierId === id; }); 
        const h = `
            <div class="modal fade" id="supplierMedicinesModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5><i class="fas fa-pills"></i> ${t('medicines')} ${escapeHtml(s.name)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${meds.length === 0 ? '<p class="text-center py-4">' + t('no_data') + '</p>' : `
                                <table class="table table-sm">
                                    <thead><tr><th>${t('medicine')}</th><th>${t('category')}</th><th>${t('quantity')}</th><th>${t('price')}</th></tr></thead>
                                    <tbody>
                                        ${meds.map(function(m) { 
                                            return '<tr><td><strong>' + escapeHtml(m.tradeName) + '</strong>' + (m.scientificName ? '<br><small>' + escapeHtml(m.scientificName) + '</small>' : '') + '</td><td>' + escapeHtml(m.category || '-') + '</td><td>' + m.quantity + '</td><td>' + formatMoney(m.price) + '</td></tr>'; 
                                        }).join('')}
                                    </tbody>
                                </table>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        const existing = document.getElementById('supplierMedicinesModal'); 
        if (existing) existing.remove(); 
        document.body.insertAdjacentHTML('beforeend', h); 
        new bootstrap.Modal(document.getElementById('supplierMedicinesModal')).show(); 
    },
    
    exportToCSV() { 
        let csv = '\uFEFFاسم الشركة,الشخص المسؤول,الهاتف,البريد الإلكتروني,العنوان,عدد الأدوية\n'; 
        AppData.suppliers.forEach(function(s) { 
            csv += '"' + s.name + '","' + (s.contactPerson || '') + '","' + (s.phone || '') + '","' + (s.email || '') + '","' + (s.address || '') + '",' + AppData.medicines.filter(function(m) { return m.supplierId === s.id; }).length + '\n'; 
        }); 
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); 
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = 'suppliers_' + new Date().toISOString().slice(0,10) + '.csv'; 
        a.click(); 
        showToast(t('export'), 'success'); 
    }
};

// ================================================================
// Customers Module
// ================================================================
window.CustomersModule = {
    searchTerm: '', currentPage: 1, itemsPerPage: 12,
    
    async render() {
        const section = document.getElementById('customers'); 
        if (!section) return;
        
        section.innerHTML = `
            <h4 style="color:white; font-weight:900; margin-bottom:20px;">
                <i class="fas fa-users"></i> <span data-i18n="customer_management">إدارة العملاء</span>
            </h4>
            <div class="stats-grid" id="customersStats"></div>
            <div class="card-modern">
                <div class="action-bar">
                    <button class="btn-modern btn-modern-success" id="openAddCustomerBtn">
                        <i class="fas fa-user-plus"></i> <span data-i18n="add_customer">إضافة عميل جديد</span>
                    </button>
                    <button class="btn-modern btn-modern-info" id="exportCustomersBtn">
                        <i class="fas fa-download"></i> <span data-i18n="export">تصدير CSV</span>
                    </button>
                    <div class="search-box ms-auto">
                        <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                            <input type="text" id="customerSearch" class="form-control" placeholder="${t('search')}...">
                        </div>
                    </div>
                </div>
            </div>
            <div class="customers-grid" id="customersGrid"></div>
            <div class="pagination-modern" id="customersPagination"></div>
        `;
        
        applyTranslations();
        this.renderStats(); 
        this.renderCustomers();
        
        document.getElementById('openAddCustomerBtn').onclick = () => this.openAddModal();
        document.getElementById('exportCustomersBtn').onclick = () => this.exportToCSV();
        document.getElementById('customerSearch').onkeyup = () => this.search();
    },
    
    renderStats() { 
        const total = AppData.customers.length; 
        const withDebt = (AppData.debts||[]).filter(function(d) { return d.type==='customer' && d.status==='active'; }).reduce(function(s,d) { return s+(d.remaining||0); },0); 
        
        document.getElementById('customersStats').innerHTML = `
            <div class="stat-card" style="border-right-color:#0d9488;">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="customers">العملاء</h3>
                    <p>${total}</p>
                </div>
            </div>
            <div class="stat-card warning" style="border-right-color:#f59e0b;">
                <div class="stat-icon"><i class="fas fa-hand-holding-usd"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="total_debts">إجمالي الديون</h3>
                    <p>${formatMoney(withDebt)}</p>
                </div>
            </div>
        `;
        applyTranslations();
    },
    
    renderCustomers() { 
        const grid = document.getElementById('customersGrid'); 
        if (!grid) return; 
        let f = DAL.getCustomers().slice(); 
        
        if (this.searchTerm) { 
            const term = this.searchTerm.toLowerCase(); 
            f = f.filter(function(c) { return (c.name||'').toLowerCase().indexOf(term) !== -1 || (c.phone||'').toLowerCase().indexOf(term) !== -1; }); 
        } 
        
        f.sort(function(a,b) { return (a.name||'').localeCompare(b.name||''); }); 
        const total = Math.ceil(f.length / this.itemsPerPage);
        const start = (this.currentPage-1)*this.itemsPerPage;
        const paginated = f.slice(start, start+this.itemsPerPage); 
        
        if (paginated.length === 0) { 
            grid.innerHTML = '<div class="no-data-message"><i class="fas fa-users fa-3x"></i><p data-i18n="no_customers">لا يوجد عملاء</p></div>'; 
            applyTranslations();
            return; 
        } 
        
        grid.innerHTML = paginated.map(function(c) { 
            const debt = (AppData.debts||[]).filter(function(d) { return d.customerId===c.id && d.status==='active'; }).reduce(function(s,d) { return s+(d.remaining||0); },0); 
            return `
                <div class="customer-card">
                    <div class="customer-header">
                        <div class="customer-icon"><i class="fas fa-user"></i></div>
                        <div class="customer-info">
                            <h4>${escapeHtml(c.name)}</h4>
                        </div>
                    </div>
                    <div class="customer-body">
                        ${c.phone ? '<p><i class="fas fa-phone"></i> ' + escapeHtml(c.phone) + '</p>' : ''}
                        ${c.email ? '<p><i class="fas fa-envelope"></i> ' + escapeHtml(c.email) + '</p>' : ''}
                        ${c.address ? '<p><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(c.address) + '</p>' : ''}
                        ${debt > 0 ? '<p class="text-warning"><i class="fas fa-hand-holding-usd"></i> ' + t('debt') + ': ' + formatMoney(debt) + '</p>' : ''}
                    </div>
                    <div class="customer-footer">
                        <button class="btn btn-sm btn-info" onclick="window.CustomersModule.openEditModal('${c.id}')"><i class="fas fa-edit"></i> ${t('edit')}</button>
                        <button class="btn btn-sm btn-danger" onclick="window.CustomersModule.deleteCustomer('${c.id}')"><i class="fas fa-trash"></i> ${t('delete')}</button>
                    </div>
                </div>
            `; 
        }).join(''); 
        this.renderPagination(total);
        applyTranslations();
    },
    
    renderPagination(total) { 
        const container = document.getElementById('customersPagination'); 
        if (!container || total <= 1) { if (container) container.innerHTML = ''; return; } 
        
        const self = this;
        let html = '<ul class="pagination">';
        html += '<li class="page-item' + (this.currentPage === 1 ? ' disabled' : '') + '"><span class="page-link" onclick="window.CustomersModule.goToPage(' + (this.currentPage - 1) + ')">«</span></li>';
        
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += '<li class="page-item' + (i === this.currentPage ? ' active' : '') + '"><span class="page-link" onclick="window.CustomersModule.goToPage(' + i + ')">' + i + '</span></li>';
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        html += '<li class="page-item' + (this.currentPage === total ? ' disabled' : '') + '"><span class="page-link" onclick="window.CustomersModule.goToPage(' + (this.currentPage + 1) + ')">»</span></li></ul>';
        container.innerHTML = html;
    },
    
    search() { 
        this.searchTerm = document.getElementById('customerSearch')?.value.trim().toLowerCase() || ''; 
        this.currentPage = 1; 
        this.renderCustomers(); 
    },
    
    goToPage(p) { this.currentPage = p; this.renderCustomers(); },
    
    openAddModal() { 
        document.getElementById('customerId').value = ''; 
        document.getElementById('customerName').value = ''; 
        document.getElementById('customerPhone').value = ''; 
        document.getElementById('customerEmail').value = ''; 
        document.getElementById('customerAddress').value = ''; 
        document.querySelector('#customerModal .modal-title').innerHTML = '<i class="fas fa-user-plus"></i> ' + t('add_customer');
        applyTranslations();
        safeOpenModal('customerModal'); 
    },
    
    openEditModal(id) { 
        const c = DAL.getCustomerById(id); 
        if (!c) return; 
        document.getElementById('customerId').value = c.id; 
        document.getElementById('customerName').value = c.name || ''; 
        document.getElementById('customerPhone').value = c.phone || ''; 
        document.getElementById('customerEmail').value = c.email || ''; 
        document.getElementById('customerAddress').value = c.address || ''; 
        document.querySelector('#customerModal .modal-title').innerHTML = '<i class="fas fa-edit"></i> ' + t('edit_customer');
        applyTranslations();
        safeOpenModal('customerModal'); 
    },
    
    async saveCustomer() { 
        const id = document.getElementById('customerId')?.value || ''; 
        const name = document.getElementById('customerName')?.value.trim() || ''; 
        if (!name) { showToast(t('field_required'), 'error'); return; } 
        
        const data = { 
            name, 
            phone: document.getElementById('customerPhone')?.value.trim() || '', 
            email: document.getElementById('customerEmail')?.value.trim() || '', 
            address: document.getElementById('customerAddress')?.value.trim() || '', 
            updatedAt: new Date().toISOString() 
        }; 
        
        if (id) { 
            const existing = DAL.getCustomerById(id); 
            if (existing) { 
                data.joined = existing.joined; 
                await DAL.updateCustomer(id, data); 
                await addAuditLog(t('edit_customer'), name); 
                await saveData(); 
                showToast(t('update_success') + ' ' + name, 'success'); 
            } 
        } else { 
            data.joined = new Date().toISOString(); 
            await DAL.addCustomer(data); 
            await addAuditLog(t('add_customer'), name); 
            await saveData(); 
            showToast(t('save_success') + ' ' + name, 'success'); 
        } 
        safeCloseModal('customerModal'); 
        this.render(); 
        if (window.POSModule) window.POSModule.updateCustomerSelect(); 
    },
    
    async deleteCustomer(id) { 
        const c = DAL.getCustomerById(id); 
        if (!c) return; 
        const hasDebt = (AppData.debts||[]).some(function(d) { return d.customerId===id && d.status==='active'; }); 
        if (hasDebt && !confirm(t('confirm_delete_with_debt') + ' "' + c.name + '"?')) return; 
        if (!hasDebt && !confirm(t('confirm_delete') + ' "' + c.name + '"?')) return; 
        await DAL.deleteCustomer(id); 
        await addAuditLog(t('delete_customer'), c.name); 
        await saveData(); 
        this.render(); 
        showToast(t('delete_success') + ' ' + c.name, 'success'); 
    },
    
    exportToCSV() { 
        let csv = '\uFEFFالاسم,الهاتف,البريد الإلكتروني,العنوان,تاريخ الانضمام\n'; 
        AppData.customers.forEach(function(c) { 
            csv += '"' + c.name + '","' + (c.phone||'') + '","' + (c.email||'') + '","' + (c.address||'') + '","' + formatDate(c.joined) + '"\n'; 
        }); 
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); 
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = 'customers_' + new Date().toISOString().slice(0,10) + '.csv'; 
        a.click(); 
        showToast(t('export'), 'success'); 
    }
};

// ================================================================
// Sales Module (with CORRECTED REFUND SYSTEM)
// ================================================================
window.SalesModule = {
    searchTerm: '', dateFrom: '', dateTo: '', currentPage: 1, itemsPerPage: 15, _currentRefundSale: null,
    
    async render() {
        const section = document.getElementById('sales'); 
        if (!section) return;
        
        section.innerHTML = `
            <h4 style="color:white; font-weight:900; margin-bottom:20px;">
                <i class="fas fa-file-invoice"></i> <span data-i18n="sales_record">سجل المبيعات</span>
            </h4>
            <div class="stats-grid" id="salesStats"></div>
            <div class="card-modern">
                <div class="filter-row">
                    <div class="filter-group">
                        <label><i class="fas fa-calendar"></i> <span data-i18n="from_date">من تاريخ</span></label>
                        <input type="date" id="salesDateFrom" class="form-control">
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-calendar"></i> <span data-i18n="to_date">إلى تاريخ</span></label>
                        <input type="date" id="salesDateTo" class="form-control">
                    </div>
                    <div class="filter-group flex-grow-1">
                        <label><i class="fas fa-search"></i> <span data-i18n="search">بحث</span></label>
                        <input type="text" id="salesSearch" class="form-control" placeholder="${t('invoice_number')} / ${t('customer')}...">
                    </div>
                    <div class="filter-group">
                        <label>&nbsp;</label>
                        <button class="btn btn-outline-secondary" id="resetSalesFiltersBtn">
                            <i class="fas fa-redo"></i> <span data-i18n="reset">إعادة تعيين</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-modern">
                <div class="action-bar mb-3">
                    <button class="btn-modern btn-modern-success" id="exportSalesBtn">
                        <i class="fas fa-download"></i> <span data-i18n="export">تصدير CSV</span>
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th data-i18n="invoice_number">رقم الفاتورة</th>
                                <th data-i18n="date">التاريخ</th>
                                <th data-i18n="customer">العميل</th>
                                <th data-i18n="items_count_sold">عدد الأصناف</th>
                                <th data-i18n="total">الإجمالي</th>
                                <th data-i18n="discount">الخصم</th>
                                <th data-i18n="paid">المدفوع</th>
                                <th data-i18n="remaining">المتبقي</th>
                                <th data-i18n="returns">مرتجعات</th>
                                <th data-i18n="payment_method">طريقة الدفع</th>
                                <th data-i18n="actions">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="salesTableBody"></tbody>
                    </table>
                </div>
                <div class="pagination-modern" id="salesPagination"></div>
            </div>
        `;
        
        applyTranslations();
        this.setDefaultDates(); 
        this.renderStats(); 
        this.renderTable();
        
        document.getElementById('salesDateFrom').onchange = () => this.filterByDate();
        document.getElementById('salesDateTo').onchange = () => this.filterByDate();
        document.getElementById('salesSearch').onkeyup = () => this.search();
        document.getElementById('resetSalesFiltersBtn').onclick = () => this.resetFilters();
        document.getElementById('exportSalesBtn').onclick = () => this.exportToCSV();
    },
    
    setDefaultDates() { 
        const today = new Date().toISOString().split('T')[0]; 
        if (document.getElementById('salesDateFrom')) document.getElementById('salesDateFrom').value = today; 
        if (document.getElementById('salesDateTo')) document.getElementById('salesDateTo').value = today; 
        this.dateFrom = today; 
        this.dateTo = today; 
    },
    
    getFilteredSales() { 
        let f = DAL.getSales().slice().reverse(); 
        
        if (this.dateFrom) {
            f = f.filter(function(s) { return s.date >= this.dateFrom; }.bind(this));
        }
        if (this.dateTo) { 
            const to = new Date(this.dateTo); 
            to.setHours(23,59,59); 
            f = f.filter(function(s) { return new Date(s.date) <= to; }); 
        } 
        if (this.searchTerm) { 
            const term = this.searchTerm.toLowerCase(); 
            f = f.filter(function(s) { return (s.invoiceNumber||'').toLowerCase().indexOf(term) !== -1 || (s.customer||'').toLowerCase().indexOf(term) !== -1; }); 
        } 
        return f; 
    },
    
    renderStats() { 
        const f = this.getFilteredSales(); 
        const totalSales = f.reduce(function(s,i) { return s+(i.total||0); },0); 
        const grossProfit = f.reduce(function(s,i) { return s+(i.profit||0); },0); 
        const invoices = f.length; 
        const refundTotal = (AppData.returns||[]).filter(function(r) { 
            const rDate = new Date(r.date).toISOString().split('T')[0]; 
            return rDate >= this.dateFrom && rDate <= this.dateTo; 
        }.bind(this)).reduce(function(s,r) { return s+(r.totalAmount||0); },0); 
        const refundProfitLoss = (AppData.returns||[]).filter(function(r) { 
            const rDate = new Date(r.date).toISOString().split('T')[0]; 
            return rDate >= this.dateFrom && rDate <= this.dateTo; 
        }.bind(this)).reduce(function(s,r) { return s+(r.totalProfit||0); },0); 
        const netProfit = grossProfit - refundProfitLoss; 
        
        document.getElementById('salesStats').innerHTML = `
            <div class="stat-card" style="border-right-color:#0d9488;">
                <div class="stat-icon"><i class="fas fa-file-invoice"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="invoices">عدد الفواتير</h3>
                    <p>${invoices}</p>
                </div>
            </div>
            <div class="stat-card success" style="border-right-color:#10b981;">
                <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="total_sales">إجمالي المبيعات</h3>
                    <p>${formatMoney(totalSales)}</p>
                </div>
            </div>
            <div class="stat-card info" style="border-right-color:#3b82f6;">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="net_profit">صافي الأرباح</h3>
                    <p>${formatMoney(netProfit)}</p>
                    <small>${t('returns')}: ${formatMoney(refundTotal)} | ${t('profit_loss')}: ${formatMoney(refundProfitLoss)}</small>
                </div>
            </div>
            <div class="stat-card warning" style="border-right-color:#f59e0b;">
                <div class="stat-icon"><i class="fas fa-undo-alt"></i></div>
                <div class="stat-info">
                    <h3 data-i18n="returns">المرتجعات</h3>
                    <p>${formatMoney(refundTotal)}</p>
                </div>
            </div>
        `;
        applyTranslations();
    },
    
    renderTable() { 
        const tbody = document.getElementById('salesTableBody'); 
        if (!tbody) return; 
        const f = this.getFilteredSales(); 
        const total = Math.ceil(f.length / this.itemsPerPage); 
        const start = (this.currentPage-1)*this.itemsPerPage; 
        const paginated = f.slice(start, start+this.itemsPerPage); 
        
        if (paginated.length === 0) { 
            tbody.innerHTML = '<tr><td colspan="11" class="text-center py-4">' + t('no_invoices') + '</td></tr>'; 
            return; 
        } 
        
        tbody.innerHTML = paginated.map(function(s) { 
            const refundAmount = s.refundTotal || 0; 
            return `
                <tr>
                    <td><strong>${s.invoiceNumber}</strong></td>
                    <td>${formatDateTime(s.date)}</td>
                    <td>${s.customer || t('cash_customer')}</td>
                    <td>${s.items ? s.items.length : 0} ${t('items_count_sold')}</td>
                    <td>${formatMoney(s.total)}</td>
                    <td>${s.discount > 0 ? formatMoney(s.discount) : '-'}</td>
                    <td>${formatMoney(s.paid)}</td>
                    <td>${s.debt > 0 ? '<span class="text-warning fw-bold">' + formatMoney(s.debt) + '</span>' : '<span class="text-success">✓ ' + t('paid') + '</span>'}</td>
                    <td>${refundAmount > 0 ? '<span class="text-warning">' + formatMoney(refundAmount) + '</span>' : '-'}</td>
                    <td>${s.method === 'cash' ? t('cash') : s.method === 'bank' ? t('bank_transfer') : t('debt')}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.SalesModule.showInvoice('${s.id}')"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-success" onclick="window.SalesModule.printInvoice('${s.id}')"><i class="fas fa-print"></i></button>
                        <button class="btn btn-sm btn-warning" onclick="window.SalesModule.openRefundModal('${s.id}')"><i class="fas fa-undo-alt"></i></button>
                    </td>
                </tr>
            `; 
        }).join(''); 
        this.renderPagination(total); 
    },
    
    renderPagination(total) { 
        const container = document.getElementById('salesPagination'); 
        if (!container || total <= 1) { if (container) container.innerHTML = ''; return; } 
        
        const self = this;
        let html = '<ul class="pagination">';
        html += '<li class="page-item' + (this.currentPage === 1 ? ' disabled' : '') + '"><span class="page-link" onclick="window.SalesModule.goToPage(' + (this.currentPage - 1) + ')">«</span></li>';
        
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += '<li class="page-item' + (i === this.currentPage ? ' active' : '') + '"><span class="page-link" onclick="window.SalesModule.goToPage(' + i + ')">' + i + '</span></li>';
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        html += '<li class="page-item' + (this.currentPage === total ? ' disabled' : '') + '"><span class="page-link" onclick="window.SalesModule.goToPage(' + (this.currentPage + 1) + ')">»</span></li></ul>';
        container.innerHTML = html;
    },
    
    filterByDate() { 
        this.dateFrom = document.getElementById('salesDateFrom')?.value || ''; 
        this.dateTo = document.getElementById('salesDateTo')?.value || ''; 
        this.currentPage = 1; 
        this.renderStats(); 
        this.renderTable(); 
    },
    
    search() { 
        this.searchTerm = document.getElementById('salesSearch')?.value.trim().toLowerCase() || ''; 
        this.currentPage = 1; 
        this.renderTable(); 
    },
    
    resetFilters() { 
        this.searchTerm = ''; 
        this.setDefaultDates(); 
        this.currentPage = 1; 
        if (document.getElementById('salesSearch')) document.getElementById('salesSearch').value = ''; 
        this.renderStats(); 
        this.renderTable(); 
        showToast(t('reset'), 'info'); 
    },
    
    goToPage(p) { this.currentPage = p; this.renderTable(); },
    
    showInvoice(id) { 
        const s = DAL.getSaleById(id); 
        if (!s) return; 
        const pharmacyName = AppData.pharmacyInfo.name || t('app_name'); 
        const refundAmount = s.refundTotal || 0; 
        const refundProfitLoss = s.refundProfitLoss || 0; 
        const currentProfit = (s.profit || 0) - (refundProfitLoss || 0); 
        
        const h = `
            <div class="modal fade" id="invoiceDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5><i class="fas fa-file-invoice"></i> ${t('invoice')} #${s.invoiceNumber} - ${pharmacyName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>${t('date')}:</strong> ${formatDateTime(s.date)}</p>
                            <p><strong>${t('customer')}:</strong> ${s.customer || t('cash_customer')}</p>
                            <table class="table table-sm">
                                <thead><tr><th>${t('medicine')}</th><th>${t('quantity')}</th><th>${t('price')}</th><th>${t('total')}</th></tr></thead>
                                <tbody>
                                    ${s.items.map(function(i) { return '<tr><td>' + escapeHtml(i.name) + '</td><td>' + i.quantity + '</td><td>' + formatMoney(i.price) + '</td><td>' + formatMoney(i.price * i.quantity) + '</td></tr>'; }).join('')}
                                </tbody>
                            </table>
                            <div class="invoice-summary">
                                <p><strong>${t('subtotal')}:</strong> ${formatMoney(s.subtotal)}</p>
                                ${s.discount > 0 ? '<p><strong>' + t('discount') + ':</strong> -' + formatMoney(s.discount) + '</p>' : ''}
                                <p><strong>${t('total')}:</strong> ${formatMoney(s.total)}</p>
                                <p><strong>${t('paid')}:</strong> ${formatMoney(s.paid)}</p>
                                ${s.debt > 0 ? '<p><strong>' + t('remaining') + ':</strong> ' + formatMoney(s.debt) + '</p>' : ''}
                                <p><strong>${t('gross_profit')}:</strong> ${formatMoney(s.profit || 0)}</p>
                                ${refundAmount > 0 ? '<p class="text-warning"><strong>' + t('returns') + ':</strong> ' + formatMoney(refundAmount) + ' (' + t('profit_loss') + ': -' + formatMoney(refundProfitLoss) + ')</p>' : ''}
                                <p class="text-info"><strong>${t('net_profit')}:</strong> ${formatMoney(currentProfit)}</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-success" onclick="window.SalesModule.printInvoice('${s.id}')"><i class="fas fa-print"></i> ${t('print')}</button>
                            <button class="btn btn-warning" onclick="window.SalesModule.openRefundModal('${s.id}')"><i class="fas fa-undo-alt"></i> ${t('process_refund')}</button>
                            <button class="btn btn-secondary" data-bs-dismiss="modal">${t('close')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const existing = document.getElementById('invoiceDetailModal'); 
        if (existing) existing.remove(); 
        document.body.insertAdjacentHTML('beforeend', h); 
        new bootstrap.Modal(document.getElementById('invoiceDetailModal')).show(); 
    },
    
    printInvoice(id) { 
        if (window.POSModule) window.POSModule.printInvoice(id); 
    },
    
    openRefundModal(saleId) {
        const sale = DAL.getSaleById(saleId); 
        if (!sale) { showToast(t('no_data'), 'error'); return; }
        this._currentRefundSale = sale;
        document.getElementById('refundSaleId').value = saleId;
        document.getElementById('refundInvoiceNumber').textContent = sale.invoiceNumber;
        document.getElementById('refundReason').value = '';
        
        let itemsHtml = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>' + t('medicine') + '</th><th>' + t('quantity_sold') + '</th><th>' + t('price') + '</th><th>' + t('refund_quantity') + '</th><th>' + t('damaged') + '</th></tr></thead><tbody>';
        
        sale.items.forEach(function(item, index) {
            itemsHtml += '<tr><td><strong>' + escapeHtml(item.name) + '</strong></td><td>' + item.quantity + '</td><td>' + formatMoney(item.price) + '</td><td><input type="number" id="refundQty_' + index + '" class="form-control form-control-sm" min="0" max="' + item.quantity + '" value="0" style="width:80px;" onchange="window.SalesModule.validateRefundQty(' + index + ', ' + item.quantity + ')"></td><td><div class="refund-item-damaged"><input type="checkbox" id="refundDamaged_' + index + '" onchange="window.SalesModule.toggleDamaged(' + index + ')"><label for="refundDamaged_' + index + '">' + t('damaged') + '</label></div></td></tr>';
        });
        
        itemsHtml += '</tbody></table></div>';
        document.getElementById('refundItemsList').innerHTML = itemsHtml;
        applyTranslations();
        
        const existingModal = document.getElementById('refundModal');
        if (existingModal) { 
            const existingInstance = bootstrap.Modal.getInstance(existingModal); 
            if (existingInstance) { existingInstance.dispose(); } 
        }
        safeOpenModal('refundModal');
        
        const confirmBtn = document.getElementById('confirmRefundBtn');
        if (confirmBtn) { 
            const newBtn = confirmBtn.cloneNode(true); 
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn); 
            newBtn.addEventListener('click', function() { window.SalesModule.processRefund(); }); 
        }
    },
    
    validateRefundQty(index, maxQty) { 
        const input = document.getElementById('refundQty_' + index); 
        if (!input) return; 
        let val = parseInt(input.value) || 0; 
        if (val < 0) input.value = 0; 
        if (val > maxQty) { 
            input.value = maxQty; 
            showToast(t('invalid_input'), 'warning'); 
        } 
    },
    
    toggleDamaged(index) { 
        const damagedCheck = document.getElementById('refundDamaged_' + index); 
        const qtyInput = document.getElementById('refundQty_' + index); 
        if (damagedCheck && damagedCheck.checked) { 
            if (qtyInput) qtyInput.style.backgroundColor = '#ffe0e0'; 
        } else { 
            if (qtyInput) qtyInput.style.backgroundColor = ''; 
        } 
    },
    
    async processRefund() {
        const sale = this._currentRefundSale; 
        if (!sale) { showToast(t('no_data'), 'error'); return; }
        
        if (sale.hasRefund && sale.refundTotal >= sale.total) {
            showToast(t('already_refunded'), 'error');
            return;
        }
        
        let totalRefundAmount = 0; 
        const refundItems = []; 
        let hasItems = false;
        let totalRefundCost = 0; 
        let totalRefundProfit = 0;
        
        const previouslyRefunded = {};
        if (AppData.returns) {
            AppData.returns.filter(function(r) { return r.saleId === sale.id; }).forEach(function(r) {
                r.items.forEach(function(ri) {
                    if (!previouslyRefunded[ri.medicineId]) previouslyRefunded[ri.medicineId] = 0;
                    previouslyRefunded[ri.medicineId] += ri.quantity;
                });
            });
        }
        
        sale.items.forEach(function(item, index) {
            const qtyInput = document.getElementById('refundQty_' + index); 
            const damagedCheck = document.getElementById('refundDamaged_' + index);
            let returnQty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
            
            const alreadyRefunded = previouslyRefunded[item.id] || 0;
            const maxAllowed = item.quantity - alreadyRefunded;
            
            if (returnQty > maxAllowed) {
                returnQty = maxAllowed;
                if (qtyInput) qtyInput.value = maxAllowed;
                showToast(t('invalid_input'), 'warning');
            }
            
            if (returnQty > 0) {
                hasItems = true; 
                const isDamaged = damagedCheck ? damagedCheck.checked : false;
                const itemRefundAmount = item.price * returnQty;
                const itemCost = (item.cost || 0) * returnQty;
                const itemProfit = itemRefundAmount - itemCost;
                
                refundItems.push({ 
                    medicineId: item.id, name: item.name, price: item.price, 
                    cost: item.cost || 0, quantity: returnQty, isDamaged, 
                    subtotal: itemRefundAmount, itemCost: itemCost, profit: itemProfit 
                });
                
                totalRefundAmount += itemRefundAmount;
                totalRefundCost += itemCost;
                totalRefundProfit += itemProfit;
            }
        });
        
        if (!hasItems) { showToast(t('no_items_selected'), 'warning'); return; }
        const reason = document.getElementById('refundReason')?.value.trim() || '';
        
        if (!confirm(t('confirm_refund') + ' ' + formatMoney(totalRefundAmount) + '?\n\n' + 
            refundItems.map(function(i) { return i.name + ' ×' + i.quantity + (i.isDamaged ? ' [' + t('damaged') + ']' : ''); }).join('\n') + 
            '\n\n' + t('total') + ': ' + formatMoney(totalRefundAmount) + '\n' + t('profit_loss') + ': -' + formatMoney(totalRefundProfit))) return;
        
        for (let riIdx = 0; riIdx < refundItems.length; riIdx++) {
            const ri = refundItems[riIdx];
            const medicine = DAL.getMedicineById(ri.medicineId);
            if (medicine) {
                if (!ri.isDamaged) {
                    medicine.quantity += ri.quantity;
                    medicine.updatedAt = new Date().toISOString();
                    await IDB.put('medicines', medicine);
                }
                const moveType = ri.isDamaged ? 'refund_damaged' : 'return';
                const moveNotes = t('process_refund') + ' ' + t('invoice') + ' #' + sale.invoiceNumber + (ri.isDamaged ? ' (' + t('damaged') + ')' : '');
                await addMovement(ri.medicineId, ri.name, moveType, ri.quantity, medicine ? medicine.quantity : 0, moveNotes);
            }
        }
        
        const refundRecord = {
            id: generateId('RET'),
            refundNumber: 'REF-' + new Date().getFullYear().toString().slice(-2) + 
                String(new Date().getMonth() + 1).padStart(2, '0') + 
                String(new Date().getDate()).padStart(2, '0') + '-' + 
                String(((AppData.returns && AppData.returns.length) || 0) + 1).padStart(4, '0'),
            saleId: sale.id, invoiceNumber: sale.invoiceNumber,
            date: new Date().toISOString(), items: refundItems,
            totalAmount: totalRefundAmount, totalCost: totalRefundCost,
            totalProfit: totalRefundProfit, reason,
            createdBy: AppData.currentUser ? AppData.currentUser.name : 'نظام'
        };
        await DAL.addReturn(refundRecord);
        
        if (!sale.refundTotal) sale.refundTotal = 0;
        if (!sale.refundProfitLoss) sale.refundProfitLoss = 0;
        sale.refundTotal += totalRefundAmount;
        sale.refundProfitLoss += totalRefundProfit;
        sale.hasRefund = true;
        await DAL.updateSale(sale.id, sale);
        
        await addAuditLog(t('process_refund'), t('invoice') + ' #' + sale.invoiceNumber + ' - ' + formatMoney(totalRefundAmount) + ' (' + t('profit_loss') + ': -' + formatMoney(totalRefundProfit) + ')' + (reason ? ' - ' + reason : ''));
        await saveData();
        
        safeCloseModal('refundModal');
        this.renderStats(); 
        this.renderTable();
        
        const damagedCount = refundItems.filter(function(i) { return i.isDamaged; }).length;
        const returnCount = refundItems.filter(function(i) { return !i.isDamaged; }).length;
        let msg = '✅ ' + t('process_refund') + ' - ' + formatMoney(totalRefundAmount);
        if (returnCount > 0) msg += ' | ' + returnCount + ' ' + t('items_returned');
        if (damagedCount > 0) msg += ' | ' + damagedCount + ' ' + t('damaged');
        showToast(msg, 'success');
        
        if (window.DashboardModule) window.DashboardModule.render();
    },
    
    exportToCSV() { 
        const f = this.getFilteredSales(); 
        let csv = '\uFEFFرقم الفاتورة,التاريخ,العميل,عدد الأصناف,الإجمالي,الخصم,المدفوع,المتبقي,المرتجعات,طريقة الدفع,الربح بعد المرتجعات\n'; 
        f.forEach(function(s) { 
            const effectiveProfit = (s.profit || 0) - (s.refundProfitLoss || 0); 
            csv += '"' + s.invoiceNumber + '","' + formatDateTime(s.date) + '","' + (s.customer || t('cash_customer')) + '",' + (s.items ? s.items.length : 0) + ',' + s.total + ',' + (s.discount || 0) + ',' + s.paid + ',' + (s.debt || 0) + ',' + (s.refundTotal || 0) + ',"' + (s.method === 'cash' ? t('cash') : s.method === 'bank' ? t('bank_transfer') : t('debt')) + '",' + effectiveProfit + '\n'; 
        }); 
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); 
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = 'sales_' + new Date().toISOString().slice(0,10) + '.csv'; 
        a.click(); 
        showToast(t('export'), 'success'); 
    }
};

// ================================================================
// Reports Module
// ================================================================
window.ReportsModule = {
    currentReport: 'sales', dateFrom: '', dateTo: '',
    
    async render() {
        const section = document.getElementById('reports'); 
        if (!section) return;
        
        section.innerHTML = `
            <h4 style="color:white; font-weight:900; margin-bottom:20px;">
                <i class="fas fa-chart-bar"></i> <span data-i18n="reports_statistics">التقارير والإحصائيات</span>
            </h4>
            <div class="card-modern">
                <div class="report-tabs">
                    <button class="report-tab ${this.currentReport === 'sales' ? 'active' : ''}" onclick="window.ReportsModule.switchReport('sales')"><i class="fas fa-chart-line"></i> ${t('sales_report')}</button>
                    <button class="report-tab ${this.currentReport === 'inventory' ? 'active' : ''}" onclick="window.ReportsModule.switchReport('inventory')"><i class="fas fa-boxes"></i> ${t('inventory_report')}</button>
                    <button class="report-tab ${this.currentReport === 'profit' ? 'active' : ''}" onclick="window.ReportsModule.switchReport('profit')"><i class="fas fa-dollar-sign"></i> ${t('profit_report')}</button>
                    <button class="report-tab ${this.currentReport === 'topProducts' ? 'active' : ''}" onclick="window.ReportsModule.switchReport('topProducts')"><i class="fas fa-trophy"></i> ${t('top_products')}</button>
                    <button class="report-tab ${this.currentReport === 'expiry' ? 'active' : ''}" onclick="window.ReportsModule.switchReport('expiry')"><i class="fas fa-clock"></i> ${t('expiry_report')}</button>
                </div>
            </div>
            <div class="card-modern" id="dateFilterCard" style="${this.currentReport === 'inventory' || this.currentReport === 'expiry' ? 'display:none;' : ''}">
                <div class="filter-row">
                    <div class="filter-group"><label><i class="fas fa-calendar"></i> ${t('from_date')}</label><input type="date" id="reportDateFrom" class="form-control"></div>
                    <div class="filter-group"><label><i class="fas fa-calendar"></i> ${t('to_date')}</label><input type="date" id="reportDateTo" class="form-control"></div>
                    <div class="filter-group"><label>${t('quick_view')}</label><select id="quickDateRange" class="form-select">
                        <option value="today">${t('today')}</option><option value="yesterday">${t('yesterday')}</option>
                        <option value="thisWeek">${t('this_week')}</option><option value="thisMonth">${t('this_month')}</option>
                        <option value="lastMonth">${t('last_month')}</option><option value="thisYear">${t('this_year')}</option>
                        <option value="all">${t('all')}</option>
                    </select></div>
                    <div class="filter-group"><label>&nbsp;</label><button class="btn btn-primary" onclick="window.ReportsModule.updateReport()"><i class="fas fa-sync-alt"></i> ${t('update')}</button></div>
                </div>
            </div>
            <div class="card-modern">
                <div class="report-header">
                    <h5 id="reportTitle">${t('sales_report')}</h5>
                    <div class="report-actions">
                        <button class="btn btn-sm btn-success" onclick="window.ReportsModule.exportToPDF()"><i class="fas fa-file-pdf"></i> ${t('pdf_export')}</button>
                        <button class="btn btn-sm btn-info" onclick="window.ReportsModule.exportToCSV()"><i class="fas fa-file-excel"></i> ${t('excel_export')}</button>
                        <button class="btn btn-sm btn-warning" onclick="window.ReportsModule.printReport()"><i class="fas fa-print"></i> ${t('print')}</button>
                    </div>
                </div>
                <div id="reportContent"></div>
            </div>
        `;
        
        applyTranslations();
        this.setDefaultDates(); 
        this.renderReport();
        
        document.getElementById('reportDateFrom').onchange = () => this.updateReport();
        document.getElementById('reportDateTo').onchange = () => this.updateReport();
        document.getElementById('quickDateRange').onchange = () => this.setQuickDateRange();
    },
    
    setDefaultDates() { 
        const now = new Date(); 
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1); 
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
        this.dateFrom = firstDay.toISOString().split('T')[0]; 
        this.dateTo = lastDay.toISOString().split('T')[0]; 
        if (document.getElementById('reportDateFrom')) document.getElementById('reportDateFrom').value = this.dateFrom; 
        if (document.getElementById('reportDateTo')) document.getElementById('reportDateTo').value = this.dateTo; 
    },
    
    setQuickDateRange() { 
        const range = document.getElementById('quickDateRange')?.value || 'thisMonth'; 
        const now = new Date(); 
        let from, to; 
        switch(range) { 
            case 'today': from = new Date(now); to = new Date(now); break; 
            case 'yesterday': from = new Date(now); from.setDate(from.getDate()-1); to = new Date(from); break; 
            case 'thisWeek': from = new Date(now); from.setDate(from.getDate()-from.getDay()); to = new Date(now); break; 
            case 'thisMonth': from = new Date(now.getFullYear(), now.getMonth(), 1); to = new Date(now); break; 
            case 'lastMonth': from = new Date(now.getFullYear(), now.getMonth()-1, 1); to = new Date(now.getFullYear(), now.getMonth(), 0); break; 
            case 'thisYear': from = new Date(now.getFullYear(), 0, 1); to = new Date(now); break; 
            case 'all': from = new Date(2000, 0, 1); to = new Date(now); break; 
            default: from = new Date(now.getFullYear(), now.getMonth(), 1); to = new Date(now); 
        } 
        this.dateFrom = from.toISOString().split('T')[0]; 
        this.dateTo = to.toISOString().split('T')[0]; 
        if (document.getElementById('reportDateFrom')) document.getElementById('reportDateFrom').value = this.dateFrom; 
        if (document.getElementById('reportDateTo')) document.getElementById('reportDateTo').value = this.dateTo; 
        this.renderReport(); 
    },
    
    switchReport(type) { 
        this.currentReport = type; 
        document.querySelectorAll('.report-tab').forEach(function(t) { t.classList.remove('active'); }); 
        const targetTab = document.querySelector('.report-tab[onclick*="' + type + '"]'); 
        if (targetTab) targetTab.classList.add('active'); 
        document.getElementById('dateFilterCard').style.display = (type === 'inventory' || type === 'expiry') ? 'none' : 'block'; 
        const titles = { sales: t('sales_report'), inventory: t('inventory_report'), profit: t('profit_report'), topProducts: t('top_products'), expiry: t('expiry_report') }; 
        document.getElementById('reportTitle').textContent = titles[type]; 
        this.renderReport(); 
    },
    
    updateReport() { 
        this.dateFrom = document.getElementById('reportDateFrom')?.value || ''; 
        this.dateTo = document.getElementById('reportDateTo')?.value || ''; 
        this.renderReport(); 
    },
    
    getFilteredSales() { 
        let f = AppData.sales.slice(); 
        if (this.dateFrom) f = f.filter(function(s) { return s.date >= this.dateFrom; }.bind(this)); 
        if (this.dateTo) { 
            const to = new Date(this.dateTo); 
            to.setHours(23,59,59); 
            f = f.filter(function(s) { return new Date(s.date) <= to; }); 
        } 
        return f; 
    },
    
    renderReport() { 
        const container = document.getElementById('reportContent'); 
        switch(this.currentReport) { 
            case 'sales': container.innerHTML = this.renderSalesReport(); break; 
            case 'inventory': container.innerHTML = this.renderInventoryReport(); break; 
            case 'profit': container.innerHTML = this.renderProfitReport(); break; 
            case 'topProducts': container.innerHTML = this.renderTopProductsReport(); break; 
            case 'expiry': container.innerHTML = this.renderExpiryReport(); break; 
        } 
        applyTranslations();
    },
    
    renderSalesReport() { 
        const sales = this.getFilteredSales(); 
        const rev = sales.reduce(function(s,i) { return s+(i.total||0); },0); 
        const grossProfit = sales.reduce(function(s,i) { return s+(i.profit||0); },0); 
        const invoices = sales.length; 
        const returns = (AppData.returns||[]).filter(function(r) { return r.date >= this.dateFrom && r.date <= this.dateTo; }.bind(this)).reduce(function(s,r) { return s+(r.totalProfit||0); },0); 
        const net = grossProfit - returns; 
        return '<div class="report-stats"><div class="report-stat-card"><h6>' + t('total_sales') + '</h6><p class="text-success">' + formatMoney(rev) + '</p></div><div class="report-stat-card"><h6>' + t('invoices') + '</h6><p>' + invoices + '</p></div><div class="report-stat-card"><h6>' + t('net_profit') + '</h6><p class="text-info">' + formatMoney(net) + '</p></div><div class="report-stat-card warning"><h6>' + t('returns_profit_loss') + '</h6><p>' + formatMoney(returns) + '</p></div></div>'; 
    },
    
    renderInventoryReport() { 
        const val = AppData.medicines.reduce(function(s,m) { return s+(m.price*m.quantity); },0); 
        const cost = AppData.medicines.reduce(function(s,m) { return s+((m.cost||0)*m.quantity); },0); 
        const byCat = {}; 
        AppData.medicines.forEach(function(m) { 
            const cat = m.category||'أخرى'; 
            if(!byCat[cat]) byCat[cat] = { count:0, value:0 }; 
            byCat[cat].count++; 
            byCat[cat].value += m.price*m.quantity; 
        }); 
        let html = '<div class="report-stats"><div class="report-stat-card"><h6>' + t('total_medicines') + '</h6><p>' + AppData.medicines.length + '</p></div><div class="report-stat-card"><h6>' + t('inventory_value') + '</h6><p class="text-success">' + formatMoney(val) + '</p></div><div class="report-stat-card"><h6>' + t('stock_cost') + '</h6><p>' + formatMoney(cost) + '</p></div></div><h6>' + t('category') + ' ' + t('distribution') + '</h6><table class="table table-sm"><thead><tr><th>' + t('category') + '</th><th>' + t('total_medicines') + '</th><th>' + t('inventory_value') + '</th></tr></thead><tbody>' + Object.entries(byCat).map(function(e) { return '<tr><td>' + e[0] + '</td><td>' + e[1].count + '</td><td>' + formatMoney(e[1].value) + '</td></tr>'; }).join('') + '</tbody></table>'; 
        return html; 
    },
    
    renderProfitReport() { 
        const sales = this.getFilteredSales(); 
        const rev = sales.reduce(function(s,i) { return s+(i.total||0); },0); 
        const cost = sales.reduce(function(s,i) { return s+(i.cost||0); },0); 
        const grossProfit = sales.reduce(function(s,i) { return s+(i.profit||0); },0); 
        const returns = (AppData.returns||[]).filter(function(r) { return r.date >= this.dateFrom && r.date <= this.dateTo; }.bind(this)).reduce(function(s,r) { return s+(r.totalProfit||0); },0); 
        const expenses = (AppData.expenses||[]).filter(function(e) { return e.date >= this.dateFrom && e.date <= this.dateTo; }.bind(this)).reduce(function(s,e) { return s+(e.amount||0); },0); 
        const net = grossProfit - returns - expenses; 
        const refundAmount = (AppData.returns||[]).filter(function(r) { return r.date >= this.dateFrom && r.date <= this.dateTo; }.bind(this)).reduce(function(s,r) { return s+(r.totalAmount||0); },0); 
        return '<div class="report-stats"><div class="report-stat-card"><h6>' + t('total_revenue') + '</h6><p class="text-success">' + formatMoney(rev) + '</p></div><div class="report-stat-card"><h6>' + t('total_cost') + '</h6><p>' + formatMoney(cost) + '</p></div><div class="report-stat-card"><h6>' + t('gross_profit') + '</h6><p class="text-info">' + formatMoney(grossProfit) + '</p></div><div class="report-stat-card warning"><h6>' + t('returns') + ' (' + t('value') + ')</h6><p>' + formatMoney(refundAmount) + '</p></div><div class="report-stat-card warning"><h6>' + t('returns_profit_loss') + '</h6><p>' + formatMoney(returns) + '</p></div><div class="report-stat-card danger"><h6>' + t('expenses') + '</h6><p>' + formatMoney(expenses) + '</p></div><div class="report-stat-card success"><h6>' + t('net_profit') + '</h6><p>' + formatMoney(net) + '</p></div></div>'; 
    },
    
    renderTopProductsReport() { 
        const sales = this.getFilteredSales(); 
        const prod = {}; 
        sales.forEach(function(s) { 
            s.items && s.items.forEach(function(i) { 
                if(!prod[i.name]) prod[i.name] = { qty:0, rev:0 }; 
                prod[i.name].qty += i.quantity; 
                prod[i.name].rev += i.price*i.quantity; 
            }); 
        }); 
        const sorted = Object.entries(prod).map(function(e) { return { name: e[0], qty: e[1].qty, rev: e[1].rev }; }).sort(function(a,b) { return b.rev - a.rev; }); 
        const totalQty = sorted.reduce(function(s,p) { return s+p.qty; },0); 
        return '<div class="report-stats"><div class="report-stat-card"><h6>' + t('items_count_sold') + '</h6><p>' + sorted.length + '</p></div><div class="report-stat-card"><h6>' + t('total_quantity') + '</h6><p>' + totalQty + '</p></div></div><h6>' + t('top_products') + '</h6><table class="table table-sm"><thead><tr><th>#</th><th>' + t('medicine') + '</th><th>' + t('quantity') + '</th><th>' + t('revenue') + '</th></tr></thead><tbody>' + sorted.slice(0,20).map(function(p,i) { return '<tr><td>' + (i+1) + '</td><td>' + p.name + '</td><td>' + p.qty + '</td><td>' + formatMoney(p.rev) + '</td></tr>'; }).join('') + '</tbody></table>'; 
    },
    
    renderExpiryReport() { 
        const meds = AppData.medicines.filter(function(m) { return m.expiryDate; }); 
        const expired = meds.filter(function(m) { return getDaysUntilExpiry(m.expiryDate) < 0; }); 
        const exp30 = meds.filter(function(m) { const d = getDaysUntilExpiry(m.expiryDate); return d >= 0 && d <= 30; }); 
        const exp60 = meds.filter(function(m) { const d = getDaysUntilExpiry(m.expiryDate); return d > 30 && d <= 60; }); 
        const exp90 = meds.filter(function(m) { const d = getDaysUntilExpiry(m.expiryDate); return d > 60 && d <= 90; }); 
        
        let html = '<div class="report-stats"><div class="report-stat-card danger"><h6>' + t('expired') + '</h6><p>' + expired.length + '</p></div><div class="report-stat-card warning"><h6>' + t('expiring_soon') + ' (30)</h6><p>' + exp30.length + '</p></div><div class="report-stat-card info"><h6>60 ' + t('days_remaining') + '</h6><p>' + exp60.length + '</p></div><div class="report-stat-card success"><h6>90 ' + t('days_remaining') + '</h6><p>' + exp90.length + '</p></div></div>';
        
        if (expired.length > 0) {
            html += '<div class="card-modern mt-3"><h6 class="text-danger mb-3"><i class="fas fa-skull"></i> ' + t('expired') + '</h6><div class="table-responsive"><table class="table table-sm"><thead><tr><th>' + t('medicine') + '</th><th>' + t('batch_number') + '</th><th>' + t('quantity') + '</th><th>' + t('price') + '</th><th>' + t('expiry_date') + '</th></tr></thead><tbody>' + expired.sort(function(a,b) { return new Date(a.expiryDate) - new Date(b.expiryDate); }).map(function(m) { return '<tr class="table-danger"><td><strong>' + escapeHtml(m.tradeName) + '</strong>' + (m.scientificName ? '<br><small>' + escapeHtml(m.scientificName) + '</small>' : '') + '</td><td><code>' + escapeHtml(m.batchNumber||'-') + '</code></td><td class="fw-bold">' + m.quantity + '</td><td>' + formatMoney(m.price) + '</td><td>' + formatDate(m.expiryDate) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
        }
        
        if (exp30.length > 0) {
            html += '<div class="card-modern mt-3"><h6 class="text-warning mb-3"><i class="fas fa-clock"></i> ' + t('expiring_soon') + ' (30 ' + t('days_remaining') + ')</h6><div class="table-responsive"><table class="table table-sm"><thead><tr><th>' + t('medicine') + '</th><th>' + t('batch_number') + '</th><th>' + t('quantity') + '</th><th>' + t('price') + '</th><th>' + t('expiry_date') + '</th><th>' + t('days_remaining') + '</th></tr></thead><tbody>' + exp30.sort(function(a,b) { return getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate); }).map(function(m) { return '<tr class="table-warning"><td><strong>' + escapeHtml(m.tradeName) + '</strong>' + (m.scientificName ? '<br><small>' + escapeHtml(m.scientificName) + '</small>' : '') + '</td><td><code>' + escapeHtml(m.batchNumber||'-') + '</code></td><td class="fw-bold">' + m.quantity + '</td><td>' + formatMoney(m.price) + '</td><td>' + formatDate(m.expiryDate) + '</td><td><span class="badge bg-warning">' + getDaysUntilExpiry(m.expiryDate) + ' ' + t('days_remaining') + '</span></td></tr>'; }).join('') + '</tbody></table></div></div>';
        }
        
        if (expired.length === 0 && exp30.length === 0 && exp60.length === 0 && exp90.length === 0) {
            html += '<div class="card-modern text-center py-5"><i class="fas fa-check-circle text-success fa-4x mb-3"></i><h5>' + t('all_good') + '</h5><p class="text-muted">' + t('no_expiry_issues') + '</p></div>';
        }
        return html; 
    },
    
    exportToPDF() { 
        if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') { 
            showToast(t('pdf_error'), 'error'); 
            return; 
        } 
        const content = document.getElementById('reportContent'); 
        if (!content) return; 
        showLoading(true); 
        html2canvas(content, { scale:2, backgroundColor:'#ffffff' }).then(function(canvas) { 
            if (typeof jspdf !== 'undefined') { 
                const jsPDF = jspdf.jsPDF; 
                const pdf = new jsPDF({ orientation:'portrait', unit:'px', format:[canvas.width/2, canvas.height/2] }); 
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width/2, canvas.height/2); 
                pdf.save('report_' + new Date().toISOString().slice(0,10) + '.pdf'); 
            } 
            showLoading(false); 
            showToast(t('export'), 'success'); 
        }).catch(function() { showLoading(false); showToast(t('error'), 'error'); }); 
    },
    
    exportToCSV() { 
        let csv = '\uFEFF'; 
        if (this.currentReport === 'sales') { 
            csv += t('date') + ',' + t('invoices') + ',' + t('total') + '\n'; 
            const sales = this.getFilteredSales(); 
            const daily = {}; 
            sales.forEach(function(s) { 
                const d = s.date.split('T')[0]; 
                if (!daily[d]) daily[d] = { count:0, total:0 }; 
                daily[d].count++; 
                daily[d].total += s.total||0; 
            }); 
            Object.entries(daily).sort(function(a,b) { return b[0].localeCompare(a[0]); }).forEach(function(e) { csv += '"' + e[0] + '",' + e[1].count + ',' + e[1].total + '\n'; }); 
        } else if (this.currentReport === 'inventory') { 
            csv += t('medicine') + ',' + t('category') + ',' + t('quantity') + ',' + t('price') + ',' + t('value') + '\n'; 
            AppData.medicines.forEach(function(m) { csv += '"' + m.tradeName + '","' + (m.category||'') + '",' + m.quantity + ',' + m.price + ',' + (m.price*m.quantity) + '\n'; }); 
        } 
        const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' }); 
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = 'report_' + new Date().toISOString().slice(0,10) + '.csv'; 
        a.click(); 
        showToast(t('export'), 'success'); 
    },
    
    printReport() { 
        const content = document.getElementById('reportContent') ? document.getElementById('reportContent').cloneNode(true) : null; 
        const title = document.getElementById('reportTitle') ? document.getElementById('reportTitle').textContent : t('reports_statistics'); 
        if (!content) return; 
        const pharmacyName = AppData.pharmacyInfo.name || t('app_name'); 
        const pharmacyPhone = AppData.pharmacyInfo.phone || ''; 
        const pharmacyAddress = AppData.pharmacyInfo.address || ''; 
        const w = window.open('', '_blank'); 
        w.document.write('<!DOCTYPE html><html dir="' + (currentLanguage === 'ar' ? 'rtl' : 'ltr') + '"><head><meta charset="UTF-8"><title>' + title + '</title><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet"><style>body{font-family:Tajawal;padding:20px}.pharmacy-header{text-align:center;margin-bottom:20px;border-bottom:2px solid #0d9488;padding-bottom:15px}.pharmacy-header h2{color:#0d9488}.report-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px}.report-stat-card{background:#f8fafc;padding:15px;border-radius:8px;text-align:center;border-right:4px solid #0d9488}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:10px}th{background:#0d9488;color:#fff}</style></head><body><div class="pharmacy-header"><h2>🏥 ' + escapeHtml(pharmacyName) + '</h2>' + (pharmacyPhone ? '<p>📞 ' + escapeHtml(pharmacyPhone) + '</p>' : '') + (pharmacyAddress ? '<p>📍 ' + escapeHtml(pharmacyAddress) + '</p>' : '') + '<hr></div><h2>' + title + '</h2><p>' + t('date') + ': ' + formatDate(new Date()) + '</p>' + content.innerHTML + '<script>window.onload=function(){window.print();setTimeout(window.close,1000)}<\/script></body></html>'); 
        w.document.close(); 
    }
};

// ================================================================
// Settings Module
// ================================================================
window.SettingsModule = {
    currentTab: 'general',
    
    async render() {
        const section = document.getElementById('settings'); 
        if (!section) return;
        
        if (!checkPermission('manage_settings')) { 
            section.innerHTML = '<h4 style="color:white; font-weight:900; margin-bottom:20px;"><i class="fas fa-cog"></i> ' + t('settings') + '</h4><div class="card-modern text-center py-5"><i class="fas fa-lock fa-4x mb-3" style="color:var(--danger-color);"></i><h5>' + t('permission_denied') + '</h5></div>';
            applyTranslations();
            return; 
        }
        
        section.innerHTML = '<h4 style="color:white; font-weight:900; margin-bottom:20px;"><i class="fas fa-cog"></i> ' + t('system_settings') + '</h4><div class="settings-container"><div class="settings-sidebar"><div class="settings-tab ' + (this.currentTab === 'general' ? 'active' : '') + '" onclick="window.SettingsModule.switchTab(\'general\')"><i class="fas fa-store"></i><span>' + t('pharmacy_info') + '</span></div><div class="settings-tab ' + (this.currentTab === 'users' ? 'active' : '') + '" onclick="window.SettingsModule.switchTab(\'users\')"><i class="fas fa-users"></i><span>' + t('user_management') + '</span></div><div class="settings-tab ' + (this.currentTab === 'categories' ? 'active' : '') + '" onclick="window.SettingsModule.switchTab(\'categories\')"><i class="fas fa-tags"></i><span>' + t('categories_management') + '</span></div><div class="settings-tab ' + (this.currentTab === 'backup' ? 'active' : '') + '" onclick="window.SettingsModule.switchTab(\'backup\')"><i class="fas fa-database"></i><span>' + t('backup_restore') + '</span></div><div class="settings-tab ' + (this.currentTab === 'system' ? 'active' : '') + '" onclick="window.SettingsModule.switchTab(\'system\')"><i class="fas fa-info-circle"></i><span>' + t('system_info') + '</span></div></div><div class="settings-content" id="settingsContent">' + this.renderGeneralSettings() + '</div></div>';
        applyTranslations();
    },
    
    switchTab(tab) { 
        this.currentTab = tab; 
        document.querySelectorAll('.settings-tab').forEach(function(t) { t.classList.remove('active'); }); 
        const targetTab = document.querySelector('.settings-tab[onclick*="' + tab + '"]'); 
        if (targetTab) targetTab.classList.add('active'); 
        const container = document.getElementById('settingsContent'); 
        if (tab === 'general') container.innerHTML = this.renderGeneralSettings(); 
        else if (tab === 'users') container.innerHTML = this.renderUsersSettings(); 
        else if (tab === 'categories') container.innerHTML = this.renderCategoriesSettings(); 
        else if (tab === 'backup') container.innerHTML = this.renderBackupSettings(); 
        else if (tab === 'system') container.innerHTML = this.renderSystemInfo(); 
        applyTranslations();
    },
    
    renderGeneralSettings() { 
        const i = AppData.pharmacyInfo, s = AppData.settings; 
        const currentLang = currentLanguage === 'ar' ? 'العربية' : 'English';
        const nextLang = currentLanguage === 'ar' ? 'English' : 'العربية';
        
        return '<div class="settings-section"><h5><i class="fas fa-globe"></i> ' + t('language') + '</h5><div class="form-group"><label>' + t('language') + '</label><div class="d-flex align-items-center gap-3"><span class="badge bg-info">' + currentLang + '</span><button class="btn btn-sm btn-outline-primary" onclick="toggleLanguage()"><i class="fas fa-exchange-alt"></i> ' + t('switch_to') + ' ' + nextLang + '</button></div><small class="text-muted">' + t('language_hint') + '</small></div></div><div class="settings-section"><h5><i class="fas fa-store"></i> ' + t('pharmacy_info') + '</h5><div class="form-group"><label>' + t('pharmacy_name') + ' <span class="text-danger">*</span></label><input type="text" id="pharmacyName" class="form-control" value="' + escapeHtml(i.name||'') + '"></div><div class="form-group"><label>' + t('phone') + '</label><input type="tel" id="pharmacyPhone" class="form-control" value="' + escapeHtml(i.phone||'') + '"></div><div class="form-group"><label>' + t('email') + '</label><input type="email" id="pharmacyEmail" class="form-control" value="' + escapeHtml(i.email||'') + '"></div><div class="form-group"><label>' + t('address') + '</label><textarea id="pharmacyAddress" class="form-control" rows="2">' + escapeHtml(i.address||'') + '</textarea></div><div class="form-group"><label>' + t('license_number') + '</label><input type="text" id="pharmacyLicense" class="form-control" value="' + escapeHtml(i.license||'') + '"></div><button class="btn btn-primary" onclick="window.SettingsModule.savePharmacyInfo()"><i class="fas fa-save"></i> ' + t('save') + '</button></div><div class="settings-section mt-4"><h5><i class="fas fa-sliders-h"></i> ' + t('general_settings') + '</h5><div class="form-group"><label>' + t('currency') + '</label><input type="text" id="currency" class="form-control" value="' + (s.currency||'SDG') + '"></div><div class="form-group"><label>' + t('alert_days_setting') + '</label><input type="number" id="alertDays" class="form-control" value="' + (s.alertDays||30) + '"></div><div class="form-check mb-3"><input type="checkbox" id="lowStockAlert" class="form-check-input" ' + (s.lowStockAlert ? 'checked' : '') + '><label class="form-check-label">' + t('enable_low_stock_alerts') + '</label></div><div class="form-check mb-3"><input type="checkbox" id="expiryAlert" class="form-check-input" ' + (s.expiryAlert ? 'checked' : '') + '><label class="form-check-label">' + t('enable_expiry_alerts') + '</label></div><div class="form-check mb-3"><input type="checkbox" id="autoBackup" class="form-check-input" ' + (s.autoBackup ? 'checked' : '') + '><label class="form-check-label">' + t('enable_auto_backup') + '</label></div><button class="btn btn-primary" onclick="window.SettingsModule.saveGeneralSettings()"><i class="fas fa-save"></i> ' + t('save') + '</button></div>'; 
    },
    
    renderUsersSettings() { 
        let html = '<div class="settings-section"><h5><i class="fas fa-users"></i> ' + t('user_management') + '</h5><button class="btn btn-success mb-3" onclick="window.SettingsModule.showAddUserModal()"><i class="fas fa-user-plus"></i> ' + t('add_user') + '</button><div class="table-responsive"><table class="table table-sm"><thead><tr><th>' + t('username') + '</th><th>' + t('full_name') + '</th><th>' + t('role') + '</th><th>' + t('status') + '</th><th>' + t('join_date') + '</th><th>' + t('actions') + '</th></tr></thead><tbody>';
        
        AppData.users.forEach(function(u) {
            html += '<tr><td>' + escapeHtml(u.username) + '</td><td>' + escapeHtml(u.name) + '</td><td><span class="badge ' + (u.role==='admin'?'bg-danger':u.role==='pharmacist'?'bg-info':'bg-secondary') + '">' + (u.role==='admin'?t('admin'):u.role==='pharmacist'?t('pharmacist'):t('staff')) + '</span></td><td><span class="badge ' + (u.isActive!==false?'bg-success':'bg-secondary') + '">' + (u.isActive!==false?t('active'):t('inactive')) + '</span></td><td>' + formatDate(u.createdAt) + '</td><td><button class="btn btn-sm btn-info" onclick="window.SettingsModule.openEditUserModal(\'' + u.id + '\')"><i class="fas fa-edit"></i></button>' + (u.id !== (AppData.currentUser?.id) ? '<button class="btn btn-sm btn-danger" onclick="window.SettingsModule.deleteUser(\'' + u.id + '\')"><i class="fas fa-trash"></i></button>' : '<button class="btn btn-sm btn-secondary" disabled><i class="fas fa-user-lock"></i></button>') + '</td></tr>';
        });
        
        html += '</tbody></table></div></div><div class="settings-section mt-4"><h5><i class="fas fa-key"></i> ' + t('change_password') + '</h5><div class="form-group"><label>' + t('current_password') + '</label><input type="password" id="currentPassword" class="form-control"></div><div class="form-group"><label>' + t('new_password') + '</label><input type="password" id="newPassword" class="form-control"></div><div class="form-group"><label>' + t('confirm_password') + '</label><input type="password" id="confirmPassword" class="form-control"></div><button class="btn btn-primary" onclick="window.SettingsModule.changeMyPassword()"><i class="fas fa-save"></i> ' + t('change_password') + '</button></div>';
        return html; 
    },
    
    renderCategoriesSettings() { 
        let html = '<div class="settings-section"><h5><i class="fas fa-tags"></i> ' + t('categories_management') + '</h5><div class="input-group mb-3"><input type="text" id="newCategory" class="form-control" placeholder="' + t('add_category') + '"><button class="btn btn-success" onclick="window.SettingsModule.addCategory()"><i class="fas fa-plus"></i> ' + t('add_category') + '</button></div><div class="categories-list">';
        AppData.categories.forEach(function(c) {
            const isDefault = ['مسكنات','مضادات حيوية','فيتامينات','أخرى'].indexOf(c) !== -1;
            html += '<div class="category-item"><span>' + escapeHtml(c) + '</span>' + (!isDefault ? '<button class="btn btn-sm btn-danger" onclick="window.SettingsModule.deleteCategory(\'' + c.replace(/'/g, "\\'") + '\')"><i class="fas fa-trash"></i></button>' : '<span class="badge bg-secondary">' + t('default') + '</span>') + '</div>';
        });
        html += '</div></div>';
        return html; 
    },
    
    renderBackupSettings() { 
        const last = AppData.lastBackup ? formatDateTime(AppData.lastBackup) : t('never'); 
        return '<div class="settings-section"><h5><i class="fas fa-database"></i> ' + t('backup_restore') + '</h5><p>' + t('last_backup') + ': <strong>' + last + '</strong></p><div class="backup-actions"><button class="btn btn-success" onclick="window.SettingsModule.exportBackup()"><i class="fas fa-download"></i> ' + t('export_backup') + '</button><button class="btn btn-info" onclick="document.getElementById(\'restoreFile\').click()"><i class="fas fa-upload"></i> ' + t('import_backup') + '</button><input type="file" id="restoreFile" accept=".json" style="display:none;" onchange="window.SettingsModule.importBackup(event)"></div><div class="alert alert-warning mt-3"><i class="fas fa-exclamation-triangle"></i> ' + t('reset_warning') + '</div></div><div class="settings-section mt-4 border-danger"><h5 class="text-danger"><i class="fas fa-skull"></i> ' + t('danger_zone') + '</h5><p>' + t('reset_all_data') + '</p><button class="btn btn-danger" onclick="window.SettingsModule.resetAllData()"><i class="fas fa-trash"></i> ' + t('reset_all_data') + '</button></div>';
    },
    
    renderSystemInfo() { 
        const stats = { 
            medicines: AppData.medicines.length, 
            sales: AppData.sales.length, 
            customers: AppData.customers.length, 
            suppliers: AppData.suppliers.length, 
            movements: AppData.movements.length, 
            audit: AppData.audit.length, 
            returns: (AppData.returns||[]).length 
        };
        return '<div class="settings-section"><h5><i class="fas fa-info-circle"></i> ' + t('system_info') + '</h5>' +
            '<table class="table table-sm">' +
            '<tr><th>' + t('version') + '</th><td>' + (AppData.version||'3.0.0') + '</td></tr>' +
            '<tr><th>' + t('medicines') + '</th><td>' + stats.medicines + '</td></tr>' +
            '<tr><th>' + t('sales') + '</th><td>' + stats.sales + '</td></tr>' +
            '<tr><th>' + t('customers') + '</th><td>' + stats.customers + '</td></tr>' +
            '<tr><th>' + t('suppliers') + '</th><td>' + stats.suppliers + '</td></tr>' +
            '<tr><th>' + t('returns') + '</th><td>' + stats.returns + '</td></tr>' +
            '<tr><th>' + t('movement_log') + '</th><td>' + stats.movements + '</td></tr>' +
            '<tr><th>' + t('audit_log') + '</th><td>' + stats.audit + '</td></tr>' +
            '</table></div>' +
            '<div class="settings-section mt-4"><h5><i class="fas fa-code"></i> ' + t('about') + '</h5>' +
            '<p>' + t('pharmacy_management_system') + '</p>' +
            '<p>Designed by Ahmed Hassan | WhatsApp: +249125000574</p>' +
            '<p>© 2026 ' + t('all_rights_reserved') + '</p></div>';
    },
    
    async savePharmacyInfo() { 
        const name = document.getElementById('pharmacyName')?.value.trim() || ''; 
        if (!name) { showToast(t('field_required'), 'error'); return; } 
        AppData.pharmacyInfo.name = name; 
        AppData.pharmacyInfo.phone = document.getElementById('pharmacyPhone')?.value.trim() || ''; 
        AppData.pharmacyInfo.email = document.getElementById('pharmacyEmail')?.value.trim() || ''; 
        AppData.pharmacyInfo.address = document.getElementById('pharmacyAddress')?.value.trim() || ''; 
        AppData.pharmacyInfo.license = document.getElementById('pharmacyLicense')?.value.trim() || ''; 
        await IDB.put('pharmacyInfo', { key: 'main', value: AppData.pharmacyInfo }); 
        await addAuditLog(t('update_pharmacy_info'), name); 
        await saveData(); 
        updatePharmacyNameInUI(); 
        showToast(t('update_success'), 'success'); 
    },
    
    saveGeneralSettings() { 
        AppData.settings.currency = document.getElementById('currency')?.value || 'SDG'; 
        AppData.settings.alertDays = parseInt(document.getElementById('alertDays')?.value || 30) || 30; 
        AppData.settings.lowStockAlert = document.getElementById('lowStockAlert')?.checked || false; 
        AppData.settings.expiryAlert = document.getElementById('expiryAlert')?.checked || false; 
        AppData.settings.autoBackup = document.getElementById('autoBackup')?.checked || true; 
        addAuditLog(t('update_settings')); 
        saveData(); 
        showToast(t('update_success'), 'success'); 
    },
    
    showAddUserModal() { 
        const h = '<div class="modal fade" id="addUserModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5><i class="fas fa-user-plus"></i> ' + t('add_user') + '</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><div class="form-group"><label>' + t('username') + '</label><input type="text" id="newUsername" class="form-control"></div><div class="form-group"><label>' + t('full_name') + '</label><input type="text" id="newFullName" class="form-control"></div><div class="form-group"><label>' + t('password') + '</label><input type="password" id="newUserPassword" class="form-control"></div><div class="form-group"><label>' + t('role') + '</label><select id="newUserRole" class="form-select"><option value="pharmacist">' + t('pharmacist') + '</option><option value="admin">' + t('admin') + '</option><option value="staff">' + t('staff') + '</option></select></div></div><div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">' + t('cancel') + '</button><button class="btn btn-primary" onclick="window.SettingsModule.addUser()">' + t('add_user') + '</button></div></div></div></div>';
        const existing = document.getElementById('addUserModal'); if (existing) existing.remove(); 
        document.body.insertAdjacentHTML('beforeend', h); 
        new bootstrap.Modal(document.getElementById('addUserModal')).show(); 
    },
    
    async addUser() { 
        const u = document.getElementById('newUsername')?.value.trim() || ''; 
        const n = document.getElementById('newFullName')?.value.trim() || ''; 
        const p = document.getElementById('newUserPassword')?.value || ''; 
        const r = document.getElementById('newUserRole')?.value || ''; 
        if(!u||!n||!p) { showToast(t('field_required'), 'error'); return; } 
        if(p.length<4) { showToast(t('password_min_length'), 'error'); return; } 
        if(AppData.users.find(function(x) { return x.username === u; })) { showToast(t('username_exists'), 'error'); return; } 
        const hashedPass = await hashPassword(p); 
        const nu = { id: generateId('USER'), username: u, name: n, pass: hashedPass, role: r, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isActive: true }; 
        AppData.users.push(nu); 
        await IDB.put('users', nu); 
        await addAuditLog(t('add_user'), n); 
        await saveData(); 
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal')); 
        if (modal) modal.hide(); 
        this.switchTab('users'); 
        showToast(t('save_success'), 'success'); 
    },
    
    openEditUserModal(id) { 
        const user = AppData.users.find(function(u) { return u.id === id; }); 
        if (!user) return; 
        const h = '<div class="modal fade" id="editUserModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5><i class="fas fa-user-edit"></i> ' + t('edit_user') + '</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><input type="hidden" id="editUserId" value="' + user.id + '"><div class="form-group"><label>' + t('username') + '</label><input type="text" id="editUsername" class="form-control" value="' + escapeHtml(user.username) + '" readonly></div><div class="form-group"><label>' + t('full_name') + '</label><input type="text" id="editFullName" class="form-control" value="' + escapeHtml(user.name) + '"></div><div class="form-group"><label>' + t('role') + '</label><select id="editUserRole" class="form-select"><option value="admin" ' + (user.role === 'admin' ? 'selected' : '') + '>' + t('admin') + '</option><option value="pharmacist" ' + (user.role === 'pharmacist' ? 'selected' : '') + '>' + t('pharmacist') + '</option><option value="staff" ' + (user.role === 'staff' ? 'selected' : '') + '>' + t('staff') + '</option></select></div><div class="form-group"><label>' + t('account_status') + '</label><select id="editUserStatus" class="form-select"><option value="true" ' + (user.isActive !== false ? 'selected' : '') + '>' + t('active') + '</option><option value="false" ' + (user.isActive === false ? 'selected' : '') + '>' + t('inactive') + '</option></select></div><div class="form-group"><label>' + t('new_password') + '</label><input type="password" id="editUserPassword" class="form-control" placeholder="' + t('leave_blank_to_keep') + '"></div></div><div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">' + t('cancel') + '</button><button class="btn btn-primary" onclick="window.SettingsModule.saveUserEdit()">' + t('save') + '</button></div></div></div></div>';
        const existing = document.getElementById('editUserModal'); if (existing) existing.remove(); 
        document.body.insertAdjacentHTML('beforeend', h); 
        new bootstrap.Modal(document.getElementById('editUserModal')).show(); 
    },
    
    async saveUserEdit() { 
        const id = document.getElementById('editUserId')?.value; 
        if (!id) { showToast(t('error'), 'error'); return; } 
        const user = AppData.users.find(function(u) { return u.id === id; }); 
        if (!user) { showToast(t('no_data'), 'error'); return; } 
        if (user.username === 'Pharmacy') { 
            const newRole = document.getElementById('editUserRole')?.value; 
            const newStatus = document.getElementById('editUserStatus')?.value; 
            if (newRole !== 'admin') { showToast(t('cant_change_admin_role'), 'error'); return; } 
            if (newStatus === 'false') { showToast(t('cant_disable_admin'), 'error'); return; } 
        } 
        user.name = document.getElementById('editFullName')?.value.trim() || user.name; 
        user.role = document.getElementById('editUserRole')?.value || user.role; 
        user.isActive = document.getElementById('editUserStatus')?.value === 'true'; 
        user.updatedAt = new Date().toISOString(); 
        const newPass = document.getElementById('editUserPassword')?.value; 
        if (newPass && newPass.length >= 4) { user.pass = await hashPassword(newPass); } 
        await IDB.put('users', user); 
        await addAuditLog(t('edit_user'), user.name); 
        await saveData(); 
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal')); 
        if (modal) modal.hide(); 
        this.switchTab('users'); 
        showToast(t('update_success'), 'success'); 
    },
    
    async deleteUser(id) { 
        const u = AppData.users.find(function(x) { return x.id === id; }); 
        if (!u) return; 
        if(u.id === (AppData.currentUser?.id)) { showToast(t('cant_delete_self'), 'error'); return; } 
        if(u.username === 'Pharmacy') { showToast(t('cant_delete_admin'), 'error'); return; } 
        if(confirm(t('confirm_delete') + ' "' + u.name + '"?')) { 
            const i = AppData.users.findIndex(function(x) { return x.id === id; }); 
            if(i !== -1) { 
                AppData.users.splice(i,1); 
                await IDB.delete('users', id); 
                await addAuditLog(t('delete_user'), u.name); 
                await saveData(); 
                this.switchTab('users'); 
                showToast(t('delete_success'), 'success'); 
            } 
        } 
    },
    
    async changeMyPassword() { 
        const c = document.getElementById('currentPassword')?.value || ''; 
        const n = document.getElementById('newPassword')?.value || ''; 
        const conf = document.getElementById('confirmPassword')?.value || ''; 
        if(!c||!n||!conf) { showToast(t('field_required'), 'error'); return; } 
        if(n !== conf) { showToast(t('passwords_not_match'), 'error'); return; } 
        if(n.length < 4) { showToast(t('password_min_length'), 'error'); return; } 
        const hashedCurrent = await hashPassword(c); 
        const u = AppData.users.find(function(x) { return x.id === AppData.currentUser?.id; }); 
        if(!u || (u.pass !== hashedCurrent && u.pass !== c)) { showToast(t('current_password_wrong'), 'error'); return; } 
        u.pass = await hashPassword(n); 
        await IDB.put('users', u); 
        await addAuditLog(t('change_password')); 
        await saveData(); 
        showToast(t('update_success'), 'success'); 
        document.getElementById('currentPassword').value = ''; 
        document.getElementById('newPassword').value = ''; 
        document.getElementById('confirmPassword').value = ''; 
    },
    
    async addCategory() { 
        const cat = document.getElementById('newCategory')?.value.trim() || ''; 
        if(!cat) { showToast(t('field_required'), 'error'); return; } 
        if(AppData.categories.indexOf(cat) !== -1) { showToast(t('category_exists'), 'error'); return; } 
        AppData.categories.push(cat); 
        await IDB.put('categories', { id: 'CAT_' + cat, name: cat }); 
        await addAuditLog(t('add_category'), cat); 
        await saveData(); 
        document.getElementById('newCategory').value = ''; 
        this.switchTab('categories'); 
        updateCategorySelects(); 
        showToast(t('save_success'), 'success'); 
    },
    
    async deleteCategory(cat) { 
        if(['مسكنات','مضادات حيوية','فيتامينات','أخرى'].indexOf(cat) !== -1) { showToast(t('cant_delete_default_category'), 'error'); return; } 
        const i = AppData.categories.indexOf(cat); 
        if(i !== -1) { 
            AppData.categories.splice(i,1); 
            await IDB.delete('categories', 'CAT_' + cat); 
            await addAuditLog(t('delete_category'), cat); 
            await saveData(); 
            this.switchTab('categories'); 
            updateCategorySelects(); 
            showToast(t('delete_success'), 'success'); 
        } 
    },
    
    async exportBackup() { 
        const backup = { version: AppData.version, timestamp: new Date().toISOString(), pharmacyInfo: AppData.pharmacyInfo, users: AppData.users.map(function(u) { return {id:u.id,username:u.username,name:u.name,role:u.role,createdAt:u.createdAt,isActive:u.isActive}; }), medicines: AppData.medicines, suppliers: AppData.suppliers, customers: AppData.customers, sales: AppData.sales, returns: AppData.returns, debts: AppData.debts, expenses: AppData.expenses, categories: AppData.categories, movements: AppData.movements, settings: AppData.settings, audit: AppData.audit.slice(0,200) }; 
        const blob = new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}); 
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = 'pharmacy_backup_' + new Date().toISOString().slice(0,19).replace(/:/g,'-') + '.json'; 
        a.click(); 
        AppData.lastBackup = new Date().toISOString(); 
        await saveData(); 
        showToast(t('export'), 'success'); 
    },
    
    async importBackup(e) { 
        const file = e.target.files[0]; 
        if(!file) return; 
        if(!confirm(t('reset_warning') + ' ' + t('confirm_import'))) { e.target.value=''; return; } 
        const reader = new FileReader(); 
        reader.onload = async function(ev) { 
            try { 
                const backup = JSON.parse(ev.target.result); 
                const stores = ['medicines', 'sales', 'returns', 'suppliers', 'customers', 'debts', 'expenses', 'movements', 'audit']; 
                for (let si = 0; si < stores.length; si++) await IDB.clear(stores[si]); 
                AppData.pharmacyInfo = backup.pharmacyInfo || AppData.pharmacyInfo; 
                AppData.medicines = backup.medicines || []; 
                AppData.suppliers = backup.suppliers || []; 
                AppData.customers = backup.customers || []; 
                AppData.sales = backup.sales || []; 
                AppData.returns = backup.returns || []; 
                AppData.debts = backup.debts || []; 
                AppData.expenses = backup.expenses || []; 
                AppData.categories = backup.categories || AppData.categories; 
                AppData.movements = backup.movements || []; 
                AppData.settings = backup.settings || AppData.settings; 
                AppData.audit = backup.audit || []; 
                AppData.lastBackup = backup.timestamp; 
                if(backup.users) { 
                    const cu = AppData.users; 
                    AppData.users = backup.users.map(function(u) { 
                        const ex = cu.find(function(x) { return x.username === u.username; }); 
                        return { id: u.id, username: u.username, name: u.name, pass: ex ? ex.pass : (u.pass || '1234'), role: u.role, createdAt: u.createdAt, updatedAt: new Date().toISOString(), isActive: u.isActive !== false }; 
                    }); 
                } 
                for (let mi = 0; mi < AppData.medicines.length; mi++) await IDB.put('medicines', AppData.medicines[mi]); 
                for (let si = 0; si < AppData.sales.length; si++) await IDB.put('sales', AppData.sales[si]); 
                for (let ri = 0; ri < AppData.returns.length; ri++) await IDB.put('returns', AppData.returns[ri]); 
                for (let spi = 0; spi < AppData.suppliers.length; spi++) await IDB.put('suppliers', AppData.suppliers[spi]); 
                for (let ci = 0; ci < AppData.customers.length; ci++) await IDB.put('customers', AppData.customers[ci]); 
                for (let ui = 0; ui < AppData.users.length; ui++) await IDB.put('users', AppData.users[ui]); 
                await IDB.put('settings', { key: 'appSettings', value: AppData.settings }); 
                await IDB.put('pharmacyInfo', { key: 'main', value: AppData.pharmacyInfo }); 
                await addAuditLog(t('import_backup')); 
                await saveData(); 
                showToast(t('import_success'), 'success'); 
                setTimeout(function() { location.reload(); }, 1500); 
            } catch(err) { showToast(t('error'), 'error'); } 
        }; 
        reader.readAsText(file); 
        e.target.value = ''; 
    },
    
    async importBackup(e) { 
        const file = e.target.files[0]; 
        if(!file) return; 
        if(!confirm(t('reset_warning') + ' ' + t('confirm_import'))) { e.target.value=''; return; } 
        const reader = new FileReader(); 
        reader.onload = async function(ev) { 
            try { 
                const backup = JSON.parse(ev.target.result); 
                const stores = ['medicines', 'sales', 'returns', 'suppliers', 'customers', 'debts', 'expenses', 'movements', 'audit']; 
                for (let si = 0; si < stores.length; si++) await IDB.clear(stores[si]); 
                AppData.pharmacyInfo = backup.pharmacyInfo || AppData.pharmacyInfo; 
                AppData.medicines = backup.medicines || []; 
                AppData.suppliers = backup.suppliers || []; 
                AppData.customers = backup.customers || []; 
                AppData.sales = backup.sales || []; 
                AppData.returns = backup.returns || []; 
                AppData.debts = backup.debts || []; 
                AppData.expenses = backup.expenses || []; 
                AppData.categories = backup.categories || AppData.categories; 
                AppData.movements = backup.movements || []; 
                AppData.settings = backup.settings || AppData.settings; 
                AppData.audit = backup.audit || []; 
                AppData.lastBackup = backup.timestamp; 
                if(backup.users) { 
                    const cu = AppData.users; 
                    AppData.users = backup.users.map(function(u) { 
                        const ex = cu.find(function(x) { return x.username === u.username; }); 
                        return { id: u.id, username: u.username, name: u.name, pass: ex ? ex.pass : (u.pass || '1234'), role: u.role, createdAt: u.createdAt, updatedAt: new Date().toISOString(), isActive: u.isActive !== false }; 
                    }); 
                } 
                for (let mi = 0; mi < AppData.medicines.length; mi++) await IDB.put('medicines', AppData.medicines[mi]); 
                for (let si = 0; si < AppData.sales.length; si++) await IDB.put('sales', AppData.sales[si]); 
                for (let ri = 0; ri < AppData.returns.length; ri++) await IDB.put('returns', AppData.returns[ri]); 
                for (let spi = 0; spi < AppData.suppliers.length; spi++) await IDB.put('suppliers', AppData.suppliers[spi]); 
                for (let ci = 0; ci < AppData.customers.length; ci++) await IDB.put('customers', AppData.customers[ci]); 
                for (let ui = 0; ui < AppData.users.length; ui++) await IDB.put('users', AppData.users[ui]); 
                await IDB.put('settings', { key: 'appSettings', value: AppData.settings }); 
                await IDB.put('pharmacyInfo', { key: 'main', value: AppData.pharmacyInfo }); 
                await addAuditLog(t('import_backup')); 
                await saveData(); 
                showToast(t('import_success'), 'success'); 
                setTimeout(function() { location.reload(); }, 1500); 
            } catch(err) { showToast(t('error'), 'error'); } 
        }; 
        reader.readAsText(file); 
        e.target.value = ''; 
    },

        async resetAllData() {
        showLoading(true);
        try {
            const stores = ['medicines', 'sales', 'returns', 'suppliers', 'customers', 'debts', 'expenses', 'movements', 'audit', 'users', 'categories'];
            for (let si = 0; si < stores.length; si++) {
                await IDB.clear(stores[si]);
            }
            localStorage.clear();
            sessionStorage.clear();
            const adminPassReset = await hashPassword('Ahmed0125#');
            AppData = {
                pharmacyInfo: { name: 'صيدلية الشفاء', phone: '', address: '', license: '', email: '' },
                users: [{ id: 'USER_ADMIN_001', username: 'Pharmacy', name: 'مدير الصيدلية', pass: adminPassReset, role: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isActive: true }],
                currentUser: null, medicines: [], suppliers: [], customers: [], sales: [], returns: [], debts: [], expenses: [], movements: [],
                categories: ['مسكنات', 'مضادات حيوية', 'فيتامينات', 'أدوية ضغط', 'أدوية سكر', 'أدوية المعدة', 'مراهم', 'قطرات', 'أخرى'],
                settings: { currency: 'SDG', lowStockAlert: true, expiryAlert: true, alertDays: 30, darkMode: false, language: 'ar', autoBackup: true },
                audit: [], version: '3.0.0', lastBackup: null
            };
            window.AppData = AppData;
            await IDB.put('users', AppData.users[0]);
            await IDB.put('settings', { key: 'appSettings', value: AppData.settings });
            await IDB.put('pharmacyInfo', { key: 'main', value: AppData.pharmacyInfo });
            await addAuditLog('إعادة تعيين', 'تم مسح جميع البيانات');
            await saveData();
            showLoading(false);
            document.getElementById('loginScreen').style.display = 'flex';
            document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
            AppData.currentUser = null;
            showToast('✅ تمت إعادة التعيين بنجاح', 'success');
        } catch (e) {
            console.error('فشل:', e);
            showLoading(false);
            showToast('❌ فشل في إعادة التعيين', 'error');
        }
    }
};

// ================================================================
// Initialize Application
// ================================================================
async function init() {
    console.log('[App] Initializing Pharmacy System v3.0 FINAL...');
    showLoading(true);
    
    try {
        await loadData();
        console.log('[App] Data loaded successfully');
    } catch(e) {
        console.error('[App] Error loading data:', e);
    }
    
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = 'fas fa-sun';
        AppData.settings.darkMode = true;
    }
    
    updateUIDirection();
    applyTranslations();
    
    if (checkExistingSession()) {
        document.getElementById('loginScreen').style.display = 'none';
        updatePharmacyNameInUI();
        goTo('dashboard');
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
    }
    
    document.querySelectorAll('[data-section]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            const section = el.getAttribute('data-section');
            if (section === 'logout') doLogout();
            else if (section) goTo(section);
        });
    });
    
    const loginBtn = document.getElementById('loginButton');
    if (loginBtn) loginBtn.addEventListener('click', doLogin);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.getElementById('loginScreen').style.display !== 'none') doLogin();
    });
    
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.getElementById('menuToggle');
        if (sidebar && menuBtn && window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });
    
    const saveMedicineBtn = document.getElementById('saveMedicineBtn');
    if (saveMedicineBtn) saveMedicineBtn.addEventListener('click', function() { window.MedicinesModule?.saveMedicine(); });
    
    const saveCustomerBtn = document.getElementById('saveCustomerBtn');
    if (saveCustomerBtn) saveCustomerBtn.addEventListener('click', function() { window.CustomersModule?.saveCustomer(); });
    
    const saveSupplierBtn = document.getElementById('saveSupplierBtn');
    if (saveSupplierBtn) saveSupplierBtn.addEventListener('click', function() { window.SuppliersModule?.saveSupplier(); });
    
    const confirmRefundBtn = document.getElementById('confirmRefundBtn');
    if (confirmRefundBtn) confirmRefundBtn.addEventListener('click', function() { window.SalesModule?.processRefund(); });
    
    window.addEventListener('resize', function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth > 768) sidebar.classList.remove('active');
    });
    
    showLoading(false);
    console.log('[App] Initialized successfully');
    console.log('[App] Version: ' + AppData.version);
    console.log('[App] Medicines: ' + AppData.medicines.length);
    console.log('[App] Sales: ' + AppData.sales.length);
}

document.addEventListener('DOMContentLoaded', init);

window.addEventListener('beforeunload', function() { saveData(); });

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', function() {
        showToast(t('update_available'), 'info');
        setTimeout(function() { location.reload(); }, 1500);
    });
}

window.t = t;
window.toggleLanguage = toggleLanguage;
window.toggleDarkMode = toggleDarkMode;
window.App = { AppData, DAL, loadData, saveData, addAuditLog, addMovement, getDaysUntilExpiry, getDashboardStats, generateBarcode, doLogin, doLogout, getUserRoleName, checkPermission, updateUIPermissions, checkExistingSession, goTo, toggleMenu, toggleDarkMode, loadDarkMode, updateCategorySelects, updateSupplierSelect, formatMoney, formatDate, formatDateTime, formatDateShort, generateId, showToast, showLoading, safeOpenModal, safeCloseModal, getMovementTypeText, updatePharmacyNameInUI, getEffectiveCategory, addCustomCategoryIfNew, setupCustomCategoryInput };
window.AppData = AppData;
window.DAL = DAL;

console.log('[App] app.js loaded - Pharmacy Management System v3.0 FINAL');