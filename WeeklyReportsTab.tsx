import React, { useState } from 'react';
import {
  BarChart2,
  Plus,
  Award,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Sparkles,
  Target,
  Download,
  Loader2,
  Eye,
  Clock,
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
  Layers,
  CheckSquare,
  Zap,
  PauseCircle,
  Lightbulb,
  ListOrdered,
  FileText,
  RotateCcw,
  Check,
  Type,
  AlignLeft,
  Hash
} from 'lucide-react';
import {
  WeeklyReport,
  UserRole,
  WeeklyReportQuestion,
  WeeklyReportSectionId,
  WeeklyReportQuestionAnswer
} from '../../types';
import { exportWeeklyReportToPDF } from '../../utils/pdfExporter';
import { ReportFilterBar, DateFilterPreset, getDateRangeFromPreset } from '../ReportFilterBar';

interface WeeklyReportsTabProps {
  reports: WeeklyReport[];
  clientId: string;
  brandName?: string;
  userRole?: UserRole;
  onAddReport: (rep: Omit<WeeklyReport, 'id'>) => void;
  onUpdateReport?: (id: string, fields: Partial<WeeklyReport>) => void;
  onDeleteReport?: (id: string) => void;
}

// 1. Default Standard Questions categorized into 6 Sections
export const DEFAULT_WEEKLY_REPORT_QUESTIONS: WeeklyReportQuestion[] = [
  // 1. ملخص الأداء | Weekly Performance
  {
    id: 'perf_spend',
    sectionId: 'performance',
    label: 'إجمالي الإنفاق | Total Spend (EGP) *',
    placeholder: '10000',
    type: 'number',
    required: true,
    standardKey: 'totalSpent'
  },
  {
    id: 'perf_orders',
    sectionId: 'performance',
    label: 'إجمالي الطلبات | Total Orders *',
    placeholder: '80',
    type: 'number',
    required: true,
    standardKey: 'totalOrders'
  },
  {
    id: 'perf_revenue',
    sectionId: 'performance',
    label: 'إجمالي المبيعات | Total Revenue (EGP) *',
    placeholder: '45000',
    type: 'number',
    required: true,
    standardKey: 'totalRevenue'
  },
  {
    id: 'perf_roas',
    sectionId: 'performance',
    label: 'العائد على الإنفاق الإعلاني | ROAS *',
    placeholder: '4.5',
    type: 'number',
    required: true,
    standardKey: 'roas'
  },
  {
    id: 'perf_cpa',
    sectionId: 'performance',
    label: 'تكلفة الطلب | CPA',
    placeholder: 'مثال: 125 EGP',
    type: 'text',
    standardKey: 'cpa'
  },
  {
    id: 'perf_aov',
    sectionId: 'performance',
    label: 'متوسط قيمة الطلب | AOV',
    placeholder: 'مثال: 560 EGP',
    type: 'text',
    standardKey: 'aov'
  },
  {
    id: 'perf_cvr',
    sectionId: 'performance',
    label: 'معدل التحويل | Conversion Rate',
    placeholder: 'مثال: 3.2%',
    type: 'text',
    standardKey: 'conversionRate'
  },

  // 2. مقارنة بالأسبوع السابق | Week-over-Week
  {
    id: 'wow_spend',
    sectionId: 'wow',
    label: 'تغير الإنفاق | Spend Change',
    placeholder: 'مثال: زيادة 15% مقارنة بالأسبوع الماضي...',
    type: 'textarea',
    standardKey: 'spendChange'
  },
  {
    id: 'wow_orders',
    sectionId: 'wow',
    label: 'تغير عدد الطلبات | Orders Change',
    placeholder: 'مثال: زيادة بنسبة 20% (من 65 إلى 78 طلب)...',
    type: 'textarea',
    standardKey: 'ordersChange'
  },
  {
    id: 'wow_revenue',
    sectionId: 'wow',
    label: 'تغير المبيعات | Revenue Change',
    placeholder: 'مثال: نمو بنسبة 25% مع تحسن سلة الشراء...',
    type: 'textarea',
    standardKey: 'revenueChange'
  },
  {
    id: 'wow_roas',
    sectionId: 'wow',
    label: 'تغير ROAS | ROAS Change',
    placeholder: 'مثال: ارتفع من 3.8x إلى 4.5x بفضل تركيز الميزانية...',
    type: 'textarea',
    standardKey: 'roasChange'
  },
  {
    id: 'wow_cpa',
    sectionId: 'wow',
    label: 'تغير CPA | CPA Change',
    placeholder: 'مثال: انخفض من 140 إلى 125 جنيه...',
    type: 'textarea',
    standardKey: 'cpaChange'
  },
  {
    id: 'wow_aov',
    sectionId: 'wow',
    label: 'تغير AOV | AOV Change',
    placeholder: 'مثال: ارتفع من 480 إلى 560 جنيه...',
    type: 'textarea',
    standardKey: 'aovChange'
  },

  // 3. أداء الحملات | Campaign Performance
  {
    id: 'camp_best',
    sectionId: 'campaigns',
    label: 'أفضل حملة | Best Performing Campaign + سبب النجاح',
    placeholder: 'اسم الحملة وأسباب تفوقها...',
    type: 'textarea',
    standardKey: 'bestCampaign'
  },
  {
    id: 'camp_weakest',
    sectionId: 'campaigns',
    label: 'أضعف حملة | Weakest Campaign + سبب الضعف',
    placeholder: 'اسم الحملة وأسباب ضعف الأداء...',
    type: 'textarea',
    standardKey: 'weakestCampaign'
  },
  {
    id: 'camp_improving',
    sectionId: 'campaigns',
    label: 'الحملات التي تحسنت | Improving Campaigns',
    placeholder: 'الحملات التي تشهد تحسناً ملحوظاً...',
    type: 'textarea',
    standardKey: 'improvingCampaigns'
  },
  {
    id: 'camp_declining',
    sectionId: 'campaigns',
    label: 'الحملات التي تراجعت | Declining Campaigns',
    placeholder: 'الحملات التي بدأت تتراجع وتتطلب تدخلاً...',
    type: 'textarea',
    standardKey: 'decliningCampaigns'
  },
  {
    id: 'camp_scaling',
    sectionId: 'campaigns',
    label: 'الحملات التي تحتاج Scaling',
    placeholder: 'الحملات المرشحة لزيادة الميزانية والتوسع...',
    type: 'textarea',
    standardKey: 'scalingCampaigns'
  },
  {
    id: 'camp_opt_pause',
    sectionId: 'campaigns',
    label: 'الحملات التي تحتاج Optimization / Pause',
    placeholder: 'الحملات التي تحتاج تعديل نصوص/تصاميم أو إيقاف...',
    type: 'textarea',
    standardKey: 'optimizationPauseCampaigns'
  },

  // 4. التحليل الأسبوعي | Weekly Analysis
  {
    id: 'ana_worked',
    sectionId: 'analysis',
    label: 'إيه اللي اشتغل كويس؟ | What Worked Well',
    placeholder: 'الزوايا الإعلانية الناجحة، الجمهور الأفضل، أنواع المحتوى الفائز...',
    type: 'textarea',
    standardKey: 'whatWorkedWell'
  },
  {
    id: 'ana_improve',
    sectionId: 'analysis',
    label: 'إيه اللي محتاج يتحسن؟ | What Needs Improvement',
    placeholder: 'النقاط التي احتاجت معالجة (سرعة الرد، سرعة الموقع، المخزون)...',
    type: 'textarea',
    standardKey: 'whatNeedsImprovement'
  },
  {
    id: 'ana_changes',
    sectionId: 'analysis',
    label: 'أهم التغييرات هذا الأسبوع | Key Changes',
    placeholder: 'التغييرات في توزيع الميزانيات، الاستهدافات، المحتوى، والأسعار...',
    type: 'textarea',
    standardKey: 'keyChanges'
  },
  {
    id: 'ana_insight',
    sectionId: 'analysis',
    label: 'أهم Insight من بيانات الأسبوع | Key Insight of the Week',
    placeholder: 'استنتاج استراتيجي رئيسي تم التوصل إليه من سلوك الجمهور والمبيعات...',
    type: 'textarea',
    standardKey: 'keyInsight'
  },
  {
    id: 'ana_sales_notes',
    sectionId: 'analysis',
    label: 'ملاحظات بيانات المبيعات والعملاء | Sales & Lead Data Notes',
    placeholder: 'ملاحظات من سجلات وتقارير العميل اليومية، اعتراضات العملاء، والمرتجعات...',
    type: 'textarea',
    standardKey: 'salesAndLeadNotes'
  },

  // 5. خطة الأسبوع القادم | Next Week Action Plan
  {
    id: 'plan_goal',
    sectionId: 'plan',
    label: '🎯 الهدف الرئيسي | Next Week Goal',
    placeholder: 'مثال: تحقيق 100 أوردر مع الحفاظ على ROAS أعلى من 4.2x...',
    type: 'text',
    standardKey: 'nextWeekGoal'
  },
  {
    id: 'plan_priorities',
    sectionId: 'plan',
    label: 'أهم الأولويات | Top Priorities',
    placeholder: '1. زيادة ميزانية الحملة الفائزة\n2. اختبار زوايا تصوير جديدة...',
    type: 'textarea',
    standardKey: 'topPriorities'
  },
  {
    id: 'plan_adjustments',
    sectionId: 'plan',
    label: 'تعديلات الحملات | Campaign Adjustments',
    placeholder: 'إعادة توزيع الميزانيات، إيقاف مجموعات إعلانية معينة، تعديل العروض...',
    type: 'textarea',
    standardKey: 'campaignAdjustments'
  },
  {
    id: 'plan_tests',
    sectionId: 'plan',
    label: 'الاختبارات الجديدة | New A/B Tests',
    placeholder: 'اختبار هوك إعلاني جديد، استهداف جمهور بديل، تجربة صفحة هبوط جديدة...',
    type: 'textarea',
    standardKey: 'newTests'
  },
  {
    id: 'plan_client_action',
    sectionId: 'plan',
    label: 'المطلوب من العميل | Action Required from Client',
    placeholder: 'توفير فيديوهات جديدة للمنتج، تأكيد توافر المخزون، تجهيز عروض...',
    type: 'textarea',
    standardKey: 'clientRequiredAction'
  },

  // 6. ملخص القرار | Weekly Decision Summary
  {
    id: 'sum_decision',
    sectionId: 'summary',
    label: 'ملخص القرار والاستنتاجات التنفيذية | Executive Summary & Decisions',
    placeholder: 'اكتب هنا:\n1. أهم ما حدث هذا الأسبوع في النتائج وأداء الحملات...\n2. أهم استنتاج تم التوصل إليه من قراءة البيانات...\n3. أهم القرارات والتعديلات التي سيتم تنفيذها...',
    type: 'textarea',
    standardKey: 'decisionSummary'
  }
];

// Sections Configuration Definition
const SECTIONS_CONFIG: {
  id: WeeklyReportSectionId;
  title: string;
  shortTitle: string;
  icon: any;
  colorClass: string;
  activeTabClass: string;
  borderClass: string;
  bgLightClass: string;
  desc: string;
}[] = [
  {
    id: 'performance',
    title: '1. ملخص الأداء | Weekly Performance',
    shortTitle: '1. ملخص الأداء',
    icon: BarChart2,
    colorClass: 'text-[#5A5A40]',
    activeTabClass: 'bg-white border-t-2 border-t-[#5A5A40] border-x border-x-[#E5E5E0] text-[#5A5A40]',
    borderClass: 'border-[#5A5A40]/20',
    bgLightClass: 'bg-[#5A5A40]/10',
    desc: 'المؤشرات الرقمية الأساسية: الإنفاق، الطلبات، المبيعات، والعائد.'
  },
  {
    id: 'wow',
    title: '2. مقارنة بالأسبوع السابق | Week-over-Week',
    shortTitle: '2. مقارنة بالأسبوع السابق',
    icon: TrendingUp,
    colorClass: 'text-blue-700',
    activeTabClass: 'bg-white border-t-2 border-t-blue-700 border-x border-x-[#E5E5E0] text-blue-800',
    borderClass: 'border-blue-500/20',
    bgLightClass: 'bg-blue-500/10',
    desc: 'مقارنة التغيرات في الإنفاق والمبيعات وتكلفة الطلب مقارنة بالأسبوع السابق.'
  },
  {
    id: 'campaigns',
    title: '3. أداء الحملات | Campaign Performance',
    shortTitle: '3. أداء الحملات',
    icon: Layers,
    colorClass: 'text-emerald-700',
    activeTabClass: 'bg-white border-t-2 border-t-emerald-700 border-x border-x-[#E5E5E0] text-emerald-800',
    borderClass: 'border-emerald-600/20',
    bgLightClass: 'bg-emerald-600/10',
    desc: 'أداء الحملات الإعلانية وتصنيفها بين الفائزة، المتراجعة، والجاهزة للتوسع.'
  },
  {
    id: 'analysis',
    title: '4. التحليل الأسبوعي | Weekly Analysis',
    shortTitle: '4. التحليل الأسبوعي',
    icon: Sparkles,
    colorClass: 'text-amber-800',
    activeTabClass: 'bg-white border-t-2 border-t-amber-700 border-x border-x-[#E5E5E0] text-amber-800',
    borderClass: 'border-amber-500/20',
    bgLightClass: 'bg-amber-500/10',
    desc: 'التحليل النوعي للنتائج، الزوايا الفائزة، وتغذية العميل الراجعة.'
  },
  {
    id: 'plan',
    title: '5. خطة الأسبوع القادم | Next Week Action Plan',
    shortTitle: '5. خطة الأسبوع القادم',
    icon: Target,
    colorClass: 'text-[#C8662B]',
    activeTabClass: 'bg-white border-t-2 border-t-[#C8662B] border-x border-x-[#E5E5E0] text-[#C8662B]',
    borderClass: 'border-[#E07A48]/20',
    bgLightClass: 'bg-[#E07A48]/10',
    desc: 'الأولويات والقرارات العملية والتعديلات المخطط تنفيذها الأسبوع القادم.'
  },
  {
    id: 'summary',
    title: '6. ملخص القرار | Weekly Decision Summary',
    shortTitle: '6. ملخص القرار',
    icon: FileText,
    colorClass: 'text-purple-900',
    activeTabClass: 'bg-white border-t-2 border-t-purple-700 border-x border-x-[#E5E5E0] text-purple-900',
    borderClass: 'border-purple-500/20',
    bgLightClass: 'bg-purple-500/10',
    desc: 'الخلاصة التنفيذية والقرارات المصيرية المتفق عليها للمتابعة السريعة.'
  }
];

export const WeeklyReportsTab: React.FC<WeeklyReportsTabProps> = ({
  reports,
  clientId,
  brandName,
  userRole,
  onAddReport,
  onUpdateReport,
  onDeleteReport
}) => {
  const clientReps = reports
    .filter((r) => r.clientId === clientId)
    .sort((a, b) => (b.weekStartDate || '').localeCompare(a.weekStartDate || ''));

  const todayStr = new Date().toISOString().split('T')[0];

  // --- Questions Template Management (Persistent per client) ---
  const storageKey = `weekly_report_questions_${clientId}`;

  const [questions, setQuestions] = useState<WeeklyReportQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore JSON error
    }
    return DEFAULT_WEEKLY_REPORT_QUESTIONS;
  });

  const saveQuestionsTemplate = (newQuestions: WeeklyReportQuestion[]) => {
    setQuestions(newQuestions);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newQuestions));
    } catch {
      // ignore
    }
  };

  // Reset questions to default for all sections or specific section
  const handleResetSectionQuestions = (sectionId: WeeklyReportSectionId) => {
    const defaultForSection = DEFAULT_WEEKLY_REPORT_QUESTIONS.filter((q) => q.sectionId === sectionId);
    const otherQuestions = questions.filter((q) => q.sectionId !== sectionId);
    saveQuestionsTemplate([...otherQuestions, ...defaultForSection]);
  };

  // --- Modal States ---
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [viewingReport, setViewingReport] = useState<WeeklyReport | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<WeeklyReportQuestion | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  // Filter States (Name & Date/Time)
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Active form section tab
  const [activeFormTab, setActiveFormTab] = useState<WeeklyReportSectionId>('performance');

  // Title & Dates Section
  const [reportTitle, setReportTitle] = useState('');
  const [weekStartDate, setWeekStartDate] = useState(todayStr);
  const [weekEndDate, setWeekEndDate] = useState('');

  // Form Values dictionary (id or standardKey -> value)
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});

  // Dynamic Question Editing / Adding States
  const [isAddingQuestionToSection, setIsAddingQuestionToSection] = useState<WeeklyReportSectionId | null>(null);
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
  const getFieldValue = (q: WeeklyReportQuestion): string | number => {
    if (formValues[q.id] !== undefined) return formValues[q.id];
    if (q.standardKey && formValues[q.standardKey] !== undefined) return formValues[q.standardKey];
    return q.type === 'number' ? '' : '';
  };

  // Update question value safely
  const handleFieldValueChange = (q: WeeklyReportQuestion, val: string | number) => {
    setFormValues((prev) => {
      const next = { ...prev, [q.id]: val };
      if (q.standardKey) {
        next[q.standardKey] = val;
      }
      return next;
    });
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingReport(null);
    setReportTitle('');
    setWeekStartDate(new Date().toISOString().split('T')[0]);
    setWeekEndDate('');

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
    setActiveFormTab('performance');
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (rep: WeeklyReport) => {
    setEditingReport(rep);
    setReportTitle(rep.title || '');
    setWeekStartDate(rep.weekStartDate || todayStr);
    setWeekEndDate(rep.weekEndDate || '');

    // If report has stored custom questions list, load them
    if (rep.customSectionsQuestions && rep.customSectionsQuestions.length > 0) {
      setQuestions(rep.customSectionsQuestions);
    }

    const loadedValues: Record<string, string | number> = {
      // 1. Performance
      totalSpent: rep.totalSpent !== undefined ? rep.totalSpent : 0,
      totalOrders: rep.totalOrders !== undefined ? rep.totalOrders : (rep.totalConversions || 0),
      totalRevenue: rep.totalRevenue !== undefined ? rep.totalRevenue : (rep.salesValue || 0),
      roas: rep.roas !== undefined ? rep.roas : 0,
      cpa: rep.cpa !== undefined ? String(rep.cpa) : '',
      aov: rep.aov !== undefined ? String(rep.aov) : '',
      conversionRate: rep.conversionRate !== undefined ? String(rep.conversionRate) : '',

      // 2. WoW
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
      scalingCampaigns: rep.scalingCampaigns || '',
      optimizationPauseCampaigns: rep.optimizationPauseCampaigns || '',

      // 4. Analysis
      whatWorkedWell: rep.whatWorkedWell || '',
      whatNeedsImprovement: rep.whatNeedsImprovement || '',
      keyChanges: rep.keyChanges || rep.whatChangedFromLastWeek || '',
      keyInsight: rep.keyInsight || '',
      salesAndLeadNotes: rep.salesAndLeadNotes || rep.dailyClientDataNotes || '',

      // 5. Plan
      nextWeekGoal: rep.nextWeekGoal || '',
      topPriorities: rep.topPriorities || '',
      campaignAdjustments: rep.campaignAdjustments || rep.campaignAdjustmentsNextWeek || '',
      newTests: rep.newTests || rep.newTestsNextWeek || '',
      clientRequiredAction: rep.clientRequiredAction || rep.clientRequiredActionNextWeek || '',

      // 6. Summary
      decisionSummary: rep.decisionSummary || '',

      // Custom answers
      ...(rep.customAnswers || {})
    };

    // Also populate by question ID if questionsList exists
    if (rep.questionsList && Array.isArray(rep.questionsList)) {
      rep.questionsList.forEach((qa) => {
        loadedValues[qa.id] = qa.answer;
        if (qa.standardKey) {
          loadedValues[qa.standardKey] = qa.answer;
        }
      });
    }

    setFormValues(loadedValues);
    setIsAddingQuestionToSection(null);
    setEditingQuestionId(null);
    setActiveFormTab('performance');
    setShowModal(true);
  };

  // Auto-calculate CPA, AOV, ROAS from Performance inputs
  const handleAutoCalculate = () => {
    const spend = Number(formValues['perf_spend'] ?? formValues['totalSpent']) || 0;
    const orders = Number(formValues['perf_orders'] ?? formValues['totalOrders']) || 0;
    const rev = Number(formValues['perf_revenue'] ?? formValues['totalRevenue']) || 0;

    const updates: Record<string, string | number> = {};

    if (spend > 0 && orders > 0) {
      const calculatedCpa = `${(spend / orders).toFixed(1)} EGP`;
      updates['perf_cpa'] = calculatedCpa;
      updates['cpa'] = calculatedCpa;
    }
    if (orders > 0 && rev > 0) {
      const calculatedAov = `${(rev / orders).toFixed(1)} EGP`;
      updates['perf_aov'] = calculatedAov;
      updates['aov'] = calculatedAov;
    }
    if (spend > 0 && rev > 0) {
      const calculatedRoas = Number((rev / spend).toFixed(2));
      updates['perf_roas'] = calculatedRoas;
      updates['roas'] = calculatedRoas;
    }

    setFormValues((prev) => ({ ...prev, ...updates }));
  };

  // --- Dynamic Question Actions ---
  const handleStartAddQuestion = (sectionId: WeeklyReportSectionId) => {
    setIsAddingQuestionToSection(sectionId);
    setNewQuestionLabel('');
    setNewQuestionType(sectionId === 'performance' ? 'number' : 'textarea');
    setNewQuestionPlaceholder('');
  };

  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddingQuestionToSection || !newQuestionLabel.trim()) return;

    const newQ: WeeklyReportQuestion = {
      id: `custom_q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
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

  const handleStartEditQuestion = (q: WeeklyReportQuestion) => {
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

  const handleDeleteQuestion = (q: WeeklyReportQuestion) => {
    setDeletingQuestion(q);
  };

  const confirmDeleteQuestion = () => {
    if (!deletingQuestion) return;
    const updated = questions.filter((q) => q.id !== deletingQuestion.id);
    saveQuestionsTemplate(updated);
    setDeletingQuestion(null);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map questions to structured list
    const questionsList: WeeklyReportQuestionAnswer[] = questions.map((q) => {
      const val = formValues[q.id] ?? (q.standardKey ? formValues[q.standardKey] : '') ?? '';
      return {
        id: q.id,
        sectionId: q.sectionId,
        question: q.label,
        answer: q.type === 'number' ? (Number(val) || 0) : String(val).trim(),
        type: q.type,
        standardKey: q.standardKey
      };
    });

    // Helper to get value for a standard key
    const getVal = (stdKey: string, fallbackId: string, defaultValue: any = '') => {
      if (formValues[stdKey] !== undefined) return formValues[stdKey];
      if (formValues[fallbackId] !== undefined) return formValues[fallbackId];
      return defaultValue;
    };

    const reportData = {
      clientId,
      title: reportTitle.trim() || undefined,
      weekStartDate,
      weekEndDate,

      // 1. ملخص الأداء | Weekly Performance
      totalSpent: Number(getVal('totalSpent', 'perf_spend', 0)) || 0,
      totalOrders: Number(getVal('totalOrders', 'perf_orders', 0)) || 0,
      totalRevenue: Number(getVal('totalRevenue', 'perf_revenue', 0)) || 0,
      salesValue: Number(getVal('totalRevenue', 'perf_revenue', 0)) || 0,
      roas: Number(getVal('roas', 'perf_roas', 0)) || 0,
      cpa: String(getVal('cpa', 'perf_cpa', '')).trim(),
      aov: String(getVal('aov', 'perf_aov', '')).trim(),
      conversionRate: String(getVal('conversionRate', 'perf_cvr', '')).trim(),

      // 2. مقارنة بالأسبوع السابق | Week-over-Week
      spendChange: String(getVal('spendChange', 'wow_spend', '')).trim(),
      ordersChange: String(getVal('ordersChange', 'wow_orders', '')).trim(),
      revenueChange: String(getVal('revenueChange', 'wow_revenue', '')).trim(),
      roasChange: String(getVal('roasChange', 'wow_roas', '')).trim(),
      cpaChange: String(getVal('cpaChange', 'wow_cpa', '')).trim(),
      aovChange: String(getVal('aovChange', 'wow_aov', '')).trim(),

      // 3. أداء الحملات | Campaign Performance
      bestCampaign: String(getVal('bestCampaign', 'camp_best', '')).trim(),
      weakestCampaign: String(getVal('weakestCampaign', 'camp_weakest', '')).trim(),
      improvingCampaigns: String(getVal('improvingCampaigns', 'camp_improving', '')).trim(),
      decliningCampaigns: String(getVal('decliningCampaigns', 'camp_declining', '')).trim(),
      scalingCampaigns: String(getVal('scalingCampaigns', 'camp_scaling', '')).trim(),
      optimizationPauseCampaigns: String(getVal('optimizationPauseCampaigns', 'camp_opt_pause', '')).trim(),

      // 4. التحليل الأسبوعي | Weekly Analysis
      whatWorkedWell: String(getVal('whatWorkedWell', 'ana_worked', '')).trim(),
      whatNeedsImprovement: String(getVal('whatNeedsImprovement', 'ana_improve', '')).trim(),
      keyChanges: String(getVal('keyChanges', 'ana_changes', '')).trim(),
      whatChangedFromLastWeek: String(getVal('keyChanges', 'ana_changes', '')).trim(),
      keyInsight: String(getVal('keyInsight', 'ana_insight', '')).trim(),
      salesAndLeadNotes: String(getVal('salesAndLeadNotes', 'ana_sales_notes', '')).trim(),
      dailyClientDataNotes: String(getVal('salesAndLeadNotes', 'ana_sales_notes', '')).trim(),

      // 5. خطة الأسبوع القادم | Next Week Action Plan
      nextWeekGoal: String(getVal('nextWeekGoal', 'plan_goal', '')).trim(),
      topPriorities: String(getVal('topPriorities', 'plan_priorities', '')).trim(),
      campaignAdjustments: String(getVal('campaignAdjustments', 'plan_adjustments', '')).trim(),
      campaignAdjustmentsNextWeek: String(getVal('campaignAdjustments', 'plan_adjustments', '')).trim(),
      newTests: String(getVal('newTests', 'plan_tests', '')).trim(),
      newTestsNextWeek: String(getVal('newTests', 'plan_tests', '')).trim(),
      clientRequiredAction: String(getVal('clientRequiredAction', 'plan_client_action', '')).trim(),
      clientRequiredActionNextWeek: String(getVal('clientRequiredAction', 'plan_client_action', '')).trim(),

      // 6. ملخص القرار | Weekly Decision Summary
      decisionSummary: String(getVal('decisionSummary', 'sum_decision', '')).trim(),

      // Compatibility & Custom data
      totalConversions: Number(getVal('totalOrders', 'perf_orders', 0)) || 0,
      clientViewed: editingReport ? editingReport.clientViewed : false,
      customAnswers: formValues,
      questionsList,
      customSectionsQuestions: questions
    };

    if (editingReport && onUpdateReport) {
      onUpdateReport(editingReport.id, reportData);
    } else {
      onAddReport(reportData);
    }

    setShowModal(false);
  };

  // Toggle Client Viewed Status
  const handleToggleClientViewed = (rep: WeeklyReport) => {
    if (onUpdateReport) {
      onUpdateReport(rep.id, { clientViewed: !rep.clientViewed });
    }
  };

  // Confirm Delete
  const confirmDelete = () => {
    if (deletingReportId && onDeleteReport) {
      onDeleteReport(deletingReportId);
      setDeletingReportId(null);
    }
  };

  // Export Weekly Report directly as PDF file
  const handleExportPDF = async (rep: WeeklyReport) => {
    try {
      setExportingId(rep.id);
      await exportWeeklyReportToPDF(rep, brandName || '');
    } catch (err) {
      console.error('Error generating PDF download:', err);
    } finally {
      setExportingId(null);
    }
  };

  // Filtered reports
  const filteredReports = clientReps.filter((rep) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (rep.title || '').toLowerCase().includes(q);
      const matchStart = (rep.weekStartDate || '').toLowerCase().includes(q);
      const matchEnd = (rep.weekEndDate || '').toLowerCase().includes(q);
      const matchGoal = (rep.nextWeekGoal || '').toLowerCase().includes(q);
      const matchDec = (rep.decisionSummary || '').toLowerCase().includes(q);
      if (!matchTitle && !matchStart && !matchEnd && !matchGoal && !matchDec) {
        return false;
      }
    }
    if (startDateFilter) {
      const repEnd = rep.weekEndDate || rep.weekStartDate;
      if (repEnd && repEnd < startDateFilter) return false;
    }
    if (endDateFilter) {
      const repStart = rep.weekStartDate;
      if (repStart && repStart > endDateFilter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
              التقرير الأسبوعي الشامل
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-[#2D2D2A] flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#5A5A40] shrink-0" />
            <span>Weekly Performance Reports (التقرير الأسبوعي)</span>
          </h2>
          <p className="text-xs text-[#8E8E85] mt-1 leading-relaxed">
            ملخص الأداء، مقارنة الأسبوع السابق، أداء الحملات، التحليل الأسبوعي، وخطة الأسبوع القادم (مع إمكانية تخصيص وتعديل أسئلة كل قسم).
          </p>
        </div>

        {userRole !== 'client' && (
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto justify-center px-4 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-2xl text-xs transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تقرير أسبوعي جديد</span>
          </button>
        )}
      </div>

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
        placeholder="ابحث باسم التقرير، الفترة الزمنية، أو الأهداف..."
        totalCount={clientReps.length}
        filteredCount={filteredReports.length}
      />

      {/* REPORTS LIST - SUMMARY CARDS (Like Monthly Reports style) */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl text-[#8E8E85] text-xs">
            {clientReps.length === 0
              ? 'لا توجد تقارير أسبوعية مسجلة لهذا البراند بعد. اضغط زر "إضافة تقرير أسبوعي جديد" أعلاه 📊'
              : 'لا توجد تقارير أسبوعية تطابق معايير البحث والفلترة المحددة.'}
          </div>
        ) : (
          filteredReports.map((rep) => {
            return (
              <div
                key={rep.id}
                className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-4 sm:p-5 hover:border-[#5A5A40]/40 transition space-y-3.5 sm:space-y-4 shadow-xs"
              >
                {/* Card Header matching Monthly Report */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E0]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-white border border-[#E5E5E0] rounded-2xl text-[#5A5A40] shadow-2xs shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-sm text-[#2D2D2A]">
                          {rep.title || `تقرير أسبوع (${rep.weekStartDate})`}
                        </h3>
                        <span className="px-2 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                          Weekly Report
                        </span>
                      </div>
                      <p className="text-xs text-[#8E8E85] mt-0.5 font-bold">
                        فترة التقرير: {rep.weekStartDate} {rep.weekEndDate ? `إلى ${rep.weekEndDate}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Badges & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#E5E5E0] pt-2.5 sm:pt-0">
                    {/* Client Viewed Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleClientViewed(rep)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                        rep.clientViewed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                      title="اضغط للتغيير (هل اطلع العميل على التقرير أم لا)"
                    >
                      {rep.clientViewed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تم الإطلاع 🟢</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>لم يطلع بعد ⏳</span>
                        </>
                      )}
                    </button>

                    {/* Action Buttons - Icons only */}
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

                    {userRole !== 'client' && (
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
                        aria-label="حذف التقرير"
                        className="p-2 sm:p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Highlights Summary (clean like monthly report) */}
                {(rep.nextWeekGoal || rep.decisionSummary) && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {rep.nextWeekGoal && (
                        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl px-3 py-2 text-amber-950 font-bold flex items-center gap-2">
                          <Target className="w-4 h-4 text-amber-700 shrink-0" />
                          <span className="truncate">الهدف: {rep.nextWeekGoal}</span>
                        </div>
                      )}
                      {rep.decisionSummary && (
                        <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl px-3 py-2 text-purple-950 font-bold flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-700 shrink-0" />
                          <span className="truncate">القرار: {rep.decisionSummary}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT FORM MODAL WITH DYNAMIC QUESTION SUPPORT PER SECTION */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between gap-3 shrink-0 bg-[#F9F8F6] rounded-t-3xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                    {editingReport ? 'تعديل التقرير الأسبوعي' : 'تسجيل تقرير أسبوعي جديد'}
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

            {/* Preserved Date & Title Section Always Visible at Top */}
            <div className="p-4 border-b border-[#E5E5E0] bg-[#F9F8F6]/80 shrink-0 space-y-3">
              <div>
                <label className="block font-extrabold text-[#2D2D2A] text-xs mb-1 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>اسم أو عنوان التقرير (اختياري)</span>
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="مثال: أسبوع العيد، أسبوع البلاك فرايداي، الأسبوع الأول من الشهر..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-[#2D2D2A] text-xs mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>تاريخ بداية الأسبوع (Week Start Date) *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={weekStartDate}
                    onChange={(e) => setWeekStartDate(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-[#2D2D2A] text-xs mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8E8E85]" />
                    <span>تاريخ نهاية الأسبوع (Week End Date)</span>
                  </label>
                  <input
                    type="date"
                    value={weekEndDate}
                    onChange={(e) => setWeekEndDate(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>
            </div>

            {/* Form Section Navigation (6 Tabs) */}
            <div className="flex items-center border-b border-[#E5E5E0] bg-[#F9F8F6] px-4 pt-2 gap-1.5 overflow-x-auto shrink-0 text-xs">
              {SECTIONS_CONFIG.map((sec) => {
                const SecIcon = sec.icon;
                const secCount = questions.filter((q) => q.sectionId === sec.id).length;
                const isActive = activeFormTab === sec.id;

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveFormTab(sec.id)}
                    className={`py-2 px-3 sm:px-4 font-extrabold rounded-t-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? `${sec.activeTabClass} shadow-2xs`
                        : 'text-[#8E8E85] hover:text-[#2D2D2A]'
                    }`}
                  >
                    <SecIcon className="w-3.5 h-3.5" />
                    <span>{sec.shortTitle}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-[#5A5A40]/15 text-[#2D2D2A]' : 'bg-[#E5E5E0] text-[#78786E]'
                    }`}>
                      {secCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Form Body with Dynamic Question Management */}
            <form id="weeklyReportForm" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto text-xs flex-1">
              {(() => {
                const currentSecMeta = SECTIONS_CONFIG.find((s) => s.id === activeFormTab) || SECTIONS_CONFIG[0];
                const SecIcon = currentSecMeta.icon;

                return (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Section Header & Management Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E5E5E0]">
                      <div>
                        <h4 className="font-extrabold text-[#2D2D2A] text-sm flex items-center gap-2">
                          <SecIcon className={`w-4 h-4 ${currentSecMeta.colorClass}`} />
                          <span>{currentSecMeta.title}</span>
                          <span className="text-[11px] font-normal text-[#8E8E85]">
                            ({currentSectionQuestions.length} أسئلة)
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#8E8E85] mt-0.5">
                          {currentSecMeta.desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {activeFormTab === 'performance' && (
                          <button
                            type="button"
                            onClick={handleAutoCalculate}
                            className="px-2.5 py-1 bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 text-[#5A5A40] rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="احتساب تلقائي للـ CPA و AOV و ROAS بناء على الأرقام المدخلة"
                          >
                            <Zap className="w-3 h-3 text-[#5A5A40]" />
                            <span>احتساب تلقائي (CPA / AOV / ROAS)</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleStartAddQuestion(activeFormTab)}
                          className="px-2.5 py-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-lg text-[11px] font-extrabold transition flex items-center gap-1 cursor-pointer shadow-2xs"
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

                    {/* Inline Form to Add a New Question to Current Section */}
                    {isAddingQuestionToSection === activeFormTab && (
                      <div className="p-3.5 bg-amber-50/50 rounded-2xl border-2 border-dashed border-[#5A5A40]/40 space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                          <span className="font-extrabold text-xs text-[#5A5A40] flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة سؤال مخصص لقسم "{currentSecMeta.shortTitle}"</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingQuestionToSection(null)}
                            className="text-[#8E8E85] hover:text-[#2D2D2A] p-1 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-[11px] text-[#2D2D2A] mb-1">
                              نص السؤال / الحقل *
                            </label>
                            <input
                              type="text"
                              required
                              value={newQuestionLabel}
                              onChange={(e) => setNewQuestionLabel(e.target.value)}
                              placeholder="مثال: عدد المبيعات المباشرة من البث المباشر..."
                              className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs font-bold text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[11px] text-[#2D2D2A] mb-1">
                              نوع الحقل
                            </label>
                            <select
                              value={newQuestionType}
                              onChange={(e) => setNewQuestionType(e.target.value as any)}
                              className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs font-bold text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                            >
                              <option value="textarea">فقرة / نص طويل</option>
                              <option value="text">نص قصير</option>
                              <option value="number">رقم عددي</option>
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block font-bold text-[11px] text-[#2D2D2A] mb-1">
                              نص توضيحي / Placeholder (اختياري)
                            </label>
                            <input
                              type="text"
                              value={newQuestionPlaceholder}
                              onChange={(e) => setNewQuestionPlaceholder(e.target.value)}
                              placeholder="توجيه أو مثال لمساعدة المستخدم أثناء كتابة الإجابة..."
                              className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAddingQuestionToSection(null)}
                            className="px-3 py-1.5 bg-white border border-[#E5E5E0] text-[#78786E] hover:bg-[#F5F5F0] rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveNewQuestion}
                            className="px-4 py-1.5 bg-[#5A5A40] text-white hover:bg-[#4a4a34] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>حفظ السؤال</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Questions List for Current Section */}
                    {currentSectionQuestions.length === 0 ? (
                      <div className="text-center py-8 bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl text-[#8E8E85] text-xs">
                        لا توجد أسئلة حالياً في هذا القسم.
                      </div>
                    ) : (
                      <div className={`grid ${
                        activeFormTab === 'performance'
                          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                          : activeFormTab === 'summary'
                          ? 'grid-cols-1'
                          : 'grid-cols-1 sm:grid-cols-2'
                      } gap-3.5`}>
                        {currentSectionQuestions.map((q) => {
                          const isEditingThisQ = editingQuestionId === q.id;
                          const val = getFieldValue(q);

                          return (
                            <div
                              key={q.id}
                              className={`bg-[#F9F8F6] p-3.5 rounded-2xl border border-[#E5E5E0] hover:border-[#5A5A40]/30 transition flex flex-col justify-between gap-2 shadow-2xs ${
                                activeFormTab === 'summary' || q.id === 'perf_cvr' || q.id === 'ana_sales_notes' || q.id === 'plan_goal'
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
                                      <span className="text-[11px] font-extrabold text-[#5A5A40]">تعديل السؤال:</span>
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
                                      placeholder={q.placeholder || 'اكتب الإجابة...'}
                                      className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2.5 text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                                    />
                                  ) : (
                                    <textarea
                                      rows={activeFormTab === 'summary' ? 6 : 2}
                                      required={q.required}
                                      value={String(val || '')}
                                      onChange={(e) => handleFieldValueChange(q, e.target.value)}
                                      placeholder={q.placeholder || 'اكتب الإجابة التفصيلية...'}
                                      className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2.5 text-[#2D2D2A] outline-none focus:border-[#5A5A40] leading-relaxed font-medium"
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
            </form>

            {/* Modal Actions */}
            <div className="p-3.5 sm:p-5 border-t border-[#E5E5E0] bg-[#F9F8F6] rounded-b-3xl flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-white border border-[#E5E5E0] hover:bg-[#F5F5F0] text-[#2D2D2A] rounded-xl text-xs font-bold transition cursor-pointer text-center"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="weeklyReportForm"
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs text-center"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingReport ? 'حفظ التعديلات' : 'حفظ التقرير الأسبوعي'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL VIEW REPORT MODAL - RENDERS ALL 6 SECTIONS WITH CUSTOM QUESTIONS */}
      {viewingReport && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div id="print-area" className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-[#E5E5E0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 bg-[#F9F8F6] rounded-t-3xl">
              <div className="w-full sm:w-auto flex items-start justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                      التقرير الأسبوعي الشامل
                    </span>
                    <span className="text-[11px] font-mono text-[#8E8E85] font-bold">
                      من {viewingReport.weekStartDate} {viewingReport.weekEndDate ? `إلى ${viewingReport.weekEndDate}` : ''}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#2D2D2A]">
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
                {/* Client Viewed Toggle inside View Modal */}
                <button
                  type="button"
                  onClick={() => handleToggleClientViewed(viewingReport)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                    viewingReport.clientViewed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {viewingReport.clientViewed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم إطلاع العميل 🟢</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>لم يطلع عليه ⏳</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => viewingReport && handleExportPDF(viewingReport)}
                  disabled={viewingReport ? exportingId === viewingReport.id : false}
                  title="تحميل التقرير PDF"
                  aria-label="تحميل التقرير PDF"
                  className="p-2 sm:p-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {viewingReport && exportingId === viewingReport.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>

                {userRole !== 'client' && (
                  <button
                    type="button"
                    onClick={() => {
                      const repToEdit = viewingReport;
                      setViewingReport(null);
                      handleOpenEdit(repToEdit);
                    }}
                    title="تعديل التقرير"
                    className="p-1.5 bg-white border border-[#E5E5E0] hover:bg-[#F5F5F0] text-[#2D2D2A] rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="w-4 h-4 text-[#8E8E85]" />
                  </button>
                )}

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

            {/* Modal Body - ALL 6 SECTIONS CONTINUOUS IN ONE SCROLLABLE VIEW */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs flex-1">
              {/* Preserved Date Box */}
              <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#5A5A40]" />
                  <span className="font-extrabold text-[#2D2D2A]">فترة التقرير:</span>
                  <span className="font-mono font-bold text-[#5A5A40]">
                    {viewingReport.weekStartDate} {viewingReport.weekEndDate ? `إلى ${viewingReport.weekEndDate}` : ''}
                  </span>
                </div>
              </div>

              {/* 1. ملخص الأداء | Weekly Performance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-[#5A5A40]/10 p-3 rounded-2xl border border-[#5A5A40]/20">
                  <h4 className="font-extrabold text-[#2D2D2A] text-sm flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#5A5A40]" />
                    <span>1. ملخص الأداء | Weekly Performance</span>
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center shadow-2xs">
                    <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">إجمالي الإنفاق (EGP)</span>
                    <div className="text-sm sm:text-base font-black text-rose-700">
                      {(viewingReport.totalSpent || 0).toLocaleString()} EGP
                    </div>
                  </div>

                  <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center shadow-2xs">
                    <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">إجمالي الطلبات</span>
                    <div className="text-sm sm:text-base font-black text-[#5A5A40]">
                      {viewingReport.totalOrders || viewingReport.totalConversions || 0} طلب
                    </div>
                  </div>

                  <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center shadow-2xs">
                    <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">إجمالي المبيعات (EGP)</span>
                    <div className="text-sm sm:text-base font-black text-emerald-700">
                      {(viewingReport.totalRevenue || viewingReport.salesValue || 0).toLocaleString()} EGP
                    </div>
                  </div>

                  <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center shadow-2xs">
                    <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">العائد (ROAS)</span>
                    <div className="text-sm sm:text-base font-black text-amber-800">
                      {viewingReport.roas || 0}x
                    </div>
                  </div>

                  <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center shadow-2xs">
                    <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">تكلفة الطلب (CPA)</span>
                    <div className="text-sm sm:text-base font-black text-[#2D2D2A]">
                      {viewingReport.cpa || '-'}
                    </div>
                  </div>

                  <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center shadow-2xs">
                    <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">متوسط الطلب (AOV)</span>
                    <div className="text-sm sm:text-base font-black text-[#2D2D2A]">
                      {viewingReport.aov || '-'}
                    </div>
                  </div>

                  <div className="bg-[#F9F8F6] p-3 rounded-2xl border border-[#E5E5E0] text-center shadow-2xs col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">معدل التحويل</span>
                    <div className="text-sm sm:text-base font-black text-indigo-700">
                      {viewingReport.conversionRate || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. مقارنة بالأسبوع السابق | Week-over-Week */}
              {(viewingReport.spendChange || viewingReport.ordersChange || viewingReport.revenueChange || viewingReport.roasChange || viewingReport.cpaChange || viewingReport.aovChange) && (
                <div className="space-y-3 pt-3 border-t border-[#E5E5E0]">
                  <div className="flex items-center justify-between bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
                    <h4 className="font-extrabold text-[#2D2D2A] text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-700" />
                      <span>2. مقارنة بالأسبوع السابق | Week-over-Week</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {viewingReport.spendChange && (
                      <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="text-[#8E8E85] font-bold text-[11px] block">تغير الإنفاق | Spend Change:</span>
                        <p className="text-[#2D2D2A] font-bold">{viewingReport.spendChange}</p>
                      </div>
                    )}

                    {viewingReport.ordersChange && (
                      <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="text-[#8E8E85] font-bold text-[11px] block">تغير عدد الطلبات | Orders Change:</span>
                        <p className="text-[#2D2D2A] font-bold">{viewingReport.ordersChange}</p>
                      </div>
                    )}

                    {viewingReport.revenueChange && (
                      <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="text-[#8E8E85] font-bold text-[11px] block">تغير المبيعات | Revenue Change:</span>
                        <p className="text-[#2D2D2A] font-bold">{viewingReport.revenueChange}</p>
                      </div>
                    )}

                    {viewingReport.roasChange && (
                      <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="text-[#8E8E85] font-bold text-[11px] block">تغير ROAS | ROAS Change:</span>
                        <p className="text-[#2D2D2A] font-bold">{viewingReport.roasChange}</p>
                      </div>
                    )}

                    {viewingReport.cpaChange && (
                      <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="text-[#8E8E85] font-bold text-[11px] block">تغير CPA | CPA Change:</span>
                        <p className="text-[#2D2D2A] font-bold">{viewingReport.cpaChange}</p>
                      </div>
                    )}

                    {viewingReport.aovChange && (
                      <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="text-[#8E8E85] font-bold text-[11px] block">تغير AOV | AOV Change:</span>
                        <p className="text-[#2D2D2A] font-bold">{viewingReport.aovChange}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. أداء الحملات | Campaign Performance */}
              {(viewingReport.bestCampaign || viewingReport.weakestCampaign || viewingReport.improvingCampaigns || viewingReport.decliningCampaigns || viewingReport.scalingCampaigns || viewingReport.optimizationPauseCampaigns) && (
                <div className="space-y-3 pt-3 border-t border-[#E5E5E0]">
                  <div className="flex items-center justify-between bg-emerald-600/10 p-3 rounded-2xl border border-emerald-600/20">
                    <h4 className="font-extrabold text-[#2D2D2A] text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-700" />
                      <span>3. أداء الحملات | Campaign Performance</span>
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    {/* Best & Weakest */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {viewingReport.bestCampaign && (
                        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl space-y-1">
                          <span className="font-extrabold text-emerald-800 flex items-center gap-1.5 text-xs">
                            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>أفضل حملة | Best Performing Campaign + سبب النجاح:</span>
                          </span>
                          <p className="text-emerald-950 leading-relaxed font-medium whitespace-pre-line">{viewingReport.bestCampaign}</p>
                        </div>
                      )}

                      {viewingReport.weakestCampaign && (
                        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl space-y-1">
                          <span className="font-extrabold text-rose-800 flex items-center gap-1.5 text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>أضعف حملة | Weakest Campaign + سبب الضعف:</span>
                          </span>
                          <p className="text-rose-950 leading-relaxed font-medium whitespace-pre-line">{viewingReport.weakestCampaign}</p>
                        </div>
                      )}
                    </div>

                    {/* Improving & Declining */}
                    {(viewingReport.improvingCampaigns || viewingReport.decliningCampaigns) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {viewingReport.improvingCampaigns && (
                          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                            <span className="font-extrabold text-emerald-700 flex items-center gap-1 text-[11px]">
                              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                              <span>الحملات التي تحسنت | Improving Campaigns:</span>
                            </span>
                            <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">{viewingReport.improvingCampaigns}</p>
                          </div>
                        )}

                        {viewingReport.decliningCampaigns && (
                          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                            <span className="font-extrabold text-amber-800 flex items-center gap-1 text-[11px]">
                              <TrendingDown className="w-3.5 h-3.5 text-amber-700" />
                              <span>الحملات التي تراجعت | Declining Campaigns:</span>
                            </span>
                            <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">{viewingReport.decliningCampaigns}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Scaling & Optimization/Pause */}
                    {(viewingReport.scalingCampaigns || viewingReport.optimizationPauseCampaigns) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {viewingReport.scalingCampaigns && (
                          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                            <span className="font-extrabold text-blue-800 flex items-center gap-1 text-[11px]">
                              <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                              <span>الحملات التي تحتاج Scaling:</span>
                            </span>
                            <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">{viewingReport.scalingCampaigns}</p>
                          </div>
                        )}

                        {viewingReport.optimizationPauseCampaigns && (
                          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                            <span className="font-extrabold text-rose-800 flex items-center gap-1 text-[11px]">
                              <PauseCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>الحملات التي تحتاج Optimization / Pause:</span>
                            </span>
                            <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">{viewingReport.optimizationPauseCampaigns}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. التحليل الأسبوعي | Weekly Analysis */}
              {(viewingReport.whatWorkedWell || viewingReport.whatNeedsImprovement || viewingReport.keyChanges || viewingReport.keyInsight || viewingReport.salesAndLeadNotes || viewingReport.whatChangedFromLastWeek || viewingReport.dailyClientDataNotes) && (
                <div className="space-y-3 pt-3 border-t border-[#E5E5E0]">
                  <div className="flex items-center justify-between bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                    <h4 className="font-extrabold text-[#2D2D2A] text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <span>4. التحليل الأسبوعي | Weekly Analysis</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewingReport.whatWorkedWell && (
                      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="font-extrabold text-emerald-700 block text-[11px]">إيه اللي اشتغل كويس؟ | What Worked Well:</span>
                        <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">{viewingReport.whatWorkedWell}</p>
                      </div>
                    )}

                    {viewingReport.whatNeedsImprovement && (
                      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="font-extrabold text-amber-800 block text-[11px]">إيه اللي محتاج يتحسن؟ | What Needs Improvement:</span>
                        <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">{viewingReport.whatNeedsImprovement}</p>
                      </div>
                    )}

                    {(viewingReport.keyChanges || viewingReport.whatChangedFromLastWeek) && (
                      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="font-extrabold text-[#5A5A40] block text-[11px]">أهم التغييرات هذا الأسبوع | Key Changes:</span>
                        <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">
                          {viewingReport.keyChanges || viewingReport.whatChangedFromLastWeek}
                        </p>
                      </div>
                    )}

                    {viewingReport.keyInsight && (
                      <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-200 space-y-1">
                        <span className="font-extrabold text-purple-900 flex items-center gap-1 text-[11px]">
                          <Lightbulb className="w-3.5 h-3.5 text-purple-700" />
                          <span>أهم Insight من بيانات الأسبوع | Key Insight of the Week:</span>
                        </span>
                        <p className="text-purple-950 leading-relaxed font-medium whitespace-pre-line">{viewingReport.keyInsight}</p>
                      </div>
                    )}

                    {(viewingReport.salesAndLeadNotes || viewingReport.dailyClientDataNotes) && (
                      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1 sm:col-span-2">
                        <span className="font-extrabold text-blue-900 block text-[11px]">ملاحظات بيانات المبيعات والعملاء | Sales & Lead Data Notes:</span>
                        <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">
                          {viewingReport.salesAndLeadNotes || viewingReport.dailyClientDataNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. خطة الأسبوع القادم | Next Week Action Plan */}
              {(viewingReport.nextWeekGoal || viewingReport.topPriorities || viewingReport.campaignAdjustments || viewingReport.newTests || viewingReport.clientRequiredAction || viewingReport.campaignAdjustmentsNextWeek || viewingReport.newTestsNextWeek || viewingReport.clientRequiredActionNextWeek) && (
                <div className="space-y-3 pt-3 border-t border-[#E5E5E0]">
                  <div className="flex items-center justify-between bg-[#E07A48]/10 p-3 rounded-2xl border border-[#E07A48]/20">
                    <h4 className="font-extrabold text-[#2D2D2A] text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#C8662B]" />
                      <span>5. خطة الأسبوع القادم | Next Week Action Plan</span>
                    </h4>
                  </div>

                  {viewingReport.nextWeekGoal && (
                    <div className="bg-[#E07A48]/10 p-3.5 rounded-2xl border border-[#E07A48]/30 space-y-1">
                      <span className="font-extrabold text-[#C8662B] block text-[11px]">🎯 الهدف الرئيسي | Next Week Goal:</span>
                      <p className="text-[#2D2D2A] font-extrabold text-sm leading-relaxed">{viewingReport.nextWeekGoal}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewingReport.topPriorities && (
                      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="font-extrabold text-[#5A5A40] flex items-center gap-1 text-[11px]">
                          <ListOrdered className="w-3.5 h-3.5 text-[#5A5A40]" />
                          <span>أهم الأولويات | Top Priorities:</span>
                        </span>
                        <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">{viewingReport.topPriorities}</p>
                      </div>
                    )}

                    {(viewingReport.campaignAdjustments || viewingReport.campaignAdjustmentsNextWeek) && (
                      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="font-extrabold text-[#5A5A40] block text-[11px]">تعديلات الحملات | Campaign Adjustments:</span>
                        <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">
                          {viewingReport.campaignAdjustments || viewingReport.campaignAdjustmentsNextWeek}
                        </p>
                      </div>
                    )}

                    {(viewingReport.newTests || viewingReport.newTestsNextWeek) && (
                      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="font-extrabold text-emerald-800 block text-[11px]">الاختبارات الجديدة | New A/B Tests:</span>
                        <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line">
                          {viewingReport.newTests || viewingReport.newTestsNextWeek}
                        </p>
                      </div>
                    )}

                    {(viewingReport.clientRequiredAction || viewingReport.clientRequiredActionNextWeek) && (
                      <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 space-y-1">
                        <span className="font-extrabold text-purple-950 flex items-center gap-1 text-[11px]">
                          <CheckSquare className="w-3.5 h-3.5 text-purple-700" />
                          <span>المطلوب من العميل | Action Required from Client:</span>
                        </span>
                        <p className="text-purple-950 leading-relaxed font-medium whitespace-pre-line">
                          {viewingReport.clientRequiredAction || viewingReport.clientRequiredActionNextWeek}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 6. ملخص القرار | Weekly Decision Summary */}
              {viewingReport.decisionSummary && (
                <div className="space-y-3 pt-3 border-t border-[#E5E5E0]">
                  <div className="flex items-center justify-between bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20">
                    <h4 className="font-extrabold text-[#2D2D2A] text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-700" />
                      <span>6. ملخص القرار | Weekly Decision Summary</span>
                    </h4>
                  </div>

                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 space-y-2">
                    <span className="font-extrabold text-purple-950 block text-[11px] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-700" />
                      <span>ملخص ما حدث هذا الأسبوع، أهم الاستنتاجات، والقرارات والتعديلات القادمة:</span>
                    </span>
                    <p className="text-purple-950 font-medium leading-relaxed whitespace-pre-line text-xs">
                      {viewingReport.decisionSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Render Any Custom Questions Not in Standard Keys */}
              {viewingReport.questionsList && viewingReport.questionsList.filter((qa) => !qa.standardKey && qa.answer).length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[#E5E5E0]">
                  <div className="flex items-center justify-between bg-stone-100 p-3 rounded-2xl border border-stone-200">
                    <h4 className="font-extrabold text-[#2D2D2A] text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                      <span>أسئلة وملاحظات إضافية مخصصة</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewingReport.questionsList.filter((qa) => !qa.standardKey && qa.answer).map((qa) => (
                      <div key={qa.id} className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="font-extrabold text-[#5A5A40] block text-[11px]">{qa.question}:</span>
                        <p className="text-[#2D2D2A] leading-relaxed whitespace-pre-line font-medium">{String(qa.answer)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-[#E5E5E0] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#F9F8F6] rounded-b-3xl shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => viewingReport && handleExportPDF(viewingReport)}
                  disabled={viewingReport ? exportingId === viewingReport.id : false}
                  title="تحميل كملف PDF"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#5A5A40] text-white rounded-xl text-xs font-extrabold hover:bg-[#4a4a34] transition cursor-pointer shadow-2xs flex items-center gap-2 justify-center disabled:opacity-50"
                >
                  {viewingReport && exportingId === viewingReport.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>تحميل التقرير PDF</span>
                </button>
              </div>

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
                <h3 className="font-extrabold text-base text-[#2D2D2A]">تأكيد حذف التقرير الأسبوعي</h3>
                <p className="text-xs text-[#8E8E85]">هل أنت متأكد من رغبتك في حذف هذا التقرير؟</p>
              </div>
            </div>

            <p className="text-xs text-[#78786E] bg-rose-50 border border-rose-200 p-3 rounded-xl leading-relaxed font-medium">
              سيتم حذف التقرير والبيانات المرتبطة به نهائياً. لا يمكن التراجع عن هذا الإجراء.
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
                سيتم إزالة هذا السؤال من أسئلة القسم لهذا البراند.
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
