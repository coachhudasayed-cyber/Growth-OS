import {
  Client,
  TodoTask,
  BudgetAlarm,
  Agreement,
  PaymentRecord,
  DailyWorkLog,
  BrandAudit,
  ContentPlanItem,
  AdsPlanItem,
  ClientDailyReport,
  WeeklyReport,
  MonthlyReport,
  QuarterlyReport,
  AdminDailyReport,
  NoteItem,
  UserProfile
} from '../types';

// Pre-configured default users for easy login & testing
export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    email: 'admin@brandcontrol.com',
    name: 'هدي سيد (الأدمن)',
    role: 'admin'
  },
  {
    id: 'user-employee-1',
    email: 'employee@brandcontrol.com',
    name: 'يوسف العطار (موظف الفريق)',
    role: 'employee',
    clientId: 'employee-client-1'
  },
  {
    id: 'user-client-1',
    email: 'client@technozone.com',
    name: 'عمر الخولي (تيكنو زون)',
    role: 'client',
    clientId: 'client-1'
  },
  {
    id: 'user-client-2',
    email: 'client@eleganza.com',
    name: 'سارة الفارس (إليجانزا فاشن)',
    role: 'client',
    clientId: 'client-2'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'عمر الخولي',
    brandName: 'تيكنو زون - TechnoZone',
    phone: '+201012345678',
    email: 'client@technozone.com',
    brandPageUrl: 'https://facebook.com/technozone.eg',
    websiteUrl: 'https://technozone.store',
    formUrl: 'https://forms.google.com/technozone-lead',
    formAnswersUrl: 'https://docs.google.com/spreadsheets/technozone-responses',
    status: 'active',
    createdAt: '2026-06-01'
  },
  {
    id: 'client-2',
    name: 'سارة الفارس',
    brandName: 'إليجانزا فاشن - Eleganza',
    phone: '+201198765432',
    email: 'client@eleganza.com',
    brandPageUrl: 'https://instagram.com/eleganza.fashion',
    websiteUrl: 'https://eleganzafashion.com',
    formUrl: 'https://forms.google.com/eleganza-orders',
    formAnswersUrl: 'https://docs.google.com/spreadsheets/eleganza-responses',
    status: 'active',
    createdAt: '2026-06-15'
  },
  {
    id: 'client-3',
    name: 'د. خالد عبد العزيز',
    brandName: 'عيادات جولد سميل - GoldSmile',
    phone: '+201255544332',
    email: 'khaled@goldsmile.com',
    brandPageUrl: 'https://facebook.com/goldsmile.dental',
    websiteUrl: 'https://goldsmile-clinic.com',
    formUrl: 'https://forms.google.com/goldsmile-booking',
    formAnswersUrl: 'https://docs.google.com/spreadsheets/goldsmile-booking',
    status: 'paused',
    createdAt: '2026-05-10'
  },
  {
    id: 'client-4',
    name: 'م. يوسف منصور',
    brandName: 'مطاعم المذاق الذهبي - Golden Taste',
    phone: '+201088776655',
    email: 'youssef@goldentaste.com',
    brandPageUrl: 'https://instagram.com/goldentaste.restaurants',
    websiteUrl: 'https://goldentaste.menu',
    formUrl: 'https://forms.google.com/goldentaste-franchise',
    formAnswersUrl: 'https://docs.google.com/spreadsheets/goldentaste-leads',
    status: 'active',
    createdAt: '2026-07-01'
  }
];

export const INITIAL_TODOS: TodoTask[] = [
  {
    id: 'todo-1',
    title: 'مراجعة الميزانية التشغيلية لحملة تيكنو زون قبل الشحن',
    completed: false,
    priority: 'high',
    dueDate: '2026-08-05',
    createdAt: '2026-08-04'
  },
  {
    id: 'todo-2',
    title: 'إعداد خطة إعلانات الموسم الصيفي لـ إليجانزا فاشن',
    completed: false,
    priority: 'medium',
    dueDate: '2026-08-07',
    createdAt: '2026-08-03'
  },
  {
    id: 'todo-3',
    title: 'إرسال تقرير الأداء الأسبوعي لمطاعم المذاق الذهبي',
    completed: true,
    priority: 'high',
    dueDate: '2026-08-04',
    createdAt: '2026-08-01'
  },
  {
    id: 'todo-4',
    title: 'تأكيد استلام دفعة المنتصف من د. خالد عبد العزيز',
    completed: false,
    priority: 'low',
    dueDate: '2026-08-10',
    createdAt: '2026-08-02'
  }
];

// Helper to calculate end date from start date and expected days
export const calculateEndDate = (startDateStr: string, days: number): string => {
  const start = new Date(startDateStr);
  start.setDate(start.getDate() + days);
  return start.toISOString().split('T')[0];
};

const todayStr = new Date().toISOString().split('T')[0];
const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const threeDaysAgoStr = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];

export const INITIAL_BUDGET_ALARMS: BudgetAlarm[] = [
  {
    id: 'budget-1',
    clientId: 'client-1',
    brandName: 'تيكنو زون - TechnoZone',
    campaignName: 'حملة العروض الأسبوعية للاكسسوارات',
    amount: 12000,
    startDate: threeDaysAgoStr,
    expectedDays: 3, // Ends TODAY! Triggering Alarm!
    endDate: calculateEndDate(threeDaysAgoStr, 3),
    platform: 'Meta Ads (FB & Insta)',
    status: 'needs_recharge',
    notes: 'حملة العروض الأسبوعية للاكسسوارات الذكية',
    createdAt: '2026-08-02'
  },
  {
    id: 'budget-2',
    clientId: 'client-2',
    brandName: 'إليجانزا فاشن - Eleganza',
    campaignName: 'حملة كولكشن الصيف الفاخر',
    amount: 25000,
    startDate: yesterdayStr,
    expectedDays: 10,
    endDate: calculateEndDate(yesterdayStr, 10),
    platform: 'TikTok Ads',
    status: 'active',
    notes: 'حملة كولكشن الصيف الفاخر',
    createdAt: '2026-08-04'
  },
  {
    id: 'budget-3',
    clientId: 'client-4',
    brandName: 'مطاعم المذاق الذهبي - Golden Taste',
    campaignName: 'حملة افتتاحات الفروع الجديدة',
    amount: 15000,
    startDate: todayStr,
    expectedDays: 7,
    endDate: calculateEndDate(todayStr, 7),
    platform: 'Google & Youtube Ads',
    status: 'active',
    notes: 'حملة افتتاحات الفروع الجديدة',
    createdAt: '2026-08-05'
  }
];

export const INITIAL_AGREEMENTS: Agreement[] = [
  {
    id: 'agr-1',
    clientId: 'client-1',
    brandName: 'تيكنو زون - TechnoZone',
    agreementType: 'إدارة حملات وتسويق شامل',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    monthlySalary: 18000,
    paymentFrequency: 'semi_monthly', // نصف شهري
    installmentAmount: 9000,
    notes: 'الدفعة الأولى يوم 1 والدفعة الثانية يوم 15',
    createdAt: '2026-06-01'
  },
  {
    id: 'agr-2',
    clientId: 'client-2',
    brandName: 'إليجانزا فاشن - Eleganza',
    agreementType: 'إدارة محتوى + إعلانات موجهة',
    startDate: '2026-06-15',
    monthlySalary: 24000,
    paymentFrequency: 'monthly', // شهري
    installmentAmount: 24000,
    notes: 'يتم السداد في بداية كل شهر ميلادي',
    createdAt: '2026-06-15'
  },
  {
    id: 'agr-3',
    clientId: 'client-3',
    brandName: 'عيادات جولد سميل - GoldSmile',
    agreementType: 'إدارة السوشيال ميديا والحجوزات',
    startDate: '2026-05-10',
    monthlySalary: 15000,
    paymentFrequency: 'semi_monthly',
    installmentAmount: 7500,
    notes: 'العقد متوقف مؤقتاً للتطوير الداخلي',
    createdAt: '2026-05-10'
  },
  {
    id: 'agr-4',
    clientId: 'client-4',
    brandName: 'مطاعم المذاق الذهبي - Golden Taste',
    agreementType: 'خطة نمو وتسويق رقمي مكثف',
    startDate: '2026-07-01',
    monthlySalary: 30000,
    paymentFrequency: 'weekly', // أسبوعي
    installmentAmount: 7500,
    notes: 'سداد أسبوعي كل يوم أحد',
    createdAt: '2026-07-01'
  }
];

export const INITIAL_DAILY_WORK_LOGS: DailyWorkLog[] = [
  {
    id: 'dwl-1',
    clientId: 'client-1',
    date: '2026-08-01',
    status: 'active',
    daysCount: 5,
    activityDetails: 'تشغيل حملة عروض الصيف على ميتا وتيك توك (5 أيام عمل)',
    createdAt: '2026-08-01'
  },
  {
    id: 'dwl-2',
    clientId: 'client-1',
    date: '2026-08-06',
    status: 'paused',
    daysCount: 2,
    activityDetails: 'إيقاف مؤقت لمدة يومين لتجهيز مخزون جديد وبداية الشحن',
    createdAt: '2026-08-06'
  },
  {
    id: 'dwl-3',
    clientId: 'client-2',
    date: '2026-08-01',
    status: 'active',
    daysCount: 7,
    activityDetails: 'تشغيل كولكشن الصيف الفاخر (7 أيام عمل متواصلة)',
    createdAt: '2026-08-01'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    agreementId: 'agr-1',
    clientId: 'client-1',
    brandName: 'تيكنو زون - TechnoZone',
    title: 'دفعة الأسبوع الأول - أتعاب الميديا بايينج',
    category: 'media_buying_fees',
    weekNumber: 1,
    date: '2026-08-01',
    amount: 4500,
    method: 'InstaPay',
    status: 'paid',
    daysCovered: 7,
    periodStartDate: '2026-08-01',
    periodEndDate: '2026-08-07',
    periodCovered: '2026-08-01 إلى 2026-08-07',
    notes: 'تم استلام أتعاب الأسبوع الأول بنجاح عبر إنستاباي'
  },
  {
    id: 'pay-1b',
    agreementId: 'agr-1',
    clientId: 'client-1',
    brandName: 'تيكنو زون - TechnoZone',
    title: 'دفعة الأسبوع الثاني - أتعاب الميديا بايينج',
    category: 'media_buying_fees',
    weekNumber: 2,
    date: '2026-08-08',
    amount: 4500,
    method: 'InstaPay',
    status: 'paid',
    daysCovered: 7,
    periodStartDate: '2026-08-08',
    periodEndDate: '2026-08-14',
    periodCovered: '2026-08-08 إلى 2026-08-14',
    notes: 'تم استلام أتعاب الأسبوع الثاني'
  },
  {
    id: 'pay-2',
    agreementId: 'agr-1',
    clientId: 'client-1',
    brandName: 'تيكنو زون - TechnoZone',
    title: 'دفعة الأسبوع الثالث - أتعاب الميديا بايينج',
    category: 'media_buying_fees',
    weekNumber: 3,
    date: '2026-08-15',
    amount: 4500,
    method: 'تحويل بنكي',
    status: 'pending',
    daysCovered: 7,
    periodStartDate: '2026-08-15',
    periodEndDate: '2026-08-21',
    periodCovered: '2026-08-15 إلى 2026-08-21',
    notes: 'دفعة مستحقة للأسبوع الثالث من الشهر'
  },
  {
    id: 'pay-2b',
    agreementId: 'agr-1',
    clientId: 'client-1',
    brandName: 'تيكنو زون - TechnoZone',
    title: 'دفعة تمويل ميزانية إعلانات ميتا (Meta Ads)',
    category: 'ad_spend',
    weekNumber: 1,
    date: '2026-08-01',
    amount: 15000,
    method: 'كارت فيزا إعلانات',
    status: 'paid',
    daysCovered: 7,
    periodStartDate: '2026-08-01',
    periodEndDate: '2026-08-07',
    periodCovered: '2026-08-01 إلى 2026-08-07',
    notes: 'تم خصم وصرف ميزانية حملة عروض الصيف'
  },
  {
    id: 'pay-2c',
    agreementId: 'agr-1',
    clientId: 'client-1',
    brandName: 'تيكنو زون - TechnoZone',
    title: 'دفعة تمويل ميزانية إعلانات تيك توك (TikTok Ads)',
    category: 'ad_spend',
    weekNumber: 2,
    date: '2026-08-10',
    amount: 12000,
    method: 'كارت فيزا إعلانات',
    status: 'paid',
    daysCovered: 7,
    periodStartDate: '2026-08-10',
    periodEndDate: '2026-08-17',
    periodCovered: '2026-08-10 إلى 2026-08-17',
    notes: 'تم صرف ميزانية حملة الفيديو والترافيك'
  },
  {
    id: 'pay-3',
    agreementId: 'agr-2',
    clientId: 'client-2',
    brandName: 'إليجانزا فاشن - Eleganza',
    title: 'أتعاب الميديا بايينج الشهرية (شهر أغسطس)',
    category: 'media_buying_fees',
    date: '2026-08-02',
    amount: 24000,
    method: 'تحويل بنكي',
    status: 'paid',
    daysCovered: 30,
    periodStartDate: '2026-08-01',
    periodEndDate: '2026-08-31',
    periodCovered: '2026-08-01 إلى 2026-08-31',
    notes: 'راتب وأتعاب إدارة شهر أغسطس بالكامل'
  },
  {
    id: 'pay-3b',
    agreementId: 'agr-2',
    clientId: 'client-2',
    brandName: 'إليجانزا فاشن - Eleganza',
    title: 'صرف إعلانات حملة كولكشن الصيف الفاخر (Meta & TikTok)',
    category: 'ad_spend',
    weekNumber: 1,
    date: '2026-08-03',
    amount: 28000,
    method: 'كارت بنكي',
    status: 'paid',
    daysCovered: 14,
    periodStartDate: '2026-08-01',
    periodEndDate: '2026-08-14',
    periodCovered: '2026-08-01 إلى 2026-08-14',
    notes: 'صرف إعلانات الكولكشن الصيفي'
  },
  {
    id: 'pay-4',
    agreementId: 'agr-3',
    clientId: 'client-3',
    brandName: 'عيادات جولد سميل - GoldSmile',
    title: 'دفعة الأسبوع الأخير (أتعاب متأخرة)',
    category: 'media_buying_fees',
    weekNumber: 4,
    date: '2026-07-15',
    amount: 7500,
    method: 'فودافون كاش',
    status: 'overdue',
    daysCovered: 15,
    periodStartDate: '2026-07-16',
    periodEndDate: '2026-07-31',
    periodCovered: '2026-07-16 إلى 2026-07-31',
    notes: 'متبقي دفعة يوليو الأخيرة - تم إرسال تذكير للعميل'
  },
  {
    id: 'pay-5',
    agreementId: 'agr-4',
    clientId: 'client-4',
    brandName: 'مطاعم المذاق الذهبي - Golden Taste',
    title: 'دفعة الأسبوع الأول - أتعاب الميديا باير',
    category: 'media_buying_fees',
    weekNumber: 1,
    date: '2026-08-03',
    amount: 7500,
    method: 'InstaPay',
    status: 'paid',
    daysCovered: 7,
    periodStartDate: '2026-08-01',
    periodEndDate: '2026-08-07',
    periodCovered: '2026-08-01 إلى 2026-08-07',
    notes: 'الأسبوع الأول من أغسطس'
  }
];

export const INITIAL_BRAND_AUDITS: Record<string, BrandAudit> = {
  'client-1': {
    clientId: 'client-1',
    score: 85,
    auditDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    overview: {
      brandName: 'تكنو زون - TechnoZone',
      industry: 'إلكترونيات وإكسسوارات هواتف وألعاب',
      coreProducts: 'سماعات لاسلكية، كابلات شحن سريعة، كيبورد وماوس جيمنج، وساعات ذكية',
      targetAudience: 'الشباب وعشاق التقنية والألعاب (18 - 35 سنة)',
      avgProductPrice: '450 - 1200 EGP',
      avgMonthlyOrders: '350 - 500 طلب شهرياً',
      salesChannels: ['Website', 'Instagram', 'Facebook', 'TikTok', 'Google', 'WhatsApp', 'Marketplace'],
      salesLocations: 'جمهورية مصر العربية (تغطية شاملة لجميع المحافظات)',
      brandStage: 'بيعمل Scale'
    },
    digitalAssets: {
      websiteChecklist: [
        { id: 'w-1', label: 'سرعة تحميل الموقع.', status: 'سريع جداً (أقل من 2 ثانية)' },
        { id: 'w-2', label: 'سهولة الاستخدام.', status: 'سهل ومريح في التصفح' },
        { id: 'w-3', label: 'هل خطوات الشراء واضحة؟', status: 'نعم، خطوات واضحة ومباشرة' },
        { id: 'w-4', label: 'هل صفحة المنتج مكتملة؟', status: 'مكتملة بالصور والوصف والتقييمات' },
        { id: 'w-5', label: 'هل صفحة الدفع سهلة؟', status: 'سهلة وتدعم طرق دفع متعددة' },
        { id: 'w-6', label: 'هل الموقع مناسب للموبايل؟', status: 'متجاوب تماماً مع الموبايل' }
      ],
      landingPageChecklist: [
        { id: 'lp-1', label: 'هل العرض واضح؟', status: 'نعم، العرض بارز ومباشر' },
        { id: 'lp-2', label: 'هل عنوان الصفحة يجذب العميل؟', status: 'عنوان جذاب يركز على القيمة' },
        { id: 'lp-3', label: 'هل يوجد Call To Action (CTA)', status: 'نعم، أزرار CTA بارزة وواضحة' },
        { id: 'lp-4', label: 'هل العميل يعرف ماذا يفعل بعد دخوله الصفحة؟', status: 'نعم، مسار العميل محدد بوضوح' }
      ],
      contactsChecklist: [
        { id: 'c-1', label: 'هل رقم الواتس اب مهيئ للبيع؟ هل يوجد رقم للتواصل هاتفيا؟ هل يتم البيع هاتفيا؟', status: 'مهيئ بالرد الآلي والكتالوج، ويوجد رقم هاتفي مخصص للبيع' },
        { id: 'c-2', label: 'هل يوجد فولو اب للارقام اللي بتتواصل مع البراند علي الواتساب؟', status: 'نعم، توجد متابعة دورية للعملاء المحتملين' }
      ]
    },
    trackingAudit: {
      metaPixelStatus: 'موجود ويعمل بنجاح',
      capiStatus: 'مفعل ويعمل بكفاءة (Conversion API Active)',
      eventsNotes: 'أحداث PageView, ViewContent, AddToCart, InitiateCheckout, و Purchase تعمل بدقة.',
      eventsChecklist: [
        { id: 'e-1', label: 'حدث PageView', status: 'ممتاز', notes: 'تتبع 100%' },
        { id: 'e-2', label: 'حدث ViewContent', status: 'ممتاز', notes: 'تتبع المنتجات المطلوبة' },
        { id: 'e-3', label: 'حدث AddToCart', status: 'ممتاز', notes: 'تنسيق متوافق مع المبيعات' },
        { id: 'e-4', label: 'حدث Purchase', status: 'ممتاز', notes: 'تأكيد المبيعات وتمرير القيمة' }
      ]
    },
    creativeAudit: {
      brandIdentityChecklist: [
        { id: 'bi-1', label: 'هل الهوية موحدة؟', status: 'نعم، الهوية موحدة ومتناسقة في التصاميم' },
        { id: 'bi-2', label: 'الألوان.', status: 'ألوان متناسقة ومحددة للبراند' },
        { id: 'bi-3', label: 'اللوجو.', status: 'لوجو بارز ومستعمل بشكل احترافي' },
        { id: 'bi-4', label: 'الخطوط.', status: 'خطوط واضحة وعصرية' },
        { id: 'bi-5', label: 'شكل التصميمات.', status: 'تصاميم مودرن تناسب الفئة المستهدفة' }
      ],
      contentQualityChecklist: [
        { id: 'cq-1', label: 'جودة الصور.', status: 'صور عالية الجودة بإضاءة ممتازة' },
        { id: 'cq-2', label: 'جودة الفيديوهات.', status: 'فيديوهات احترافية واضحة' },
        { id: 'cq-3', label: 'جودة الريلز.', status: 'ريلز سريعة وممتعة وبمونتاج جذاب' },
        { id: 'cq-4', label: 'هل المحتوى مناسب للإعلانات؟', status: 'مناسب جداً للإعلانات المباشرة' },
        { id: 'cq-5', label: 'هل يوجد تنوع؟', status: 'نعم، يوجد تنوع بين صور وفيديوهات وشرح' }
      ],
      ugcChecklist: [
        { id: 'ugc-1', label: 'هل موجود؟', status: 'موجود بنسبة متوسطة' },
        { id: 'ugc-2', label: 'هل يحتاج تطوير؟', status: 'يحتاج زيادتها والتركيز على تجارب العملاء' }
      ],
      hooksChecklist: [
        { id: 'hook-1', label: 'هل الـ Hook قوي؟', status: 'قوي ويجذب الانتباه في أول 3 ثواني' }
      ],
      valuePropChecklist: [
        { id: 'vp-1', label: 'هل واضحة؟', status: 'واضحة وتركز على حل المشكلة والضمان' }
      ],
      offersChecklist: [
        { id: 'off-1', label: 'هل العروض قوية؟و ما هي؟', status: 'عروض باقات وخصم عند شراء قطعتين' },
        { id: 'off-2', label: 'هل يوجد سبب مقنع للشراء الآن؟', status: 'نعم، العرض لفترة محدودة وبكميات خاصة' }
      ]
    },
    socialMediaAudit: {
      pageAppearance: 'شكل الصفحة احترافي، البايو يحتوي على لينكات مباشرة، والـ Highlights مقسمة حسب الفئات.',
      contentRegularity: 'انتظام جيد بنشر 4-5 بوستات ورريلز أسبوعياً مع معدل تفاعل مرتفع.',
      customerServiceNotes: 'سرعة رد ممتازة على الرسائل والتعليقات (خلال 15 دقيقة)، والتقييمات 4.7/5.',
      checklist: [
        { id: 'sm-1', label: 'شكل الصفحة.', status: 'منظم واحترافي ويعكس هوية البراند' },
        { id: 'sm-2', label: 'مراجعة البايو.', status: 'يحتوي على الوصف والروابط وتفاصيل التواصل' },
        { id: 'sm-3', label: 'مراجعة الـ Highlights.', status: 'مقسمة حسب الفئات وتسهل الوصول للمعلومات' },
        { id: 'sm-4', label: 'مراجعة صور المنتجات.', status: 'صور واضحة وعالية الجودة' },
        { id: 'sm-5', label: 'مراجعة الهوية البصرية.', status: 'هوية موحدة ومتناسقة في كل البوستات' },
        { id: 'sm-6', label: 'مراجعة طريقة عرض الأسعار.', status: 'الأسعار معروضة بوضوح في المنشورات والستوري' },
        { id: 'sm-7', label: 'انتظام المحتوى.', status: 'نشر منتظم حسب استراتيجية المحتوى' },
        { id: 'sm-8', label: 'معدل التفاعل.', status: 'تفاعل جيد مرتفع مع الجمهور' },
        { id: 'sm-9', label: 'التعليقات.', status: 'متابعة مستمرة وردود سريعة على كافة التعليقات' },
        { id: 'sm-10', label: 'الرسائل.', status: 'ردود آلي ورسائل ترحيبية مهيأة' },
        { id: 'sm-11', label: 'سرعة الرد.', status: 'سرعة رد فائقة خلال دقائق' },
        { id: 'sm-12', label: 'تقييمات العملاء.', status: 'تقييمات إيجابية وآراء آراء ممتازة' }
      ]
    },
    operationsAudit: {
      packagingGifts: 'تغليف قيم ومحكم لحماية المنتجات الإلكترونية مع هدايا استيكرات وبطاقات خصم.',
      replySpeed: 'فريق خدمة العملاء يرد بسرعة فائقة على الواتساب والرسائل.',
      customerServiceQuality: 'تعامل راقي وسياسة إرضاء العميل متوفرة.',
      shippingDuration: 'من 24 إلى 48 ساعة داخل القاهرة والجيزة، و3-4 أيام لباقي المحافظات.',
      returnPolicy: 'سياسة استبدال واسترجاع مجانية خلال 14 يوماً من الاستلام.',
      stockAvailability: 'المخزون متوفر للأصناف الرئيسية مع نقص خفيف في قطع الألعاب الموسمية.',
      teamCapacity: 'الفريق جاهز لتجهيز حتى 100 طلب يومياً بكفاءة.',
      checklist: [
        { id: 'op-1', label: 'التغليف و الهدايا.', status: 'تغليف ممتاز ومحكم مع هدايا مميزة' },
        { id: 'op-2', label: 'سرعة الرد و جودة خدمة العملاء.', status: 'سرعة رد فائقة مع جودة خدمة عالية' },
        { id: 'op-3', label: 'مدة الشحن.', status: 'من 24 إلى 48 ساعة داخل القاهرة والجيزة' },
        { id: 'op-4', label: 'سياسة الاستبدال والاسترجاع.', status: 'سياسة استبدال واسترجاع سريعة وواضحة خلال 14 يوم' },
        { id: 'op-5', label: 'توفر المخزون.', status: 'المخزون متوفر للأصناف الرئيسية' },
        { id: 'op-6', label: 'هل الفريق يستطيع استقبال عدد كبير من الطلبات؟', status: 'نعم، الفريق جاهز ومؤهل لاستقبال أعداد كبيرة من الطلبات' }
      ]
    },
    salesFunnel: {
      entrySources: 'إعلانات ممولة على فايسبوك وإنستجرام وريلز تيك توك، بالإضافة للبحث المباشر.',
      landingPoint: 'العميل يتوجه مباشرة لصفحة المنتج المخصص أو كتالوج الواتساب السريع.',
      purchaseMethod: 'شراء مباشر عبر المتجر أو تأكيد الأوردر مع خدمة العملاء على الواتساب.',
      dropOffPoints: 'أغلب خروج العملاء يكون عند خطوة الدفع بسبب الرغبة في خيارات تقسيط إضافية.'
    },
    unitEconomics: {
      avgPriceRange: 'متوسط أسعار المنتجات بين 350 و 1500 جنيه مصري.',
      competitorComparison: 'الأسعار في نفس الرينج المتوسط للمنافسين، ولكن البراند يتفوق بوجود ضمان استبدال مجاني.',
      priceJustification: 'السعر مبرر تماماً لأن الجودة ممتازة والمنتجات تأتي بخدمة ضمان معتمدة.',
      valueVsPrice: 'القيمة مرتفعة جداً مقارنة بالسعر المدفوع.',
      offerSupport: 'عروض الشحن المجاني مع طلب منتجين تساعد جداً في رفع قيمة السلة (AOV).',
      profitMargin: 'هامش الربح صافي يتراوح بين 35% إلى 45%.',
      allowsAds: 'نعم، هامش الربح ممتاز ويسمح بميزانيات إعلانية مرنة برابح مرتفع.'
    },
    historicalAds: {
      bestCampaign: 'حملة تحويل مبيعات (Sales Campaign) بجمهور مهتم بالألعاب التقنية واستجابة فيديو Reels.',
      worstCampaign: 'حملة زيارات نقرات (Traffic Campaign) بدون هدف تحويل واضح.',
      highestRoas: '6.8x على باقة أجهزة الجيمنج.',
      lowestCpa: '85 EGP لكل طلب مكتمل.',
      bestAudience: 'جمهور Lookalike 1% للمشترين السابقين + مهتمي الإكسسوارات.',
      bestAd: 'فيديو ريلز مدته 18 ثانية يوضح تجربة الماوس والسماعة في الألعاب.',
      successReasons: 'وضوح المنتج بالفيديو، التركيز على الضمان والشحن السريع.',
      failureReasons: 'ضعف الصور الثابتة السابقة وعدم وجود عرض خصم واضح.'
    },
    competitors: [
      {
        id: 'comp-1',
        name: 'المنافس الأول - جيك ستور',
        pageLink: 'https://facebook.com/geekstore.eg',
        products: 'إكسسوارات هواتف وألعاب',
        price: 'أرخص بنسبة 10%',
        targetAudience: 'شباب الجيمنج ومهتمي الهواتف الذكية (18-30 سنة)',
        salesChannels: 'صفحة فيسبوك وموقع إلكتروني متواضع',
        priceDiffReason: 'بسبب عدم توفير ضمان استبدال محلي',
        offers: 'خصم 15% عند الشراء بـ 1000 جنيه',
        strengths: 'انتشار واسع وتواجد في محلات تجارية',
        weaknesses: 'بطء الرد في خدمة العملاء وعدم وجود متجر إلكتروني سلس',
        marketingMessage: 'أرخص سعر إكسسوارات في مصر',
        photographyStyle: 'تصوير ستوديو تقليدي',
        contentType: 'بوستات ثنائية الأبعاد',
        opportunitiesToExploit: 'التركيز على ثقة الضمان وسرعة الشحن والبيع المباشر عبر الفيديو'
      }
    ],
    swot: {
      strengths: ['تنوع واسع في المنتجات الإلكترونية', 'خدمة توصيل سريعة', 'ضمان حقيقي للمنتجات'],
      weaknesses: ['قلة الفيديو ريلز والتفاعل الحي', 'الموقع الإلكتروني يفتقد وسيلة دفع اقساط'],
      opportunities: ['التوسع في سوق الألعاب والـ Gaming Accessories', 'الحملات التفاعلية مع المؤثرين'],
      threats: ['المنافسة الشديدة في الأسعار من التجار المحليين']
    },
    customerPersona: {
      targetAudienceDetails: {
        ageRange: '18 - 35 سنة',
        gender: 'ذكور وإناث (70% ذكور / 30% إناث)',
        incomeLevel: 'متوسط إلى فوق المتوسط',
        interests: 'الألعاب الإلكترونية، التكنولوجيا، الهواتف الذكية، الموسيقى والسفر',
        lifestyle: 'شباب عملي، عشاق للتقنية والألعاب، يبحثون عن الحلول السريعة والجودة الموثوقة',
        location: 'القاهرة الكبرى، الإسكندرية، والدلتا والمحافظات الرئيسية'
      },
      insights: {
        painPoints: 'الخوف من شراء إلكترونيات تقليدية أو تالفة بدون ضمان حقيقي أو تأخر الشحن.',
        buyingMotivation: 'الحصول على أداء قوي في الألعاب والموسيقى بمظهر أنيق وسعر مناسب.',
        buyingTriggers: 'عروض الخصم لفترة محدودة، الشحن المجاني، والضمان المباشر ضد عيوب الصناعة.',
        objections: 'هل المنتج أصلي؟ هل الضمان حقيقي؟ وماذا لو واجهت مشكلة بعد الشراء؟'
      },
      positioning: {
        coreValue: 'المصداقية، الضمان الحقيقي، والجودة التقنية العالية.',
        usp: 'أسرع خدمة توصيل مع ضمان استبدال مجاني خلال 14 يوماً.',
        coreMessage: 'تقنيتك الموثوقة.. أداء بلا حدود وضمان حقيقي.',
        firstImpression: 'براند تقني عصري موثوق ومحترف.',
        marketTier: 'متوسط - راقي (Mid to High Tier)',
        identityClarity: 'واضحة جداً ومميزة.',
        growthReadiness: 'جاهز تماماً للنمو والتوسع الإقليمي.'
      }
    },
    problemsAndSolutions: [
      {
        id: 'ps-1',
        problem: 'قلة محتوى الفيديوهات القصيرة (Reels) الواقعية للمنتجات',
        impactOnSales: 'تراجع معدل التحويل (CR) للإعلانات الممولة ونقص ثقة العملاء المترددين',
        priorityLevel: 'عالية جداً',
        solutionStrategy: 'إنتاج 8 فيديوهات Unboxing واستعراض للمنتجات شهرياً بالتعاون مع صانعي محتوى تقني'
      },
      {
        id: 'ps-2',
        problem: 'عدم توفر خيار الدفع بالتقسيط على الموقع الإلكتروني',
        impactOnSales: 'فقدان طلبات المنتجات عالية السعر (أكثر من 1000 جنيه)',
        priorityLevel: 'عالية',
        solutionStrategy: 'الربط المباشر مع بوابات التقسيط مثل (Valu - Sympl - Souhoola)'
      }
    ],
    socialLinks: {
      facebook: 'https://facebook.com/technozone.eg',
      instagram: 'https://instagram.com/technozone.eg',
      tiktok: 'https://tiktok.com/@technozone.eg'
    },
    notes: 'البراند يحتوي على مقومات ممتازة للنمو، يجب التركيز على المحتوى البصري الفيديوي للفئة المستهدفة.'
  },
  'client-2': {
    clientId: 'client-2',
    score: 92,
    swot: {
      strengths: ['جودة أقمشة فاخرة وتصاميم حصرية', 'هوية بصرية أنيقة جداً', 'قاعدة عملاء مخلصين'],
      weaknesses: ['ارتفاع التكلفة التشغيلية للشحن الدولي'],
      opportunities: ['إطلاق خط إنتاج خاص بالحقائب والإكسسوارات', 'استهداف دول الخليج العربي'],
      threats: ['تقلبات أسعار الخامات المستوردة']
    },
    socialLinks: {
      instagram: 'https://instagram.com/eleganza.fashion',
      snapchat: 'https://snapchat.com/add/eleganza.fashion'
    },
    notes: 'الأداء ممتاز جداً وصورة البراند راقية. التوسع الخارجي سيكون خطوة استراتيجية ناجحة.'
  }
};

export const INITIAL_CONTENT_PLANS: ContentPlanItem[] = [
  {
    id: 'cnt-1',
    clientId: 'client-1',
    title: 'ريل استعراض مميزات أحدث سماعة نويز كانسلنج',
    format: 'reel',
    status: 'published',
    publishDate: '2026-08-03',
    details: 'فيديو قصير 30 ثانية يبرز العزل الصوتي مع استعراض التجربة الميدانية.'
  },
  {
    id: 'cnt-2',
    clientId: 'client-1',
    title: 'تصميم ألبوم صور (Carousel): 5 أخطاء عند شراء شاحن سريع',
    format: 'design',
    status: 'approved',
    publishDate: '2026-08-06',
    details: 'ألبوم تعليمي تثقيفي لزيادة التفاعل والحفظ (Saves).'
  },
  {
    id: 'cnt-3',
    clientId: 'client-1',
    title: 'فيديو مقارنة بين أفضل 3 ساعات ذكية لهذا العام',
    format: 'reel',
    status: 'review',
    publishDate: '2026-08-08',
    details: 'مقارنة شاملة مع رابط شراء في الستوري والبايو.'
  },
  {
    id: 'cnt-4',
    clientId: 'client-2',
    title: 'ستوري كواليس تصوير كولكشن الصيف مع العارضات',
    format: 'story',
    status: 'draft',
    publishDate: '2026-08-07',
    details: 'فيديوهات خلف الكواليس لإضفاء الطابع الإنساني والقرب من المتابعين.'
  }
];

export const INITIAL_ADS_PLANS: AdsPlanItem[] = [
  {
    id: 'ads-1',
    clientId: 'client-1',
    campaignName: 'حملة تحويلات المبيعات - تشكيلة الصيف الإلكترونية',
    platform: 'Meta (Instagram & Facebook)',
    platforms: ['Meta Ads (Instagram & Facebook)', 'TikTok Ads'],
    campaignStage: 'Scaling',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    objective: 'مبيعات مباشرة (Sales Conversion - Purchase)',
    campaignType: 'CBO',
    campaignBudget: 15000,
    primaryKpi: 'ROAS & CPA',
    targetKpi: 'ROAS >= 4.0 | CPA <= 65 EGP',
    testingHypothesis: 'استخدام زاوية حل المشكلة (Problem-Solution) عبر فيديوهات UGC حقيقية سيزيد معدل النقر CTR ويخفض تكلفة الاستحواذ CPA بنسبة 25%.',
    campaignStrategyNotes: 'التركيز على مبيعات باقات الصيف وإبراز ميزة الضمان الفوري 14 يوماً مع الشحن السريع في جميع المحافظات.',
    targetAudience: 'المهتمين بالتكنولوجيا والتقنية بعمر 18-35 في القاهرة والأسكندرية والمدن الكبرى',
    adCopy: '⚡ لا تفوت فرصة امتلاك أحدث التقنيات بخصم يصل إلى 30% مع ضمان سنة وشحن سريع لباب بيتك! اطلب الآن 🛒',
    status: 'active',
    createdAt: '2026-08-01',
    adSets: [
      {
        id: 'adset-1',
        name: 'AdSet 01 - Broad Audience (No Interests)',
        objectiveOrRole: 'Broad Scale & Top of Funnel',
        budgetType: 'Campaign Controlled',
        budget: 0,
        audienceTargeting: 'استهداف عام مفتوح بدون اهتمامات محددة لترك خوارزمية ميتا تجلب أفضل شريحة',
        location: 'مصر (جميع المحافظات مع استبعاد الأماكن البعيدة جداً)',
        age: '18 - 38 سنة',
        gender: 'الكل',
        placements: 'Advantage+ Placements (Feeds + Reels & Stories)',
        notes: 'المجموعة المفتوحة أثبتت كفاءة عالية في تقليل تكلفة الألف ظهور CPM.',
        ads: [
          {
            id: 'ad-101',
            name: 'Ad 01 - UGC Unboxing & Review',
            creative: 'فيديو أنبوكسينج مع مؤثر تقني يشرح ميزة عزل الضوضاء',
            creativeType: 'UGC',
            angle: 'Problem-Solution (عزل الضوضاء في المواصلات والشوارع)',
            hook: 'لو بتعاني من الدوشة وأنت شغال أو مسافر، السماعة دي هتنقذك!',
            primaryText: 'سماعة Pro Wireless الأصلية مع عزل صوتي حقيقي وضمان استبدال معتمد 14 يوم. شحن سريع لكافة المحافظات.',
            headline: 'خصم 30% لفترة محدودة + شحن سريع ⚡',
            cta: 'Shop Now (اطلب الآن)',
            destination: 'Website',
            notes: 'أفضل إعلان حقق أعلى معدل تحويل وأعلى طلبات في أول أسبوع.',
            status: 'Winner'
          },
          {
            id: 'ad-102',
            name: 'Ad 02 - Static Offer Banner (Carousel)',
            creative: 'كاروسيل 4 سلايدات يستعرض ألوان السماعة والمميزات التقنية',
            creativeType: 'Carousel',
            angle: 'Price / Value & Free Shipping',
            hook: '3 ألوان مميزة تناسب ستايلك مع شحن مجاني اليوم فقط!',
            primaryText: 'اكتشف التشكيلة الجديدة من أجهزة الصوت الذكية بأسعار تبدأ من 399 جنيه مع ضمان سنة كاملة.',
            headline: 'تشكيلة الصيف الحصرية بأفضل سعر 🎧',
            cta: 'Shop Now (تسوق الآن)',
            destination: 'Website',
            notes: 'معدل التفاعل جيد لكن تكلفة الشراء أعلى قليلاً من الفيديو.',
            status: 'Live'
          }
        ]
      },
      {
        id: 'adset-2',
        name: 'AdSet 02 - Retargeting (Website Visitors & Engaged 30D)',
        objectiveOrRole: 'Middle/Bottom of Funnel (Retargeting)',
        budgetType: 'Campaign Controlled',
        budget: 0,
        audienceTargeting: 'زوار الموقع آخر 30 يوم + المتفاعلين مع حساب إنستجرام وفيسبوك آخر 60 يوم',
        location: 'مصر',
        age: '18 - 45 سنة',
        gender: 'الكل',
        placements: 'Feeds, Instagram Stories & Reels',
        notes: 'إعادة استهداف برمز خصم إضافي واسترجاع السلات المتروكة.',
        ads: [
          {
            id: 'ad-201',
            name: 'Ad 03 - Social Proof & Customer Reviews',
            creative: 'سكرين شوتس لآراء العملاء الحقيقيين مع فيديو سريع للمنتج',
            creativeType: 'Video',
            angle: 'Social Proof & Trust Building',
            hook: 'أكثر من 5000 عميل اختاروا تكنو زون هذا الشهر.. شوف تجاربهم!',
            primaryText: 'لسة متردد؟ جرب الآن مع إمكانية المعاينة قبل الاستلام واسترجاع مجاني خلال 14 يوماً.',
            headline: 'معاينة قبل الاستلام + ضمان ذهبي 🛡️',
            cta: 'Order Now (اطلب الآن)',
            destination: 'Landing Page',
            notes: 'حقق ROAS قياسي يتخطى 6.5X في إعادة الاستهداف.',
            status: 'Winner'
          }
        ]
      }
    ],
    results: {
      actualSpend: 11450,
      impressions: 485000,
      reach: 320000,
      ctr: '2.85%',
      cpc: '1.45 EGP',
      cpm: '23.6 EGP',
      atc: 412,
      purchasesOrLeads: 238,
      cpaOrCac: '48.1 EGP',
      cvr: '4.6%',
      roas: '5.2X',
      performanceStatus: 'Winner'
    },
    learnings: {
      whatWorked: 'فيديوهات الـ UGC والمراجعات الواقعية تفوقت بفارق ضخم على التصاميم الثابتة. زاوية عزل الضوضاء والضمان حققت أعلى نسبة شراء.',
      whatDidntWork: 'التصاميم الجرافيكية البسيطة بدون وجوه بشرية حققت CTR منخفض وتكلفة عالية.',
      bestCreative: 'Ad 01 - UGC Unboxing & Review (سماعة Pro Wireless)',
      bestAngle: 'Problem-Solution + Social Proof & Guarantee',
      bestAudience: 'Broad Audience + Retargeting Engaged 30D',
      insightsNotes: 'العميل يحتاج لرؤية المنتج يعمل بشكل فعلي وسماع تجارب حقيقية لإتمام الطلب سريعاً.',
      decision: 'Scale',
      nextStep: 'زيادة الميزانية بنسبة 30% وتصوير 3 نسخ جديدة (Hooks مختلفة) من نفس الـ Winning Concept.'
    }
  },
  {
    id: 'ads-2',
    clientId: 'client-1',
    campaignName: 'حملة إبداء الاهتمام والنموذج (Leads - موزعين وجملة)',
    platform: 'Meta (Facebook & Instagram)',
    platforms: ['Facebook Lead Ads'],
    campaignStage: 'Testing',
    startDate: '2026-08-10',
    endDate: '2026-08-25',
    objective: 'جمع بيانات الراغبين في الشراء بالتجزئة والجملة (Lead Generation)',
    campaignType: 'ABO',
    campaignBudget: 5000,
    primaryKpi: 'Cost Per Lead (CPL)',
    targetKpi: 'CPL <= 20 EGP',
    testingHypothesis: 'فورم ميتا الفوري (Instant Form) مع أسئلة تأهيلية سيوفر ليدز بجودة أعلى من رسائل الواتساب المباشرة.',
    campaignStrategyNotes: 'استقطاب تجار المحلات وأصحاب المتاجر الصغيرة للحصول على كتالوج أسعار الجملة.',
    targetAudience: 'أصحاب المتاجر الإلكترونية والشباب المبتدئين في التجارة',
    adCopy: 'هل تبحث عن المورد المباشر لأفضل الإكسسوارات؟ سجل بياناتك الآن للحصول على قائمة الأسعار والجملة 📊',
    status: 'planned',
    createdAt: '2026-08-08',
    adSets: [
      {
        id: 'adset-3',
        name: 'AdSet 01 - E-commerce & Retail Store Owners',
        objectiveOrRole: 'B2B Lead Acquisition',
        budgetType: 'Ad Set Controlled',
        budget: 250,
        audienceTargeting: 'المهتمين بالتجارة الإلكترونية، Dropshipping، تجارة التجزئة، وإدارة الأعمال',
        location: 'مصر (القاهرة، الجيزة، الإسكندرية، طنطا، المنصورة)',
        age: '24 - 50 سنة',
        gender: 'الكل',
        placements: 'Facebook Feed & Instagram Feed',
        notes: 'اختبار رسالة العائد الربحي وتوفير أسعار الوكيل المباشر.',
        ads: [
          {
            id: 'ad-301',
            name: 'Ad 01 - Wholesale Catalog Lead Form',
            creative: 'فيديو سريع لشحنات المستودع وتغليف بضائع الجملة',
            creativeType: 'Video',
            angle: 'High Margin & Fast Delivery',
            hook: 'لو بتدور على إكسسوارات هواتف بهامش ربح يوصل 40%.. اسمع ده!',
            primaryText: 'احصل على كتالوج أسعار الجملة المباشر مع خصومات تبدأ من أول 10 قطع. سجل بياناتك ليصلك الكتالوج فوراً.',
            headline: 'كتالوج أسعار الجملة 2026 متاح الآن 📦',
            cta: 'Sign Up (سجل الآن)',
            destination: 'Landing Page',
            notes: 'فورم فوري مكون من 3 أسئلة: الاسم، المحافظة، وعدد القطع المطلوب شهرياً.',
            status: 'Ready'
          }
        ]
      }
    ],
    results: {
      performanceStatus: 'Needs More Data'
    },
    learnings: {
      decision: 'Keep',
      nextStep: 'إطلاق الحملة ومتابعة أول 50 ليد مع فريق المبيعات للتأكد من الجودة.'
    }
  }
];

export const INITIAL_CLIENT_DAILY_REPORTS: ClientDailyReport[] = [
  {
    id: 'cdr-1',
    clientId: 'client-1',
    date: '2026-08-04',
    ordersCount: 12,
    salesAmount: 18400,
    topProductsSold: 'سماعة Pro Wireless V2 + جراب سيليكون مجاني',
    cancelledOrdersCount: 2,
    cancellationReason: 'تأخير في الميعاد المطلوب للمحافظات البعيدة',
    commonQuestions: 'السؤال عن مواعيد التوصيل وهل يوجد معاينة قبل الدفع؟',
    customerObjections: 'سعر الشحن للمحافظات مرتفع قليلاً مقارنة بداخل القاهرة',
    inventoryIssues: 'اللون الأسود من السماعات قرب يخلص (باقي 15 قطعة فقط)',
    shippingOperationalIssues: 'تأخر بسيط من شركة الشحن في تأكيد المحافظات البعيدة',
    updatesOrOffers: 'تم إطلاق عرض الشحن النصف مجاني للطلبات الكبيرة',
    returnsCountAndType: '1 مرتجع (طلب استبدال لون السماعة من الأبيض إلى الأسود)',
    inquiriesCount: 95,
    leadsCount: 38,
    topPlatforms: 'واتساب و إنستجرام',
    challenges: 'تأخر بسيط من شركة الشحن في تأكيد المحافظات البعيدة',
    notes: 'تم استقبال عدد كبير من الاستفسارات عن السماعة الجديدة. تم إغلاق 12 طلب حتى الآن بجودة عالية.'
  },
  {
    id: 'cdr-2',
    clientId: 'client-1',
    date: '2026-08-03',
    ordersCount: 15,
    salesAmount: 22100,
    topProductsSold: 'باك العناية المتكاملة + ساعة ذكية Ultra',
    cancelledOrdersCount: 1,
    cancellationReason: 'العميل غير رأيه بعد إتمام الطلب مباشرة',
    commonQuestions: 'هل يوجد ضمان لمدة سنة؟ وما هي طريقة استبدال المنتج؟',
    customerObjections: 'استفسار عن إمكانية الدفع بالفيزا عند الاستلام',
    inventoryIssues: 'المخزون متوفر بالكامل ولا توجد أي نواقص حالياً',
    shippingOperationalIssues: 'لا توجد مشكلات بالشحن اليوم، جميع الطلبات خرجت في الموعد',
    updatesOrOffers: 'لا توجد تعديلات جديدة على الأسعار اليوم',
    returnsCountAndType: 'لا توجد أي مرتجعات اليوم',
    inquiriesCount: 110,
    leadsCount: 42,
    topPlatforms: 'تيك توك و واتساب',
    challenges: 'لا توجد معوقات رئيسية اليوم، الأداء ممتاز جداً',
    notes: 'إقبال ممتاز عقب نشر الريل الجديد على إنستجرام وتيك توك مع زيادة التفاعل المباشر.'
  }
];

export const INITIAL_WEEKLY_REPORTS: WeeklyReport[] = [
  {
    id: 'wr-1',
    clientId: 'client-1',
    weekStartDate: '2026-08-03',
    weekEndDate: '2026-08-09',
    clientViewed: true,

    // 1. ملخص الأداء | Weekly Performance
    totalSpent: 12000,
    totalOrders: 84,
    totalRevenue: 50400,
    salesValue: 50400,
    roas: 4.2,
    cpa: '142.8 EGP',
    aov: '600 EGP',
    conversionRate: '3.4%',

    // 2. مقارنة بالأسبوع السابق | Week-over-Week
    spendChange: '+10% (زيادة مقصودة للتوسيع)',
    ordersChange: '+22% (زيادة 15 طلب إضافي)',
    revenueChange: '+28% (+11,000 EGP)',
    roasChange: '+0.6x (ارتفع من 3.6x إلى 4.2x)',
    cpaChange: '-12% (انخفضت التكلفة لكل طلب)',
    aovChange: '+5% (ارتفع متوسط السلة)',

    // 3. أداء الحملات | Campaign Performance
    bestCampaign: 'حملة العروض الأسبوعية للاكسسوارات — سبب النجاح: نسبة النقر CTR تجاوزت 3.8% بفضل نصوص إعلانية قصيرة وزوايا تصوير واقعية (UGC).',
    weakestCampaign: 'حملة إعادة الاستهداف القديمة — سبب الضعف: تشبع الجمهور (Ad Fatigue) وانخفاض معدل التحويل.',
    improvingCampaigns: 'حملة الريلز على إنستجرام وتيك توك أظهرت تحسناً بنسبة 35% في سرعة إتمام الطلبات.',
    decliningCampaigns: 'حملة الرسائل الثابتة على فيسبوك تراجعت تكلفة الرسالة فيها.',
    scalingCampaigns: 'حملة كولكشن الصيف ومجموعات الجمهور المشابه (Lookalike 1%).',
    optimizationPauseCampaigns: 'إيقاف إعلان الصور الثابتة رقم 3 وإعادة صياغة العناوين الترويجية.',

    // 4. التحليل الأسبوعي | Weekly Analysis
    whatWorkedWell: 'إعلانات الفيديو القصيرة (Reels) والجمهور المماثل (Lookalike 1%) حققا أعلى نسبة مبيعات بأقل تكلفة CPA.',
    whatNeedsImprovement: 'صفحة هبوط المنتج تحتاج تحسين سرعة التحميل لزيادة نسبة إتمام الشراء، وتفعيل رد فوري على استفسارات الواتساب.',
    keyChanges: 'تم تحويل 25% من الميزانية من الإعلانات الثابتة إلى فيديوهات الريلز، مما رفع ROAS من 3.6x إلى 4.2x.',
    whatChangedFromLastWeek: 'تم تحويل 25% من الميزانية من الإعلانات الثابتة إلى فيديوهات الريلز، مما رفع ROAS من 3.6x إلى 4.2x.',
    keyInsight: 'العملاء يفضلون عروض الباقات المزدوجة (Bundle Offers) حيث حققت 45% من إجمالي المبيعات وقادت لرفع AOV.',
    salesAndLeadNotes: 'سجل العميل معدل تأكيد طلبات 92% مع انخفاض ملحوظ في نسبة الإلغاء، وتأكيد 12 طلب إضافي عبر الهاتف.',
    dailyClientDataNotes: 'العميل أفاد بوجود إقبال كبير في العطلة الأسبوعية وتفاعل ممتاز مع العرض الخاص.',

    // 5. خطة الأسبوع القادم | Next Week Action Plan
    nextWeekGoal: 'الوصول إلى 105 طلب أسبوعي مع الحفاظ على ROAS أعلى من 4.0x وتخفيض CPA إلى 135 EGP.',
    topPriorities: '1. زيادة ضخ الميزانية على الإعلانات الفائزة\n2. اختبار 3 زوايا تصوير جديدة\n3. تحسين تجربة صفحة الدفع.',
    campaignAdjustments: 'زيادة الميزانية لحملة الريلز الناجحة بنسبة 20%، وإيقاف المجموعات الإعلانية المجهدة.',
    campaignAdjustmentsNextWeek: 'زيادة الميزانية لحملة الريلز الناجحة بنسبة 20%، وإيقاف المجموعات الإعلانية المجهدة.',
    newTests: 'اختبار جمهور جديد (A/B Test) مبني على اهتمامات الموضة الحديثة، وتجربة عنوان إعلاني يركز على الشحن المجاني فوق 1000 جنيه.',
    newTestsNextWeek: 'اختبار جمهور جديد (A/B Test) مبني على اهتمامات الموضة الحديثة، وتجربة عنوان إعلاني يركز على الشحن المجاني فوق 1000 جنيه.',
    clientRequiredAction: '1. تزويدنا بـ 3 فيديوهات جديدة للآراء والتقييمات للعملاء (UGC).\n2. التأكد من توفر مخزون كافي للمنتجات الأكثر طلباً.',
    clientRequiredActionNextWeek: 'تزويدنا بـ 3 فيديوهات جديدة للآراء والتقييمات للعملاء وتوفير المخزون الكافي للمنتجات الأكثر طلباً.',

    // 6. ملخص القرار | Weekly Decision Summary
    decisionSummary: 'أهم ما حدث هذا الأسبوع: تحقيق نمو بنسبة 28% في المبيعات وارتفاع العائد ROAS إلى 4.2x بفضل حملات الريلز الواقعية.\nأهم استنتاج من البيانات: عروض الباقات المزدوجة تحقق أعلى معدل تحويل بنسبة 45% من المبيعات وترفع متوسط قيمة الطلب AOV.\nأهم القرارات والتعديلات للأسبوع القادم: زيادة ميزانية حملة الريلز الناجحة بنسبة 20%، إيقاف إعلانات الصور الثابتة المجهدة، وإطلاق اختبار A/B لجمهور جديد مع ميزة الشحن المجاني فوق 1000 جنيه.',

    campaignsPerformanceSummary: 'أداء قوي واستقرار ملحوظ في الحملات مع انخفاض تكلفة الاستحواذ على العميل واستجابة سريعة للعروض الموسمية.',
    totalReach: 145000,
    totalConversions: 84,
    notes: 'تحقق عائد ممتاز على الإنفاق الإعلاني (ROAS 4.2x).'
  }
];

export const INITIAL_MONTHLY_REPORTS: MonthlyReport[] = [
  {
    id: 'mr-1',
    clientId: 'client-1',
    month: '2026-07',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    createdAt: '2026-08-01',

    // 1. ملخص الأداء | Monthly Performance
    totalSpent: 48000,
    totalOrders: 360,
    totalRevenue: 216000,
    roas: 4.5,
    cpa: '133.3 EGP',
    aov: '600 EGP',
    conversionRate: '3.6%',

    // 2. مقارنة بالشهر السابق | Month-over-Month
    spendChange: '+15% (توسيع ميزانية الحملات الرابحة)',
    ordersChange: '+28% (زيادة 78 طلب عن الشهر السابق)',
    revenueChange: '+32% (نمو المبيعات الإجمالية)',
    roasChange: '+0.5x (تحسن من 4.0x إلى 4.5x)',
    cpaChange: '-10% (انخفاض تكلفة الاستحواذ على الطلب)',
    aovChange: '+6% (ارتفاع متوسط السلة بفضل عروض الباقات)',

    // 3. أداء الحملات | Campaign Performance
    bestCampaign: 'حملة إعلانات الريلز (UGC Reels) — سبب النجاح: محتوى واقعي سريع يجيب على تساؤلات العملاء ويستعرض تجربة فتح الصندوق (Unboxing) بدقة عالية.',
    weakestCampaign: 'حملة التفاعل المنفصلة على فيسبوك — سبب الضعف: ارتفاع تكلفة النقرة وعدم توجيه الجمهور لمسار شراء مباشر.',
    improvingCampaigns: 'حملة إعادة الاستهداف المتقدمة (Dynamic Retargeting) وحملات تيك توك سبارك آدز.',
    decliningCampaigns: 'حملة الصور الثابتة للكولكشن القديم نتيجة استنزاف الجمهور (Ad Fatigue).',

    // 4. أداء المحتوى والإعلانات | Creative Performance
    bestCreative: 'فيديو ريل (المقارنة بين المنتج الأصلي والتقليد) حصد أكثر من 240 ألف مشاهدة بنسبة CTR بلغت 4.1%.',
    bestHook: '«ليه بتدفع أكتر لما تقدر تاخد نفس الجودة بنصف السعر مع ضمان سنة كاملة؟»',
    bestMarketingAngle: 'زاوية الاعتمادية وتوفير التكاليف مع راحة البال والضمان والاستبدال الفوري.',
    bestContentFormat: 'فيديوهات UGC القصيرة والمراجعات الواقعية (9:16 Reels / TikToks).',
    creativesNeedRefresh: 'تصاميم الكاروسيل الثابتة الخاصة بعروض نهاية الأسبوع تحتاج تجديد كلي في الألوان والنصوص.',

    // 5. أداء المنتجات | Product Performance
    topPerformingProducts: 'باكيدج السماعة الذكية + الشاحن اللاسلكي السريع حقق 40% من مبيعات الشهر.',
    lowPerformingProducts: 'كابلات الشحن المنفردة وأغطية الحماية البسيطة.',
    growthOpportunityProducts: 'ساعات الترا الذكية الجديدة واكسسوارات السيارات الذكية.',

    // 6. ملاحظات العملاء والمبيعات | Customer & Sales Insights
    topCustomerObjections: 'السؤال المتكرر عن مدة الشحن للمحافظات ورسوم التوصيل قبل تأكيد الطلب.',
    keySalesInsights: 'العملاء الذين يتم التواصل معهم خلال 15 دقيقة من ترك البيانات يسجلون نسبة تأكيد شراء تفوق 94%.',
    pricingShippingStockIssues: 'نفاد مخزون اللون الأسود من السماعات خلال الأسبوع الثالث مما أدى لتأخير شحن 25 طلب.',

    // 7. أهم ما تعلمناه | Key Learnings
    whatWorked: 'التركيز على عروض الباقات (Bundles) وفيديوهات تقييمات المشترين حقق أعلى معدل تحويل وأفضل ROAS.',
    whatDidntWork: 'الإعلانات الثابتة بدون حركة أو استعراض عملي للمنتج سجلت تفاعلاً ضعيفاً وتكلفة طلب مرتفعة.',
    keyInsight: 'تقديم الشحن المجاني عند شراء باقة بقيمة 1000 جنيه فأكثر يرفع نسبة إتمام الطلبات بنسبة تتجاوز 35%.',

    // 8. فرص النمو | Growth Opportunities
    biggestGrowthOpportunity: 'التوسع في حملات تيك توك وسناب شات وتكثيف تصوير فيديوهات الـ UGC والمراجعات.',
    biggestGrowthChallenge: 'إدارة المخزون بدقة لتفادي نفاد المنتجات الأكثر مبيعاً في أوقات ذروة الحملات الإعلانية.',
    salesGrowthOpportunity: 'إطلاق عروض الترقية (Upselling) أثناء اتصال خدمة العملاء لتأكيد الطلب لإضافة ملحقات إضافية.',

    // 9. خطة الشهر القادم | Next Month Strategy
    mainGoal: 'تخطي حاجز 450 طلب شهرياً مع الحفاظ على ROAS لا يقل عن 4.2x وتوسيع قاعدة العملاء الجدد.',
    targetRevenueOrders: 'الهدف الرقمي: 275,000 EGP مبيعات إجمالية من خلال 450 طلب مؤكد.',
    targetCpaRoas: 'المستهدف: CPA أقل من 130 EGP و ROAS مستهدف 4.2x - 4.6x.',
    advertisingStrategy: 'تخصيص 60% من الميزانية لحملات الريلز وتيك توك، 25% لإعادة الاستهداف الذكي، و15% لاختبار جماهير ومنتجات جديدة.',
    contentStrategy: 'إنتاج 12 فيديو UGC جديد، و4 تصاميم سلايد شو للمقارنات، و6 ستوريز تفاعلية أسبوعياً.',
    newTests: 'اختبار استهداف المهتمين بالتقنية في المحافظات الكبرى، واختبار صفحة دفع سريعة بضغطة زر واحدة (One-Click Checkout).',
    clientActionRequired: '1. تأمين كميات كافية من مخزون السماعات والباقات الأكثر مبيعاً.\n2. تسليم 6 عينات لمنتجات جديدة للبدء في تصوير الفيديوهات الترويجية.',

    // 10. التقييم الشهري | Monthly Growth Summary
    monthlyGrowthSummary: 'أين كان البراند في بداية الشهر: الاعتماد الكامل على منشورات وتصاميم ثابتة مع ثبات نسبي في المبيعات وتكلفة استحواذ مرتفعة بعض الشيء.\nماذا تغير خلال الشهر: التحول الكامل لصناعة ونشر فيديوهات الـ UGC والريلز، وتطبيق عروض الباقات المزدوجة التي رفعت قيمة متوسط السلة AOV ومعدل التحويل إلى 3.6%، محققين 216 ألف جنيه مبيعات وعائد 4.5x.\nأهم القرارات للشهر القادم: زيادة الميزانية بنسبة 25% والتوسع في تيك توك وسناب شات، وتوفير مخزون كافي للمنتجات الأعلى طلباً لمنع نفاد المخزون خلال ذروة الحملات.',

    notes: 'شهر ناجح ومحقق لجميع الأهداف الرقمية والتسويقية المطلوبة بامتياز.'
  }
];

export const INITIAL_QUARTERLY_REPORTS: QuarterlyReport[] = [
  {
    id: 'qr-1',
    clientId: 'client-1',
    quarter: 'Q2 2026',
    year: 2026,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    createdAt: '2026-07-01',

    // 1. ملخص الأداء | Quarterly Performance
    totalSpent: 135000,
    totalOrders: 1140,
    totalRevenue: 615600,
    roas: 4.56,
    cpa: '118.4 EGP',
    aov: '540 EGP',
    conversionRate: '3.4%',

    // 2. مقارنة بالربع السابق | Quarter-over-Quarter
    spendChange: '+28%',
    ordersChange: '+35%',
    revenueChange: '+42%',
    roasChange: '+11%',
    cpaChange: '-5%',
    aovChange: '+6%',

    // 3. أداء الحملات | Campaign Performance
    topPerformingCampaigns: 'حملة العروض المجمعة (Bundles Campaign) وحملة إعادة الاستهداف المخصصة للزوار السابقين (Retargeting DPA).',
    weakestCampaigns: 'حملة التوعية العامة الواسعة (Broad Awareness) حيث كان معدل التحويل فيها ضعيفاً مقارنة بالتكلفة.',
    highestGrowthCampaigns: 'حملات Advantage+ Shopping على فيسبوك وانستغرام حيث نمت بنسبة 60% في حجم المبيعات الإجمالي.',
    pausedCampaignsReasons: 'تم إيقاف حملة إعلانات الصور الفردية الثابتة لعدم قدرتها على منافسة مقاطع الفيديو القصيرة والريلز.',
    keyCampaignLearnings: 'حملات الفيديوهات القصيرة (UGC) مع ربطها بصفحات هبوط مخصصة لكل باقة تحقق معدل تحويل مضاعف بنسبة 140% مقارنة بالصفحة الرئيسية.',

    // 4. أداء الإعلانات والمحتوى | Creative Performance
    topPerformingCreatives: 'فيديو تجربة فتح الصندوق ومقارنة جودة الصوت للسماعات الرياضية (Unboxing & Sound Comparison).',
    topPerformingHooks: '«3 أسباب تخليك تبدل سماعتك القديمة فوراً...» و«ليه كل اللي جربوا السماعة دي ما استغنوش عنها؟»',
    bestMarketingAngles: 'زاوية عزل الضوضاء الفائق وعمر البطارية الطويل، مع ضمان الاستبدال الفوري لمدة عام.',
    bestContentFormats: 'فيديوهات UGC القصيرة (9:16)، وتصاميم الكاروسيل التي تعرض الباقات ومكوناتها بالتفصيل.',
    creativesNeedRefresh: 'إعلانات الصور الترويجية الثابتة لعروض الصيف التي تم استهلاكها بالكامل وتراجع CTR الخاص بها.',
    keyCreativeLearnings: 'المقاطع التي تظهر المنتج في أول ثانية مع نص توضيحي ديناميكي حققت أعلى نسبة احتفاظ بالمشاهدين وانخفاض في تكلفة النقرة.',

    // 5. أداء المنتجات والعروض | Product & Offer Performance
    topPerformingProducts: 'سماعات Pro Wireless مع باقة الشاحن اللاسلكي السريع وكفر الحماية.',
    lowPerformingProducts: 'كابلات الشحن الفردية بدون باقات أو عروض مصاحبة.',
    productGrowthOpportunities: 'إطلاق باقة خاصة بالطلاب والرياضيين تجمع السماعة مع ساعة ذكية بخصم مغري.',
    offerPerformance: 'عرض «اشتري واحدة واحصل على الثانية بنصف السعر» كان الأكثر جذباً للمبيعات المرتفعة ورفع AOV بشكل ملموس.',
    upsellCrossSellOpportunities: 'إضافة خيار تمديد الضمان أو شراء حامي صدمات سيليكون بصفحة الدفع بنقرة واحدة.',

    // 6. سلوك العملاء والمبيعات | Customer & Sales Insights
    topCustomerObjections: 'التساؤل عن سرعة التوصيل في المحافظات البعيدة وسياسة الإرجاع في حال عدم الرضا.',
    keySalesInsights: 'العملاء يفضلون الدفع عند الاستلام مع إمكانية فتح الشحنة ومعاينتها قبل الدفع.',
    pricingShippingStockIssues: 'حدث تأخير لمدة 3 أيام في شحن منتجات الباقة الذهبية بسبب نفاد المخزون المؤقت في الأسبوع الأخير من مايو.',
    customerBehaviorChanges: 'زيادة ملحوظة في نسبة الشراء المباشر عبر الهواتف الذكية لتتجاوز 92% من إجمالي الطلبات.',

    // 7. أهم النتائج والتعلم | Key Learnings
    biggestWin: 'تحقيق نمو في المبيعات بنسبة 42% مع خفض تكلفة الطلب (CPA) وتحقيق عائد 4.56x.',
    biggestChallenge: 'إدارة تدفق المخزون مع نمو الطلبات السريع لتجنب نفاد المنتجات الأكثر مبيعاً.',
    keyLearnings: 'التركيز على الفيديوهات الواقعية والعروض المركبة يقلل من حساسية العملاء تجاه الأسعار ويزيد من متوسط السلة.',
    keyStrategicInsight: 'بناء الثقة من خلال ضمان التجربة وخدمة ما بعد البيع السريعة هو المحرك الأول لتكرار الشراء والولاء للبراند.',

    // 8. فرص النمو | Growth Opportunities
    biggestGrowthOpportunity: 'التوسع بحملات تيك توك وسناب شات مع التعاون مع صناع محتوى متخصصين في المراجعات التقنية.',
    salesGrowthOpportunity: 'تفعيل برنامج المكافآت ورسائل الواتساب الآلية لاستعادة السلات المتروكة وإعادة الشراء.',
    productOfferOpportunities: 'تصميم باقات موسمية مخصصة لموسم العودة للمدارس والجامعات في الربع القادم.',
    scalingOpportunities: 'زيادة الميزانية الإعلانية تدريجياً بنسبة 30% خلال الربع القادم مع الحفاظ على ROAS أعلى من 4.0x.',

    // 9. التقييم الاستراتيجي | Strategic Review
    whatChanged: 'تحول البراند من الاعتماد على المنتجات الفردية إلى تسويق باقات قيمة متكاملة ذات هوية بصرية قوية وموثوقة.',
    isGrowthSustainable: 'نعم، النمو مستدام بفضل تحسن هوامش الربح وارتفاع نسبة تكرار الطلبات وتراجع معدل المرتجعات.',
    keyGrowthBarriers: 'الطاقة الاستيعابية لفريق خدمة العملاء والشحن السريع خلال أوقات الذروة والمواسم.',
    whatShouldContinue: 'الاستمرار في استراتيجية الـ UGC اليومي وتحديث زوايا الإعلانات باستمرار وعروض الباقات.',
    whatShouldChange: 'تقليل الاعتماد على الإعلانات الثابتة واستبدال نظام إدارة المخزون اليدوي بنظام تنبيه آلي.',

    // 10. خطة الربع القادم | Next Quarter Strategy
    mainGoal: 'الوصول إلى مليون جنيه إيرادات خلال الربع القادم مع ترسيخ مكانة البراند كالخيار الأول للاكسسوارات الذكية.',
    revenueOrderTargets: 'تحقيق 850,000 - 1,000,000 جنيه إيرادات مع الوصول إلى 1,800 طلب مؤكد.',
    targetCpaRoas: 'Target ROAS: 4.2x+ | Target CPA: 110 - 125 EGP',
    advertisingStrategy: 'تنويع المنصات (Meta 60%, TikTok 30%, Google Ads 10%) واختبار جماهير مخصصة جديدة.',
    contentStrategy: 'إنتاج 40 فيديو ريلز جديد شهرياً والتركيز على شهادات العملاء وتجارب الاستخدام الحقيقية.',
    productOfferStrategy: 'إطلاق 3 باقات حصرية لموسم الخريف والمدارس وتفعيل هدايا مجانية مع الطلبات الكبيرة.',
    newTests: 'اختبار الإعلانات التفاعلية (Interactive Poll Ads) وإعلانات الدفع المباشر عبر واتساب.',
    nextQuarterScalingOpportunities: 'استهداف دول الخليج (السعودية والإمارات) عبر متجر مخصص وشحن مباشر.',
    clientActionRequired: '1. توفير مخزون إضافي بنسبة 50% قبل بداية موسم سبتمبر.\n2. تعيين موظف إضافي لمتابعة وتأكيد الشحنات هاتفياً.',

    // 11. خطة الـ90 يوم | 90-Day Growth Plan
    month1Plan: 'الشهر الأول (Optimize): تحسين صفحات الهبوط ومسار الشراء، وتصفية الحملات الإعلانية غير المجدية وتحديث كل المواد الإعلانية القديمة.',
    month2Plan: 'الشهر الثاني (Test & Scale): إطلاق باقات العودة للمدارس، واختبار قنوات تيك توك وسناب شات، وزيادة الميزانية بنسبة 20%.',
    month3Plan: 'الشهر الثالث (Scale & Expand): التوسع بالميزانية إلى أقصى حد خلال ذروة الموسم، وتفعيل حملات إعادة الشراء للعملاء الحاليين.',

    // 12. ملخص النمو | Quarterly Growth Summary
    quarterlyGrowthSummary: 'حقق البراند خلال الربع الثاني قفزة نوعية في المبيعات (+42%) والأرباح التشغيلية، ونجح في ترسيخ هوية موثوقة من خلال محتوى الفيديو الواقعي وعروض الباقات المتميزة. لمواصلة هذا الزخم خلال الـ90 يوماً القادمة، يجب التركيز على تأمين سلاسل التوريد والمخزون، والتوسع المنظم في منصات تيك توك وسناب شات لضمان تحقيق نمو مستدام ومضاعفة الإيرادات.',

    notes: 'تقرير ربع سنوي شامل يعكس الأداء الفصلي الاستثنائي ومسار النمو للربع القادم.'
  }
];

export const INITIAL_ADMIN_DAILY_REPORTS: AdminDailyReport[] = [
  {
    id: 'adr-1',
    clientId: 'client-1',
    date: new Date().toISOString().split('T')[0],
    campaigns: ['حملة العروض الأسبوعية للاكسسوارات'],
    quickEvaluation: '🟢 ممتاز',
    mainNotes: 'تحسن كبير في أداء الحملة واستهداف الجمهور اليوم بعد تعديل العناوين الرئيسية وتخفيض CPC بنسبة 18%.',
    mediaBuyerNotes: 'تم ضبط تكلفة النقرة (CPC) لتخفيضها بنسبة 18%. تم استبعاد الفئات غير المتفاعلة.',
    tasksDone: 'تعديل التصاميم الإعلانية وتجربة 3 نصوص إعلانية جديدة A/B Testing.',
    optimizationsPerformed: 'إيقاف إعلان الفيديو رقم 2 وتحويل ميزانيته للريل رقم 1 الأعلى تحويلاً.',
    attachedFiles: [
      {
        id: 'file-1',
        name: 'نتائج_الحملة_اليومية_04-08-2026.xlsx',
        size: '142 KB',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    ]
  }
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    clientId: 'client-1',
    title: 'ملاحظة بخصوص عروض الشحن المجاني',
    content: 'يرجى التأكيد على أن الشحن المجاني يطبق فقط على الطلبات التي تتجاوز قيمتها 1000 جنيه.',
    author: 'عمر الخولي (العميل)',
    authorRole: 'client',
    isPinned: true,
    status: 'قيد المتابعة',
    date: '2026-08-02'
  },
  {
    id: 'note-2',
    clientId: 'client-1',
    title: 'تحديد مواعيد إطلاق كولكشن المدارس',
    content: 'سوف نبدأ التحضير لحملة العودة للمدارس والجامعات ابتداءً من منتصف أغسطس.',
    author: 'هدي سيد (الأدمن)',
    authorRole: 'admin',
    isPinned: false,
    status: 'تم التنفيذ',
    date: '2026-08-04'
  }
];

export const INITIAL_ADS_STRATEGIES: Record<string, import('../types').ClientAdsStageStrategy> = {
  'client-1': {
    currentStage: 'Scaling',
    overallStrategy: 'التركيز على التوسع (Horizontal & Vertical Scaling) بعد إثبات نجاح زاوية Problem-Solution بفيديوهات UGC وتحقيق ROAS 5.2X. الخطة الحالية تعتمد على مضاعفة ميزانية الحملة الفائزة واختبار زوايا جديدة لجمهور أوسع، مع هدف الوصول إلى 800+ طلب شهرياً مع الحفاظ على CPA أقل من 65 جنيه.',
    phaseStatus: 'In Progress',
    updatedAt: '2026-08-15'
  }
};

