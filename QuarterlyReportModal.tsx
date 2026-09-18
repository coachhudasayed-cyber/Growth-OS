import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Calendar,
  BarChart3,
  TrendingUp,
  Megaphone,
  Sparkles,
  PackageCheck,
  MessageSquare,
  Lightbulb,
  Compass,
  CheckCircle,
  Target,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Check
} from 'lucide-react';
import {
  QuarterlyReport,
  QuarterlyReportQuestion,
  QuarterlyReportQuestionAnswer,
  QuarterlyReportSectionId
} from '../../types';

interface QuarterlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<QuarterlyReport, 'id' | 'createdAt'>) => void;
  editingReport?: QuarterlyReport | null;
  brandName?: string;
  clientId: string;
}

export const DEFAULT_QUARTERLY_REPORT_QUESTIONS: QuarterlyReportQuestion[] = [
  // 1. ملخص الأداء | Quarterly Performance
  {
    id: 'q_perf_spend',
    sectionId: 'performance',
    label: 'إجمالي الإنفاق الإعلاني | Total Spend (EGP) *',
    placeholder: '150000',
    type: 'number',
    required: true,
    standardKey: 'totalSpent'
  },
  {
    id: 'q_perf_orders',
    sectionId: 'performance',
    label: 'إجمالي الطلبات | Total Orders *',
    placeholder: '1350',
    type: 'number',
    required: true,
    standardKey: 'totalOrders'
  },
  {
    id: 'q_perf_revenue',
    sectionId: 'performance',
    label: 'إجمالي المبيعات | Total Revenue (EGP) *',
    placeholder: '675000',
    type: 'number',
    required: true,
    standardKey: 'totalRevenue'
  },
  {
    id: 'q_perf_roas',
    sectionId: 'performance',
    label: 'العائد على الإنفاق (ROAS) *',
    placeholder: '4.5',
    type: 'number',
    required: true,
    standardKey: 'roas'
  },
  {
    id: 'q_perf_cpa',
    sectionId: 'performance',
    label: 'متوسط تكلفة الطلب (CPA)',
    placeholder: 'مثال: 111 EGP',
    type: 'text',
    standardKey: 'cpa'
  },
  {
    id: 'q_perf_aov',
    sectionId: 'performance',
    label: 'متوسط قيمة الطلب (AOV)',
    placeholder: 'مثال: 500 EGP',
    type: 'text',
    standardKey: 'aov'
  },
  {
    id: 'q_perf_cvr',
    sectionId: 'performance',
    label: 'معدل التحويل (Conversion Rate)',
    placeholder: 'مثال: 3.8%',
    type: 'text',
    standardKey: 'conversionRate'
  },

  // 2. مقارنة بالربع السابق | Quarter-over-Quarter
  {
    id: 'q_qoq_spend',
    sectionId: 'qoq',
    label: 'تغير الإنفاق مقارنة بالربع السابق | Spend QoQ',
    placeholder: 'مثال: زيادة الإنفاق 30% مع الحفاظ على الكفاءة...',
    type: 'textarea',
    standardKey: 'spendChange'
  },
  {
    id: 'q_qoq_orders',
    sectionId: 'qoq',
    label: 'تغير الطلبات QoQ | Orders QoQ',
    placeholder: 'مثال: زيادة الطلبات بنسبة 45%...',
    type: 'textarea',
    standardKey: 'ordersChange'
  },
  {
    id: 'q_qoq_revenue',
    sectionId: 'qoq',
    label: 'تغير المبيعات QoQ | Revenue QoQ',
    placeholder: 'مثال: نمو المبيعات بنسبة 50% مقارنة بالربع الماضي...',
    type: 'textarea',
    standardKey: 'revenueChange'
  },
  {
    id: 'q_qoq_roas',
    sectionId: 'qoq',
    label: 'تغير ROAS QoQ',
    placeholder: 'مثال: تحسن من 3.9x إلى 4.5x...',
    type: 'textarea',
    standardKey: 'roasChange'
  },
  {
    id: 'q_qoq_cpa',
    sectionId: 'qoq',
    label: 'تغير CPA QoQ',
    placeholder: 'مثال: انخفاض تكلفة الاكتساب بنسبة 12%...',
    type: 'textarea',
    standardKey: 'cpaChange'
  },
  {
    id: 'q_qoq_aov',
    sectionId: 'qoq',
    label: 'تغير AOV QoQ',
    placeholder: 'مثال: زيادة السلة بفضل البكجات الجديدة...',
    type: 'textarea',
    standardKey: 'aovChange'
  },

  // 3. أداء الحملات | Campaign Performance
  {
    id: 'q_camp_top',
    sectionId: 'campaigns',
    label: 'أفضل الحملات أداءً خلال الربع | Top Campaigns',
    placeholder: 'الحملات الأكثر مساهمة في الإيرادات والأرباح...',
    type: 'textarea',
    standardKey: 'topPerformingCampaigns'
  },
  {
    id: 'q_camp_weak',
    sectionId: 'campaigns',
    label: 'أضعف الحملات وأسبابها | Weakest Campaigns',
    placeholder: 'الحملات التي لم تحقق التارجت وأسباب الضعف...',
    type: 'textarea',
    standardKey: 'weakestCampaigns'
  },
  {
    id: 'q_camp_growth',
    sectionId: 'campaigns',
    label: 'الحملات الأكثر نمواً (Highest Growth)',
    placeholder: 'الحملات ذات الإمكانيات الكبيرة للـ Scaling...',
    type: 'textarea',
    standardKey: 'highestGrowthCampaigns'
  },
  {
    id: 'q_camp_paused',
    sectionId: 'campaigns',
    label: 'الحملات الموقوفة وأسباب إيقافها | Paused Campaigns',
    placeholder: 'الأسباب (استهلاك الزاوية، انتهاء المخزون، ارتفاع التكلفة)...',
    type: 'textarea',
    standardKey: 'pausedCampaignsReasons'
  },
  {
    id: 'q_camp_learnings',
    sectionId: 'campaigns',
    label: 'أهم دروس الحملات الإعلانية | Key Campaign Learnings',
    placeholder: 'أهم ما تعلمناه من هيكل الحساب واختبارات الميزانيات...',
    type: 'textarea',
    standardKey: 'keyCampaignLearnings'
  },

  // 4. أداء الإعلانات والمحتوى | Creative Performance
  {
    id: 'q_creat_top',
    sectionId: 'creatives',
    label: 'أفضل الإعلانات والمحتوى (Top Creatives)',
    placeholder: 'الإعلانات الأعلى تحويلاً وأدنى تكلفة للطلب...',
    type: 'textarea',
    standardKey: 'topPerformingCreatives'
  },
  {
    id: 'q_creat_hooks',
    sectionId: 'creatives',
    label: 'أفضل الهوكات (Top Performing Hooks)',
    placeholder: 'الهوكات الأكثر جذباً وتثبيتاً لانتباه العميل...',
    type: 'textarea',
    standardKey: 'topPerformingHooks'
  },
  {
    id: 'q_creat_angles',
    sectionId: 'creatives',
    label: 'أفضل الزوايا التسويقية (Best Marketing Angles)',
    placeholder: 'الزوايا النفسية والتسويقية الأكثر إقناعاً...',
    type: 'textarea',
    standardKey: 'bestMarketingAngles'
  },
  {
    id: 'q_creat_formats',
    sectionId: 'creatives',
    label: 'أفضل صيغ المحتوى (Best Content Formats)',
    placeholder: 'UGC، فيديو تجربة منتج، كاروسيل، صور مصممة...',
    type: 'textarea',
    standardKey: 'bestContentFormats'
  },
  {
    id: 'q_creat_refresh',
    sectionId: 'creatives',
    label: 'الإعلانات التي تحتاج تجديد (Creatives Need Refresh)',
    placeholder: 'الإعلانات التي وصلت للتشبع وتحتاج زوايا جديدة...',
    type: 'textarea',
    standardKey: 'creativesNeedRefresh'
  },
  {
    id: 'q_creat_learnings',
    sectionId: 'creatives',
    label: 'أهم دروس الإعلانات والمحتوى | Creative Learnings',
    placeholder: 'النتائج الأساسية من اختبارات المحتوى...',
    type: 'textarea',
    standardKey: 'keyCreativeLearnings'
  },

  // 5. أداء المنتجات والعروض | Product & Offer Performance
  {
    id: 'q_prod_top',
    sectionId: 'products',
    label: 'أفضل المنتجات أداءً ومبيعاً | Top Products',
    placeholder: 'المنتجات البطلة (Hero Products) في المبيعات...',
    type: 'textarea',
    standardKey: 'topPerformingProducts'
  },
  {
    id: 'q_prod_low',
    sectionId: 'products',
    label: 'المنتجات الأقل أداءً | Low Performing Products',
    placeholder: 'المنتجات البطيئة وأسباب قلة الطلب عليها...',
    type: 'textarea',
    standardKey: 'lowPerformingProducts'
  },
  {
    id: 'q_prod_growth',
    sectionId: 'products',
    label: 'فرص نمو المنتجات والبكجات | Growth Opportunities',
    placeholder: 'منتجات جاهزة للتوسع أو عمل عروض مجمعة...',
    type: 'textarea',
    standardKey: 'productGrowthOpportunities'
  },
  {
    id: 'q_prod_offers',
    sectionId: 'products',
    label: 'أداء العروض الترويجية | Offer Performance',
    placeholder: 'العروض الأكثر جاذبية ونسب التحويل عليها...',
    type: 'textarea',
    standardKey: 'offerPerformance'
  },
  {
    id: 'q_prod_upsell',
    sectionId: 'products',
    label: 'فرص الـ Upsell والـ Cross-Sell',
    placeholder: 'طرق زيادة متوسط قيمة الطلب للمنتجات...',
    type: 'textarea',
    standardKey: 'upsellCrossSellOpportunities'
  },

  // 6. سلوك العملاء والمبيعات | Customer & Sales Insights
  {
    id: 'q_ins_objections',
    sectionId: 'insights',
    label: 'أهم اعتراضات العملاء خلال الربع | Customer Objections',
    placeholder: 'الاعتراضات الأكثر تكراراً وكيفية معالجتها...',
    type: 'textarea',
    standardKey: 'topCustomerObjections'
  },
  {
    id: 'q_ins_sales',
    sectionId: 'insights',
    label: 'أهم استنتاجات المبيعات وخدمة العملاء | Sales Insights',
    placeholder: 'ملاحظات فريق المبيعات ونسبة تأكيد الأوردرات...',
    type: 'textarea',
    standardKey: 'keySalesInsights'
  },
  {
    id: 'q_ins_issues',
    sectionId: 'insights',
    label: 'تحديات التسعير والشحن والمخزون | Pricing & Logistics',
    placeholder: 'المشاكل اللوجستية وتأثيرها على استكمال الطلبات...',
    type: 'textarea',
    standardKey: 'pricingShippingStockIssues'
  },
  {
    id: 'q_ins_behavior',
    sectionId: 'insights',
    label: 'تغيرات سلوك العملاء والجمهور | Behavior Changes',
    placeholder: 'أي تحولات في تفضيلات العملاء أو أوقات الشراء...',
    type: 'textarea',
    standardKey: 'customerBehaviorChanges'
  },

  // 7. أهم النتائج والتعلم | Key Learnings
  {
    id: 'q_learn_win',
    sectionId: 'learnings',
    label: 'أكبر إنجاز في هذا الربع | Biggest Win',
    placeholder: 'أكبر نجاح تم تحقيقه للأرقام أو البراند...',
    type: 'textarea',
    standardKey: 'biggestWin'
  },
  {
    id: 'q_learn_challenge',
    sectionId: 'learnings',
    label: 'أكبر تحدي تم مواجهته | Biggest Challenge',
    placeholder: 'التحدي الأبرز وكيف تم التعامل معه...',
    type: 'textarea',
    standardKey: 'biggestChallenge'
  },
  {
    id: 'q_learn_key',
    sectionId: 'learnings',
    label: 'أهم الدروس المستفادة | Key Learnings',
    placeholder: 'الدروس الاستراتيجية المستخلصة من الـ 90 يوماً الماضية...',
    type: 'textarea',
    standardKey: 'keyLearnings'
  },
  {
    id: 'q_learn_insight',
    sectionId: 'learnings',
    label: 'الاستنتاج الاستراتيجي الأهم | Strategic Insight',
    placeholder: 'الرؤية المحورية التي ستوجه قرارات الفترة القادمة...',
    type: 'textarea',
    standardKey: 'keyStrategicInsight'
  },

  // 8. فرص النمو | Growth Opportunities
  {
    id: 'q_grow_biggest',
    sectionId: 'growth',
    label: 'أكبر فرصة نمو مستقبلي | Biggest Growth Opportunity',
    placeholder: 'أقوى فرصة لمضاعفة حجم أعمال البراند...',
    type: 'textarea',
    standardKey: 'biggestGrowthOpportunity'
  },
  {
    id: 'q_grow_sales',
    sectionId: 'growth',
    label: 'فرص نمو المبيعات | Sales Growth Opportunity',
    placeholder: 'توسيع القنوات أو تحسين مسارات البيع...',
    type: 'textarea',
    standardKey: 'salesGrowthOpportunity'
  },
  {
    id: 'q_grow_offers',
    sectionId: 'growth',
    label: 'فرص المنتجات والعروض الجديدة | Product & Offer Opportunities',
    placeholder: 'إطلاق خطوط إنتاج جديدة أو عروض موسمية...',
    type: 'textarea',
    standardKey: 'productOfferOpportunities'
  },
  {
    id: 'q_grow_scaling',
    sectionId: 'growth',
    label: 'فرص التوسع ومضاعفة الميزانية (Scaling Opportunities)',
    placeholder: 'القنوات أو الزوايا القابلة لمضاعفة الصرف بكفاءة...',
    type: 'textarea',
    standardKey: 'scalingOpportunities'
  },

  // 9. التقييم الاستراتيجي | Strategic Review
  {
    id: 'q_rev_changed',
    sectionId: 'review',
    label: 'ما الذي تغير خلال الـ 90 يوماً؟ | What Changed',
    placeholder: 'مقارنة وضع البراند بين أول الربع ونهايته...',
    type: 'textarea',
    standardKey: 'whatChanged'
  },
  {
    id: 'q_rev_sustainable',
    sectionId: 'review',
    label: 'هل النمو الحالي قابل للاستدامة؟ | Is Growth Sustainable',
    placeholder: 'تقييم قوة الأساسات التشغيلية والتسويقية...',
    type: 'textarea',
    standardKey: 'isGrowthSustainable'
  },
  {
    id: 'q_rev_barriers',
    sectionId: 'review',
    label: 'أهم عوائق النمو والـ Bottlenecks | Growth Barriers',
    placeholder: 'المخزون، السيولة، فريق المبيعات، أو المحتوى...',
    type: 'textarea',
    standardKey: 'keyGrowthBarriers'
  },
  {
    id: 'q_rev_continue',
    sectionId: 'review',
    label: 'ما الذي يجب الاستمرار فيه؟ | What Should Continue',
    placeholder: 'العناصر الناجحة التي أثبتت جدارتها...',
    type: 'textarea',
    standardKey: 'whatShouldContinue'
  },
  {
    id: 'q_rev_change',
    sectionId: 'review',
    label: 'ما الذي يجب تغييره وتطويره؟ | What Should Change',
    placeholder: 'القرارات والعمليات التي تحتاج تعديلاً فورياً...',
    type: 'textarea',
    standardKey: 'whatShouldChange'
  },

  // 10. خطة الربع القادم | Next Quarter Strategy
  {
    id: 'q_strat_goal',
    sectionId: 'strategy',
    label: 'الهدف الاستراتيجي الرئيسي للربع القادم | Main Goal *',
    placeholder: 'مثال: الوصول إلى 2.5 مليون مبيعات مع فتح شريحة عملاء جديدة...',
    type: 'text',
    required: true,
    standardKey: 'mainGoal'
  },
  {
    id: 'q_strat_targets',
    sectionId: 'strategy',
    label: 'المستهدفات الرقمية (تارجت المبيعات والطلبات) | Targets',
    placeholder: 'مثال: 4,000 طلب / 2,500,000 EGP',
    type: 'text',
    standardKey: 'revenueOrderTargets'
  },
  {
    id: 'q_strat_cpa_roas',
    sectionId: 'strategy',
    label: 'مستهدف CPA و ROAS للربع القادم',
    placeholder: 'مثال: CPA أقل من 105 EGP و ROAS أعلى من 4.3x',
    type: 'text',
    standardKey: 'targetCpaRoas'
  },
  {
    id: 'q_strat_ads',
    sectionId: 'strategy',
    label: 'استراتيجية الإعلانات والحملات | Advertising Strategy',
    placeholder: 'هيكل الصرف وتوزيع القنوات والتوسع الإعلاني...',
    type: 'textarea',
    standardKey: 'advertisingStrategy'
  },
  {
    id: 'q_strat_content',
    sectionId: 'strategy',
    label: 'استراتيجية المحتوى والإبداع | Content Strategy',
    placeholder: 'خطة إنتاج المحتوى، التعاونات، والزوايا الجديدة...',
    type: 'textarea',
    standardKey: 'contentStrategy'
  },
  {
    id: 'q_strat_product_plan',
    sectionId: 'strategy',
    label: 'استراتيجية المنتجات والعروض | Product & Offer Strategy',
    placeholder: 'العروض والبكجات وتحديث المنتجات...',
    type: 'textarea',
    standardKey: 'productOfferStrategy'
  },
  {
    id: 'q_strat_tests',
    sectionId: 'strategy',
    label: 'الاختبارات والتجارب الجديدة | New Experiments',
    placeholder: 'التجارب المخطط تنفيذها في الربع الجديد...',
    type: 'textarea',
    standardKey: 'newTests'
  },
  {
    id: 'q_strat_scaling',
    sectionId: 'strategy',
    label: 'فرص الـ Scaling للربع القادم',
    placeholder: 'خطة مضاعفة المبيعات والاستثمار...',
    type: 'textarea',
    standardKey: 'nextQuarterScalingOpportunities'
  },
  {
    id: 'q_strat_client',
    sectionId: 'strategy',
    label: 'المطلوب من العميل | Action Required from Client',
    placeholder: 'توفير المخزون، الميزانيات، وتصوير الخامات المطلوبة...',
    type: 'textarea',
    standardKey: 'clientActionRequired'
  },

  // 11. خطة الـ90 يوم | 90-Day Growth Plan
  {
    id: 'q_plan_m1',
    sectionId: 'plan90',
    label: 'خطة الشهر الأول (Month 1 Action Plan)',
    placeholder: 'المهام والأهداف المحددة للشهر الأول من الربع...',
    type: 'textarea',
    standardKey: 'month1Plan'
  },
  {
    id: 'q_plan_m2',
    sectionId: 'plan90',
    label: 'خطة الشهر الثاني (Month 2 Action Plan)',
    placeholder: 'المهام والأهداف المحددة للشهر الثاني...',
    type: 'textarea',
    standardKey: 'month2Plan'
  },
  {
    id: 'q_plan_m3',
    sectionId: 'plan90',
    label: 'خطة الشهر الثالث (Month 3 Action Plan)',
    placeholder: 'المهام والأهداف المحددة للشهر الثالث وتثبيت النتائج...',
    type: 'textarea',
    standardKey: 'month3Plan'
  },

  // 12. ملخص النمو | Quarterly Growth Summary
  {
    id: 'q_sum_growth',
    sectionId: 'summary',
    label: 'الملخص الفصلي للنمو | Quarterly Growth Summary',
    placeholder: 'اكتب هنا الملخص التنفيذي الشامل للربع:\n1. أين كان البراند في بداية الربع...\n2. التحولات والإنجازات التي تمت خلال الـ 90 يوماً...\n3. القرارات الاستراتيجية للربع القادم...',
    type: 'textarea',
    standardKey: 'quarterlyGrowthSummary'
  },
  {
    id: 'q_sum_notes',
    sectionId: 'summary',
    label: 'ملاحظات وتوصيات عامة | General Notes & Recommendations',
    placeholder: 'أي توصيات إضافية للإدارة وفريق العمل...',
    type: 'textarea',
    standardKey: 'notes'
  }
];

export const QUARTERLY_SECTIONS: {
  id: QuarterlyReportSectionId;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: 'performance',
    title: '1. ملخص الأداء',
    subtitle: 'المقاييس المالية، الإنفاق، والمبيعات والـ ROAS',
    icon: BarChart3,
    color: '#5A5A40'
  },
  {
    id: 'qoq',
    title: '2. مقارنة بالربع السابق (QoQ)',
    subtitle: 'مقارنة نمو الإنفاق والطلبات والأرباح فصلياً',
    icon: TrendingUp,
    color: '#1E40AF'
  },
  {
    id: 'campaigns',
    title: '3. أداء الحملات',
    subtitle: 'أفضل وأضعف الحملات ودروس الحساب الإعلاني',
    icon: Megaphone,
    color: '#065F46'
  },
  {
    id: 'creatives',
    title: '4. المحتوى والإعلانات',
    subtitle: 'الهوكات، الزوايا، وتجديد الإعلانات',
    icon: Sparkles,
    color: '#6B21A8'
  },
  {
    id: 'products',
    title: '5. المنتجات والعروض',
    subtitle: 'أداء المنتجات البطلة والعروض الترويجية والـ Upsell',
    icon: PackageCheck,
    color: '#9A3412'
  },
  {
    id: 'insights',
    title: '6. سلوك العملاء والمبيعات',
    subtitle: 'اعتراضات العملاء وملاحظات المبيعات واللوجستيات',
    icon: MessageSquare,
    color: '#374151'
  },
  {
    id: 'learnings',
    title: '7. أهم النتائج والتعلم',
    subtitle: 'أكبر إنجاز، أكبر تحدي، وأهم الدروس',
    icon: Lightbulb,
    color: '#B45309'
  },
  {
    id: 'growth',
    title: '8. فرص النمو',
    subtitle: 'فرص مضاعفة المبيعات والـ Scaling',
    icon: Compass,
    color: '#0F766E'
  },
  {
    id: 'review',
    title: '9. التقييم الاستراتيجي',
    subtitle: 'استدامة النمو، عوائق التوسع، وما يجب استمراره أو تغييره',
    icon: CheckCircle,
    color: '#3B82F6'
  },
  {
    id: 'strategy',
    title: '10. خطة الربع القادم',
    subtitle: 'الأهداف، الاستراتيجيات، والتجارب والمطلوب من العميل',
    icon: Target,
    color: '#C2410C'
  },
  {
    id: 'plan90',
    title: '11. خطة الـ90 يوم',
    subtitle: 'خطة العمل التفصيلية لشهر 1 وشهر 2 وشهر 3',
    icon: Clock,
    color: '#047857'
  },
  {
    id: 'summary',
    title: '12. ملخص النمو والتوصيات',
    subtitle: 'الملخص التنفيذي الفصلي والتوصيات العامة',
    icon: FileText,
    color: '#581C87'
  }
];

const MONTHS_LIST = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر'
];

const QUARTER_PRESETS = [
  { label: 'Q1 (يناير - مارس)', m1: 'يناير', m2: 'فبراير', m3: 'مارس', qName: 'الربع الأول (Q1)' },
  { label: 'Q2 (أبريل - يونيو)', m1: 'أبريل', m2: 'مايو', m3: 'يونيو', qName: 'الربع الثاني (Q2)' },
  { label: 'Q3 (يوليو - سبتمبر)', m1: 'يوليو', m2: 'أغسطس', m3: 'سبتمبر', qName: 'الربع الثالث (Q3)' },
  { label: 'Q4 (أكتوبر - ديسمبر)', m1: 'أكتوبر', m2: 'نوفمبر', m3: 'ديسمبر', qName: 'الربع الرابع (Q4)' }
];

export const QuarterlyReportModal: React.FC<QuarterlyReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingReport,
  brandName,
  clientId
}) => {
  // Questions template state
  const [questions, setQuestions] = useState<QuarterlyReportQuestion[]>(() => {
    try {
      const stored = localStorage.getItem(`quarterly_report_questions_${clientId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_QUARTERLY_REPORT_QUESTIONS;
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`quarterly_report_questions_${clientId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setQuestions(DEFAULT_QUARTERLY_REPORT_QUESTIONS);
  }, [clientId]);

  const saveQuestionsTemplate = (updatedQuestions: QuarterlyReportQuestion[]) => {
    setQuestions(updatedQuestions);
    try {
      localStorage.setItem(
        `quarterly_report_questions_${clientId}`,
        JSON.stringify(updatedQuestions)
      );
    } catch {
      // ignore
    }
  };

  const handleResetSectionQuestions = (sectionId: QuarterlyReportSectionId) => {
    const defaultForSec = DEFAULT_QUARTERLY_REPORT_QUESTIONS.filter(
      (q) => q.sectionId === sectionId
    );
    const otherQuestions = questions.filter((q) => q.sectionId !== sectionId);
    saveQuestionsTemplate([...otherQuestions, ...defaultForSec]);
  };

  // Active section tab
  const [activeTab, setActiveTab] = useState<QuarterlyReportSectionId>('performance');

  // Meta state
  const [reportTitle, setReportTitle] = useState('');
  const [quarter, setQuarter] = useState('الربع الأول (Q1)');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month1, setMonth1] = useState('يناير');
  const [month2, setMonth2] = useState('فبراير');
  const [month3, setMonth3] = useState('مارس');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Values dictionary
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});

  // Dynamic question editing/adding state
  const [isAddingQuestionToSection, setIsAddingQuestionToSection] = useState<QuarterlyReportSectionId | null>(null);
  const [newQuestionLabel, setNewQuestionLabel] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'number' | 'text' | 'textarea'>('textarea');
  const [newQuestionPlaceholder, setNewQuestionPlaceholder] = useState('');

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionLabel, setEditingQuestionLabel] = useState('');
  const [editingQuestionPlaceholder, setEditingQuestionPlaceholder] = useState('');
  const [editingQuestionType, setEditingQuestionType] = useState<'number' | 'text' | 'textarea'>('textarea');

  const [deletingQuestion, setDeletingQuestion] = useState<QuarterlyReportQuestion | null>(null);

  // Initialize or load editing report
  useEffect(() => {
    if (editingReport && isOpen) {
      setReportTitle(editingReport.title || '');
      setQuarter(editingReport.quarter || 'الربع الأول (Q1)');
      setYear(editingReport.year || new Date().getFullYear());
      setMonth1(editingReport.month1Name || 'يناير');
      setMonth2(editingReport.month2Name || 'فبراير');
      setMonth3(editingReport.month3Name || 'مارس');
      setStartDate(editingReport.startDate || '');
      setEndDate(editingReport.endDate || '');

      if (
        editingReport.customSectionsQuestions &&
        editingReport.customSectionsQuestions.length > 0
      ) {
        setQuestions(editingReport.customSectionsQuestions);
      }

      const initialValues: Record<string, string | number> = {
        totalSpent: editingReport.totalSpent !== undefined ? editingReport.totalSpent : 0,
        totalOrders: editingReport.totalOrders !== undefined ? editingReport.totalOrders : 0,
        totalRevenue: editingReport.totalRevenue !== undefined ? editingReport.totalRevenue : 0,
        roas: editingReport.roas !== undefined ? editingReport.roas : 0,
        cpa: editingReport.cpa || '',
        aov: editingReport.aov || '',
        conversionRate: editingReport.conversionRate || '',

        spendChange: editingReport.spendChange || '',
        ordersChange: editingReport.ordersChange || '',
        revenueChange: editingReport.revenueChange || '',
        roasChange: editingReport.roasChange || '',
        cpaChange: editingReport.cpaChange || '',
        aovChange: editingReport.aovChange || '',

        topPerformingCampaigns: editingReport.topPerformingCampaigns || '',
        weakestCampaigns: editingReport.weakestCampaigns || '',
        highestGrowthCampaigns: editingReport.highestGrowthCampaigns || '',
        pausedCampaignsReasons: editingReport.pausedCampaignsReasons || '',
        keyCampaignLearnings: editingReport.keyCampaignLearnings || '',

        topPerformingCreatives: editingReport.topPerformingCreatives || '',
        topPerformingHooks: editingReport.topPerformingHooks || '',
        bestMarketingAngles: editingReport.bestMarketingAngles || '',
        bestContentFormats: editingReport.bestContentFormats || '',
        creativesNeedRefresh: editingReport.creativesNeedRefresh || '',
        keyCreativeLearnings: editingReport.keyCreativeLearnings || '',

        topPerformingProducts: editingReport.topPerformingProducts || '',
        lowPerformingProducts: editingReport.lowPerformingProducts || '',
        productGrowthOpportunities: editingReport.productGrowthOpportunities || '',
        offerPerformance: editingReport.offerPerformance || '',
        upsellCrossSellOpportunities: editingReport.upsellCrossSellOpportunities || '',

        topCustomerObjections: editingReport.topCustomerObjections || '',
        keySalesInsights: editingReport.keySalesInsights || '',
        pricingShippingStockIssues: editingReport.pricingShippingStockIssues || '',
        customerBehaviorChanges: editingReport.customerBehaviorChanges || '',

        biggestWin: editingReport.biggestWin || '',
        biggestChallenge: editingReport.biggestChallenge || '',
        keyLearnings: editingReport.keyLearnings || '',
        keyStrategicInsight: editingReport.keyStrategicInsight || '',

        biggestGrowthOpportunity: editingReport.biggestGrowthOpportunity || '',
        salesGrowthOpportunity: editingReport.salesGrowthOpportunity || '',
        productOfferOpportunities: editingReport.productOfferOpportunities || '',
        scalingOpportunities: editingReport.scalingOpportunities || '',

        whatChanged: editingReport.whatChanged || '',
        isGrowthSustainable: editingReport.isGrowthSustainable || '',
        keyGrowthBarriers: editingReport.keyGrowthBarriers || '',
        whatShouldContinue: editingReport.whatShouldContinue || '',
        whatShouldChange: editingReport.whatShouldChange || '',

        mainGoal: editingReport.mainGoal || '',
        revenueOrderTargets: editingReport.revenueOrderTargets || '',
        targetCpaRoas: editingReport.targetCpaRoas || '',
        advertisingStrategy: editingReport.advertisingStrategy || '',
        contentStrategy: editingReport.contentStrategy || '',
        productOfferStrategy: editingReport.productOfferStrategy || '',
        newTests: editingReport.newTests || '',
        nextQuarterScalingOpportunities: editingReport.nextQuarterScalingOpportunities || '',
        clientActionRequired: editingReport.clientActionRequired || '',

        month1Plan: editingReport.month1Plan || '',
        month2Plan: editingReport.month2Plan || '',
        month3Plan: editingReport.month3Plan || '',

        quarterlyGrowthSummary: editingReport.quarterlyGrowthSummary || '',
        notes: editingReport.notes || '',

        ...(editingReport.customAnswers || {})
      };

      if (editingReport.questionsList && Array.isArray(editingReport.questionsList)) {
        editingReport.questionsList.forEach((qa) => {
          initialValues[qa.id] = qa.answer;
          if (qa.standardKey) initialValues[qa.standardKey] = qa.answer;
        });
      }

      setFormValues(initialValues);
      setActiveTab('performance');
    } else if (isOpen && !editingReport) {
      setReportTitle('');
      setQuarter(`الربع الأول (Q1) ${new Date().getFullYear()}`);
      setYear(new Date().getFullYear());
      setMonth1('يناير');
      setMonth2('فبراير');
      setMonth3('مارس');
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
      setActiveTab('performance');
    }
  }, [editingReport, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: (typeof QUARTER_PRESETS)[0]) => {
    setMonth1(preset.m1);
    setMonth2(preset.m2);
    setMonth3(preset.m3);
    setQuarter(`${preset.qName} ${year}`);
  };

  const getFieldValue = (q: QuarterlyReportQuestion): string | number => {
    if (formValues[q.id] !== undefined) return formValues[q.id];
    if (q.standardKey && formValues[q.standardKey] !== undefined) return formValues[q.standardKey];
    return q.type === 'number' ? 0 : '';
  };

  const handleFieldValueChange = (q: QuarterlyReportQuestion, val: string | number) => {
    setFormValues((prev) => {
      const next = { ...prev, [q.id]: val };
      if (q.standardKey) next[q.standardKey] = val;
      return next;
    });

    const isSpend = q.standardKey === 'totalSpent' || q.id === 'q_perf_spend';
    const isOrders = q.standardKey === 'totalOrders' || q.id === 'q_perf_orders';
    const isRev = q.standardKey === 'totalRevenue' || q.id === 'q_perf_revenue';

    if (isSpend || isOrders || isRev) {
      setTimeout(() => {
        const curVals = { ...formValues, [q.id]: val };
        if (q.standardKey) curVals[q.standardKey] = val;

        const spend = Number(curVals['totalSpent'] ?? curVals['q_perf_spend'] ?? 0);
        const orders = Number(curVals['totalOrders'] ?? curVals['q_perf_orders'] ?? 0);
        const rev = Number(curVals['totalRevenue'] ?? curVals['q_perf_revenue'] ?? 0);

        const updates: Record<string, string | number> = {};
        if (spend > 0 && orders > 0) {
          const cpaCalc = `${(spend / orders).toFixed(1)} EGP`;
          updates['q_perf_cpa'] = cpaCalc;
          updates['cpa'] = cpaCalc;
        }
        if (orders > 0 && rev > 0) {
          const aovCalc = `${(rev / orders).toFixed(1)} EGP`;
          updates['q_perf_aov'] = aovCalc;
          updates['aov'] = aovCalc;
        }
        if (spend > 0 && rev > 0) {
          const roasCalc = Number((rev / spend).toFixed(2));
          updates['q_perf_roas'] = roasCalc;
          updates['roas'] = roasCalc;
        }
        setFormValues((prev) => ({ ...prev, ...updates }));
      }, 0);
    }
  };

  // Dynamic question management
  const handleStartAddQuestion = (sectionId: QuarterlyReportSectionId) => {
    setIsAddingQuestionToSection(sectionId);
    setNewQuestionLabel('');
    setNewQuestionType(sectionId === 'performance' ? 'number' : 'textarea');
    setNewQuestionPlaceholder('');
  };

  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddingQuestionToSection || !newQuestionLabel.trim()) return;

    const newQ: QuarterlyReportQuestion = {
      id: `custom_q_q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sectionId: isAddingQuestionToSection,
      label: newQuestionLabel.trim(),
      placeholder: newQuestionPlaceholder.trim() || undefined,
      type: newQuestionType,
      required: false
    };

    const updated = [...questions, newQ];
    saveQuestionsTemplate(updated);

    setFormValues((prev) => ({
      ...prev,
      [newQ.id]: newQ.type === 'number' ? 0 : ''
    }));

    setIsAddingQuestionToSection(null);
    setNewQuestionLabel('');
    setNewQuestionPlaceholder('');
  };

  const handleStartEditQuestion = (q: QuarterlyReportQuestion) => {
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

  const confirmDeleteQuestion = () => {
    if (!deletingQuestion) return;
    const updated = questions.filter((q) => q.id !== deletingQuestion.id);
    saveQuestionsTemplate(updated);
    setDeletingQuestion(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const questionsList: QuarterlyReportQuestionAnswer[] = questions.map((q) => {
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

    const totalSpentVal = Number(getVal('totalSpent', 'q_perf_spend', 0)) || 0;
    const totalOrdersVal = Number(getVal('totalOrders', 'q_perf_orders', 0)) || 0;
    const totalRevenueVal = Number(getVal('totalRevenue', 'q_perf_revenue', 0)) || 0;
    const roasVal = Number(getVal('roas', 'q_perf_roas', 0)) || 0;

    const data: Omit<QuarterlyReport, 'id' | 'createdAt'> = {
      clientId,
      title: reportTitle.trim() || undefined,
      quarter: quarter.trim() || `الربع ${year}`,
      year: Number(year) || new Date().getFullYear(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      month1Name: month1 || undefined,
      month2Name: month2 || undefined,
      month3Name: month3 || undefined,

      // 1. Performance
      totalSpent: totalSpentVal,
      totalOrders: totalOrdersVal,
      totalRevenue: totalRevenueVal,
      roas: roasVal,
      cpa: String(getVal('cpa', 'q_perf_cpa', '')).trim() || undefined,
      aov: String(getVal('aov', 'q_perf_aov', '')).trim() || undefined,
      conversionRate: String(getVal('conversionRate', 'q_perf_cvr', '')).trim() || undefined,

      // 2. QoQ
      spendChange: String(getVal('spendChange', 'q_qoq_spend', '')).trim() || undefined,
      ordersChange: String(getVal('ordersChange', 'q_qoq_orders', '')).trim() || undefined,
      revenueChange: String(getVal('revenueChange', 'q_qoq_revenue', '')).trim() || undefined,
      roasChange: String(getVal('roasChange', 'q_qoq_roas', '')).trim() || undefined,
      cpaChange: String(getVal('cpaChange', 'q_qoq_cpa', '')).trim() || undefined,
      aovChange: String(getVal('aovChange', 'q_qoq_aov', '')).trim() || undefined,

      // 3. Campaigns
      topPerformingCampaigns: String(getVal('topPerformingCampaigns', 'q_camp_top', '')).trim() || undefined,
      weakestCampaigns: String(getVal('weakestCampaigns', 'q_camp_weak', '')).trim() || undefined,
      highestGrowthCampaigns: String(getVal('highestGrowthCampaigns', 'q_camp_growth', '')).trim() || undefined,
      pausedCampaignsReasons: String(getVal('pausedCampaignsReasons', 'q_camp_paused', '')).trim() || undefined,
      keyCampaignLearnings: String(getVal('keyCampaignLearnings', 'q_camp_learnings', '')).trim() || undefined,

      // 4. Creatives
      topPerformingCreatives: String(getVal('topPerformingCreatives', 'q_creat_top', '')).trim() || undefined,
      topPerformingHooks: String(getVal('topPerformingHooks', 'q_creat_hooks', '')).trim() || undefined,
      bestMarketingAngles: String(getVal('bestMarketingAngles', 'q_creat_angles', '')).trim() || undefined,
      bestContentFormats: String(getVal('bestContentFormats', 'q_creat_formats', '')).trim() || undefined,
      creativesNeedRefresh: String(getVal('creativesNeedRefresh', 'q_creat_refresh', '')).trim() || undefined,
      keyCreativeLearnings: String(getVal('keyCreativeLearnings', 'q_creat_learnings', '')).trim() || undefined,

      // 5. Products
      topPerformingProducts: String(getVal('topPerformingProducts', 'q_prod_top', '')).trim() || undefined,
      lowPerformingProducts: String(getVal('lowPerformingProducts', 'q_prod_low', '')).trim() || undefined,
      productGrowthOpportunities: String(getVal('productGrowthOpportunities', 'q_prod_growth', '')).trim() || undefined,
      offerPerformance: String(getVal('offerPerformance', 'q_prod_offers', '')).trim() || undefined,
      upsellCrossSellOpportunities: String(getVal('upsellCrossSellOpportunities', 'q_prod_upsell', '')).trim() || undefined,

      // 6. Insights
      topCustomerObjections: String(getVal('topCustomerObjections', 'q_ins_objections', '')).trim() || undefined,
      keySalesInsights: String(getVal('keySalesInsights', 'q_ins_sales', '')).trim() || undefined,
      pricingShippingStockIssues: String(getVal('pricingShippingStockIssues', 'q_ins_issues', '')).trim() || undefined,
      customerBehaviorChanges: String(getVal('customerBehaviorChanges', 'q_ins_behavior', '')).trim() || undefined,

      // 7. Learnings
      biggestWin: String(getVal('biggestWin', 'q_learn_win', '')).trim() || undefined,
      biggestChallenge: String(getVal('biggestChallenge', 'q_learn_challenge', '')).trim() || undefined,
      keyLearnings: String(getVal('keyLearnings', 'q_learn_key', '')).trim() || undefined,
      keyStrategicInsight: String(getVal('keyStrategicInsight', 'q_learn_insight', '')).trim() || undefined,

      // 8. Growth
      biggestGrowthOpportunity: String(getVal('biggestGrowthOpportunity', 'q_grow_biggest', '')).trim() || undefined,
      salesGrowthOpportunity: String(getVal('salesGrowthOpportunity', 'q_grow_sales', '')).trim() || undefined,
      productOfferOpportunities: String(getVal('productOfferOpportunities', 'q_grow_offers', '')).trim() || undefined,
      scalingOpportunities: String(getVal('scalingOpportunities', 'q_grow_scaling', '')).trim() || undefined,

      // 9. Review
      whatChanged: String(getVal('whatChanged', 'q_rev_changed', '')).trim() || undefined,
      isGrowthSustainable: String(getVal('isGrowthSustainable', 'q_rev_sustainable', '')).trim() || undefined,
      keyGrowthBarriers: String(getVal('keyGrowthBarriers', 'q_rev_barriers', '')).trim() || undefined,
      whatShouldContinue: String(getVal('whatShouldContinue', 'q_rev_continue', '')).trim() || undefined,
      whatShouldChange: String(getVal('whatShouldChange', 'q_rev_change', '')).trim() || undefined,

      // 10. Strategy
      mainGoal: String(getVal('mainGoal', 'q_strat_goal', '')).trim() || undefined,
      revenueOrderTargets: String(getVal('revenueOrderTargets', 'q_strat_targets', '')).trim() || undefined,
      targetCpaRoas: String(getVal('targetCpaRoas', 'q_strat_cpa_roas', '')).trim() || undefined,
      advertisingStrategy: String(getVal('advertisingStrategy', 'q_strat_ads', '')).trim() || undefined,
      contentStrategy: String(getVal('contentStrategy', 'q_strat_content', '')).trim() || undefined,
      productOfferStrategy: String(getVal('productOfferStrategy', 'q_strat_product_plan', '')).trim() || undefined,
      newTests: String(getVal('newTests', 'q_strat_tests', '')).trim() || undefined,
      nextQuarterScalingOpportunities: String(getVal('nextQuarterScalingOpportunities', 'q_strat_scaling', '')).trim() || undefined,
      clientActionRequired: String(getVal('clientActionRequired', 'q_strat_client', '')).trim() || undefined,

      // 11. Plan 90
      month1Plan: String(getVal('month1Plan', 'q_plan_m1', '')).trim() || undefined,
      month2Plan: String(getVal('month2Plan', 'q_plan_m2', '')).trim() || undefined,
      month3Plan: String(getVal('month3Plan', 'q_plan_m3', '')).trim() || undefined,

      // 12. Summary
      quarterlyGrowthSummary: String(getVal('quarterlyGrowthSummary', 'q_sum_growth', '')).trim() || undefined,
      notes: String(getVal('notes', 'q_sum_notes', '')).trim() || undefined,

      customAnswers: formValues,
      questionsList,
      customSectionsQuestions: questions
    };

    onSubmit(data);
    onClose();
  };

  const currentSectionQuestions = questions.filter((q) => q.sectionId === activeTab);
  const activeMeta = QUARTERLY_SECTIONS.find((s) => s.id === activeTab)!;
  const ActiveIcon = activeMeta.icon;

  return (
    <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-5xl max-h-[94vh] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 my-auto">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between gap-3 shrink-0 bg-[#F9F8F6] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#5A5A40] text-white rounded-2xl shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                  {editingReport ? 'تعديل التقرير الربع سنوي' : 'إنشاء تقرير ربع سنوي جديد'}
                </span>
                <span className="text-xs text-[#8E8E85] font-bold">
                  {brandName || 'البراند'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#2D2D2A] mt-0.5">
                التقرير الاستراتيجي الربع سنوي وخطة الـ 90 يوماً
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Basic Quarter & Dates Configuration Bar */}
        <div className="p-4 border-b border-[#E5E5E0] bg-[#F9F8F6]/80 shrink-0 space-y-3">
          {/* Quick Quarter Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-[#8E8E85] shrink-0 ml-1">
              اختر الربع:
            </span>
            {QUARTER_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 bg-white hover:bg-[#5A5A40] hover:text-white text-[#5A5A40] border border-[#E5E5E0] rounded-xl text-[11px] font-extrabold transition cursor-pointer shrink-0 shadow-2xs"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Report Title field */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2D2D2A] mb-1">
              اسم أو عنوان التقرير (اختياري)
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2.5 text-xs font-bold text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
              placeholder="مثال: التقرير الاستراتيجي للربع الأول 2026 أو أي اسم مخصص..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-[#2D2D2A] mb-1">
                اسم الربع *
              </label>
              <input
                type="text"
                required
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs font-bold text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                placeholder="مثال: الربع الأول (Q1) 2026"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#2D2D2A] mb-1">
                السنة *
              </label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs font-bold text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#2D2D2A] mb-1">
                تاريخ البداية (اختياري)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#2D2D2A] mb-1">
                تاريخ النهاية (اختياري)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2 text-xs text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>
        </div>

        {/* 12 Sections Navigation Tabs */}
        <div className="flex items-center border-b border-[#E5E5E0] bg-[#F9F8F6] px-4 pt-2 gap-1.5 overflow-x-auto shrink-0 text-xs">
          {QUARTERLY_SECTIONS.map((sec) => {
            const count = questions.filter((q) => q.sectionId === sec.id).length;
            const isActive = activeTab === sec.id;
            const Icon = sec.icon;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveTab(sec.id)}
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
                    isActive ? 'bg-[#5A5A40] text-white' : 'bg-[#E5E5E0] text-[#78786E]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div className="space-y-4">
            {/* Section Header & Customization Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E5E0] shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl shrink-0">
                  <ActiveIcon className="w-4 h-4" />
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

              {/* Questions Controls: Add & Reset */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleStartAddQuestion(activeTab)}
                  className="px-3 py-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white text-[11px] font-extrabold rounded-xl transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة سؤال جديد</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleResetSectionQuestions(activeTab)}
                  title="استعادة الأسئلة الافتراضية لهذا القسم"
                  className="p-1.5 bg-white border border-[#E5E5E0] text-[#78786E] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inline Add New Question Form */}
            {isAddingQuestionToSection === activeTab && (
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
                    placeholder="اكتب نص السؤال هنا..."
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

            {/* Questions Grid */}
            {currentSectionQuestions.length === 0 ? (
              <div className="bg-[#F9F8F6] border-2 border-dashed border-[#E5E5E0] rounded-2xl p-8 text-center space-y-2">
                <p className="text-xs font-bold text-[#8E8E85]">
                  لا توجد أسئلة حالياً في هذا القسم.
                </p>
                <button
                  type="button"
                  onClick={() => handleStartAddQuestion(activeTab)}
                  className="px-3 py-1.5 bg-[#5A5A40] text-white rounded-xl text-xs font-extrabold hover:bg-[#4a4a34] cursor-pointer shadow-2xs"
                >
                  + إضافة أول سؤال
                </button>
              </div>
            ) : (
              <div
                className={`grid ${
                  activeTab === 'performance'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                    : activeTab === 'summary' || activeTab === 'plan90'
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
                        q.id === 'q_perf_cvr' ||
                        q.id === 'q_strat_goal' ||
                        q.id === 'q_sum_growth'
                          ? 'sm:col-span-2 md:col-span-3'
                          : ''
                      }`}
                    >
                      {/* Question Title & Actions */}
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
                              title="تعديل السؤال"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingQuestion(q)}
                              className="p-1 text-[#8E8E85] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="حذف السؤال"
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
                              rows={activeTab === 'summary' || activeTab === 'plan90' ? 4 : 2}
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

          {/* Form Actions & Navigation */}
          <div className="pt-3 sm:pt-4 border-t border-[#E5E5E0] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              {activeTab !== 'performance' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = QUARTERLY_SECTIONS.map((s) => s.id);
                    const idx = tabs.indexOf(activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1]);
                  }}
                  className="px-3.5 py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] rounded-xl text-xs font-extrabold hover:bg-[#F5F5F0] transition cursor-pointer"
                >
                  القسم السابق
                </button>
              )}

              {activeTab !== 'summary' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = QUARTERLY_SECTIONS.map((s) => s.id);
                    const idx = tabs.indexOf(activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
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
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] rounded-xl text-xs font-extrabold hover:bg-[#F5F5F0] transition cursor-pointer text-center"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-2.5 sm:py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-xs text-center"
              >
                {editingReport ? 'حفظ التعديلات' : 'حفظ التقرير الربع سنوي'}
              </button>
            </div>
          </div>
        </form>
      </div>

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
                <p className="text-xs text-[#8E8E85]">هل أنت متأكد من رغبتك في حذف هذا السؤال من نموذج الربع سنوي؟</p>
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
