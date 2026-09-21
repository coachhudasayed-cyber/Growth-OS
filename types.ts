export type UserRole = 'admin' | 'client' | 'employee';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string; // Linked client ID if role is 'client'
}

export interface EmployeeAssignment {
  clientId: string;
  compensation: number;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  assignments: EmployeeAssignment[];
}

export type ClientStatus = 'active' | 'paused' | 'finished';
export type ClientRole = 'admin' | 'client' | 'employee';

export interface Client {
  id: string;
  name: string;             // اسم العميل
  brandName: string;        // اسم البراند
  phone: string;            // رقم الهاتف
  email: string;            // البريد الإلكتروني
  brandPageUrl: string;     // رابط صفحة البراند
  websiteUrl: string;       // رابط الموقع
  formUrl: string;          // رابط الفورم
  formAnswersUrl?: string;  // رابط إجابات الفورم (اختياري)
  status: ClientStatus;     // Active, Paused, Finished
  clientRole?: ClientRole;  // المسمى (أدمن - عميل - موظف)
  createdAt: string;
}

export interface TodoTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: string;
}

export interface BudgetRechargeRecord {
  id: string;
  date: string;          // تاريخ الشحن / تسجيل الميزانية
  amount: number;        // القيمة (EGP)
  expectedDays: number;  // عدد الأيام
  startDate: string;     // تاريخ البداية
  endDate: string;       // تاريخ الانتهاء
  notes?: string;        // ملاحظات الشحن/الميزانية
  type?: 'initial' | 'recharge'; // نوع العملية (أولية أو إعادة شحن)
}

export interface BudgetAlarm {
  id: string;
  clientId: string;
  brandName: string;
  campaignName?: string;  // اسم الحملة
  amount: number;         // قيمة الميزانية
  startDate: string;      // تاريخ بداية التشغيل (YYYY-MM-DD)
  expectedDays: number;   // عدد الأيام المتوقع أن تكفيها الميزانية
  endDate: string;        // تاريخ انتهاء الميزانية (محسوب تلقائياً)
  platform?: string;      // المنصة
  status?: 'active' | 'paused' | 'completed' | 'needs_recharge'; // الحالة
  notes?: string;         // ملاحظات
  createdAt: string;
  rechargesCount?: number;  // عدد مرات إعادة الشحن
  lastRechargedAt?: string; // تاريخ آخر إعادة شحن
  rechargeHistory?: BudgetRechargeRecord[]; // سجل الميزانيات السابقة وإعادات الشحن
  pausedAt?: string;          // تاريخ بدء إيقاف الحملة مؤقتاً
  totalPausedDays?: number;   // إجمالي أيام التوقف التي أضيفت للدورة الحالية
}

export type PaymentFrequency = 'weekly' | 'semi_monthly' | 'monthly';

export interface Agreement {
  id: string;
  clientId: string;
  brandName: string;
  agreementType: string;         // نوع الاتفاق
  startDate: string;             // بداية الاتفاق
  endDate?: string;              // نهاية الاتفاق (اختياري)
  monthlySalary: number;         // الراتب الشهري
  paymentFrequency: PaymentFrequency; // طريقة التقسيم
  installmentAmount: number;     // قيمة كل دفعة
  notes?: string;
  createdAt: string;
}

export interface DailyWorkLog {
  id: string;
  clientId: string;
  date: string;              // YYYY-MM-DD
  status: 'active' | 'paused'; // شغال (أخضر) / متوقف (أحمر)
  title?: string;            // اسم يوم العمل / العنوان
  daysCount?: number;        // عدد الأيام
  activityDetails: string;   // تفاصيل العمل أو الإيقاف
  createdAt: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'overdue';
export type PaymentCategory = 'media_buying_fees' | 'ad_spend' | 'combined' | 'other';

export interface PaymentRecord {
  id: string;
  agreementId?: string;
  clientId: string;
  brandName: string;
  title?: string;                // وصف / عنوان الدفعة (مثال: دفعة الأسبوع 1، أتعاب الميديا بايينج)
  category?: PaymentCategory;    // نوع الدفعة: أتعاب ميديا باير / صرف إعلانات / مجمع
  date: string;                  // تاريخ الدفعة / الاستحقاق (YYYY-MM-DD)
  amount: number;
  paidAmount?: number;           // المبلغ المدفوع (في حالة الدفع الجزئي)
  remainingAmount?: number;      // المبلغ المتبقي (في حالة الدفع الجزئي)
  method: string;                // تحويل بنكي / فودافون كاش / InstaPay / كارت / كاش
  status: PaymentStatus;         // paid / pending / partial / overdue
  weekNumber?: number;           // رقم الأسبوع (اختياري)
  daysCovered?: number;          // عدد الأيام المدفوعة (مثلا 7 أيام)
  periodStartDate?: string;      // بداية الفترة الزمنية (YYYY-MM-DD)
  periodEndDate?: string;        // نهاية الفترة الزمنية (YYYY-MM-DD)
  periodCovered?: string;        // نص توضيحي للفترة (مثلا: 01-08-2026 إلى 07-08-2026)
  notes?: string;
  createdAt?: string;
}

export interface BrandAuditProblemSolution {
  id: string;
  problem: string;
  impactOnSales: string;
  priorityLevel: 'عالية جداً' | 'عالية' | 'متوسطة' | 'منخفضة' | string;
  solutionStrategy: string;
  status?: 'قيد التنفيذ' | 'تم التنفيذ';
}

export interface CompetitorItem {
  id: string;

  // 1. بيانات المنافس | Competitor Profile
  name: string;
  competitorType?: 'مباشر' | 'غير مباشر' | 'كبير (Market Leader)' | string;
  pageLink?: string;
  products?: string;
  targetAudience?: string;
  salesChannels?: string;

  // 2. التسعير والعروض | Pricing & Offers
  price?: string; // متوسط الأسعار
  offers?: string; // العروض الحالية
  discounts?: string; // الخصومات
  bundles?: string; // الـBundles
  giftsAndExtras?: string; // الهدايا والمزايا الإضافية
  warrantyAndReturns?: string; // شروط الضمان والاسترجاع

  // 3. التسويق والمحتوى | Marketing & Content
  marketingChannels?: string; // قنوات التسويق
  postingFrequency?: string; // تكرار النشر
  contentType?: string; // أنواع المحتوى
  bestPerformingContent?: string; // أفضل المحتوى + سبب نجاحه
  marketingMessage?: string; // الرسائل التسويقية الأساسية
  photographyStyle?: string; // أسلوب التصوير والـCreative Style
  primaryCta?: string; // الـCTA الأساسي

  // 4. الإعلانات | Advertising
  currentAds?: string; // الإعلانات الحالية
  adCopy?: string; // Ad Copy
  adHook?: string; // Hook
  adCta?: string; // CTA
  landingPageOrPurchaseLink?: string; // Landing Page / رابط الشراء
  offerTypeUsed?: string; // نوع الـOffer المستخدم
  adStrategyNotes?: string; // ملاحظات على استراتيجية الإعلان

  // 5. تجربة العميل | Customer Experience
  landingPageQuality?: string; // جودة صفحة الهبوط
  easeOfPurchase?: string; // سهولة الشراء
  afterSalesService?: string; // خدمة ما بعد البيع
  reviewsAndFeedback?: string; // الريفيوز وملاحظات العملاء
  recurringComplaintsOrObjections?: string; // أكثر الاعتراضات أو المشاكل المتكررة

  // 6. أداء المنافس | Competitive Assessment
  strengths?: string; // نقاط القوة
  weaknesses?: string; // نقاط الضعف
  engagementLevel?: string; // مستوى التفاعل
  winningPatterns?: string; // أهم الـWinning Patterns
  keyDifferentiator?: string; // ما الذي يميزه عن باقي المنافسين؟

  // 7. فرص السوق | Market Opportunities
  marketGaps?: string; // الـGaps الموجودة في السوق
  unexploitedNeeds?: string; // احتياجات غير مستغلة
  opportunitiesToExploit?: string; // فرص يمكن للبراند استغلالها
  ideasToTest?: string; // أفكار يمكن اختبارها

  // 8. التهديدات | Competitive Threats
  biggestThreat?: string; // أكبر تهديد من المنافس
  whyCustomerChoosesThem?: string; // ما الذي يمكن أن يجعل العميل يختاره بدلًا من البراند؟
  movementsToWatch?: string; // أي تحركات تستحق المتابعة

  // 9. التوصيات | Strategic Takeaways
  whatToLearn?: string; // ماذا نتعلم من المنافس؟
  whatNotToCopy?: string; // ماذا لا يجب أن ننسخه؟
  whatToTest?: string; // ما الذي يمكن اختباره؟
  opportunityToExploit?: string; // ما الفرصة التي يجب استغلالها؟
  recommendedAction?: string; // الإجراء المقترح للبراند | Recommended Action

  // للتوافق القديم
  priceDiffReason?: string;
}

export interface AuditCheckItem {
  id: string;
  label: string;
  status: 'ممتاز' | 'جيد' | 'يحتاج تطوير' | 'ضعيف' | 'غير متاح' | string;
  notes?: string;
}

export interface CustomBrandAuditSection {
  id: string;
  title: string;
  itemsTitle: string;
  auditDate: string;
  items: AuditCheckItem[];
}

export interface BrandAudit {
  clientId: string;
  score: number;                 // 0-100
  auditDate?: string;            // تاريخ التقييم (YYYY-MM-DD أو نص عربي)
  createdAt?: string;
  updatedAt?: string;

  // 1. Brand Overview (نبذة عن البراند)
  overview?: {
    brandName?: string;
    industry?: string;
    coreProducts?: string;
    targetAudience?: string;
    avgProductPrice?: string;
    avgMonthlyOrders?: string;
    salesChannels?: string[];
    salesLocations?: string;
    brandStage?: string; // جديد - شغال - بيعمل Scale
    checklist?: AuditCheckItem[];
  };

  // 2. Digital Assets Audit (تقييم الأصول الرقمية)
  digitalAssets?: {
    websiteChecklist?: AuditCheckItem[];
    landingPageChecklist?: AuditCheckItem[];
    contactsChecklist?: AuditCheckItem[];
  };

  // 3. Tracking Audit (تقييم التتبع)
  trackingAudit?: {
    metaPixelStatus?: string;
    capiStatus?: string;
    eventsNotes?: string;
    eventsChecklist?: AuditCheckItem[];
    checklist?: AuditCheckItem[];
  };

  // 4. Creative & Content Audit (تقييم المحتوى والكريتيف)
  creativeAudit?: {
    brandIdentity?: string;
    contentQuality?: string;
    ugcContent?: string;
    hooksQuality?: string;
    valueProposition?: string;
    offersAnalysis?: string;
    brandIdentityChecklist?: AuditCheckItem[];
    contentQualityChecklist?: AuditCheckItem[];
    ugcChecklist?: AuditCheckItem[];
    hooksChecklist?: AuditCheckItem[];
    valuePropChecklist?: AuditCheckItem[];
    offersChecklist?: AuditCheckItem[];
  };

  // 5. Social Media Audit (تقييم السوشيال ميديا)
  socialMediaAudit?: {
    pageAppearance?: string;
    contentRegularity?: string;
    customerServiceNotes?: string;
    checklist?: AuditCheckItem[];
  };

  // 6. Operations Audit (تقييم التشغيل)
  operationsAudit?: {
    packagingGifts?: string;
    replySpeed?: string;
    customerServiceQuality?: string;
    shippingDuration?: string;
    returnPolicy?: string;
    stockAvailability?: string;
    teamCapacity?: string;
    checklist?: AuditCheckItem[];
  };

  // 7. Sales Funnel Audit (تقييم رحلة العميل)
  salesFunnel?: {
    entrySources?: string;
    landingPoint?: string;
    purchaseMethod?: string;
    dropOffPoints?: string;
    checklist?: AuditCheckItem[];
  };

  // 8. Unit Economics and Pricing (تحليل ربحية المنتج وتسعيرته)
  unitEconomics?: {
    avgPriceRange?: string;
    competitorComparison?: string;
    priceJustification?: string;
    valueVsPrice?: string;
    offerSupport?: string;
    profitMargin?: string;
    allowsAds?: string;
    checklist?: AuditCheckItem[];
  };

  // 9. Historical Ads Analysis (تحليل الإعلانات السابقة)
  historicalAds?: {
    bestCampaign?: string;
    worstCampaign?: string;
    highestRoas?: string;
    lowestCpa?: string;
    bestAudience?: string;
    bestAd?: string;
    successReasons?: string;
    failureReasons?: string;
    checklist?: AuditCheckItem[];
  };

  // 10. Competitor Analysis (تحليل المنافسين)
  competitors?: CompetitorItem[];

  // 11. SWOT Analysis
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // 12. Customer Persona (تحليل العميل المستهدف)
  customerPersona?: {
    targetAudienceDetails?: {
      ageRange?: string;
      gender?: string;
      incomeLevel?: string;
      interests?: string;
      lifestyle?: string;
      location?: string;
    };
    insights?: {
      painPoints?: string;
      buyingMotivation?: string;
      buyingTriggers?: string;
      objections?: string;
    };
    positioning?: {
      coreValue?: string;
      usp?: string;
      coreMessage?: string;
      firstImpression?: string;
      marketTier?: string;
      identityClarity?: string;
      growthReadiness?: string;
    };
    targetAudienceChecklist?: AuditCheckItem[];
    insightsChecklist?: AuditCheckItem[];
    positioningChecklist?: AuditCheckItem[];
    checklist?: AuditCheckItem[];
  };

  // 13. Main Problems & Solutions (أهم المشاكل وحلها)
  problemsAndSolutions?: BrandAuditProblemSolution[];

  // Custom audit sections created by the admin
  customSections?: CustomBrandAuditSection[];

  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    snapchat?: string;
  };
  notes: string;
}

export type ContentFormat = 'reel' | 'post' | 'design' | 'story';
export type ContentStatus = 'draft' | 'review' | 'approved' | 'published';

export interface ContentPlanItem {
  id: string;
  clientId: string;
  title: string;
  format: ContentFormat;
  status: ContentStatus;
  publishDate: string;
  details: string;
  platforms?: string[];
  category?: string;
  goal?: string;
  idea?: string;
  ideaDescription?: string;
  isExecuted?: boolean;
  notes?: string;
}

export type AdStageType =
  | 'Launch'
  | 'Testing'
  | 'Validation'
  | 'Scaling'
  | 'Retargeting'
  | 'Creative Refresh'
  | 'Optimization'
  | string;

export type AdPhaseStatus = 'Not Started' | 'In Progress' | 'Completed' | string;

export interface ClientAdsStageStrategy {
  currentStage: AdStageType;
  overallStrategy: string;
  phaseStatus: AdPhaseStatus;
  updatedAt?: string;
}

export type AdCreativeType =
  | 'UGC'
  | 'Video'
  | 'Static'
  | 'Carousel'
  | 'Founder'
  | 'Unboxing'
  | 'Problem-Solution'
  | 'Testimonial'
  | string;

export type AdItemStatus =
  | 'Planned'
  | 'Ready'
  | 'Live'
  | 'Paused'
  | 'Completed'
  | 'Winner'
  | 'Loser'
  | string;

export interface AdItem {
  id: string;
  name: string;
  creative?: string;
  creativeType?: AdCreativeType;
  angle?: string;
  hook?: string;
  primaryText?: string;
  headline?: string;
  cta?: string;
  destination?: 'Website' | 'Landing Page' | 'WhatsApp' | 'Instagram DM' | string;
  notes?: string;
  status: AdItemStatus;
}

export interface AdSetItem {
  id: string;
  name: string;
  objectiveOrRole?: string; // الدور داخل الحملة: Broad, Retargeting, Interest, etc.
  budgetType?: 'Campaign Controlled' | 'Ad Set Controlled' | string;
  budget?: number | string;
  audienceTargeting?: string;
  location?: string;
  age?: string;
  gender?: 'All' | 'Men' | 'Women' | 'الكل' | 'رجال' | 'نساء' | string;
  placements?: string;
  notes?: string;
  ads: AdItem[];
}

export interface CampaignActualResults {
  actualSpend?: number | string;
  impressions?: number | string;
  reach?: number | string;
  ctr?: number | string;
  cpc?: number | string;
  cpm?: number | string;
  atc?: number | string;
  purchasesOrLeads?: number | string;
  cpaOrCac?: number | string;
  cvr?: number | string;
  roas?: number | string;
  performanceStatus?: 'Winner' | 'Needs More Data' | 'Loser' | 'فائز' | 'يحتاج بيانات أكثر' | 'خاسر' | string;
}

export interface CampaignLearningsAndDecision {
  whatWorked?: string;
  whatDidntWork?: string;
  bestCreative?: string;
  bestAngle?: string;
  bestAudience?: string;
  insightsNotes?: string;
  decision?: 'Keep' | 'Pause' | 'Scale' | 'Iterate' | 'Retest' | 'استمرار' | 'إيقاف' | 'توسيع' | 'تطوير / تعديل' | 'إعادة الاختبار' | string;
  nextStep?: string;
}

export type AdCampaignType = 'CBO' | 'ABO' | string;

export interface StrategyDetails {
  startDate?: string;
  endDate?: string;
  stage?: AdStageType;
  phaseStatus?: AdPhaseStatus;
  overallStrategy?: string;
  targetAudience?: string;
  strategicGoals?: string[];
  totalBudget?: number | string;
  notes?: string;
}

export interface CampaignPlanEntry {
  id: string;
  campaignName: string;
  platform?: string;
  platforms?: string[];
  campaignStage?: AdStageType;
  startDate?: string;
  endDate?: string;
  objective: string;
  campaignType?: 'CBO' | 'ABO' | string;
  campaignBudget?: number | string;
  primaryKpi?: string;
  targetKpi?: string;
  testingHypothesis?: string;
  campaignStrategyNotes?: string;
  status?: 'planned' | 'active' | 'completed' | 'paused' | string;
  adSets?: AdSetItem[];
  results?: CampaignActualResults;
  learnings?: CampaignLearningsAndDecision;
}

export interface AdsPlanItem {
  id: string;
  clientId: string;
  title?: string;

  // New Unified Strategy Information (الاستراتيجية المحددة بالتواريخ والأهداف)
  strategy?: StrategyDetails;

  // Multiple Campaigns inside this Strategy Plan (الحملات الإعلانية داخل الخطة)
  campaigns?: CampaignPlanEntry[];

  // 1. Campaign Information (بيانات الحملة - للتوافق مع السجلات السابقة)
  campaignName?: string;
  platform?: string; // Meta / TikTok / Google / Snapchat
  platforms?: string[]; // للتوافق القديم
  campaignStage?: AdStageType;
  startDate?: string;
  endDate?: string;
  objective?: string; // مبيعات / زيارات / تفاعل / ليدز
  campaignType?: 'CBO' | 'ABO' | string;
  campaignBudget?: number | string;
  primaryKpi?: string;
  targetKpi?: string;
  testingHypothesis?: string;
  campaignStrategyNotes?: string;

  // للتوافق القديم
  targetAudience?: string;
  adCopy?: string;
  status?: 'planned' | 'active' | 'completed' | 'paused' | string;

  // 2. Ad Sets (مجموعات الإعلانات)
  adSets?: AdSetItem[];

  // 3. Results & Learnings (النتائج والتعلم)
  results?: CampaignActualResults;
  learnings?: CampaignLearningsAndDecision;

  createdAt?: string;
  updatedAt?: string;
}

export interface DailyReportQuestion {
  id: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'number';
  required?: boolean;
  standardKey?: string;
}

export interface ClientDailyReportQuestionAnswer {
  id: string;
  question: string;
  answer: string | number;
  type?: 'text' | 'textarea' | 'number';
  standardKey?: string;
}

export interface ClientDailyReport {
  id: string;
  clientId: string;
  date: string;
  ordersCount: number | string;      // عدد أوردرات النهاردة و كام أوردر لكل منتج؟
  salesAmount: number;               // إجمالي قيمة المبيعات (جنيه)
  topProductsSold?: string;          // (اختياري / ملغى)
  cancelledOrdersCount?: number;     // عدد الأوردرات الملغية
  cancellationReason?: string;       // سبب الإلغاء الأكثر تكرارًا
  commonQuestions?: string;          // أكتر سؤال اتكرر النهارده او طلبات معينة من العملاء
  customerObjections?: string;       // أكتر اعتراضات من العملاء
  inventoryIssues?: string;          // هل فيه مشكلة في المخزون او فيه منتج معين قرب يخلص؟
  shippingOperationalIssues?: string;// هل فيه مشكلة في الشحن أو التشغيل او اي حاجة واجهتكوا النهاردة؟
  updatesOrOffers?: string;          // هل فيه اي تعديلات في المنتجات او الاسعار او العروض تمت جديدة؟
  returnsCountAndType?: string;      // 10. عدد المرتجعات اليوم؟ و نوعها:
  inquiriesCount?: number;
  leadsCount?: number;
  topPlatforms?: string;
  challenges?: string;
  notes?: string;
  reviewed?: boolean;
  customAnswers?: Record<string, string | number>;
  questionsList?: ClientDailyReportQuestionAnswer[];
}

export type WeeklyReportSectionId =
  | 'performance'
  | 'wow'
  | 'campaigns'
  | 'analysis'
  | 'plan'
  | 'summary';

export interface WeeklyReportQuestion {
  id: string;
  sectionId: WeeklyReportSectionId;
  label: string;
  placeholder?: string;
  type: 'number' | 'text' | 'textarea';
  required?: boolean;
  standardKey?: string;
}

export interface WeeklyReportQuestionAnswer {
  id: string;
  sectionId?: WeeklyReportSectionId;
  question: string;
  answer: string | number;
  type?: 'number' | 'text' | 'textarea';
  standardKey?: string;
}

export interface WeeklyReport {
  id: string;
  clientId: string;
  title?: string; // اسم أو عنوان مخصص للتقرير (مثل: أسبوع العيد، الأسبوع الأول...)
  weekStartDate: string;
  weekEndDate?: string;
  clientViewed?: boolean; // هل اتطلع العميل عليه أم لا

  // 1. ملخص الأداء | Weekly Performance
  totalSpent: number;                   // إجمالي الإنفاق | Total Spend (EGP)
  totalOrders: number;                  // إجمالي الطلبات | Total Orders
  totalRevenue?: number;                // إجمالي المبيعات | Total Revenue (EGP)
  salesValue?: number;                  // للتوافق (قيمة المبيعات)
  roas: number;                         // العائد على الإنفاق الإعلاني | ROAS
  cpa?: string | number;                // تكلفة الطلب | CPA
  aov?: string | number;                // متوسط قيمة الطلب | AOV
  conversionRate?: string | number;     // معدل التحويل | Conversion Rate

  // 2. مقارنة بالأسبوع السابق | Week-over-Week
  spendChange?: string;                 // تغير الإنفاق | Spend Change
  ordersChange?: string;                // تغير عدد الطلبات | Orders Change
  revenueChange?: string;               // تغير المبيعات | Revenue Change
  roasChange?: string;                  // تغير ROAS | ROAS Change
  cpaChange?: string;                   // تغير CPA | CPA Change
  aovChange?: string;                   // تغير AOV | AOV Change

  // 3. أداء الحملات | Campaign Performance
  bestCampaign?: string;                // أفضل حملة | Best Performing Campaign + سبب النجاح
  weakestCampaign?: string;             // أضعف حملة | Weakest Campaign + سبب الضعف
  improvingCampaigns?: string;          // الحملات التي تحسنت | Improving Campaigns
  decliningCampaigns?: string;          // الحملات التي تراجعت | Declining Campaigns
  scalingCampaigns?: string;            // الحملات التي تحتاج Scaling
  optimizationPauseCampaigns?: string;  // الحملات التي تحتاج Optimization / Pause

  // 4. التحليل الأسبوعي | Weekly Analysis
  whatWorkedWell?: string;              // إيه اللي اشتغل كويس؟ | What Worked Well
  whatNeedsImprovement?: string;        // إيه اللي محتاج يتحسن؟ | What Needs Improvement
  keyChanges?: string;                  // أهم التغييرات هذا الأسبوع | Key Changes
  whatChangedFromLastWeek?: string;     // للتوافق
  keyInsight?: string;                  // أهم Insight من بيانات الأسبوع | Key Insight of the Week
  salesAndLeadNotes?: string;           // ملاحظات بيانات المبيعات والعملاء | Sales & Lead Data Notes
  dailyClientDataNotes?: string;        // للتوافق

  // 5. خطة الأسبوع القادم | Next Week Action Plan
  nextWeekGoal?: string;                // الهدف الرئيسي | Next Week Goal
  topPriorities?: string;               // أهم الأولويات | Top Priorities
  campaignAdjustments?: string;         // تعديلات الحملات | Campaign Adjustments
  campaignAdjustmentsNextWeek?: string; // للتوافق
  newTests?: string;                    // الاختبارات الجديدة | New A/B Tests
  newTestsNextWeek?: string;            // للتوافق
  clientRequiredAction?: string;        // المطلوب من العميل | Action Required from Client
  clientRequiredActionNextWeek?: string;// للتوافق

  // 6. ملخص القرار | Weekly Decision Summary
  decisionSummary?: string;             // ملخص القرار | Weekly Decision Summary (ملخص قصير يوضح أهم ما حدث هذا الأسبوع، أهم استنتاج تم الوصول إليه من البيانات، وأهم القرارات والتعديلات التي سيتم تنفيذها خلال الأسبوع القادم)

  campaignsPerformanceSummary?: string;// للتوافق
  totalReach?: number;                  // للتوافق
  totalConversions?: number;            // للتوافق
  notes?: string;                       // ملاحظات عامة

  // Dynamic / Custom Questions & Answers
  customAnswers?: Record<string, string | number>;
  questionsList?: WeeklyReportQuestionAnswer[];
  customSectionsQuestions?: WeeklyReportQuestion[];
}

export type MonthlyReportSectionId =
  | 'performance'
  | 'mom'
  | 'campaigns'
  | 'creatives'
  | 'products'
  | 'insights'
  | 'learnings'
  | 'growth'
  | 'strategy'
  | 'evaluation';

export interface MonthlyReportQuestion {
  id: string;
  sectionId: MonthlyReportSectionId;
  label: string;
  placeholder?: string;
  type: 'number' | 'text' | 'textarea';
  required?: boolean;
  standardKey?: string;
}

export interface MonthlyReportQuestionAnswer {
  id: string;
  sectionId?: MonthlyReportSectionId;
  question: string;
  answer: string | number;
  type?: 'number' | 'text' | 'textarea';
  standardKey?: string;
}

export interface MonthlyReport {
  id: string;
  clientId: string;
  title?: string; // اسم أو عنوان مخصص للتقرير (مثل: تقرير شهر أغسطس، مراجعة الصيف...)
  month: string; // e.g. "2026-08" or "أغسطس 2026"
  startDate?: string;
  endDate?: string;
  createdAt?: string;

  // 1. ملخص الأداء | Monthly Performance
  totalSpent?: number;
  totalOrders?: number;
  totalRevenue?: number;
  roas?: number;
  cpa?: string;
  aov?: string;
  conversionRate?: string;

  // 2. مقارنة بالشهر السابق | Month-over-Month
  spendChange?: string;
  ordersChange?: string;
  revenueChange?: string;
  roasChange?: string;
  cpaChange?: string;
  aovChange?: string;

  // 3. أداء الحملات | Campaign Performance
  bestCampaign?: string;
  weakestCampaign?: string;
  improvingCampaigns?: string;
  decliningCampaigns?: string;

  // 4. أداء المحتوى والإعلانات | Creative Performance
  bestCreative?: string;
  bestHook?: string;
  bestMarketingAngle?: string;
  bestContentFormat?: string;
  creativesNeedRefresh?: string;

  // 5. أداء المنتجات | Product Performance
  topPerformingProducts?: string;
  lowPerformingProducts?: string;
  growthOpportunityProducts?: string;

  // 6. ملاحظات العملاء والمبيعات | Customer & Sales Insights
  topCustomerObjections?: string;
  keySalesInsights?: string;
  pricingShippingStockIssues?: string;

  // 7. أهم ما تعلمناه | Key Learnings
  whatWorked?: string;
  whatDidntWork?: string;
  keyInsight?: string;

  // 8. فرص النمو | Growth Opportunities
  biggestGrowthOpportunity?: string;
  biggestGrowthChallenge?: string;
  salesGrowthOpportunity?: string;

  // 9. خطة الشهر القادم | Next Month Strategy
  mainGoal?: string;
  targetRevenueOrders?: string;
  targetCpaRoas?: string;
  advertisingStrategy?: string;
  contentStrategy?: string;
  newTests?: string;
  clientActionRequired?: string;

  // 10. التقييم الشهري | Monthly Growth Summary
  monthlyGrowthSummary?: string;        // التقييم الشهري | Monthly Growth Summary (ملخص مختصر يوضح أين كان البراند في بداية الشهر، ماذا تغير خلال الشهر، وما أهم القرارات التي يجب اتخاذها للشهر القادم)

  notes?: string;

  // Dynamic / Custom Questions & Answers
  customAnswers?: Record<string, string | number>;
  questionsList?: MonthlyReportQuestionAnswer[];
  customSectionsQuestions?: MonthlyReportQuestion[];
}

export type QuarterlyReportSectionId =
  | 'performance'
  | 'qoq'
  | 'campaigns'
  | 'creatives'
  | 'products'
  | 'insights'
  | 'learnings'
  | 'growth'
  | 'review'
  | 'strategy'
  | 'plan90'
  | 'summary';

export interface QuarterlyReportQuestion {
  id: string;
  sectionId: QuarterlyReportSectionId;
  label: string;
  placeholder?: string;
  type: 'number' | 'text' | 'textarea';
  required?: boolean;
  standardKey?: string;
}

export interface QuarterlyReportQuestionAnswer {
  id: string;
  sectionId?: QuarterlyReportSectionId;
  question: string;
  answer: string | number;
  type?: 'number' | 'text' | 'textarea';
  standardKey?: string;
}

export interface QuarterlyReport {
  id: string;
  clientId: string;
  title?: string; // اسم أو عنوان مخصص للتقرير (مثل: تقرير الربع الأول، خطة Q1 للنمو والتوسع...)
  quarter: string; // e.g. "Q1 2026", "الربع (فبراير - أبريل)", "تقرير الربع الأول"
  year?: number;
  startDate?: string;
  endDate?: string;
  month1Name?: string; // e.g. "فبراير"
  month2Name?: string; // e.g. "مارس"
  month3Name?: string; // e.g. "أبريل"
  createdAt?: string;

  // 1. ملخص الأداء | Quarterly Performance
  totalSpent?: number;
  totalOrders?: number;
  totalRevenue?: number;
  roas?: number;
  cpa?: string | number;
  aov?: string | number;
  conversionRate?: string;

  // 2. مقارنة بالربع السابق | Quarter-over-Quarter
  spendChange?: string;
  ordersChange?: string;
  revenueChange?: string;
  roasChange?: string;
  cpaChange?: string;
  aovChange?: string;

  // 3. أداء الحملات | Campaign Performance
  topPerformingCampaigns?: string;
  weakestCampaigns?: string;
  highestGrowthCampaigns?: string;
  pausedCampaignsReasons?: string;
  keyCampaignLearnings?: string;

  // 4. أداء الإعلانات والمحتوى | Creative Performance
  topPerformingCreatives?: string;
  topPerformingHooks?: string;
  bestMarketingAngles?: string;
  bestContentFormats?: string;
  creativesNeedRefresh?: string;
  keyCreativeLearnings?: string;

  // 5. أداء المنتجات والعروض | Product & Offer Performance
  topPerformingProducts?: string;
  lowPerformingProducts?: string;
  productGrowthOpportunities?: string;
  offerPerformance?: string;
  upsellCrossSellOpportunities?: string;

  // 6. سلوك العملاء والمبيعات | Customer & Sales Insights
  topCustomerObjections?: string;
  keySalesInsights?: string;
  pricingShippingStockIssues?: string;
  customerBehaviorChanges?: string;

  // 7. أهم النتائج والتعلم | Key Learnings
  biggestWin?: string;
  biggestChallenge?: string;
  keyLearnings?: string;
  keyStrategicInsight?: string;

  // 8. فرص النمو | Growth Opportunities
  biggestGrowthOpportunity?: string;
  salesGrowthOpportunity?: string;
  productOfferOpportunities?: string;
  scalingOpportunities?: string;

  // 9. التقييم الاستراتيجي | Strategic Review
  whatChanged?: string;
  isGrowthSustainable?: string;
  keyGrowthBarriers?: string;
  whatShouldContinue?: string;
  whatShouldChange?: string;

  // 10. خطة الربع القادم | Next Quarter Strategy
  mainGoal?: string;
  revenueOrderTargets?: string;
  targetCpaRoas?: string;
  advertisingStrategy?: string;
  contentStrategy?: string;
  productOfferStrategy?: string;
  newTests?: string;
  nextQuarterScalingOpportunities?: string;
  clientActionRequired?: string;

  // 11. خطة الـ90 يوم | 90-Day Growth Plan
  month1Plan?: string;
  month2Plan?: string;
  month3Plan?: string;

  // 12. ملخص النمو | Quarterly Growth Summary
  quarterlyGrowthSummary?: string;

  notes?: string;

  // Dynamic / Custom Questions & Answers
  customAnswers?: Record<string, string | number>;
  questionsList?: QuarterlyReportQuestionAnswer[];
  customSectionsQuestions?: QuarterlyReportQuestion[];
}

export interface AttachedReportFile {
  id: string;
  name: string;
  size?: string;
  type?: string;
  dataUrl?: string;
}

export interface AdminDailyReport {
  id: string;
  clientId: string;
  date: string;
  campaigns?: string[];
  quickEvaluation?: '🟢 ممتاز' | '🟡 طبيعي' | '🟠 محتاج متابعة' | '🔴 سيئ' | string;
  attachedFiles?: AttachedReportFile[];
  mainNotes?: string;
  mediaBuyerNotes?: string;
  tasksDone?: string;
  optimizationsPerformed?: string;
}

export interface NoteItem {
  id: string;
  clientId: string;
  title: string;
  content: string;
  author: string;
  authorRole: UserRole;
  isPinned: boolean;
  status?: 'قيد المتابعة' | 'تم التنفيذ';
  date: string;
}

export type AdminTab = 
  | 'daily_work'
  | 'audit'
  | 'content'
  | 'ads_plan'
  | 'ads_budget'
  | 'client_daily'
  | 'weekly'
  | 'monthly_reports'
  | 'admin_daily'
  | 'notes';

export type ClientTab = 
  | 'audit'
  | 'content'
  | 'ads_budget'
  | 'client_daily'
  | 'weekly'
  | 'monthly_reports'
  | 'notes';
