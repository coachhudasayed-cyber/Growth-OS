import { useSupabaseSetting } from '../../lib/useSupabaseSetting';
import React, { useState, useEffect } from 'react';
import {
  CalendarRange,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Download,
  Loader2,
  Eye,
  X,
  Target,
  ArrowUpRight,
  ShoppingCart,
  DollarSign,
  Percent,
  CheckCircle2,
  Lightbulb,
  CheckSquare,
  AlertTriangle,
  Megaphone,
  PackageCheck,
  MessageSquare,
  Compass,
  Repeat,
  Video,
  FileSpreadsheet,
  FileText,
  Check,
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import {
  MonthlyReport,
  QuarterlyReport,
  UserRole,
  MonthlyReportQuestion,
  MonthlyReportQuestionAnswer,
  MonthlyReportSectionId
} from '../../types';
import { QuarterlyReportsSubTab } from './QuarterlyReportsSubTab';
import { ReportFilterBar, DateFilterPreset, getDateRangeFromPreset } from '../ReportFilterBar';

interface MonthlyReportsTabProps {
  reports?: MonthlyReport[];
  quarterlyReports?: QuarterlyReport[];
  clientId: string;
  brandName?: string;
  userRole?: UserRole;
  onAddReport?: (rep: Omit<MonthlyReport, 'id'>) => void;
  onUpdateReport?: (id: string, fields: Partial<MonthlyReport>) => void;
  onDeleteReport?: (id: string) => void;
  onAddQuarterlyReport?: (rep: Omit<QuarterlyReport, 'id' | 'createdAt'>) => void;
  onUpdateQuarterlyReport?: (id: string, fields: Partial<QuarterlyReport>) => void;
  onDeleteQuarterlyReport?: (id: string) => void;
}

// 1. Default Standard Questions categorized into 10 Sections
export const DEFAULT_MONTHLY_REPORT_QUESTIONS: MonthlyReportQuestion[] = [
  // 1. ملخص الأداء | Monthly Performance
  {
    id: 'm_perf_spend',
    sectionId: 'performance',
    label: 'إجمالي الإنفاق | Total Spend (EGP) *',
    placeholder: '50000',
    type: 'number',
    required: true,
    standardKey: 'totalSpent'
  },
  {
    id: 'm_perf_orders',
    sectionId: 'performance',
    label: 'إجمالي الطلبات | Total Orders *',
    placeholder: '450',
    type: 'number',
    required: true,
    standardKey: 'totalOrders'
  },
  {
    id: 'm_perf_revenue',
    sectionId: 'performance',
    label: 'إجمالي المبيعات | Total Revenue (EGP) *',
    placeholder: '225000',
    type: 'number',
    required: true,
    standardKey: 'totalRevenue'
  },
  {
    id: 'm_perf_roas',
    sectionId: 'performance',
    label: 'العائد على الإنفاق الإعلاني | ROAS *',
    placeholder: '4.5',
    type: 'number',
    required: true,
    standardKey: 'roas'
  },
  {
    id: 'm_perf_cpa',
    sectionId: 'performance',
    label: 'تكلفة الطلب | CPA',
    placeholder: 'مثال: 110 EGP',
    type: 'text',
    standardKey: 'cpa'
  },
  {
    id: 'm_perf_aov',
    sectionId: 'performance',
    label: 'متوسط قيمة الطلب | AOV',
    placeholder: 'مثال: 500 EGP',
    type: 'text',
    standardKey: 'aov'
  },
  {
    id: 'm_perf_cvr',
    sectionId: 'performance',
    label: 'معدل التحويل | Conversion Rate',
    placeholder: 'مثال: 3.5%',
    type: 'text',
    standardKey: 'conversionRate'
  },

  // 2. مقارنة بالشهر السابق | Month-over-Month
  {
    id: 'm_mom_spend',
    sectionId: 'mom',
    label: 'تغير الإنفاق | Spend Change',
    placeholder: 'مثال: زيادة 20% مقارنة بالشهر السابق...',
    type: 'textarea',
    standardKey: 'spendChange'
  },
  {
    id: 'm_mom_orders',
    sectionId: 'mom',
    label: 'تغير عدد الطلبات | Orders Change',
    placeholder: 'مثال: زيادة بنسبة 25% في عدد الطلبات...',
    type: 'textarea',
    standardKey: 'ordersChange'
  },
  {
    id: 'm_mom_revenue',
    sectionId: 'mom',
    label: 'تغير المبيعات | Revenue Change',
    placeholder: 'مثال: نمو المبيعات بنسبة 30%...',
    type: 'textarea',
    standardKey: 'revenueChange'
  },
  {
    id: 'm_mom_roas',
    sectionId: 'mom',
    label: 'تغير ROAS | ROAS Change',
    placeholder: 'مثال: تحسن من 3.8x إلى 4.5x...',
    type: 'textarea',
    standardKey: 'roasChange'
  },
  {
    id: 'm_mom_cpa',
    sectionId: 'mom',
    label: 'تغير CPA | CPA Change',
    placeholder: 'مثال: انخفض من 130 إلى 110 جنيه...',
    type: 'textarea',
    standardKey: 'cpaChange'
  },
  {
    id: 'm_mom_aov',
    sectionId: 'mom',
    label: 'تغير AOV | AOV Change',
    placeholder: 'مثال: ارتفع من 450 إلى 500 جنيه...',
    type: 'textarea',
    standardKey: 'aovChange'
  },

  // 3. أداء الحملات | Campaign Performance
  {
    id: 'm_camp_best',
    sectionId: 'campaigns',
    label: 'أفضل حملة | Best Performing Campaign + سبب النجاح',
    placeholder: 'اسم الحملة وأسباب تحقيقها أعلى عائد ومبيعات...',
    type: 'textarea',
    standardKey: 'bestCampaign'
  },
  {
    id: 'm_camp_weakest',
    sectionId: 'campaigns',
    label: 'أضعف حملة | Weakest Campaign + سبب الضعف',
    placeholder: 'اسم الحملة وأسباب ضعف أدائها...',
    type: 'textarea',
    standardKey: 'weakestCampaign'
  },
  {
    id: 'm_camp_improving',
    sectionId: 'campaigns',
    label: 'الحملات التي تحسنت | Improving Campaigns',
    placeholder: 'الحملات التي شهدت نمواً وتحسناً ملحوظاً...',
    type: 'textarea',
    standardKey: 'improvingCampaigns'
  },
  {
    id: 'm_camp_declining',
    sectionId: 'campaigns',
    label: 'الحملات التي تراجعت | Declining Campaigns',
    placeholder: 'الحملات التي بدأت تتراجع وتتطلب تعديلاً أو إيقافاً...',
    type: 'textarea',
    standardKey: 'decliningCampaigns'
  },

  // 4. أداء المحتوى والإعلانات | Creative Performance
  {
    id: 'm_creat_best',
    sectionId: 'creatives',
    label: 'أفضل إعلان | Top Performing Creative + سبب النجاح',
    placeholder: 'الإعلان الأفضل أداءً وتحويلاً وتكلفة...',
    type: 'textarea',
    standardKey: 'bestCreative'
  },
  {
    id: 'm_creat_hook',
    sectionId: 'creatives',
    label: 'أفضل هوك | Best Hook',
    placeholder: 'أول 3 ثواني الأكثر جذباً للانتباه ورفع نسبة المشاهدة...',
    type: 'textarea',
    standardKey: 'bestHook'
  },
  {
    id: 'm_creat_angle',
    sectionId: 'creatives',
    label: 'أفضل زاوية تسويقية | Best Marketing Angle',
    placeholder: 'الزاوية التسويقية الأكثر إقناعاً وتحقيقاً للطلبات...',
    type: 'textarea',
    standardKey: 'bestMarketingAngle'
  },
  {
    id: 'm_creat_format',
    sectionId: 'creatives',
    label: 'أفضل نوع محتوى | Best Content Format',
    placeholder: 'ريلز، UGC، صور كاروسيل، فيديو تجربة منتج...',
    type: 'textarea',
    standardKey: 'bestContentFormat'
  },
  {
    id: 'm_creat_refresh',
    sectionId: 'creatives',
    label: 'الإعلانات التي تحتاج تجديد | Creatives Need Refresh',
    placeholder: 'الإعلانات التي استهلكت وتحتاج تصوير أفكار جديدة...',
    type: 'textarea',
    standardKey: 'creativesNeedRefresh'
  },

  // 5. أداء المنتجات | Product Performance
  {
    id: 'm_prod_top',
    sectionId: 'products',
    label: 'أفضل المنتجات مبيعاً | Top Performing Products',
    placeholder: 'المنتجات الأكثر مبيعاً وتحقيقاً للأرباح...',
    type: 'textarea',
    standardKey: 'topPerformingProducts'
  },
  {
    id: 'm_prod_low',
    sectionId: 'products',
    label: 'المنتجات الضعيفة | Low Performing Products',
    placeholder: 'المنتجات ذات المبيعات المنخفضة وأسباب عدم الإقبال عليها...',
    type: 'textarea',
    standardKey: 'lowPerformingProducts'
  },
  {
    id: 'm_prod_growth',
    sectionId: 'products',
    label: 'منتجات واعدة وفرص نمو | Growth Opportunity Products',
    placeholder: 'منتجات تمتلك فرصة كبيرة للـ Scaling أو عمل بكجات...',
    type: 'textarea',
    standardKey: 'growthOpportunityProducts'
  },

  // 6. ملاحظات العملاء والمبيعات | Customer & Sales Insights
  {
    id: 'm_ins_objections',
    sectionId: 'insights',
    label: 'أهم اعتراضات العملاء | Top Customer Objections',
    placeholder: 'الاعتراضات المتكررة (سعر، شحن، خامة، تفاصيل مقاسات)...',
    type: 'textarea',
    standardKey: 'topCustomerObjections'
  },
  {
    id: 'm_ins_sales',
    sectionId: 'insights',
    label: 'أهم ملاحظات المبيعات | Key Sales Insights',
    placeholder: 'ملاحظات فريق خدمة العملاء وتأكيد الأوردرات ونسبة الاستلام...',
    type: 'textarea',
    standardKey: 'keySalesInsights'
  },
  {
    id: 'm_ins_issues',
    sectionId: 'insights',
    label: 'مشاكل التسعير والشحن والمخزون | Pricing, Shipping & Stock Issues',
    placeholder: 'نواقص المخزون، تأخيرات الشحن، أو تحديات التسعير...',
    type: 'textarea',
    standardKey: 'pricingShippingStockIssues'
  },

  // 7. أهم ما تعلمناه | Key Learnings
  {
    id: 'm_learn_worked',
    sectionId: 'learnings',
    label: 'إيه اللي اشتغل كويس هذا الشهر؟ | What Worked',
    placeholder: 'الاستراتيجيات والقرارات التي حققت نتائج إيجابية ملموسة...',
    type: 'textarea',
    standardKey: 'whatWorked'
  },
  {
    id: 'm_learn_didnt',
    sectionId: 'learnings',
    label: 'إيه اللي لم ينجح ومحتاج مراجعة؟ | What Didn\'t Work',
    placeholder: 'التجارب التي لم تحقق المتوقع والدروس المستفادة منها...',
    type: 'textarea',
    standardKey: 'whatDidntWork'
  },
  {
    id: 'm_learn_insight',
    sectionId: 'learnings',
    label: 'أهم Insight واستنتاج هذا الشهر | Key Insight',
    placeholder: 'الاستنتاج الاستراتيجي الأهم من سلوك الجمهور وبيانات الشهر...',
    type: 'textarea',
    standardKey: 'keyInsight'
  },

  // 8. فرص النمو | Growth Opportunities
  {
    id: 'm_grow_opp',
    sectionId: 'growth',
    label: 'أكبر فرصة للنمو | Biggest Growth Opportunity',
    placeholder: 'الفرصة الأكبر لمضاعفة المبيعات والتوسع خلال الفترة القادمة...',
    type: 'textarea',
    standardKey: 'biggestGrowthOpportunity'
  },
  {
    id: 'm_grow_challenge',
    sectionId: 'growth',
    label: 'أكبر تحدي للنمو | Biggest Growth Challenge',
    placeholder: 'العائق الرئيسي الذي يجب التغلب عليه لتسريع النمو...',
    type: 'textarea',
    standardKey: 'biggestGrowthChallenge'
  },
  {
    id: 'm_grow_sales',
    sectionId: 'growth',
    label: 'فرص نمو المبيعات | Sales Growth Opportunities',
    placeholder: 'زيادة سلة الشراء، عروض التكرار، أو استهداف شرائح جديدة...',
    type: 'textarea',
    standardKey: 'salesGrowthOpportunity'
  },

  // 9. خطة الشهر القادم | Next Month Strategy
  {
    id: 'm_strat_goal',
    sectionId: 'strategy',
    label: 'الهدف الرئيسي للشهر القادم | Main Goal *',
    placeholder: 'مثال: تحقيق 1.2M مبيعات والحفاظ على ROAS أعلى من 4x',
    type: 'text',
    required: true,
    standardKey: 'mainGoal'
  },
  {
    id: 'm_strat_target_rev',
    sectionId: 'strategy',
    label: 'المستهدف الرقمي (مبيعات / طلبات) | Target Revenue & Orders',
    placeholder: 'مثال: 1,800 طلب / 1,200,000 EGP',
    type: 'text',
    standardKey: 'targetRevenueOrders'
  },
  {
    id: 'm_strat_target_cpa',
    sectionId: 'strategy',
    label: 'مستهدف CPA و ROAS | Target CPA & ROAS',
    placeholder: 'مثال: CPA أقل من 110 EGP و ROAS أعلى من 4.2x',
    type: 'text',
    standardKey: 'targetCpaRoas'
  },
  {
    id: 'm_strat_ads',
    sectionId: 'strategy',
    label: 'استراتيجية الحملات الإعلانية | Advertising Strategy',
    placeholder: 'توزيع الميزانيات، حملات التوسع (Scaling)، وهيكل الحساب...',
    type: 'textarea',
    standardKey: 'advertisingStrategy'
  },
  {
    id: 'm_strat_content',
    sectionId: 'strategy',
    label: 'استراتيجية المحتوى والإعلانات الجديدة | Content Strategy',
    placeholder: 'خطة تصوير الإعلانات، الزوايا الجديدة، والفورمات المستهدفة...',
    type: 'textarea',
    standardKey: 'contentStrategy'
  },
  {
    id: 'm_strat_tests',
    sectionId: 'strategy',
    label: 'الاختبارات الجديدة المخططة | New A/B Tests',
    placeholder: 'اختبارات عروض، لاندنج بيدج، زوايا، أو استهدافات جديدة...',
    type: 'textarea',
    standardKey: 'newTests'
  },
  {
    id: 'm_strat_client',
    sectionId: 'strategy',
    label: 'المطلوب من العميل | Action Required from Client',
    placeholder: 'تجهيز مخزون، تصوير المنتجات الجديدة، اعتماد الميزانيات...',
    type: 'textarea',
    standardKey: 'clientActionRequired'
  },

  // 10. التقييم الشهري | Monthly Growth Summary
  {
    id: 'm_eval_summary',
    sectionId: 'evaluation',
    label: 'التقييم الشهري ومسار نمو البراند | Monthly Growth & Brand Evaluation',
    placeholder: 'اكتب هنا الملخص التنفيذي للشهر:\n1. أين كان البراند في بداية الشهر...\n2. ماذا تغير خلال الشهر والتحسينات المطبقة...\n3. ما أهم القرارات التي يجب اتخاذها للشهر القادم لضمان استمرار النمو...',
    type: 'textarea',
    standardKey: 'monthlyGrowthSummary'
  }
];

export const MONTHLY_SECTIONS: {
  id: MonthlyReportSectionId;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: 'performance',
    title: '1. ملخص الأداء',
    subtitle: 'المقاييس الرئيسية، الإنفاق، والمبيعات والـ ROAS',
    icon: BarChart3,
    color: '#5A5A40'
  },
  {
    id: 'mom',
    title: '2. مقارنة بالشهر السابق',
    subtitle: 'مقارنة Month-over-Month في الإنفاق والطلبات والأداء',
    icon: TrendingUp,
    color: '#1E40AF'
  },
  {
    id: 'campaigns',
    title: '3. أداء الحملات',
    subtitle: 'أفضل الحملات وأضعفها، والتحسينات والتراجع',
    icon: Megaphone,
    color: '#065F46'
  },
  {
    id: 'creatives',
    title: '4. المحتوى والإعلانات',
    subtitle: 'أفضل الإعلانات، الهوكات، الزوايا، وتجديد المحتوى',
    icon: Sparkles,
    color: '#6B21A8'
  },
  {
    id: 'products',
    title: '5. المنتجات والعروض',
    subtitle: 'المنتجات الأكثر مبيعاً والأضعف وفرص النمو',
    icon: PackageCheck,
    color: '#9A3412'
  },
  {
    id: 'insights',
    title: '6. ملاحظات العملاء والمبيعات',
    subtitle: 'اعتراضات العملاء، ملاحظات الشحن، والتسعير والمخزون',
    icon: MessageSquare,
    color: '#374151'
  },
  {
    id: 'learnings',
    title: '7. أهم ما تعلمناه',
    subtitle: 'ما نجح وما لم ينجح وأهم استنتاجات الشهر',
    icon: Lightbulb,
    color: '#B45309'
  },
  {
    id: 'growth',
    title: '8. فرص النمو',
    subtitle: 'أكبر فرص وتحديات التوسع والمبيعات',
    icon: Compass,
    color: '#0F766E'
  },
  {
    id: 'strategy',
    title: '9. خطة الشهر القادم',
    subtitle: 'الأهداف، الاستراتيجيات، التجارب، والمطلوب من العميل',
    icon: Target,
    color: '#C2410C'
  },
  {
    id: 'evaluation',
    title: '10. التقييم الشهري',
    subtitle: 'الملخص التنفيذي لمسار نمو البراند والقرارات القادمة',
    icon: FileText,
    color: '#581C87'
  }
];

export const MonthlyReportsTab: React.FC<MonthlyReportsTabProps> = ({
  reports = [],
  quarterlyReports = [],
  clientId,
  brandName,
  userRole,
  onAddReport,
  onUpdateReport,
  onDeleteReport,
  onAddQuarterlyReport,
  onUpdateQuarterlyReport,
  onDeleteQuarterlyReport
}) => {
  // Sub-pages state: 'monthly' or 'quarterly'
  const [activeSubPage, setActiveSubPage] = useState<'monthly' | 'quarterly'>('monthly');

  const clientReps = reports
    .filter((r) => r.clientId === clientId)
    .sort((a, b) => (b.month || b.startDate || '').localeCompare(a.month || a.startDate || ''));

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. 2026-08

  // Template Questions State (Per-client customizable with Supabase persistence)
  const [questions, setQuestions] = useSupabaseSetting<MonthlyReportQuestion[]>(
    `monthly_report_questions_${clientId}`, clientId, DEFAULT_MONTHLY_REPORT_QUESTIONS, userRole !== 'client'
  );

  const saveQuestionsTemplate = (updatedQuestions: MonthlyReportQuestion[]) => setQuestions(updatedQuestions);

  // Reset section questions to default
  const handleResetSectionQuestions = (sectionId: MonthlyReportSectionId) => {
    const defaultForSection = DEFAULT_MONTHLY_REPORT_QUESTIONS.filter(
      (q) => q.sectionId === sectionId
    );
    const otherQuestions = questions.filter((q) => q.sectionId !== sectionId);
    saveQuestionsTemplate([...otherQuestions, ...defaultForSection]);
  };

  // --- Modal States ---
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState<MonthlyReport | null>(null);
  const [viewingReport, setViewingReport] = useState<MonthlyReport | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<MonthlyReportQuestion | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  // Form Section Tab State (10 Sections)
  const [activeFormTab, setActiveFormTab] = useState<MonthlyReportSectionId>('performance');

  // Filter States (Name & Date/Time)
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Title, Dates / Month
  const [reportTitle, setReportTitle] = useState('');
  const [month, setMonth] = useState(currentMonthStr);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form Values dictionary (id or standardKey -> value)
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});

  // Dynamic Question Editing / Adding States
  const [isAddingQuestionToSection, setIsAddingQuestionToSection] = useState<MonthlyReportSectionId | null>(null);
  const [newQuestionLabel, setNewQuestionLabel] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'number' | 'text' | 'textarea'>('textarea');
  const [newQuestionPlaceholder, setNewQuestionPlaceholder] = useState('');

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionLabel, setEditingQuestionLabel] = useState('');
  const [editingQuestionPlaceholder, setEditingQuestionPlaceholder] = useState('');
  const [editingQuestionType, setEditingQuestionType] = useState<'number' | 'text' | 'textarea'>('textarea');

  // Helper to get questions for active section
  const currentSectionQuestions = questions.filter((q) => q.sectionId === activeFormTab);

  // Get question value safely
  const getFieldValue = (q: MonthlyReportQuestion): string | number => {
    if (formValues[q.id] !== undefined) return formValues[q.id];
    if (q.standardKey && formValues[q.standardKey] !== undefined) return formValues[q.standardKey];
    return q.type === 'number' ? '' : '';
  };

  // Update question value safely
  const handleFieldValueChange = (q: MonthlyReportQuestion, val: string | number) => {
    setFormValues((prev) => {
      const next = { ...prev, [q.id]: val };
      if (q.standardKey) {
        next[q.standardKey] = val;
      }
      return next;
    });

    // Auto-calculate CPA, AOV, ROAS when spend/orders/revenue change
    const isSpend = q.standardKey === 'totalSpent' || q.id === 'm_perf_spend';
    const isOrders = q.standardKey === 'totalOrders' || q.id === 'm_perf_orders';
    const isRev = q.standardKey === 'totalRevenue' || q.id === 'm_perf_revenue';

    if (isSpend || isOrders || isRev) {
      setTimeout(() => autoCalculatePerformanceMetrics(q, val), 0);
    }
  };

  const autoCalculatePerformanceMetrics = (
    changedQ: MonthlyReportQuestion,
    newVal: string | number
  ) => {
    const currentValues = { ...formValues, [changedQ.id]: newVal };
    if (changedQ.standardKey) currentValues[changedQ.standardKey] = newVal;

    const spend = Number(currentValues['totalSpent'] ?? currentValues['m_perf_spend'] ?? 0);
    const orders = Number(currentValues['totalOrders'] ?? currentValues['m_perf_orders'] ?? 0);
    const rev = Number(currentValues['totalRevenue'] ?? currentValues['m_perf_revenue'] ?? 0);

    const updates: Record<string, string | number> = {};

    if (spend > 0 && orders > 0) {
      const calculatedCpa = `${(spend / orders).toFixed(1)} EGP`;
      updates['m_perf_cpa'] = calculatedCpa;
      updates['cpa'] = calculatedCpa;
    }
    if (orders > 0 && rev > 0) {
      const calculatedAov = `${(rev / orders).toFixed(1)} EGP`;
      updates['m_perf_aov'] = calculatedAov;
      updates['aov'] = calculatedAov;
    }
    if (spend > 0 && rev > 0) {
      const calculatedRoas = Number((rev / spend).toFixed(2));
      updates['m_perf_roas'] = calculatedRoas;
      updates['roas'] = calculatedRoas;
    }

    setFormValues((prev) => ({ ...prev, ...updates }));
  };

  // --- Dynamic Question Actions ---
  const handleStartAddQuestion = (sectionId: MonthlyReportSectionId) => {
    setIsAddingQuestionToSection(sectionId);
    setNewQuestionLabel('');
    setNewQuestionType(sectionId === 'performance' ? 'number' : 'textarea');
    setNewQuestionPlaceholder('');
  };

  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddingQuestionToSection || !newQuestionLabel.trim()) return;

    const newQ: MonthlyReportQuestion = {
      id: `custom_m_q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sectionId: isAddingQuestionToSection,
      label: newQuestionLabel.trim(),
      placeholder: newQuestionPlaceholder.trim() || undefined,
      type: newQuestionType,
      required: false
    };

    const updated = [...questions, newQ];
    saveQuestionsTemplate(updated);

    // Initialize answer value
    setFormValues((prev) => ({
      ...prev,
      [newQ.id]: newQ.type === 'number' ? 0 : ''
    }));

    setIsAddingQuestionToSection(null);
    setNewQuestionLabel('');
    setNewQuestionPlaceholder('');
  };

  const handleStartEditQuestion = (q: MonthlyReportQuestion) => {
    setEditingQuestionId(q.id);
    setEditingQuestionLabel(q.label);
    setEditingQuestionPlaceholder(q.placeholder || '');
    setEditingQuestionType(q.type);
  };

  const handleSaveEditQuestion = (id: string) => {
    if (!editingQuestionLabel.trim()) return;

    const updated = questions.map((q) => {
      if (q.id === id) {
        return {
          ...q,
          label: editingQuestionLabel.trim(),
          placeholder: editingQuestionPlaceholder.trim() || undefined,
          type: editingQuestionType
        };
      }
      return q;
    });

    saveQuestionsTemplate(updated);
    setEditingQuestionId(null);
    setEditingQuestionLabel('');
    setEditingQuestionPlaceholder('');
  };

  const handleDeleteQuestion = (q: MonthlyReportQuestion) => {
    setDeletingQuestion(q);
  };

  const confirmDeleteQuestion = () => {
    if (!deletingQuestion) return;
    const updated = questions.filter((q) => q.id !== deletingQuestion.id);
    saveQuestionsTemplate(updated);
    setDeletingQuestion(null);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingReport(null);
    setReportTitle('');
    setActiveFormTab('performance');
    setMonth(currentMonthStr);
    setStartDate('');
    setEndDate('');

    const initialValues: Record<string, string | number> = {};
    questions.forEach((q) => {
      if (q.type === 'number') {
        initialValues[q.id] = 0;
        if (q.standardKey) initialValues[q.standardKey] = 0;
      } else {
        initialValues[q.id] = '';
        if (q.standardKey) initialValues[q.standardKey] = '';
      }
    });

    setFormValues(initialValues);
    setIsAddingQuestionToSection(null);
    setEditingQuestionId(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rep: MonthlyReport) => {
    setEditingReport(rep);
    setReportTitle(rep.title || '');
    setActiveFormTab('performance');
    setMonth(rep.month || currentMonthStr);
    setStartDate(rep.startDate || '');
    setEndDate(rep.endDate || '');

    if (rep.customSectionsQuestions && rep.customSectionsQuestions.length > 0) {
      setQuestions(rep.customSectionsQuestions);
    }

    const loadedValues: Record<string, string | number> = {
      // 1. Performance
      totalSpent: rep.totalSpent !== undefined ? rep.totalSpent : 0,
      totalOrders: rep.totalOrders !== undefined ? rep.totalOrders : 0,
      totalRevenue: rep.totalRevenue !== undefined ? rep.totalRevenue : 0,
      roas: rep.roas !== undefined ? rep.roas : 0,
      cpa: rep.cpa || '',
      aov: rep.aov || '',
      conversionRate: rep.conversionRate || '',

      // 2. MoM
      spendChange: rep.spendChange || '',
      ordersChange: rep.ordersChange || '',
      revenueChange: rep.revenueChange || '',
      roasChange: rep.roasChange || '',
      cpaChange: rep.cpaChange || '',
      aovChange: rep.aovChange || '',

      // 3. Campaigns
      bestCampaign: rep.bestCampaign || '',
      weakestCampaign: rep.weakestCampaign || '',
      improvingCampaigns: rep.improvingCampaigns || '',
      decliningCampaigns: rep.decliningCampaigns || '',

      // 4. Creatives
      bestCreative: rep.bestCreative || '',
      bestHook: rep.bestHook || '',
      bestMarketingAngle: rep.bestMarketingAngle || '',
      bestContentFormat: rep.bestContentFormat || '',
      creativesNeedRefresh: rep.creativesNeedRefresh || '',

      // 5. Products
      topPerformingProducts: rep.topPerformingProducts || '',
      lowPerformingProducts: rep.lowPerformingProducts || '',
      growthOpportunityProducts: rep.growthOpportunityProducts || '',

      // 6. Insights
      topCustomerObjections: rep.topCustomerObjections || '',
      keySalesInsights: rep.keySalesInsights || '',
      pricingShippingStockIssues: rep.pricingShippingStockIssues || '',

      // 7. Learnings
      whatWorked: rep.whatWorked || '',
      whatDidntWork: rep.whatDidntWork || '',
      keyInsight: rep.keyInsight || '',

      // 8. Growth
      biggestGrowthOpportunity: rep.biggestGrowthOpportunity || '',
      biggestGrowthChallenge: rep.biggestGrowthChallenge || '',
      salesGrowthOpportunity: rep.salesGrowthOpportunity || '',

      // 9. Strategy
      mainGoal: rep.mainGoal || '',
      targetRevenueOrders: rep.targetRevenueOrders || '',
      targetCpaRoas: rep.targetCpaRoas || '',
      advertisingStrategy: rep.advertisingStrategy || '',
      contentStrategy: rep.contentStrategy || '',
      newTests: rep.newTests || '',
      clientActionRequired: rep.clientActionRequired || '',

      // 10. Evaluation
      monthlyGrowthSummary: rep.monthlyGrowthSummary || '',

      // Custom answers
      ...(rep.customAnswers || {})
    };

    // Load from questionsList if available
    if (rep.questionsList && Array.isArray(rep.questionsList)) {
      rep.questionsList.forEach((qa) => {
        loadedValues[qa.id] = qa.answer;
        if (qa.standardKey) loadedValues[qa.standardKey] = qa.answer;
      });
    }

    setFormValues(loadedValues);
    setIsAddingQuestionToSection(null);
    setEditingQuestionId(null);
    setShowModal(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map questions to structured list
    const questionsList: MonthlyReportQuestionAnswer[] = questions.map((q) => {
      const val = formValues[q.id] ?? (q.standardKey ? formValues[q.standardKey] : '') ?? '';
      return {
        id: q.id,
        sectionId: q.sectionId,
        question: q.label,
        answer: q.type === 'number' ? Number(val) || 0 : String(val).trim(),
        type: q.type,
        standardKey: q.standardKey
      };
    });

    const getVal = (stdKey: string, fallbackId: string, defaultValue: any = '') => {
      if (formValues[stdKey] !== undefined) return formValues[stdKey];
      if (formValues[fallbackId] !== undefined) return formValues[fallbackId];
      return defaultValue;
    };

    const totalSpentVal = Number(getVal('totalSpent', 'm_perf_spend', 0)) || 0;
    const totalOrdersVal = Number(getVal('totalOrders', 'm_perf_orders', 0)) || 0;
    const totalRevenueVal = Number(getVal('totalRevenue', 'm_perf_revenue', 0)) || 0;
    const roasVal = Number(getVal('roas', 'm_perf_roas', 0)) || 0;

    const reportPayload: Omit<MonthlyReport, 'id'> = {
      clientId,
      title: reportTitle.trim() || undefined,
      month: month || currentMonthStr,
      startDate: startDate || undefined,
      endDate: endDate || undefined,

      // 1. Performance
      totalSpent: totalSpentVal,
      totalOrders: totalOrdersVal,
      totalRevenue: totalRevenueVal,
      roas: roasVal,
      cpa: String(getVal('cpa', 'm_perf_cpa', '')).trim() || undefined,
      aov: String(getVal('aov', 'm_perf_aov', '')).trim() || undefined,
      conversionRate: String(getVal('conversionRate', 'm_perf_cvr', '')).trim() || undefined,

      // 2. MoM
      spendChange: String(getVal('spendChange', 'm_mom_spend', '')).trim() || undefined,
      ordersChange: String(getVal('ordersChange', 'm_mom_orders', '')).trim() || undefined,
      revenueChange: String(getVal('revenueChange', 'm_mom_revenue', '')).trim() || undefined,
      roasChange: String(getVal('roasChange', 'm_mom_roas', '')).trim() || undefined,
      cpaChange: String(getVal('cpaChange', 'm_mom_cpa', '')).trim() || undefined,
      aovChange: String(getVal('aovChange', 'm_mom_aov', '')).trim() || undefined,

      // 3. Campaigns
      bestCampaign: String(getVal('bestCampaign', 'm_camp_best', '')).trim() || undefined,
      weakestCampaign: String(getVal('weakestCampaign', 'm_camp_weakest', '')).trim() || undefined,
      improvingCampaigns: String(getVal('improvingCampaigns', 'm_camp_improving', '')).trim() || undefined,
      decliningCampaigns: String(getVal('decliningCampaigns', 'm_camp_declining', '')).trim() || undefined,

      // 4. Creatives
      bestCreative: String(getVal('bestCreative', 'm_creat_best', '')).trim() || undefined,
      bestHook: String(getVal('bestHook', 'm_creat_hook', '')).trim() || undefined,
      bestMarketingAngle: String(getVal('bestMarketingAngle', 'm_creat_angle', '')).trim() || undefined,
      bestContentFormat: String(getVal('bestContentFormat', 'm_creat_format', '')).trim() || undefined,
      creativesNeedRefresh: String(getVal('creativesNeedRefresh', 'm_creat_refresh', '')).trim() || undefined,

      // 5. Products
      topPerformingProducts: String(getVal('topPerformingProducts', 'm_prod_top', '')).trim() || undefined,
      lowPerformingProducts: String(getVal('lowPerformingProducts', 'm_prod_low', '')).trim() || undefined,
      growthOpportunityProducts: String(getVal('growthOpportunityProducts', 'm_prod_growth', '')).trim() || undefined,

      // 6. Insights
      topCustomerObjections: String(getVal('topCustomerObjections', 'm_ins_objections', '')).trim() || undefined,
      keySalesInsights: String(getVal('keySalesInsights', 'm_ins_sales', '')).trim() || undefined,
      pricingShippingStockIssues: String(getVal('pricingShippingStockIssues', 'm_ins_issues', '')).trim() || undefined,

      // 7. Learnings
      whatWorked: String(getVal('whatWorked', 'm_learn_worked', '')).trim() || undefined,
      whatDidntWork: String(getVal('whatDidntWork', 'm_learn_didnt', '')).trim() || undefined,
      keyInsight: String(getVal('keyInsight', 'm_learn_insight', '')).trim() || undefined,

      // 8. Growth
      biggestGrowthOpportunity: String(getVal('biggestGrowthOpportunity', 'm_grow_opp', '')).trim() || undefined,
      biggestGrowthChallenge: String(getVal('biggestGrowthChallenge', 'm_grow_challenge', '')).trim() || undefined,
      salesGrowthOpportunity: String(getVal('salesGrowthOpportunity', 'm_grow_sales', '')).trim() || undefined,

      // 9. Strategy
      mainGoal: String(getVal('mainGoal', 'm_strat_goal', '')).trim() || undefined,
      targetRevenueOrders: String(getVal('targetRevenueOrders', 'm_strat_target_rev', '')).trim() || undefined,
      targetCpaRoas: String(getVal('targetCpaRoas', 'm_strat_target_cpa', '')).trim() || undefined,
      advertisingStrategy: String(getVal('advertisingStrategy', 'm_strat_ads', '')).trim() || undefined,
      contentStrategy: String(getVal('contentStrategy', 'm_strat_content', '')).trim() || undefined,
      newTests: String(getVal('newTests', 'm_strat_tests', '')).trim() || undefined,
      clientActionRequired: String(getVal('clientActionRequired', 'm_strat_client', '')).trim() || undefined,

      // 10. Evaluation
      monthlyGrowthSummary: String(getVal('monthlyGrowthSummary', 'm_eval_summary', '')).trim() || undefined,

      // Dynamic answers and questions template
      customAnswers: formValues,
      questionsList,
      customSectionsQuestions: questions
    };

    if (editingReport && onUpdateReport) {
      onUpdateReport(editingReport.id, reportPayload);
    } else if (onAddReport) {
      onAddReport(reportPayload);
    }

    setShowModal(false);
  };

  // Export PDF Handler
  const handleExportPDF = async (rep: MonthlyReport) => {
    try {
      setExportingId(rep.id);
      const { exportMonthlyReportToPDF } = await import('../../utils/pdfExporter');
      await exportMonthlyReportToPDF(rep, brandName || 'البراند');
    } catch (err) {
      console.error('Failed to export Monthly Report PDF:', err);
    } finally {
      setExportingId(null);
    }
  };

  // Delete Report Handler
  const confirmDelete = () => {
    if (deletingReportId && onDeleteReport) {
      onDeleteReport(deletingReportId);
      setDeletingReportId(null);
    }
  };

  // Filtered Monthly Reports
  const filteredMonthlyReports = clientReps.filter((rep) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (rep.title || '').toLowerCase().includes(q);
      const matchMonth = (rep.month || '').toLowerCase().includes(q);
      const matchStartDate = (rep.startDate || '').toLowerCase().includes(q);
      const matchEndDate = (rep.endDate || '').toLowerCase().includes(q);
      const matchGoal = (rep.mainGoal || '').toLowerCase().includes(q);
      const matchSummary = (rep.monthlyGrowthSummary || '').toLowerCase().includes(q);
      const matchInsight = (rep.keyInsight || '').toLowerCase().includes(q);
      if (!matchTitle && !matchMonth && !matchStartDate && !matchEndDate && !matchGoal && !matchSummary && !matchInsight) {
        return false;
      }
    }

    if (startDateFilter) {
      const repDate = rep.endDate || rep.startDate || (rep.month ? `${rep.month}-28` : '');
      if (repDate && repDate < startDateFilter) return false;
    }
    if (endDateFilter) {
      const repDate = rep.startDate || (rep.month ? `${rep.month}-01` : '');
      if (repDate && repDate > endDateFilter) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
              التقارير الدورية (Monthly & Quarterly)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#2D2D2A] flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-[#5A5A40]" />
            <span>Monthly & Quarterly Reports (التقارير الشهرية والربع سنوية)</span>
          </h2>
          <p className="text-xs text-[#8E8E85] mt-1">
            تقارير الأداء الشهرية والربع سنوية للبراند {brandName ? `(${brandName})` : ''} لمتابعة النتائج والنمو الاستراتيجي مع إمكانية تعديل وحذف وإضافة أسئلة النماذج.
          </p>
        </div>

        {activeSubPage === 'monthly' && userRole !== 'client' && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-2xl text-xs transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تقرير شهري جديد</span>
          </button>
        )}
      </div>

      {/* SUB-NAVIGATION TABS (2 SEPARATE PAGES) */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-[#F9F8F6] p-1.5 rounded-2xl border border-[#E5E5E0] w-full sm:w-auto sm:max-w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveSubPage('monthly')}
          className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center ${
            activeSubPage === 'monthly'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-white/60'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>التقارير الشهرية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubPage('quarterly')}
          className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center ${
            activeSubPage === 'quarterly'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-white/60'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>التقارير الربع سنوية</span>
        </button>
      </div>

      {/* SUB-PAGE 1: التقارير الشهرية (Monthly Reports) */}
      {activeSubPage === 'monthly' && (
        <div className="space-y-4 animate-in fade-in">
          {/* FILTER BAR */}
          <ReportFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            datePreset={datePreset}
            onDatePresetChange={(preset) => {
              setDatePreset(preset);
              const range = getDateRangeFromPreset(preset);
              setStartDateFilter(range.startDate);
              setEndDateFilter(range.endDate);
            }}
            startDate={startDateFilter}
            onStartDateChange={(val) => {
              setStartDateFilter(val);
              setDatePreset('custom');
            }}
            endDate={endDateFilter}
            onEndDateChange={(val) => {
              setEndDateFilter(val);
              setDatePreset('custom');
            }}
            onReset={() => {
              setSearchQuery('');
              setDatePreset('all');
              setStartDateFilter('');
              setEndDateFilter('');
            }}
            placeholder="ابحث باسم التقرير، الشهر، الأهداف أو الاستراتيجية..."
            totalCount={clientReps.length}
            filteredCount={filteredMonthlyReports.length}
          />

          {filteredMonthlyReports.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#E5E5E0] rounded-3xl p-10 sm:p-14 text-center space-y-3">
              <div className="w-14 h-14 bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl flex items-center justify-center mx-auto text-[#5A5A40] shadow-xs">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-extrabold text-[#2D2D2A]">
                {clientReps.length === 0
                  ? 'لا توجد تقارير شهرية مسجلة بعد'
                  : 'لا توجد تقارير شهرية تطابق معايير البحث والفلترة'}
              </h4>
              <p className="text-xs text-[#8E8E85] max-w-md mx-auto leading-relaxed">
                {clientReps.length === 0
                  ? 'اضغط على زر "إضافة تقرير شهري جديد" لتوثيق أداء الشهر بجميع الأقسام الـ 10 بدقة مع إمكانية تخصيص الأسئلة.'
                  : 'جرب تغيير مصطلح البحث أو اختيار فترة زمنية مختلفة في الفلتر أعلاه.'}
              </p>
              {userRole !== 'client' && clientReps.length === 0 && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-4 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول تقرير شهري</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMonthlyReports.map((rep) => {
                return (
                  <div
                    key={rep.id}
                    className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-4 sm:p-5 hover:border-[#5A5A40]/40 transition space-y-3.5 sm:space-y-4 shadow-xs"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E0]">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 sm:p-3 bg-white border border-[#E5E5E0] rounded-2xl text-[#5A5A40] shadow-2xs shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-black text-sm text-[#2D2D2A]">
                              {rep.title || (rep.month ? `تقرير شهر ${rep.month}` : 'التقرير الشهري')}
                            </h3>
                            <span className="px-2 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                              Monthly Report
                            </span>
                          </div>
                          {(rep.startDate || rep.endDate) && (
                            <p className="text-xs text-[#8E8E85] mt-0.5 font-bold">
                              الفترة: {rep.startDate || ''} {rep.endDate ? `إلى ${rep.endDate}` : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons - Icons only */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#E5E5E0] pt-2.5 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => setViewingReport(rep)}
                          title="عرض التقرير"
                          aria-label="عرض التقرير"
                          className="p-2 sm:p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportPDF(rep)}
                          disabled={exportingId === rep.id}
                          title="تحميل التقرير PDF"
                          aria-label="تحميل التقرير PDF"
                          className="p-2 sm:p-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                          {exportingId === rep.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <Download className="w-4 h-4 text-white" />
                          )}
                        </button>

                        {userRole !== 'client' && onUpdateReport && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rep)}
                            title="تعديل التقرير"
                            aria-label="تعديل التقرير"
                            className="p-2 sm:p-1.5 bg-white hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5E0] rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Edit2 className="w-4 h-4 text-[#5A5A40]" />
                          </button>
                        )}

                        {userRole !== 'client' && onDeleteReport && (
                          <button
                            type="button"
                            onClick={() => setDeletingReportId(rep.id)}
                            title="حذف التقرير"
                            className="p-2 sm:p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Highlights Summary */}
                    {(rep.mainGoal || rep.keyInsight || rep.bestCampaign || rep.monthlyGrowthSummary) && (
                      <div className="space-y-2 pt-1">
                        {(rep.mainGoal || rep.keyInsight || rep.bestCampaign) && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                            {rep.mainGoal && (
                              <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl px-3 py-2 text-amber-950 font-bold flex items-center gap-2">
                                <Target className="w-4 h-4 text-amber-700 shrink-0" />
                                <span className="truncate">الهدف: {rep.mainGoal}</span>
                              </div>
                            )}
                            {rep.bestCampaign && (
                              <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-3 py-2 text-emerald-950 font-bold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span className="truncate">أفضل حملة: {rep.bestCampaign}</span>
                              </div>
                            )}
                            {rep.keyInsight && (
                              <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl px-3 py-2 text-purple-950 font-bold flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-purple-700 shrink-0" />
                                <span className="truncate">الاستنتاج: {rep.keyInsight}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {rep.monthlyGrowthSummary && (
                          <div className="bg-purple-50/50 border border-purple-200/70 rounded-xl p-2.5 text-xs text-purple-950 flex items-start gap-2">
                            <FileText className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <span className="font-extrabold text-purple-900 block text-[11px] mb-0.5">
                                10. التقييم الشهري | Monthly Growth Summary:
                              </span>
                              <p className="line-clamp-2 text-purple-950 text-[11px] leading-relaxed font-medium">
                                {rep.monthlyGrowthSummary}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-PAGE 2: التقارير الربع سنوية (Quarterly Reports) */}
      {activeSubPage === 'quarterly' && (
        <QuarterlyReportsSubTab
          quarterlyReports={quarterlyReports}
          clientId={clientId}
          brandName={brandName}
          userRole={userRole}
          onAddQuarterlyReport={onAddQuarterlyReport}
          onUpdateQuarterlyReport={onUpdateQuarterlyReport}
          onDeleteQuarterlyReport={onDeleteQuarterlyReport}
        />
      )}

      {/* CREATE / EDIT FORM MODAL (10 SECTIONS WITH CUSTOMIZABLE QUESTIONS) */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-5xl max-h-[94vh] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between gap-3 shrink-0 bg-[#F9F8F6] rounded-t-3xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                    {editingReport ? 'تعديل التقرير الشهري' : 'تسجيل تقرير شهري جديد'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#2D2D2A]">
                  {brandName || 'البراند'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preserved Month & Date Section + Custom Report Title */}
            <div className="p-4 border-b border-[#E5E5E0] bg-[#F9F8F6]/80 shrink-0 space-y-3">
              <div>
                <label className="block font-extrabold text-[#2D2D2A] text-xs mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>اسم أو عنوان التقرير (اختياري)</span>
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="مثال: تقرير شهر مارس - أداء حملات رمضان وحملة عيد الفطر"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2.5 text-xs text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-extrabold text-[#2D2D2A] text-xs mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>شهر التقرير (Month / Year) *</span>
                  </label>
                  <input
                    type="month"
                    required
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-[#2D2D2A] text-xs mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8E8E85]" />
                    <span>تاريخ البداية (اختياري)</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-[#2D2D2A] text-xs mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8E8E85]" />
                    <span>تاريخ النهاية (اختياري)</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>
            </div>

            {/* Form Section Navigation (10 Tabs with Badges) */}
            <div className="flex items-center border-b border-[#E5E5E0] bg-[#F9F8F6] px-4 pt-2 gap-1.5 overflow-x-auto shrink-0 text-xs">
              {MONTHLY_SECTIONS.map((sec) => {
                const count = questions.filter((q) => q.sectionId === sec.id).length;
                const isActive = activeFormTab === sec.id;
                const Icon = sec.icon;

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveFormTab(sec.id)}
                    className={`py-2 px-3 font-extrabold rounded-t-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white border-t-2 border-t-[#5A5A40] border-x border-x-[#E5E5E0] text-[#5A5A40] shadow-2xs'
                        : 'text-[#8E8E85] hover:text-[#2D2D2A]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sec.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive
                          ? 'bg-[#5A5A40] text-white'
                          : 'bg-[#E5E5E0] text-[#78786E]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Form Body with Dynamic Questions Editor & Fields */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Active Section Header & Customization Controls */}
              {(() => {
                const activeMeta = MONTHLY_SECTIONS.find((s) => s.id === activeFormTab)!;
                const Icon = activeMeta.icon;

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E5E0] shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#2D2D2A] text-xs sm:text-sm">
                            {activeMeta.title}
                          </h4>
                          <p className="text-[11px] text-[#8E8E85]">
                            {activeMeta.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Section Questions Controls: Add & Reset */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleStartAddQuestion(activeFormTab)}
                          className="px-3 py-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white text-[11px] font-extrabold rounded-xl transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة سؤال جديد</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetSectionQuestions(activeFormTab)}
                          title="استعادة الأسئلة الافتراضية لهذا القسم"
                          className="p-1.5 bg-white border border-[#E5E5E0] text-[#78786E] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Add New Question Form */}
                    {isAddingQuestionToSection === activeFormTab && (
                      <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-amber-700" />
                            <span>إضافة سؤال جديد إلى ({activeMeta.title})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingQuestionToSection(null)}
                            className="p-1 text-amber-800 hover:bg-amber-100 rounded-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="text"
                            required
                            value={newQuestionLabel}
                            onChange={(e) => setNewQuestionLabel(e.target.value)}
                            placeholder="اكتب نص السؤال هنا (مثال: ما هي الزاوية التسويقية الأكثر طلباً؟)..."
                            className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs text-[#2D2D2A] font-bold outline-none focus:border-amber-600"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-extrabold text-amber-900 mb-1">
                                نوع حقل الإجابة:
                              </label>
                              <select
                                value={newQuestionType}
                                onChange={(e) => setNewQuestionType(e.target.value as any)}
                                className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-bold text-[#2D2D2A] outline-none"
                              >
                                <option value="textarea">فقرة / نص طويل (Textarea)</option>
                                <option value="text">نص قصير (Text Input)</option>
                                <option value="number">رقم عددي (Number Input)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-amber-900 mb-1">
                                نص توضيحي داخلي (Placeholder):
                              </label>
                              <input
                                type="text"
                                value={newQuestionPlaceholder}
                                onChange={(e) => setNewQuestionPlaceholder(e.target.value)}
                                placeholder="مثال: اكتب التفاصيل هنا..."
                                className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs text-[#2D2D2A] outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAddingQuestionToSection(null)}
                            className="px-3 py-1.5 bg-white border border-[#E5E5E0] text-[#78786E] rounded-xl text-xs font-bold hover:bg-[#F5F5F0] cursor-pointer"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveNewQuestion}
                            className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>حفظ السؤال</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Render Section Questions */}
                    {currentSectionQuestions.length === 0 ? (
                      <div className="bg-[#F9F8F6] border-2 border-dashed border-[#E5E5E0] rounded-2xl p-8 text-center space-y-2">
                        <p className="text-xs font-bold text-[#8E8E85]">
                          لا توجد أسئلة حالياً في هذا القسم.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleStartAddQuestion(activeFormTab)}
                          className="px-3 py-1.5 bg-[#5A5A40] text-white rounded-xl text-xs font-extrabold hover:bg-[#4a4a34] cursor-pointer shadow-2xs"
                        >
                          + إضافة أول سؤال
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`grid ${
                          activeFormTab === 'performance'
                            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                            : activeFormTab === 'evaluation'
                            ? 'grid-cols-1'
                            : 'grid-cols-1 sm:grid-cols-2'
                        } gap-3.5`}
                      >
                        {currentSectionQuestions.map((q) => {
                          const isEditingThisQ = editingQuestionId === q.id;
                          const val = getFieldValue(q);

                          return (
                            <div
                              key={q.id}
                              className={`bg-[#F9F8F6] p-3.5 rounded-2xl border border-[#E5E5E0] hover:border-[#5A5A40]/30 transition flex flex-col justify-between gap-2 shadow-2xs ${
                                activeFormTab === 'evaluation' ||
                                q.id === 'm_perf_cvr' ||
                                q.id === 'm_strat_goal' ||
                                q.id === 'm_eval_summary'
                                  ? 'sm:col-span-2 md:col-span-3'
                                  : ''
                              }`}
                            >
                              {/* Question Title & Actions Toolbar */}
                              <div className="flex items-start justify-between gap-2">
                                {!isEditingThisQ ? (
                                  <label className="block font-extrabold text-[#2D2D2A] text-xs leading-relaxed flex-1">
                                    {q.label}
                                  </label>
                                ) : (
                                  <div className="flex-1 space-y-2 pb-2 border-b border-[#E5E5E0]">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-extrabold text-[#5A5A40]">
                                        تعديل السؤال:
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleSaveEditQuestion(q.id)}
                                          className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                          title="حفظ تعديل السؤال"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingQuestionId(null)}
                                          className="p-1 bg-white border border-[#E5E5E0] hover:bg-[#F5F5F0] text-[#78786E] rounded-lg text-[10px] cursor-pointer"
                                          title="إلغاء التعديل"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    <input
                                      type="text"
                                      value={editingQuestionLabel}
                                      onChange={(e) => setEditingQuestionLabel(e.target.value)}
                                      className="w-full bg-white border border-[#5A5A40] rounded-lg p-1.5 text-xs font-bold text-[#2D2D2A] outline-none"
                                      placeholder="نص السؤال..."
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                      <select
                                        value={editingQuestionType}
                                        onChange={(e) => setEditingQuestionType(e.target.value as any)}
                                        className="bg-white border border-[#E5E5E0] rounded-lg p-1 text-[11px] font-bold text-[#2D2D2A]"
                                      >
                                        <option value="textarea">فقرة / نص طويل</option>
                                        <option value="text">نص قصير</option>
                                        <option value="number">رقم عددي</option>
                                      </select>

                                      <input
                                        type="text"
                                        value={editingQuestionPlaceholder}
                                        onChange={(e) => setEditingQuestionPlaceholder(e.target.value)}
                                        className="bg-white border border-[#E5E5E0] rounded-lg p-1 text-[11px] text-[#2D2D2A]"
                                        placeholder="Placeholder..."
                                      />
                                    </div>
                                  </div>
                                )}

                                {!isEditingThisQ && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditQuestion(q)}
                                      className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-white rounded-lg transition cursor-pointer"
                                      title="تعديل نص ونوع السؤال"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuestion(q)}
                                      className="p-1 text-[#8E8E85] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      title="حذف هذا السؤال"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Question Answer Field */}
                              {!isEditingThisQ && (
                                <div className="mt-1">
                                  {q.type === 'number' ? (
                                    <input
                                      type="number"
                                      min="0"
                                      step={q.standardKey === 'roas' ? '0.01' : 'any'}
                                      required={q.required}
                                      value={val === '' ? '' : Number(val)}
                                      onChange={(e) =>
                                        handleFieldValueChange(
                                          q,
                                          e.target.value === '' ? '' : Number(e.target.value)
                                        )
                                      }
                                      placeholder={q.placeholder || '0'}
                                      className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2.5 text-[#2D2D2A] font-extrabold outline-none focus:border-[#5A5A40]"
                                    />
                                  ) : q.type === 'text' ? (
                                    <input
                                      type="text"
                                      required={q.required}
                                      value={String(val || '')}
                                      onChange={(e) => handleFieldValueChange(q, e.target.value)}
                                      placeholder={q.placeholder || ''}
                                      className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2.5 text-xs text-[#2D2D2A] font-extrabold outline-none focus:border-[#5A5A40]"
                                    />
                                  ) : (
                                    <textarea
                                      rows={activeFormTab === 'evaluation' ? 5 : 2}
                                      required={q.required}
                                      value={String(val || '')}
                                      onChange={(e) => handleFieldValueChange(q, e.target.value)}
                                      placeholder={q.placeholder || 'اكتب الإجابة والتحليل هنا...'}
                                      className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2.5 text-xs text-[#2D2D2A] leading-relaxed outline-none focus:border-[#5A5A40]"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Form Navigation & Submit Buttons */}
              <div className="pt-3 sm:pt-4 border-t border-[#E5E5E0] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  {activeFormTab !== 'performance' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = MONTHLY_SECTIONS.map((s) => s.id);
                        const idx = tabs.indexOf(activeFormTab);
                        if (idx > 0) setActiveFormTab(tabs[idx - 1]);
                      }}
                      className="px-3.5 py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] rounded-xl text-xs font-extrabold hover:bg-[#F5F5F0] transition cursor-pointer"
                    >
                      القسم السابق
                    </button>
                  )}

                  {activeFormTab !== 'evaluation' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = MONTHLY_SECTIONS.map((s) => s.id);
                        const idx = tabs.indexOf(activeFormTab);
                        if (idx < tabs.length - 1) setActiveFormTab(tabs[idx + 1]);
                      }}
                      className="px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E5E0] text-[#5A5A40] rounded-xl text-xs font-extrabold hover:bg-[#F5F5F0] transition cursor-pointer"
                    >
                      القسم التالي
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] rounded-xl text-xs font-extrabold hover:bg-[#F5F5F0] transition cursor-pointer text-center"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-5 py-2.5 sm:py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-xs text-center"
                  >
                    {editingReport ? 'حفظ التعديلات' : 'حفظ التقرير الشهري'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL VIEW MODAL (ALL 10 SECTIONS WITH DYNAMIC QUESTION ANSWERS) */}
      {viewingReport && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 my-auto">
            {/* View Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-[#E5E5E0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 bg-[#F9F8F6] rounded-t-3xl">
              <div className="w-full sm:w-auto flex items-start justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                      التقرير الشهري الشامل
                    </span>
                    <span className="text-xs text-[#8E8E85] font-bold">
                      {viewingReport.month ? `شهر ${viewingReport.month}` : ''}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#2D2D2A]">
                    {viewingReport.title || brandName || 'البراند'}
                  </h3>
                  {viewingReport.title && brandName && (
                    <p className="text-xs text-[#8E8E85] font-bold">{brandName}</p>
                  )}
                </div>

                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="sm:hidden p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#E5E5E0] pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => handleExportPDF(viewingReport)}
                  disabled={exportingId === viewingReport.id}
                  title="تحميل كملف PDF"
                  aria-label="تحميل التقرير PDF"
                  className="p-2 sm:p-1.5 bg-[#5A5A40] text-white rounded-xl text-xs font-extrabold hover:bg-[#4a4a34] transition cursor-pointer shadow-2xs flex items-center justify-center disabled:opacity-50"
                >
                  {exportingId === viewingReport.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>

                {/* Desktop Close Button */}
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="hidden sm:inline-flex p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* View Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {MONTHLY_SECTIONS.map((sec) => {
                const Icon = sec.icon;

                // Gather answers for this section from questionsList or report fields
                const reportQuestions =
                  viewingReport.questionsList && viewingReport.questionsList.length > 0
                    ? viewingReport.questionsList.filter((qa) => qa.sectionId === sec.id)
                    : questions
                        .filter((q) => q.sectionId === sec.id)
                        .map((q) => {
                          const val =
                            viewingReport.customAnswers?.[q.id] ??
                            (q.standardKey ? (viewingReport as any)[q.standardKey] : undefined) ??
                            '';
                          return {
                            id: q.id,
                            sectionId: sec.id,
                            question: q.label,
                            answer: val,
                            type: q.type,
                            standardKey: q.standardKey
                          };
                        });

                const filledAnswers = reportQuestions.filter(
                  (qa) => qa.answer !== undefined && qa.answer !== '' && qa.answer !== 0
                );

                if (filledAnswers.length === 0 && sec.id !== 'performance') return null;

                return (
                  <div key={sec.id} className="space-y-3">
                    <div className="flex items-center justify-between bg-[#5A5A40]/10 p-3 rounded-2xl border border-[#5A5A40]/20">
                      <h4 className="font-extrabold text-[#2D2D2A] text-sm flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#5A5A40]" />
                        <span>{sec.title}</span>
                      </h4>
                    </div>

                    {sec.id === 'performance' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center">
                            <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">
                              إجمالي الإنفاق
                            </span>
                            <span className="text-sm font-black text-rose-700">
                              {(viewingReport.totalSpent || 0).toLocaleString()} EGP
                            </span>
                          </div>

                          <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center">
                            <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">
                              إجمالي الطلبات
                            </span>
                            <span className="text-sm font-black text-[#5A5A40]">
                              {viewingReport.totalOrders || 0} طلب
                            </span>
                          </div>

                          <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center">
                            <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">
                              إجمالي المبيعات
                            </span>
                            <span className="text-sm font-black text-emerald-700">
                              {(viewingReport.totalRevenue || 0).toLocaleString()} EGP
                            </span>
                          </div>

                          <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center">
                            <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">
                              العائد (ROAS)
                            </span>
                            <span className="text-sm font-black text-amber-800">
                              {viewingReport.roas || 0}x
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] text-center">
                            <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">
                              تكلفة الطلب (CPA)
                            </span>
                            <span className="text-xs font-black text-[#2D2D2A]">
                              {viewingReport.cpa || '-'}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] text-center">
                            <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">
                              متوسط السلة (AOV)
                            </span>
                            <span className="text-xs font-black text-[#2D2D2A]">
                              {viewingReport.aov || '-'}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] text-center">
                            <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">
                              معدل التحويل (CR)
                            </span>
                            <span className="text-xs font-black text-indigo-700">
                              {viewingReport.conversionRate || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`grid ${
                          sec.id === 'evaluation' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                        } gap-3`}
                      >
                        {filledAnswers.map((qa) => (
                          <div
                            key={qa.id}
                            className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1.5"
                          >
                            <span className="font-extrabold text-[#8E8E85] block text-[11px]">
                              {qa.question}:
                            </span>
                            <p className="text-[#2D2D2A] font-extrabold leading-relaxed whitespace-pre-line">
                              {String(qa.answer)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* View Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-[#E5E5E0] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#F9F8F6] rounded-b-3xl shrink-0">
              <button
                type="button"
                onClick={() => handleExportPDF(viewingReport)}
                disabled={exportingId === viewingReport.id}
                title="تحميل كملف PDF"
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#5A5A40] text-white rounded-xl text-xs font-extrabold hover:bg-[#4a4a34] transition cursor-pointer shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {exportingId === viewingReport.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>تحميل التقرير PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingReport(null)}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-extrabold rounded-xl text-xs hover:bg-[#F5F5F0] transition cursor-pointer text-center"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE REPORT MODAL */}
      {deletingReportId && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#2D2D2A]">تأكيد حذف التقرير الشهري</h3>
                <p className="text-xs text-[#8E8E85]">هل أنت متأكد من رغبتك في حذف هذا التقرير؟</p>
              </div>
            </div>

            <p className="text-xs text-[#78786E] bg-rose-50 border border-rose-200 p-3 rounded-xl leading-relaxed font-medium">
              سيتم حذف التقرير الشهري وبياناته نهائياً من السيستم.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingReportId(null)}
                className="px-4 py-2 bg-white border border-[#E5E5E0] hover:bg-[#F5F5F0] text-[#2D2D2A] rounded-xl text-xs font-extrabold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE QUESTION MODAL */}
      {deletingQuestion && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-[70] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#2D2D2A]">تأكيد حذف السؤال</h3>
                <p className="text-xs text-[#8E8E85]">هل أنت متأكد من رغبتك في حذف هذا السؤال من النموذج؟</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-1">
              <span className="text-[11px] font-extrabold text-rose-900 block">نص السؤال:</span>
              <p className="text-xs text-rose-950 font-bold leading-relaxed">
                "{deletingQuestion.label}"
              </p>
              <p className="text-[11px] text-[#78786E] pt-1">
                سيتم إزالة هذا السؤال من أسئلة هذا القسم للبراند.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQuestion(null)}
                className="px-4 py-2 bg-white border border-[#E5E5E0] hover:bg-[#F5F5F0] text-[#2D2D2A] rounded-xl text-xs font-extrabold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDeleteQuestion}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
