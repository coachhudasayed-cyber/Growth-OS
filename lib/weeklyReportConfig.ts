import {
  WeeklyReport,
  WeeklyReportCampaignEntry,
  WeeklyReportOrganicEntry,
  WeeklyReportQuestion,
  WeeklyReportQuestionAnswer,
  WeeklyReportSection
} from '../types';

export const DEFAULT_WEEKLY_REPORT_SECTIONS: WeeklyReportSection[] = [
  { id: 'campaigns', title: '1. CAMPAIGNS PERFORMANCE', kind: 'campaigns' },
  { id: 'organic', title: '2. ORGANIC CONTENT PERFORMANCE', kind: 'organic' }
];

export const DEFAULT_WEEKLY_REPORT_QUESTIONS: WeeklyReportQuestion[] = [
  {
    id: 'campaign_name',
    sectionId: 'campaigns',
    label: 'Campaign Name',
    placeholder: 'اسم الحملة',
    type: 'text',
    standardKey: 'campaignName'
  },
  {
    id: 'campaign_objective',
    sectionId: 'campaigns',
    label: 'Objective',
    placeholder: 'اكتبي هدف الحملة يدويا',
    type: 'text',
    standardKey: 'objective'
  },
  {
    id: 'campaign_platform',
    sectionId: 'campaigns',
    label: 'Platforms',
    placeholder: 'Meta / TikTok / Google / ...',
    type: 'text',
    standardKey: 'platform'
  },
  {
    id: 'campaign_spend',
    sectionId: 'campaigns',
    label: 'Total Spend',
    placeholder: '0',
    type: 'number',
    standardKey: 'spend'
  },
  {
    id: 'campaign_days_worked',
    sectionId: 'campaigns',
    label: 'Days Worked',
    placeholder: 'مثال: 5',
    type: 'number',
    standardKey: 'daysWorked'
  },
  {
    id: 'campaign_main_result',
    sectionId: 'campaigns',
    label: 'Result So Far',
    placeholder: 'اكتبي أهم نتيجة وصلنالها لحد دلوقتي',
    type: 'text',
    standardKey: 'mainResult'
  },
  {
    id: 'campaign_performance_summary',
    sectionId: 'campaigns',
    label: 'Performance Summary',
    placeholder: 'اكتبي شرح بسيط لملخص أداء الحملة...',
    type: 'textarea',
    standardKey: 'performanceSummary'
  },
  {
    id: 'organic_platform',
    sectionId: 'organic',
    label: 'Platform',
    placeholder: 'Instagram / Facebook / TikTok / ...',
    type: 'text',
    standardKey: 'organicPlatform'
  },
  {
    id: 'organic_content_published',
    sectionId: 'organic',
    label: 'Content Published',
    placeholder: '0',
    type: 'number',
    standardKey: 'contentPublished'
  },
  {
    id: 'organic_reach',
    sectionId: 'organic',
    label: 'Reach',
    placeholder: '0',
    type: 'number',
    standardKey: 'organicReach'
  },
  {
    id: 'organic_reach_change',
    sectionId: 'organic',
    label: 'Reach Change %',
    placeholder: 'مثال: 25 أو -10',
    type: 'number',
    standardKey: 'reachChange'
  },
  {
    id: 'organic_interactions',
    sectionId: 'organic',
    label: 'Engagement / Interactions',
    placeholder: '0',
    type: 'number',
    standardKey: 'interactions'
  },
  {
    id: 'organic_followers_gained',
    sectionId: 'organic',
    label: 'Followers Gained',
    placeholder: '0',
    type: 'number',
    standardKey: 'followersGained'
  },
  {
    id: 'organic_profile_visits',
    sectionId: 'organic',
    label: 'Profile Visits',
    placeholder: '0',
    type: 'number',
    standardKey: 'profileVisits'
  }
];

const LEGACY_SECTION_ORDER = ['performance', 'wow', 'campaigns', 'analysis', 'plan', 'summary'];
const LEGACY_SECTION_TITLES: Record<string, string> = {
  performance: 'Weekly Performance',
  wow: 'Previous Week Comparison',
  campaigns: 'Campaign Performance',
  analysis: 'Weekly Analysis',
  plan: 'Next Week Plan',
  summary: 'Decision Summary'
};

const hasAnswer = (answer: unknown) => {
  if (typeof answer === 'number') return Number.isFinite(answer);
  return String(answer ?? '').trim().length > 0;
};

export interface WeeklyReportDisplaySection {
  id: string;
  title: string;
  kind: 'fields' | 'campaigns' | 'organic';
  fields: WeeklyReportQuestionAnswer[];
  campaignFields: WeeklyReportQuestion[];
  campaignEntries: WeeklyReportCampaignEntry[];
  organicFields: WeeklyReportQuestion[];
  organicEntries: WeeklyReportOrganicEntry[];
}

const getLegacyQuestionsFromFields = (rep: WeeklyReport): WeeklyReportQuestionAnswer[] => {
  const rows: Array<[string, string, unknown, 'number' | 'text' | 'textarea']> = [
    ['legacy_total_spend', 'Total Spend', rep.totalSpent, 'number'],
    ['legacy_total_orders', 'Total Orders', rep.totalOrders ?? rep.totalConversions, 'number'],
    ['legacy_total_revenue', 'Total Revenue', rep.totalRevenue ?? rep.salesValue, 'number'],
    ['legacy_roas', 'ROAS', rep.roas, 'number'],
    ['legacy_cpa', 'CPA', rep.cpa, 'text'],
    ['legacy_aov', 'AOV', rep.aov, 'text'],
    ['legacy_cvr', 'Conversion Rate', rep.conversionRate, 'text'],
    ['legacy_spend_change', 'Spend Change', rep.spendChange, 'textarea'],
    ['legacy_orders_change', 'Orders Change', rep.ordersChange, 'textarea'],
    ['legacy_revenue_change', 'Revenue Change', rep.revenueChange, 'textarea'],
    ['legacy_roas_change', 'ROAS Change', rep.roasChange, 'textarea'],
    ['legacy_cpa_change', 'CPA Change', rep.cpaChange, 'textarea'],
    ['legacy_aov_change', 'AOV Change', rep.aovChange, 'textarea'],
    ['legacy_best_campaign', 'Best Performing Campaign', rep.bestCampaign, 'textarea'],
    ['legacy_weak_campaign', 'Weakest Campaign', rep.weakestCampaign, 'textarea'],
    ['legacy_improving', 'Improving Campaigns', rep.improvingCampaigns, 'textarea'],
    ['legacy_declining', 'Declining Campaigns', rep.decliningCampaigns, 'textarea'],
    ['legacy_scaling', 'Scaling Campaigns', rep.scalingCampaigns, 'textarea'],
    ['legacy_pause', 'Optimization / Pause', rep.optimizationPauseCampaigns, 'textarea'],
    ['legacy_worked', 'What Worked Well', rep.whatWorkedWell, 'textarea'],
    ['legacy_improve', 'What Needs Improvement', rep.whatNeedsImprovement, 'textarea'],
    ['legacy_changes', 'Key Changes', rep.keyChanges ?? rep.whatChangedFromLastWeek, 'textarea'],
    ['legacy_insight', 'Key Insight', rep.keyInsight, 'textarea'],
    ['legacy_sales_notes', 'Sales & Lead Data Notes', rep.salesAndLeadNotes ?? rep.dailyClientDataNotes, 'textarea'],
    ['legacy_goal', 'Next Week Goal', rep.nextWeekGoal, 'text'],
    ['legacy_priorities', 'Top Priorities', rep.topPriorities, 'textarea'],
    ['legacy_adjustments', 'Campaign Adjustments', rep.campaignAdjustments ?? rep.campaignAdjustmentsNextWeek, 'textarea'],
    ['legacy_tests', 'New Tests', rep.newTests ?? rep.newTestsNextWeek, 'textarea'],
    ['legacy_client_action', 'Action Required from Client', rep.clientRequiredAction ?? rep.clientRequiredActionNextWeek, 'textarea'],
    ['legacy_decision', 'Decision Summary', rep.decisionSummary, 'textarea']
  ];

  const sectionFor = (id: string) => {
    if (/total_|roas|cpa|aov|cvr/.test(id)) return 'performance';
    if (/change/.test(id)) return 'wow';
    if (/campaign|improving|declining|scaling|pause/.test(id)) return 'campaigns';
    if (/worked|improve|changes|insight|sales_notes/.test(id)) return 'analysis';
    if (/goal|priorities|adjustments|tests|client_action/.test(id)) return 'plan';
    return 'summary';
  };

  return rows
    .filter(([, , answer]) => hasAnswer(answer))
    .map(([id, question, answer, type]) => ({
      id,
      sectionId: sectionFor(id),
      question,
      answer: answer as string | number,
      type
    }));
};

export const getWeeklyReportDisplaySections = (rep: WeeklyReport): WeeklyReportDisplaySection[] => {
  const savedQuestions = rep.customSectionsQuestions || [];
  const savedAnswers = rep.questionsList || [];

  if (rep.sectionsSnapshot?.length) {
    return rep.sectionsSnapshot.map(section => {
      const sectionQuestions = savedQuestions.filter(q => q.sectionId === section.id);
      const fields = savedAnswers.filter(qa => qa.sectionId === section.id && hasAnswer(qa.answer));
      const campaignEntries = section.kind === 'campaigns' ? (rep.campaignEntries || []) : [];
      const nonEmptyCampaigns = campaignEntries.filter(entry =>
        sectionQuestions.some(q => hasAnswer(entry.answers?.[q.id]))
      );
      const organicEntries = section.kind === 'organic' ? (rep.organicEntries || []) : [];
      const nonEmptyOrganic = organicEntries.filter(entry =>
        sectionQuestions.some(q => hasAnswer(entry.answers?.[q.id]))
      );
      return {
        id: section.id,
        title: section.title,
        kind: section.kind || (section.id === 'campaigns' ? 'campaigns' : 'fields'),
        fields,
        campaignFields: section.kind === 'campaigns' ? sectionQuestions : [],
        campaignEntries: nonEmptyCampaigns,
        organicFields: section.kind === 'organic' ? sectionQuestions : [],
        organicEntries: nonEmptyOrganic
      };
    }).filter(section => section.fields.length > 0 || section.campaignEntries.length > 0 || section.organicEntries.length > 0);
  }

  // Historical reports keep their saved question/answer snapshot and remain readable.
  const legacyAnswers = savedAnswers.length > 0 ? savedAnswers.filter(qa => hasAnswer(qa.answer)) : getLegacyQuestionsFromFields(rep);
  const ids = Array.from(new Set(legacyAnswers.map(qa => String(qa.sectionId || 'performance'))));
  const orderedIds = [
    ...LEGACY_SECTION_ORDER.filter(id => ids.includes(id)),
    ...ids.filter(id => !LEGACY_SECTION_ORDER.includes(id))
  ];

  return orderedIds.map(sectionId => ({
    id: sectionId,
    title: LEGACY_SECTION_TITLES[sectionId] || sectionId,
    kind: 'fields' as const,
    fields: legacyAnswers.filter(qa => String(qa.sectionId || 'performance') === sectionId),
    campaignFields: [],
    campaignEntries: [],
    organicFields: [],
    organicEntries: []
  })).filter(section => section.fields.length > 0);
};

export const getWeeklyReportSearchText = (rep: WeeklyReport) => {
  const parts = [
    rep.title,
    rep.weekStartDate,
    rep.weekEndDate,
    rep.campaignsRunThisWeek,
    rep.keyLearnings,
    rep.nextWeekActions
  ];

  (rep.questionsList || []).forEach(qa => {
    parts.push(qa.question, String(qa.answer ?? ''));
  });
  (rep.campaignEntries || []).forEach(entry => {
    Object.values(entry.answers || {}).forEach(value => parts.push(String(value ?? '')));
  });
  (rep.organicEntries || []).forEach(entry => {
    Object.values(entry.answers || {}).forEach(value => parts.push(String(value ?? '')));
  });

  return parts.filter(Boolean).join(' ').toLowerCase();
};
