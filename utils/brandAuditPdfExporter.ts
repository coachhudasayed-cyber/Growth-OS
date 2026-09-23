import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { AuditCheckItem, BrandAudit, CompetitorItem } from '../types';

type PdfRow = {
  label: string;
  value: string;
};

type PdfGroup = {
  title?: string;
  rows: PdfRow[];
};

type PdfSection = {
  id: string;
  title: string;
  groups: PdfGroup[];
};

export interface BrandAuditDataPdfOptions {
  filename: string;
  sectionId?: string;
}

const BUILT_IN_ORDER = [
  'overview',
  'digitalAssets',
  'tracking',
  'creative',
  'socialMedia',
  'operations',
  'salesFunnel',
  'unitEconomics',
  'historicalAds',
  'competitors',
  'swot',
  'persona',
  'problems'
];

const DEFAULT_TITLES: Record<string, string> = {
  overview: '1. Brand Overview | نبذة عن البراند',
  digitalAssets: '2. Digital Assets Audit | تقييم الاصول الرقمية',
  tracking: '3. Tracking Audit | تقييم التتبع',
  creative: '4. Creative & Content Audit | تقييم المحتوى والكريتيف',
  socialMedia: '5. Social Media Audit | تقييم السوشيال ميديا',
  operations: '6. Operations Audit | تقييم التشغيل',
  salesFunnel: '7. Sales Funnel Audit | تقييم رحلة العميل',
  unitEconomics: '8. Unit Economics & Pricing | ربحية المنتج والتسعير',
  historicalAds: '9. Historical Ads Analysis | تحليل الاعلانات السابقة',
  competitors: '10. Competitor Analysis | تحليل المنافسين',
  swot: '11. SWOT Analysis',
  persona: '12. Customer Persona & Brand Positioning',
  problems: '13. Main Problems & Solutions | اهم المشاكل والحلول'
};

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join('، ');
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value).trim();
};

const row = (label: string, value: unknown): PdfRow | null => {
  const text = clean(value);
  return text ? { label, value: text } : null;
};

const compactRows = (rows: Array<PdfRow | null | undefined>) =>
  rows.filter((item): item is PdfRow => Boolean(item && item.value));

const checklistRows = (items?: AuditCheckItem[]) =>
  (items || []).map(item => ({
    label: item.label || 'Question',
    value: [clean(item.status), clean(item.notes)].filter(Boolean).join('\n')
  })).filter(item => item.value);

const checklistRowsWithEmpty = (items?: AuditCheckItem[]) =>
  (items || []).map(item => ({
    label: item.label || 'Question',
    value: [clean(item.status), clean(item.notes)].filter(Boolean).join('\n') || '—'
  }));

const COMPETITOR_AXIS_TITLES: Record<string, string> = {
  '1': '1. Competitor Profile | بيانات المنافس',
  '2': '2. Pricing & Offers | التسعير والعروض',
  '3': '3. Marketing & Content | التسويق والمحتوى',
  '4': '4. Advertising | الإعلانات',
  '5': '5. Customer Experience | تجربة العميل',
  '6': '6. Competitive Assessment | أداء المنافس',
  '7': '7. Market Opportunities | فرص السوق',
  '8': '8. Competitive Threats | التهديدات',
  '9': '9. Strategic Takeaways | التوصيات الاستراتيجية'
};

const getCompetitorAxisRows = (
  competitor: CompetitorItem,
  axisKey: string,
  template?: Record<string, AuditCheckItem[]>
): PdfRow[] => {
  const savedItems = competitor.sectionChecklists?.[axisKey] || [];
  const structure = template?.[axisKey]?.length ? template[axisKey] : savedItems;
  const savedById = new Map(savedItems.map(item => [item.id, item]));

  const merged = structure.map(item => {
    const saved = savedById.get(item.id);
    return {
      ...item,
      status: saved?.status ?? item.status ?? '',
      notes: saved?.notes ?? item.notes
    };
  });

  return checklistRowsWithEmpty(merged);
};

const mergeChecklistRows = (...lists: Array<AuditCheckItem[] | undefined>) => {
  const seen = new Set<string>();
  const merged: AuditCheckItem[] = [];
  lists.forEach(list => {
    (list || []).forEach(item => {
      const key = item.id || item.label;
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(item);
    });
  });
  return checklistRows(merged);
};

const getSectionTitle = (audit: BrandAudit, id: string) =>
  audit.builtInSectionSettings?.[id]?.title || DEFAULT_TITLES[id] || id;

const group = (title: string | undefined, rows: Array<PdfRow | null | undefined>): PdfGroup | null => {
  const filtered = compactRows(rows);
  return filtered.length ? { title, rows: filtered } : null;
};

const checklistGroup = (title: string | undefined, items?: AuditCheckItem[]) => {
  const rows = checklistRows(items);
  return rows.length ? { title, rows } : null;
};

const knownCompetitorRows = (competitor: CompetitorItem) => compactRows([
  row('Competitor Name | اسم المنافس', competitor.name),
  row('Competitor Type | نوع المنافس', competitor.competitorType),
  row('Page / Website | الرابط', competitor.pageLink),
  row('Products | المنتجات', competitor.products),
  row('Target Audience | الجمهور المستهدف', competitor.targetAudience),
  row('Sales Channels | قنوات البيع', competitor.salesChannels),
  row('Average Price | متوسط السعر', competitor.price),
  row('Offers | العروض', competitor.offers),
  row('Discounts | الخصومات', competitor.discounts),
  row('Bundles | الباقات', competitor.bundles),
  row('Gifts & Extras | الهدايا والمزايا', competitor.giftsAndExtras),
  row('Warranty & Returns | الضمان والاسترجاع', competitor.warrantyAndReturns),
  row('Marketing Channels | قنوات التسويق', competitor.marketingChannels),
  row('Posting Frequency | معدل النشر', competitor.postingFrequency),
  row('Content Type | نوع المحتوى', competitor.contentType),
  row('Best Performing Content | افضل محتوى', competitor.bestPerformingContent),
  row('Marketing Message | الرسالة التسويقية', competitor.marketingMessage),
  row('Photography / Creative Style | اسلوب التصوير', competitor.photographyStyle),
  row('Primary CTA', competitor.primaryCta),
  row('Current Ads | الاعلانات الحالية', competitor.currentAds),
  row('Ad Copy', competitor.adCopy),
  row('Ad Hook', competitor.adHook),
  row('Ad CTA', competitor.adCta),
  row('Landing Page / Purchase Link', competitor.landingPageOrPurchaseLink),
  row('Offer Type Used', competitor.offerTypeUsed),
  row('Ad Strategy Notes', competitor.adStrategyNotes),
  row('Landing Page Quality', competitor.landingPageQuality),
  row('Ease of Purchase | سهولة الشراء', competitor.easeOfPurchase),
  row('After Sales Service | خدمة ما بعد البيع', competitor.afterSalesService),
  row('Reviews & Feedback | التقييمات', competitor.reviewsAndFeedback),
  row('Recurring Complaints / Objections', competitor.recurringComplaintsOrObjections),
  row('Strengths | نقاط القوة', competitor.strengths),
  row('Weaknesses | نقاط الضعف', competitor.weaknesses),
  row('Engagement Level | مستوى التفاعل', competitor.engagementLevel),
  row('Winning Patterns', competitor.winningPatterns),
  row('Key Differentiator | اهم ميزة', competitor.keyDifferentiator),
  row('Market Gaps | فجوات السوق', competitor.marketGaps),
  row('Unexploited Needs | احتياجات غير مستغلة', competitor.unexploitedNeeds),
  row('Opportunities to Exploit | فرص الاستغلال', competitor.opportunitiesToExploit),
  row('Ideas to Test | افكار للاختبار', competitor.ideasToTest),
  row('Biggest Threat | اكبر تهديد', competitor.biggestThreat),
  row('Why Customers Choose Them | لماذا يختاره العميل', competitor.whyCustomerChoosesThem),
  row('Movements to Watch | تحركات تستحق المتابعة', competitor.movementsToWatch),
  row('What to Learn | ماذا نتعلم', competitor.whatToLearn),
  row('What Not to Copy | ماذا لا ننسخ', competitor.whatNotToCopy),
  row('What to Test | ما الذي نختبره', competitor.whatToTest),
  row('Opportunity to Exploit | الفرصة', competitor.opportunityToExploit),
  row('Recommended Action | الاجراء المقترح', competitor.recommendedAction),
  row('Price Difference Reason | سبب فرق السعر', competitor.priceDiffReason)
]);

const buildSections = (audit: BrandAudit): PdfSection[] => {
  const sections: PdfSection[] = [];

  const overviewLabels = audit.overviewFieldLabels || {};
  const overviewRows = compactRows([
    row(overviewLabels.brandName || 'Brand Name | اسم البراند', audit.overview?.brandName),
    row(overviewLabels.industry || 'Business Activity | نشاط البراند', audit.overview?.industry),
    row(overviewLabels.coreProducts || 'Core Products | المنتجات الاساسية', audit.overview?.coreProducts),
    row(overviewLabels.targetAudience || 'Target Audience | الجمهور المستهدف', audit.overview?.targetAudience),
    row(overviewLabels.avgProductPrice || 'Average Price | متوسط السعر', audit.overview?.avgProductPrice),
    row(overviewLabels.avgMonthlyOrders || 'Average Monthly Orders | متوسط الاوردرات', audit.overview?.avgMonthlyOrders),
    row(overviewLabels.salesLocations || 'Coverage Areas | مناطق التغطية', audit.overview?.salesLocations),
    row(overviewLabels.brandStage || 'Brand Stage | مرحلة البراند', audit.overview?.brandStage),
    row(overviewLabels.salesChannels || 'Sales Channels | قنوات البيع', audit.overview?.salesChannels)
  ]);
  // Important: overview.checklist contains every extra overview question created by the user.
  overviewRows.push(...checklistRows(audit.overview?.checklist));
  sections.push({
    id: 'overview',
    title: getSectionTitle(audit, 'overview'),
    groups: [{ rows: overviewRows }]
  });

  const digitalGroups = [
    checklistGroup('Website / Store | الموقع او المتجر', audit.digitalAssets?.websiteChecklist),
    checklistGroup('Landing Page | صفحة الهبوط', audit.digitalAssets?.landingPageChecklist),
    checklistGroup('Contacts | وسائل التواصل', audit.digitalAssets?.contactsChecklist)
  ].filter(Boolean) as PdfGroup[];
  sections.push({ id: 'digitalAssets', title: getSectionTitle(audit, 'digitalAssets'), groups: digitalGroups });

  const trackingChecklist = mergeChecklistRows(audit.trackingAudit?.checklist, audit.trackingAudit?.eventsChecklist);
  sections.push({
    id: 'tracking',
    title: getSectionTitle(audit, 'tracking'),
    groups: trackingChecklist.length
      ? [{ rows: trackingChecklist }]
      : [{
          rows: compactRows([
            row('Meta Pixel', audit.trackingAudit?.metaPixelStatus),
            row('Conversion API (CAPI)', audit.trackingAudit?.capiStatus),
            row('Events | الاحداث', audit.trackingAudit?.eventsNotes)
          ])
        }]
  });

  const creativeGroups = [
    checklistGroup('Brand Identity | الهوية البصرية', audit.creativeAudit?.brandIdentityChecklist),
    checklistGroup('Content Quality | جودة المحتوى', audit.creativeAudit?.contentQualityChecklist),
    checklistGroup('UGC Content', audit.creativeAudit?.ugcChecklist),
    checklistGroup('Hooks', audit.creativeAudit?.hooksChecklist),
    checklistGroup('Value Proposition', audit.creativeAudit?.valuePropChecklist),
    checklistGroup('Offers | العروض', audit.creativeAudit?.offersChecklist)
  ].filter(Boolean) as PdfGroup[];
  if (!creativeGroups.length) {
    const fallback = group(undefined, [
      row('Brand Identity', audit.creativeAudit?.brandIdentity),
      row('Content Quality', audit.creativeAudit?.contentQuality),
      row('UGC Content', audit.creativeAudit?.ugcContent),
      row('Hooks Quality', audit.creativeAudit?.hooksQuality),
      row('Value Proposition', audit.creativeAudit?.valueProposition),
      row('Offers Analysis', audit.creativeAudit?.offersAnalysis)
    ]);
    if (fallback) creativeGroups.push(fallback);
  }
  sections.push({ id: 'creative', title: getSectionTitle(audit, 'creative'), groups: creativeGroups });

  const socialRows = checklistRows(audit.socialMediaAudit?.checklist);
  sections.push({
    id: 'socialMedia',
    title: getSectionTitle(audit, 'socialMedia'),
    groups: [{
      rows: socialRows.length ? socialRows : compactRows([
        row('Page Appearance | شكل الصفحة', audit.socialMediaAudit?.pageAppearance),
        row('Content Regularity | انتظام المحتوى', audit.socialMediaAudit?.contentRegularity),
        row('Customer Service Notes | خدمة العملاء', audit.socialMediaAudit?.customerServiceNotes)
      ])
    }]
  });

  const operationsRows = checklistRows(audit.operationsAudit?.checklist);
  sections.push({
    id: 'operations',
    title: getSectionTitle(audit, 'operations'),
    groups: [{
      rows: operationsRows.length ? operationsRows : compactRows([
        row('Packaging & Gifts | التغليف والهدايا', audit.operationsAudit?.packagingGifts),
        row('Reply Speed | سرعة الرد', audit.operationsAudit?.replySpeed),
        row('Customer Service Quality | جودة خدمة العملاء', audit.operationsAudit?.customerServiceQuality),
        row('Shipping Duration | مدة الشحن', audit.operationsAudit?.shippingDuration),
        row('Return Policy | سياسة الاسترجاع', audit.operationsAudit?.returnPolicy),
        row('Stock Availability | توافر المخزون', audit.operationsAudit?.stockAvailability),
        row('Team Capacity | قدرة الفريق', audit.operationsAudit?.teamCapacity)
      ])
    }]
  });

  const funnelRows = checklistRows(audit.salesFunnel?.checklist);
  sections.push({
    id: 'salesFunnel',
    title: getSectionTitle(audit, 'salesFunnel'),
    groups: [{
      rows: funnelRows.length ? funnelRows : compactRows([
        row('Entry Sources | مصادر دخول العميل', audit.salesFunnel?.entrySources),
        row('Landing Point | نقطة الوصول', audit.salesFunnel?.landingPoint),
        row('Purchase Method | طريقة الشراء', audit.salesFunnel?.purchaseMethod),
        row('Drop-off Points | نقاط التسريب', audit.salesFunnel?.dropOffPoints)
      ])
    }]
  });

  const unitGroups: PdfGroup[] = [];
  const unitSectionChecklists = audit.unitEconomics?.sectionChecklists || {};
  const unitSectionKeys = Object.keys(unitSectionChecklists);

  if (unitSectionKeys.length) {
    // Render the standard Unit Economics groups in the same fixed order as the UI.
    // Object insertion order can differ in saved data, which previously produced
    // PDFs starting with ads/order before product/selling.
    const orderedUnitSections = [
      { key: 'product', title: 'Product Costs | تكلفة المنتج' },
      { key: 'selling', title: 'Selling Economics | اقتصاديات البيع' },
      { key: 'order', title: 'Order Costs | تكلفة الاوردر' },
      { key: 'ads', title: 'Advertising Profitability | ربحية الاعلانات' }
    ];

    const renderedKeys = new Set<string>();
    orderedUnitSections.forEach(({ key, title }) => {
      const rows = checklistRows(unitSectionChecklists[key]);
      if (rows.length) {
        unitGroups.push({ title, rows });
        renderedKeys.add(key);
      }
    });

    // Keep future/custom groups too, but only after the standard groups.
    unitSectionKeys
      .filter(key => !renderedKeys.has(key))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .forEach(key => {
        const rows = checklistRows(unitSectionChecklists[key]);
        if (rows.length) unitGroups.push({ title: key, rows });
      });
  } else {
    const unitRows = checklistRows(audit.unitEconomics?.checklist);
    if (unitRows.length) unitGroups.push({ rows: unitRows });
  }
  if (!unitGroups.length) {
    const fallback = group(undefined, [
      row('Average Price Range | متوسط السعر', audit.unitEconomics?.avgPriceRange),
      row('Competitor Comparison | مقارنة المنافسين', audit.unitEconomics?.competitorComparison),
      row('Price Justification | تبرير السعر', audit.unitEconomics?.priceJustification),
      row('Value vs Price | القيمة مقابل السعر', audit.unitEconomics?.valueVsPrice),
      row('Offer Support | دعم العروض', audit.unitEconomics?.offerSupport),
      row('Profit Margin | هامش الربح', audit.unitEconomics?.profitMargin),
      row('Allows Ads | قابلية تحمل الاعلانات', audit.unitEconomics?.allowsAds)
    ]);
    if (fallback) unitGroups.push(fallback);
  }
  sections.push({ id: 'unitEconomics', title: getSectionTitle(audit, 'unitEconomics'), groups: unitGroups });

  const historicalRows = checklistRows(audit.historicalAds?.checklist);
  sections.push({
    id: 'historicalAds',
    title: getSectionTitle(audit, 'historicalAds'),
    groups: [{
      rows: historicalRows.length ? historicalRows : compactRows([
        row('Best Campaign | افضل حملة', audit.historicalAds?.bestCampaign),
        row('Worst Campaign | اسوأ حملة', audit.historicalAds?.worstCampaign),
        row('Highest ROAS', audit.historicalAds?.highestRoas),
        row('Lowest CPA', audit.historicalAds?.lowestCpa),
        row('Best Audience | افضل جمهور', audit.historicalAds?.bestAudience),
        row('Best Ad | افضل اعلان', audit.historicalAds?.bestAd),
        row('Success Reasons | اسباب النجاح', audit.historicalAds?.successReasons),
        row('Failure Reasons | اسباب الفشل', audit.historicalAds?.failureReasons)
      ])
    }]
  });

  const competitorGroups: PdfGroup[] = [];
  const competitorTemplate = audit.competitorAnalysisTemplate || {};

  (audit.competitors || []).forEach((competitor, index) => {
    const competitorLabel = `${index + 1}. ${competitor.name || 'Competitor'}`;
    const hasStructuredAnalysis =
      Object.keys(competitorTemplate).length > 0 ||
      Object.keys(competitor.sectionChecklists || {}).length > 0;

    if (hasStructuredAnalysis) {
      // Always render the 9 analysis axes in their intended order.
      for (let axis = 1; axis <= 9; axis += 1) {
        const key = String(axis);
        const rows = getCompetitorAxisRows(competitor, key, competitorTemplate);

        // Competitor identity belongs to axis 1 and must always be visible in the PDF.
        if (axis === 1) {
          rows.unshift(
            { label: 'Competitor Name | اسم المنافس', value: clean(competitor.name) || '—' },
            { label: 'Competitor Type | نوع المنافس', value: clean(competitor.competitorType) || '—' }
          );
        }

        competitorGroups.push({
          title: `${competitorLabel} — ${COMPETITOR_AXIS_TITLES[key]}`,
          rows
        });
      }
    } else {
      // Backwards compatibility for legacy competitors saved before the 9-axis structure.
      const rows = knownCompetitorRows(competitor);
      if (rows.length) competitorGroups.push({ title: competitorLabel, rows });
    }
  });

  // If there are no competitors yet, still expose the 9-axis template in the section export.
  if (!competitorGroups.length && Object.keys(competitorTemplate).length) {
    for (let axis = 1; axis <= 9; axis += 1) {
      const key = String(axis);
      competitorGroups.push({
        title: COMPETITOR_AXIS_TITLES[key],
        rows: checklistRowsWithEmpty(competitorTemplate[key] || [])
      });
    }
  }

  sections.push({ id: 'competitors', title: getSectionTitle(audit, 'competitors'), groups: competitorGroups });

  const swotGroups = [
    group('Strengths | نقاط القوة', (audit.swot?.strengths || []).map((value, index) => row(String(index + 1), value))),
    group('Weaknesses | نقاط الضعف', (audit.swot?.weaknesses || []).map((value, index) => row(String(index + 1), value))),
    group('Opportunities | الفرص', (audit.swot?.opportunities || []).map((value, index) => row(String(index + 1), value))),
    group('Threats | التهديدات', (audit.swot?.threats || []).map((value, index) => row(String(index + 1), value)))
  ].filter(Boolean) as PdfGroup[];
  sections.push({ id: 'swot', title: getSectionTitle(audit, 'swot'), groups: swotGroups });

  const personaGroups: PdfGroup[] = [];
  const targetRows = checklistRows(audit.customerPersona?.targetAudienceChecklist);
  personaGroups.push({
    title: 'Target Audience | الجمهور المستهدف',
    rows: targetRows.length ? targetRows : compactRows([
      row('Age Range | العمر', audit.customerPersona?.targetAudienceDetails?.ageRange),
      row('Gender | النوع', audit.customerPersona?.targetAudienceDetails?.gender),
      row('Income Level | مستوى الدخل', audit.customerPersona?.targetAudienceDetails?.incomeLevel),
      row('Interests | الاهتمامات', audit.customerPersona?.targetAudienceDetails?.interests),
      row('Lifestyle | نمط الحياة', audit.customerPersona?.targetAudienceDetails?.lifestyle),
      row('Location | الموقع', audit.customerPersona?.targetAudienceDetails?.location)
    ])
  });
  const insightRows = checklistRows(audit.customerPersona?.insightsChecklist);
  personaGroups.push({
    title: 'Customer Insights | فهم العميل',
    rows: insightRows.length ? insightRows : compactRows([
      row('Pain Points | المشاكل', audit.customerPersona?.insights?.painPoints),
      row('Buying Motivation | دوافع الشراء', audit.customerPersona?.insights?.buyingMotivation),
      row('Buying Triggers | محفزات الشراء', audit.customerPersona?.insights?.buyingTriggers),
      row('Objections | الاعتراضات', audit.customerPersona?.insights?.objections)
    ])
  });
  const positioningRows = checklistRows(audit.customerPersona?.positioningChecklist);
  personaGroups.push({
    title: 'Brand Positioning | تمركز البراند',
    rows: positioningRows.length ? positioningRows : compactRows([
      row('Core Value | القيمة الاساسية', audit.customerPersona?.positioning?.coreValue),
      row('USP', audit.customerPersona?.positioning?.usp),
      row('Core Message | الرسالة الاساسية', audit.customerPersona?.positioning?.coreMessage),
      row('First Impression | الانطباع الاول', audit.customerPersona?.positioning?.firstImpression),
      row('Market Tier | الفئة السعرية', audit.customerPersona?.positioning?.marketTier),
      row('Identity Clarity | وضوح الهوية', audit.customerPersona?.positioning?.identityClarity),
      row('Growth Readiness | جاهزية النمو', audit.customerPersona?.positioning?.growthReadiness)
    ])
  });
  const extraPersona = checklistGroup('Additional | اضافي', audit.customerPersona?.checklist);
  if (extraPersona) personaGroups.push(extraPersona);
  sections.push({
    id: 'persona',
    title: getSectionTitle(audit, 'persona'),
    groups: personaGroups.filter(group => group.rows.length)
  });

  const problemGroups: PdfGroup[] = [];
  (audit.problemsAndSolutions || []).forEach((problem, index) => {
    const checklist = problem.checklist || [];
    const rows = checklist.length
      ? checklistRows(checklist)
      : compactRows([
          row('Problem | المشكلة', problem.problem),
          row('Impact on Sales | التأثير على المبيعات', problem.impactOnSales),
          row('Priority | الاولوية', problem.priorityLevel),
          row('Solution Strategy | الحل', problem.solutionStrategy),
          row('Status | الحالة', problem.status)
        ]);
    if (rows.length) problemGroups.push({ title: `Problem ${index + 1}`, rows });
  });
  sections.push({ id: 'problems', title: getSectionTitle(audit, 'problems'), groups: problemGroups });

  (audit.customSections || []).forEach(custom => {
    sections.push({
      id: `custom:${custom.id}`,
      title: custom.title,
      groups: [{
        title: custom.itemsTitle,
        rows: checklistRows(custom.items)
      }]
    });
  });

  const byId = new Map(sections.map(section => [section.id, section]));
  const requestedOrder = audit.sectionOrder || [];
  const resolvedOrder = [
    ...requestedOrder,
    ...BUILT_IN_ORDER.filter(id => !requestedOrder.includes(id)),
    ...(audit.customSections || [])
      .map(section => `custom:${section.id}`)
      .filter(id => !requestedOrder.includes(id))
  ];

  return resolvedOrder
    .map(id => byId.get(id))
    .filter((section): section is PdfSection => Boolean(section))
    .filter(section => {
      if (section.id.startsWith('custom:')) return true;
      return !audit.builtInSectionSettings?.[section.id]?.hidden;
    });
};

const makeHost = () => {
  const host = document.createElement('div');
  Object.assign(host.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '794px',
    background: '#fff',
    zIndex: '-9999'
  });
  document.body.appendChild(host);
  return host;
};

const escapeText = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function exportBrandAuditDataToPDF(audit: BrandAudit, options: BrandAuditDataPdfOptions) {
  const allSections = buildSections(audit);
  const sections = options.sectionId && options.sectionId !== 'all'
    ? allSections.filter(section => section.id === options.sectionId)
    : allSections;

  if (!sections.length) {
    throw new Error('No Brand Audit data found for PDF export.');
  }

  const host = makeHost();
  const pages: HTMLElement[] = [];
  const PAGE_W = 794;
  const PAGE_H = 1123;
  const PAD_X = 44;
  const PAD_TOP = 34;
  const PAD_BOTTOM = 48;
  const BODY_H = PAGE_H - PAD_TOP - PAD_BOTTOM;

  const brandName = clean(audit.overview?.brandName) || 'Brand';
  const auditDate = clean(audit.auditDate);

  const createPage = (sectionTitle: string, continued = false) => {
    const page = document.createElement('div');
    page.dir = 'rtl';
    Object.assign(page.style, {
      width: `${PAGE_W}px`,
      height: `${PAGE_H}px`,
      boxSizing: 'border-box',
      padding: `${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px`,
      background: '#ffffff',
      color: '#111111',
      fontFamily: "Cairo, 'IBM Plex Sans Arabic', Arial, sans-serif",
      overflow: 'hidden',
      position: 'relative'
    });

    const body = document.createElement('div');
    Object.assign(body.style, {
      height: `${BODY_H}px`,
      overflow: 'hidden',
      boxSizing: 'border-box'
    });

    const docHeader = document.createElement('div');
    docHeader.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:16px;gap:16px;">
        <div>
          <div style="font-size:12px;font-weight:700;color:#555;margin-bottom:4px;">Brand Audit</div>
          <div style="font-size:18px;font-weight:800;color:#111;line-height:1.4;">${escapeText(brandName)}</div>
        </div>
        <div style="font-size:11px;font-weight:600;color:#555;text-align:left;">${escapeText(auditDate)}</div>
      </div>
      <div style="font-size:17px;font-weight:800;line-height:1.5;margin-bottom:14px;color:#111;">
        ${escapeText(sectionTitle)}${continued ? ' <span style="font-size:11px;color:#666;font-weight:700;">— Continued | تابع</span>' : ''}
      </div>
    `;
    body.appendChild(docHeader);
    page.appendChild(body);

    const pageNumber = document.createElement('div');
    pageNumber.className = 'simple-audit-page-number';
    Object.assign(pageNumber.style, {
      position: 'absolute',
      bottom: '14px',
      left: '0',
      right: '0',
      textAlign: 'center',
      fontSize: '10px',
      fontWeight: '600',
      color: '#666'
    });
    page.appendChild(pageNumber);

    host.appendChild(page);
    pages.push(page);
    return body;
  };

  const fits = (body: HTMLElement) => body.scrollHeight <= body.clientHeight + 1;

  try {
    if (document.fonts) await document.fonts.ready;

    for (const section of sections) {
      let body = createPage(section.title, false);
      let hasContent = false;

      const nextPage = () => {
        body = createPage(section.title, true);
        hasContent = false;
      };

      const appendGroupTitle = (title?: string) => {
        if (!title) return;
        const block = document.createElement('div');
        block.textContent = title;
        Object.assign(block.style, {
          fontSize: '13px',
          fontWeight: '800',
          color: '#222',
          margin: '14px 0 8px',
          paddingBottom: '5px',
          borderBottom: '1px solid #d8d8d8',
          lineHeight: '1.5'
        });
        body.appendChild(block);
        if (!fits(body)) {
          block.remove();
          nextPage();
          body.appendChild(block);
        }
        hasContent = true;
      };

      const buildRow = (label: string, value: string, continued = false) => {
        const block = document.createElement('div');
        Object.assign(block.style, {
          border: '1px solid #d9d9d9',
          borderRadius: '8px',
          padding: '10px 12px',
          marginBottom: '8px',
          background: '#ffffff',
          breakInside: 'avoid'
        });

        const labelEl = document.createElement('div');
        labelEl.textContent = continued ? `${label} — تابع` : label;
        Object.assign(labelEl.style, {
          fontSize: '11.5px',
          fontWeight: '800',
          color: '#222',
          lineHeight: '1.55',
          marginBottom: '5px'
        });

        const valueEl = document.createElement('div');
        valueEl.textContent = value;
        Object.assign(valueEl.style, {
          fontSize: '12px',
          fontWeight: '600',
          color: '#111',
          lineHeight: '1.75',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere'
        });

        block.appendChild(labelEl);
        block.appendChild(valueEl);
        return { block, valueEl };
      };

      const appendRow = (item: PdfRow) => {
        let { block } = buildRow(item.label, item.value);
        body.appendChild(block);

        if (fits(body)) {
          hasContent = true;
          return;
        }

        block.remove();
        if (hasContent) {
          nextPage();
          ({ block } = buildRow(item.label, item.value));
          body.appendChild(block);
          if (fits(body)) {
            hasContent = true;
            return;
          }
          block.remove();
        }

        // Extremely long single answer: split text by measured word chunks.
        const tokens = item.value.split(/(\s+)/).filter(Boolean);
        let cursor = 0;
        let continued = false;

        while (cursor < tokens.length) {
          const partial = buildRow(item.label, '', continued);
          body.appendChild(partial.block);

          let low = cursor + 1;
          let high = tokens.length;
          let best = cursor;

          while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            partial.valueEl.textContent = tokens.slice(cursor, mid).join('');
            if (fits(body)) {
              best = mid;
              low = mid + 1;
            } else {
              high = mid - 1;
            }
          }

          if (best === cursor) {
            partial.valueEl.textContent = tokens[cursor];
            best = cursor + 1;
          } else {
            partial.valueEl.textContent = tokens.slice(cursor, best).join('');
          }

          hasContent = true;
          cursor = best;
          continued = true;

          if (cursor < tokens.length) nextPage();
        }
      };

      section.groups.forEach(group => {
        appendGroupTitle(group.title);
        group.rows.forEach(appendRow);
      });

      if (!section.groups.some(group => group.rows.length)) {
        appendRow({ label: 'No data', value: 'لا توجد بيانات مسجلة في هذا السكشن.' });
      }
    }

    pages.forEach((page, index) => {
      const number = page.querySelector<HTMLElement>('.simple-audit-page-number');
      if (number) number.textContent = `${index + 1} / ${pages.length}`;
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    for (let index = 0; index < pages.length; index += 1) {
      const canvas = await html2canvas(pages[index], {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: PAGE_W,
        height: PAGE_H,
        windowWidth: PAGE_W,
        scrollX: 0,
        scrollY: 0
      });

      if (index > 0) pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        210,
        297,
        undefined,
        'FAST'
      );
    }

    const filename = options.filename.toLowerCase().endsWith('.pdf')
      ? options.filename
      : `${options.filename}.pdf`;
    pdf.save(filename.replace(/[\\/:*?"<>|]+/g, '_'));
  } finally {
    host.remove();
  }
}
