import React, { useState, useRef } from 'react';
import { formatLocalDate } from '../../lib/dateUtils';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Check,
  Sparkles,
  Building,
  Globe,
  Activity,
  Share2,
  Settings,
  Filter,
  DollarSign,
  Users,
  AlertCircle,
  TrendingUp,
  X,
  PlusCircle,
  FileText,
  Calendar,
  Download,
  Loader2,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  HelpCircle,
  Clock,
  ExternalLink,
  Tag,
  Gift,
  Percent,
  Target,
  Megaphone,
  MessageSquare,
  Award,
  Zap,
  Lightbulb,
  Compass,
  AlertTriangle,
  ArrowRight,
  Flame
} from 'lucide-react';
import {
  BrandAudit,
  BrandAuditProblemSolution,
  CompetitorItem,
  AuditCheckItem,
  CustomBrandAuditSection,
  UserRole
} from '../../types';
import { INITIAL_BRAND_AUDITS } from '../../lib/initialData';
import { ChecklistEditorSection } from './ChecklistEditorSection';
import { applyBrandAuditSchema, BrandAuditSchema, createBlankBrandAuditFromSchema } from '../../lib/brandAuditSchema';

interface BrandAuditTabProps {
  audit?: BrandAudit;
  schema?: BrandAuditSchema | null;
  clientId: string;
  userRole: UserRole;
  onUpdateAudit: (clientId: string, audit: BrandAudit) => void;
}

const UNIT_ECONOMICS_SECTIONS = [
  {
    id: 'product',
    title: 'Product Costs',
    subtitle: 'تكلفة المنتج',
    icon: '📦',
    items: [
      { id: 'ue-product-unit-cost', label: '1. ما تكلفة شراء أو تصنيع القطعة الواحدة؟', status: '' },
      { id: 'ue-product-packaging', label: '2. ما تكلفة التغليف للقطعة أو الأوردر؟ (Box / Bag / Sticker / Card)', status: '' }
    ]
  },
  {
    id: 'selling',
    title: 'Selling Economics',
    subtitle: 'اقتصاديات البيع',
    icon: '💰',
    items: [
      { id: 'ue-selling-actual-price', label: '3. ما متوسط سعر البيع الفعلي بعد الخصومات والكوبونات والعروض؟', status: '' },
      { id: 'ue-selling-aov', label: '4. ما متوسط قيمة الأوردر (AOV)؟', status: '' },
      { id: 'ue-selling-items-per-order', label: '5. ما متوسط عدد القطع داخل الأوردر (Average Items Per Order)؟', status: '' },
      { id: 'ue-selling-gross-margin', label: '6. ما هامش الربح الإجمالي (Gross Margin)؟', status: '' },
      { id: 'ue-selling-contribution-margin', label: '7. ما هامش المساهمة (Contribution Margin)؟', status: '' },
      { id: 'ue-selling-net-margin', label: '8. ما صافي هامش الربح (Net Profit Margin) إن كان معروفًا؟', status: '' },
      { id: 'ue-selling-contribution-per-order', label: '9. كم يتبقى من الأوردر بعد تكلفة المنتج والتكاليف المتغيرة وقبل الإعلانات (Contribution Margin Per Order)؟', status: '' },
      { id: 'ue-selling-most-profitable', label: '10. ما أكثر المنتجات أو الـ Categories تحقيقًا لهامش ربح؟', status: '' },
      { id: 'ue-selling-least-profitable', label: '11. ما أقل المنتجات أو الـ Categories تحقيقًا لهامش ربح؟', status: '' },
      { id: 'ue-selling-sku-variation', label: '12. هل تختلف التكلفة والهامش بشكل كبير من SKU لآخر؟', status: '' }
    ]
  },
  {
    id: 'order',
    title: 'Order Costs',
    subtitle: 'تكلفة الأوردر',
    icon: '🚚',
    items: [
      { id: 'ue-order-shipping-cost', label: '13. ما متوسط تكلفة الشحن التي يتحملها البراند؟', status: '' },
      { id: 'ue-order-shipping-payer', label: '14. هل العميل يدفع الشحن بالكامل أم البراند يتحمل جزءًا منه؟', status: '' },
      { id: 'ue-order-shipping-offers', label: '15. هل يوجد شحن مجاني أو عروض شحن (Free Shipping / Shipping Offers)؟', status: '' },
      { id: 'ue-order-payment-gateway', label: '16. ما رسوم بوابة الدفع (Payment Gateway Fees)؟', status: '' },
      { id: 'ue-order-cod-fees', label: '17. ما رسوم الدفع عند الاستلام (COD Fees)؟', status: '' },
      { id: 'ue-order-marketplace', label: '18. ما عمولة الـ Marketplace إن وجدت؟', status: '' },
      { id: 'ue-order-other-commissions', label: '19. هل توجد أي عمولات أخرى مرتبطة بالأوردر؟', status: '' },
      { id: 'ue-order-return-rate', label: '20. ما متوسط نسبة المرتجعات (Return Rate)؟', status: '' },
      { id: 'ue-order-exchange-rate', label: '21. ما متوسط نسبة الاستبدال (Exchange Rate)؟', status: '' },
      { id: 'ue-order-return-loss', label: '22. ما متوسط خسارة الأوردر المرتجع أو غير المستلم؟', status: '' },
      { id: 'ue-order-variable-costs', label: '23. ما تكاليف التشغيل المتغيرة لكل أوردر؟ (Fulfillment / Packing / Sales Commission / Gifts / Samples)', status: '' }
    ]
  },
  {
    id: 'ads',
    title: 'Advertising Profitability',
    subtitle: 'ربحية الإعلانات',
    icon: '📈',
    items: [
      { id: 'ue-ads-break-even-cpa', label: '24. ما أقصى تكلفة اكتساب قبل التعادل (Break-even CPA / CAC)؟', status: '' },
      { id: 'ue-ads-target-cpa', label: '25. ما تكلفة الاكتساب المناسبة للحفاظ على الربح (Target CPA)؟', status: '' },
      { id: 'ue-ads-break-even-roas', label: '26. ما أقل عائد يغطي التكلفة بدون خسارة (Break-even ROAS)؟', status: '' },
      { id: 'ue-ads-target-roas', label: '27. ما العائد المستهدف لتحقيق ربح مناسب (Target ROAS)؟', status: '' }
    ]
  }
] as const;

const UNIT_ECONOMICS_DEFAULT_ITEMS: AuditCheckItem[] = UNIT_ECONOMICS_SECTIONS.flatMap(
  section => section.items.map(item => ({ ...item }))
);

const getUnitEconomicsChecklist = (unitEconomics?: BrandAudit['unitEconomics']): AuditCheckItem[] => {
  const existing = unitEconomics?.checklist || [];
  const byId = new Map(existing.map(item => [item.id, item]));
  const legacyAnswers: Record<string, string | undefined> = {
    'ue-selling-actual-price': byId.get('ue-1')?.status || unitEconomics?.avgPriceRange,
    'ue-selling-gross-margin': byId.get('ue-4')?.status || unitEconomics?.profitMargin
  };
  const knownIds = new Set(UNIT_ECONOMICS_DEFAULT_ITEMS.map(item => item.id));
  const legacyIds = new Set(['ue-1', 'ue-2', 'ue-3', 'ue-4']);
  const defaults = UNIT_ECONOMICS_DEFAULT_ITEMS.map(item => ({
    ...item,
    status: byId.get(item.id)?.status || legacyAnswers[item.id] || ''
  }));
  const customItems = existing
    .filter(item => !knownIds.has(item.id) && !legacyIds.has(item.id))
    .map(item => ({ ...item, id: item.id.startsWith('ue-selling-') ? item.id : `ue-selling-legacy-${item.id}` }));
  return [...defaults, ...customItems];
};

const getUnitEconomicsSectionItems = (
  unitEconomics: BrandAudit['unitEconomics'],
  sectionId: string
) => getUnitEconomicsChecklist(unitEconomics).filter(item => item.id.startsWith(`ue-${sectionId}-`));

const BUILT_IN_AUDIT_SECTIONS = [
  { id: 'overview', num: 1, title: '1. Brand Overview' },
  { id: 'digitalAssets', num: 2, title: '2. Digital Assets Audit' },
  { id: 'tracking', num: 3, title: '3. Tracking Audit' },
  { id: 'creative', num: 4, title: '4. Creative & Content Audit' },
  { id: 'socialMedia', num: 5, title: '5. Social Media Audit' },
  { id: 'operations', num: 6, title: '6. Operations Audit' },
  { id: 'salesFunnel', num: 7, title: '7. Sales Funnel Audit' },
  { id: 'unitEconomics', num: 8, title: '8. Unit Economics & Pricing' },
  { id: 'historicalAds', num: 9, title: '9. Historical Ads Analysis' },
  { id: 'competitors', num: 10, title: '10. Competitor Analysis' },
  { id: 'swot', num: 11, title: '11. SWOT Analysis' },
  { id: 'persona', num: 12, title: '12. Customer Persona & Brand Positioning' },
  { id: 'problems', num: 13, title: '13. Main Problems & Solutions' }
] as const;

const OVERVIEW_FIELD_DEFAULT_LABELS: Record<string, string> = {
  brandName: 'اسم البراند',
  industry: 'النشاط',
  coreProducts: 'المنتجات الأساسية',
  targetAudience: 'الفئة المستهدفة',
  avgProductPrice: 'متوسط سعر المنتجات',
  avgMonthlyOrders: 'متوسط الاوردرات الشهرية',
  salesChannels: 'قنوات البيع',
  salesLocations: 'مناطق البيع و الانتشار',
  brandStage: 'مرحلة البراند'
};

export const BrandAuditTab: React.FC<BrandAuditTabProps> = ({
  audit,
  schema,
  clientId,
  userRole,
  onUpdateAudit
}) => {
  const [resetToast, setResetToast] = useState<string | null>(null);
  const [showConfirmResetAuditModal, setShowConfirmResetAuditModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const currentAudit: BrandAudit = audit
    ? applyBrandAuditSchema(schema, audit)
    : createBlankBrandAuditFromSchema(clientId, schema);

  // Section view filter
  const [activeSection, setActiveSection] = useState<string>('all');

  // Main Audit Form Modal (Pop-up بكل الأسئلة)
  const [showFullAuditModal, setShowFullAuditModal] = useState(false);

  // View Details Modal (معاينة التقرير بالكامل)
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);

  // Confirm Delete Entire Audit Modal (تأكيد حذف التقييم بالكامل)
  const [showConfirmDeleteAuditModal, setShowConfirmDeleteAuditModal] = useState(false);

  // Active Tab inside the Full Audit Modal to make filling easy
  const [modalActiveTab, setModalActiveTab] = useState<number>(1);

  // Modal State for Problem & Solution (Add/Edit)
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<BrandAuditProblemSolution | null>(null);
  const [probTitle, setProbTitle] = useState('');
  const [probImpact, setProbImpact] = useState('');
  const [probPriority, setProbPriority] = useState<string>('عالية');
  const [probSolution, setProbSolution] = useState('');
  const [probStatus, setProbStatus] = useState<'قيد التنفيذ' | 'تم التنفيذ'>('قيد التنفيذ');

  // Modal State for Competitor (Add/Edit)
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<CompetitorItem | null>(null);
  const [compActiveModalTab, setCompActiveModalTab] = useState<number>(1);
  const [expandedCompIds, setExpandedCompIds] = useState<Record<string, boolean>>({});

  const defaultCompetitorData: CompetitorItem = {
    id: '',
    name: '',
    competitorType: 'مباشر',
    pageLink: '',
    products: '',
    targetAudience: '',
    salesChannels: '',
    price: '',
    offers: '',
    discounts: '',
    bundles: '',
    giftsAndExtras: '',
    warrantyAndReturns: '',
    marketingChannels: '',
    postingFrequency: '',
    contentType: '',
    bestPerformingContent: '',
    marketingMessage: '',
    photographyStyle: '',
    primaryCta: '',
    currentAds: '',
    adCopy: '',
    adHook: '',
    adCta: '',
    landingPageOrPurchaseLink: '',
    offerTypeUsed: '',
    adStrategyNotes: '',
    landingPageQuality: '',
    easeOfPurchase: '',
    afterSalesService: '',
    reviewsAndFeedback: '',
    recurringComplaintsOrObjections: '',
    strengths: '',
    weaknesses: '',
    engagementLevel: '',
    winningPatterns: '',
    keyDifferentiator: '',
    marketGaps: '',
    unexploitedNeeds: '',
    opportunitiesToExploit: '',
    ideasToTest: '',
    biggestThreat: '',
    whyCustomerChoosesThem: '',
    movementsToWatch: '',
    whatToLearn: '',
    whatNotToCopy: '',
    whatToTest: '',
    opportunityToExploit: '',
    recommendedAction: ''
  };

  const [compFormData, setCompFormData] = useState<CompetitorItem>(defaultCompetitorData);

  // Confirm delete item state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'swot' | 'problem' | 'competitor' | 'field' | 'checklist';
    fieldKey?: string;
    idOrIndex?: string | number;
    swotCategory?: 'strengths' | 'weaknesses' | 'opportunities' | 'threats';
    title: string;
  } | null>(null);

  // Form state held inside the main Audit Modal
  const [formData, setFormData] = useState<BrandAudit>(currentAudit);

  // Custom Brand Audit section state
  const [showCustomSectionModal, setShowCustomSectionModal] = useState(false);
  const [editingCustomSectionId, setEditingCustomSectionId] = useState<string | null>(null);
  const [customSectionTitle, setCustomSectionTitle] = useState('');
  const [customSectionItemsTitle, setCustomSectionItemsTitle] = useState('عناصر التقييم');
  const [customSectionDate, setCustomSectionDate] = useState(formatLocalDate());
  const [showBuiltInSectionsModal, setShowBuiltInSectionsModal] = useState(false);
  const [editingOverviewLabelKey, setEditingOverviewLabelKey] = useState<string | null>(null);
  const [overviewLabelDraft, setOverviewLabelDraft] = useState('');

  // Quick Inline Edit State
  const [inlineEditingField, setInlineEditingField] = useState<{ section: string; key: string } | null>(null);
  const [inlineValue, setInlineValue] = useState('');

  // Open the Full Audit Modal
  const handleOpenFullModal = () => {
    if (userRole === 'client') return;
    setFormData(JSON.parse(JSON.stringify(currentAudit)));
    const firstVisibleEntry = orderedSectionEntries.find(entry =>
      entry.type === 'custom' || !currentAudit.builtInSectionSettings?.[entry.builtIn.id]?.hidden
    );
    if (firstVisibleEntry?.type === 'custom') {
      const customIndex = (currentAudit.customSections || []).findIndex(section => section.id === firstVisibleEntry.custom.id);
      setModalActiveTab(1000 + Math.max(customIndex, 0));
    } else {
      setModalActiveTab(firstVisibleEntry?.builtIn.num || 1);
    }
    setShowFullAuditModal(true);
  };

  // Save Full Audit Modal
  const handleSaveFullAudit = () => {
    if (userRole === 'client') return;
    const updatedDate = formData.auditDate || formatLocalDate();
    const updatedAudit: BrandAudit = {
      ...formData,
      builtInSectionSettings: currentAudit.builtInSectionSettings,
      overviewFieldLabels: currentAudit.overviewFieldLabels,
      customSections: currentAudit.customSections,
      auditDate: updatedDate,
      updatedAt: formatLocalDate()
    };
    onUpdateAudit(clientId, updatedAudit);
    setShowFullAuditModal(false);
  };

  // Download the full audit directly as a paginated PDF.
  const handleDownloadPDF = async () => {
    if (isExportingPdf) return;
    try {
      const printElement = document.getElementById('print-area');
      if (!printElement) throw new Error('Brand Audit PDF content was not found.');
      const brandTitle = currentAudit.overview?.brandName || clientId || 'Brand Audit';
      setIsExportingPdf(true);
      const { exportElementToPDF } = await import('../../utils/pdfExporter');
      await exportElementToPDF(printElement, {
        filename: `Brand_Audit_${brandTitle}.pdf`,
        backgroundColor: '#ffffff'
      });
    } catch (err) {
      console.error('Brand Audit PDF export failed', err);
      window.alert('تعذر تحميل ملف PDF. حاولي مرة أخرى.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Quick delete of any top-level string property in audit
  const handleDeleteField = (section: keyof BrandAudit, key: string) => {
    const newAudit = JSON.parse(JSON.stringify(currentAudit));
    if (newAudit[section] && typeof newAudit[section] === 'object') {
      delete newAudit[section][key];
      onUpdateAudit(clientId, newAudit);
    }
  };

  // SWOT Handlers
  const [newSwotInput, setNewSwotInput] = useState<{ category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats'; text: string }>({ category: 'strengths', text: '' });
  const [editingSwotItem, setEditingSwotItem] = useState<{
    category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats';
    index: number;
    text: string;
  } | null>(null);

  const handleAddSwot = (category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', text: string) => {
    if (userRole === 'client') return;
    if (!text.trim()) return;
    const newSwot = {
      ...currentAudit.swot,
      [category]: [...(currentAudit.swot[category] || []), text.trim()]
    };
    onUpdateAudit(clientId, { ...currentAudit, swot: newSwot });
  };

  const handleUpdateSwot = (category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', index: number, newText: string) => {
    if (userRole === 'client') return;
    if (!newText.trim()) return;
    const list = [...(currentAudit.swot[category] || [])];
    list[index] = newText.trim();
    const newSwot = {
      ...currentAudit.swot,
      [category]: list
    };
    onUpdateAudit(clientId, { ...currentAudit, swot: newSwot });
  };

  const handleRemoveSwot = (category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', index: number) => {
    if (userRole === 'client') return;
    const newSwot = {
      ...currentAudit.swot,
      [category]: (currentAudit.swot[category] || []).filter((_, i) => i !== index)
    };
    onUpdateAudit(clientId, { ...currentAudit, swot: newSwot });
  };

  // Problem & Solution Handlers
  const handleOpenAddProblem = () => {
    if (userRole === 'client') return;
    setEditingProblem(null);
    setProbTitle('');
    setProbImpact('');
    setProbPriority('عالية');
    setProbSolution('');
    setProbStatus('قيد التنفيذ');
    setShowProblemModal(true);
  };

  const handleOpenEditProblem = (prob: BrandAuditProblemSolution) => {
    if (userRole === 'client') return;
    setEditingProblem(prob);
    setProbTitle(prob.problem);
    setProbImpact(prob.impactOnSales);
    setProbPriority(prob.priorityLevel || 'عالية');
    setProbSolution(prob.solutionStrategy);
    setProbStatus(prob.status || 'قيد التنفيذ');
    setShowProblemModal(true);
  };

  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'client') return;
    const existing = currentAudit.problemsAndSolutions || [];
    let updated: BrandAuditProblemSolution[] = [];

    if (editingProblem) {
      updated = existing.map((p) =>
        p.id === editingProblem.id
          ? {
              ...p,
              problem: probTitle.trim(),
              impactOnSales: probImpact.trim(),
              priorityLevel: probPriority,
              solutionStrategy: probSolution.trim(),
              status: probStatus
            }
          : p
      );
    } else {
      const newProb: BrandAuditProblemSolution = {
        id: `ps-${Date.now()}`,
        problem: probTitle.trim(),
        impactOnSales: probImpact.trim(),
        priorityLevel: probPriority,
        solutionStrategy: probSolution.trim(),
        status: probStatus
      };
      updated = [...existing, newProb];
    }

    onUpdateAudit(clientId, { ...currentAudit, problemsAndSolutions: updated });
    setShowProblemModal(false);
  };

  const toggleProblemStatus = (probId: string) => {
    if (userRole === 'client') return;
    const updated = (currentAudit.problemsAndSolutions || []).map((p) => {
      if (p.id === probId) {
        const nextStatus: 'قيد التنفيذ' | 'تم التنفيذ' =
          p.status === 'تم التنفيذ' ? 'قيد التنفيذ' : 'تم التنفيذ';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    onUpdateAudit(clientId, { ...currentAudit, problemsAndSolutions: updated });
  };

  const handleDeleteProblem = (id: string) => {
    if (userRole === 'client') return;
    const updated = (currentAudit.problemsAndSolutions || []).filter((p) => p.id !== id);
    onUpdateAudit(clientId, { ...currentAudit, problemsAndSolutions: updated });
  };

  // Competitor Handlers
  const handleOpenAddCompetitor = () => {
    if (userRole === 'client') return;
    setEditingCompetitor(null);
    setCompActiveModalTab(1);
    setCompFormData({
      ...defaultCompetitorData,
      id: `comp-${Date.now()}`
    });
    setShowCompetitorModal(true);
  };

  const handleOpenEditCompetitor = (comp: CompetitorItem) => {
    if (userRole === 'client') return;
    setEditingCompetitor(comp);
    setCompActiveModalTab(1);
    setCompFormData({
      id: comp.id,
      name: comp.name || '',
      competitorType: comp.competitorType || 'مباشر',
      pageLink: comp.pageLink || '',
      products: comp.products || '',
      targetAudience: comp.targetAudience || '',
      salesChannels: comp.salesChannels || '',
      price: comp.price || '',
      offers: comp.offers || '',
      discounts: comp.discounts || '',
      bundles: comp.bundles || '',
      giftsAndExtras: comp.giftsAndExtras || '',
      warrantyAndReturns: comp.warrantyAndReturns || '',
      marketingChannels: comp.marketingChannels || '',
      postingFrequency: comp.postingFrequency || '',
      contentType: comp.contentType || '',
      bestPerformingContent: comp.bestPerformingContent || '',
      marketingMessage: comp.marketingMessage || '',
      photographyStyle: comp.photographyStyle || '',
      primaryCta: comp.primaryCta || '',
      currentAds: comp.currentAds || '',
      adCopy: comp.adCopy || '',
      adHook: comp.adHook || '',
      adCta: comp.adCta || '',
      landingPageOrPurchaseLink: comp.landingPageOrPurchaseLink || '',
      offerTypeUsed: comp.offerTypeUsed || '',
      adStrategyNotes: comp.adStrategyNotes || '',
      landingPageQuality: comp.landingPageQuality || '',
      easeOfPurchase: comp.easeOfPurchase || '',
      afterSalesService: comp.afterSalesService || '',
      reviewsAndFeedback: comp.reviewsAndFeedback || '',
      recurringComplaintsOrObjections: comp.recurringComplaintsOrObjections || '',
      strengths: comp.strengths || '',
      weaknesses: comp.weaknesses || '',
      engagementLevel: comp.engagementLevel || '',
      winningPatterns: comp.winningPatterns || '',
      keyDifferentiator: comp.keyDifferentiator || '',
      marketGaps: comp.marketGaps || '',
      unexploitedNeeds: comp.unexploitedNeeds || '',
      opportunitiesToExploit: comp.opportunitiesToExploit || '',
      ideasToTest: comp.ideasToTest || '',
      biggestThreat: comp.biggestThreat || '',
      whyCustomerChoosesThem: comp.whyCustomerChoosesThem || '',
      movementsToWatch: comp.movementsToWatch || '',
      whatToLearn: comp.whatToLearn || '',
      whatNotToCopy: comp.whatNotToCopy || '',
      whatToTest: comp.whatToTest || '',
      opportunityToExploit: comp.opportunityToExploit || '',
      recommendedAction: comp.recommendedAction || '',
      priceDiffReason: comp.priceDiffReason || ''
    });
    setShowCompetitorModal(true);
  };

  const handleSaveCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compFormData.name?.trim()) return;

    const existing = currentAudit.competitors || [];
    let updated: CompetitorItem[] = [];

    const compData: CompetitorItem = {
      id: editingCompetitor ? editingCompetitor.id : `comp-${Date.now()}`,
      name: compFormData.name.trim(),
      competitorType: compFormData.competitorType || 'مباشر',
      pageLink: compFormData.pageLink?.trim() || '',
      products: compFormData.products?.trim() || '',
      targetAudience: compFormData.targetAudience?.trim() || '',
      salesChannels: compFormData.salesChannels?.trim() || '',
      price: compFormData.price?.trim() || '',
      offers: compFormData.offers?.trim() || '',
      discounts: compFormData.discounts?.trim() || '',
      bundles: compFormData.bundles?.trim() || '',
      giftsAndExtras: compFormData.giftsAndExtras?.trim() || '',
      warrantyAndReturns: compFormData.warrantyAndReturns?.trim() || '',
      marketingChannels: compFormData.marketingChannels?.trim() || '',
      postingFrequency: compFormData.postingFrequency?.trim() || '',
      contentType: compFormData.contentType?.trim() || '',
      bestPerformingContent: compFormData.bestPerformingContent?.trim() || '',
      marketingMessage: compFormData.marketingMessage?.trim() || '',
      photographyStyle: compFormData.photographyStyle?.trim() || '',
      primaryCta: compFormData.primaryCta?.trim() || '',
      currentAds: compFormData.currentAds?.trim() || '',
      adCopy: compFormData.adCopy?.trim() || '',
      adHook: compFormData.adHook?.trim() || '',
      adCta: compFormData.adCta?.trim() || '',
      landingPageOrPurchaseLink: compFormData.landingPageOrPurchaseLink?.trim() || '',
      offerTypeUsed: compFormData.offerTypeUsed?.trim() || '',
      adStrategyNotes: compFormData.adStrategyNotes?.trim() || '',
      landingPageQuality: compFormData.landingPageQuality?.trim() || '',
      easeOfPurchase: compFormData.easeOfPurchase?.trim() || '',
      afterSalesService: compFormData.afterSalesService?.trim() || '',
      reviewsAndFeedback: compFormData.reviewsAndFeedback?.trim() || '',
      recurringComplaintsOrObjections: compFormData.recurringComplaintsOrObjections?.trim() || '',
      strengths: compFormData.strengths?.trim() || '',
      weaknesses: compFormData.weaknesses?.trim() || '',
      engagementLevel: compFormData.engagementLevel?.trim() || '',
      winningPatterns: compFormData.winningPatterns?.trim() || '',
      keyDifferentiator: compFormData.keyDifferentiator?.trim() || '',
      marketGaps: compFormData.marketGaps?.trim() || '',
      unexploitedNeeds: compFormData.unexploitedNeeds?.trim() || '',
      opportunitiesToExploit: compFormData.opportunitiesToExploit?.trim() || '',
      ideasToTest: compFormData.ideasToTest?.trim() || '',
      biggestThreat: compFormData.biggestThreat?.trim() || '',
      whyCustomerChoosesThem: compFormData.whyCustomerChoosesThem?.trim() || '',
      movementsToWatch: compFormData.movementsToWatch?.trim() || '',
      whatToLearn: compFormData.whatToLearn?.trim() || '',
      whatNotToCopy: compFormData.whatNotToCopy?.trim() || '',
      whatToTest: compFormData.whatToTest?.trim() || '',
      opportunityToExploit: compFormData.opportunityToExploit?.trim() || '',
      recommendedAction: compFormData.recommendedAction?.trim() || '',
      priceDiffReason: compFormData.priceDiffReason?.trim() || ''
    };

    if (editingCompetitor) {
      updated = existing.map((c) => (c.id === editingCompetitor.id ? compData : c));
    } else {
      updated = [...existing, compData];
    }

    onUpdateAudit(clientId, { ...currentAudit, competitors: updated });
    setShowCompetitorModal(false);
  };

  const handleDeleteCompetitor = (id: string) => {
    const updated = (currentAudit.competitors || []).filter((c) => c.id !== id);
    onUpdateAudit(clientId, { ...currentAudit, competitors: updated });
  };

  // Perform confirmed deletion
  const executeConfirmedDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'swot' && deleteConfirmation.swotCategory) {
      handleRemoveSwot(deleteConfirmation.swotCategory, Number(deleteConfirmation.idOrIndex));
    } else if (deleteConfirmation.type === 'problem') {
      const probId = String(deleteConfirmation.idOrIndex);
      handleDeleteProblem(probId);
      setFormData((prev) => ({
        ...prev,
        problemsAndSolutions: (prev.problemsAndSolutions || []).filter((p) => p.id !== probId)
      }));
    } else if (deleteConfirmation.type === 'competitor') {
      const compId = String(deleteConfirmation.idOrIndex);
      handleDeleteCompetitor(compId);
      setFormData((prev) => ({
        ...prev,
        competitors: (prev.competitors || []).filter((c) => c.id !== compId)
      }));
    } else if (deleteConfirmation.type === 'field' && deleteConfirmation.fieldKey) {
      const [sec, key] = deleteConfirmation.fieldKey.split('.');
      if (sec && key) {
        handleDeleteField(sec as keyof BrandAudit, key);
      }
    }

    setDeleteConfirmation(null);
  };

  // Helper to get default data for any audit section
  const getDefaultBrandAuditSectionData = (targetClientId: string, sectionKey: string) => {
    const baseClient = INITIAL_BRAND_AUDITS[targetClientId] || INITIAL_BRAND_AUDITS['client-1'];

    switch (sectionKey) {
      case 'overview':
        return baseClient?.overview || {
          brandName: 'اسم البراند',
          industry: 'التجارة الإلكترونية والبيع بالتجزئة',
          coreProducts: 'المنتجات والخدمات الأساسية للبراند',
          targetAudience: 'الشباب والمهتمين بالمنتجات العصرية (18 - 35 سنة)',
          avgProductPrice: '450 - 1200 EGP',
          avgMonthlyOrders: '350 - 500 طلب شهرياً',
          salesChannels: ['Website', 'Instagram', 'Facebook', 'TikTok', 'Google', 'WhatsApp', 'Marketplace'],
          salesLocations: 'جمهورية مصر العربية (تغطية شاملة لجميع المحافظات)',
          brandStage: 'بيعمل Scale'
        };

      case 'digitalAssets':
        return baseClient?.digitalAssets || {
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
        };

      case 'tracking':
      case 'trackingAudit':
        return baseClient?.trackingAudit || {
          metaPixelStatus: 'موجود ويعمل بنجاح',
          capiStatus: 'مفعل ويعمل بكفاءة (Conversion API Active)',
          eventsNotes: 'أحداث PageView, ViewContent, AddToCart, InitiateCheckout, و Purchase تعمل بدقة.',
          eventsChecklist: [
            { id: 'e-1', label: 'حدث PageView', status: 'ممتاز', notes: 'تتبع 100%' },
            { id: 'e-2', label: 'حدث ViewContent', status: 'ممتاز', notes: 'تتبع المنتجات المطلوبة' },
            { id: 'e-3', label: 'حدث AddToCart', status: 'ممتاز', notes: 'تنسيق متوافق مع المبيعات' },
            { id: 'e-4', label: 'حدث Purchase', status: 'ممتاز', notes: 'تأكيد المبيعات وتمرير القيمة' }
          ],
          checklist: [
            { id: 'tr-1', label: 'Meta Pixel (هل موجود؟ وهل يعمل بوضوح؟)', status: 'موجود ويعمل بنجاح' },
            { id: 'tr-2', label: 'Conversion API (CAPI) (هل مفعل وهل يعمل؟)', status: 'مفعل ويعمل بكفاءة' },
            { id: 'tr-3', label: 'Events (هل جميع الأحداث تعمل؟ وما هي؟)', status: 'أحداث الشراء والسلة والصفحة تعمل بدقة' }
          ]
        };

      case 'creative':
      case 'creativeAudit':
        return baseClient?.creativeAudit || {
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
        };

      case 'socialMedia':
      case 'socialMediaAudit':
        return baseClient?.socialMediaAudit || {
          pageAppearance: 'شكل الصفحة احترافي، البايو يحتوي على لينكات مباشرة، والـ Highlights مقسمة حسب الفئات.',
          contentRegularity: 'انتظام جيد بنشر 4-5 بوستات وريلز أسبوعياً مع معدل تفاعل مرتفع.',
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
            { id: 'sm-12', label: 'تقييمات العملاء.', status: 'تقييمات إيجابية وآراء ممتازة' }
          ]
        };

      case 'operations':
      case 'operationsAudit':
        return baseClient?.operationsAudit || {
          packagingGifts: 'تغليف قيم ومحكم لحماية المنتجات مع هدايا استيكرات وبطاقات خصم.',
          replySpeed: 'فريق خدمة العملاء يرد بسرعة فائقة على الواتساب والرسائل.',
          customerServiceQuality: 'تعامل راقي وسياسة إرضاء العميل متوفرة.',
          shippingDuration: 'من 24 إلى 48 ساعة داخل المحافظات الرئيسية، و3-4 أيام لباقي المناطق.',
          returnPolicy: 'سياسة استبدال واسترجاع مجانية خلال 14 يوماً من الاستلام.',
          stockAvailability: 'المخزون متوفر للأصناف الرئيسية بشكل مستمر.',
          teamCapacity: 'الفريق جاهز لتجهيز حتى 100 طلب يومياً بكفاءة.',
          checklist: [
            { id: 'op-1', label: 'التغليف و الهدايا.', status: 'تغليف ممتاز ومحكم مع هدايا مميزة' },
            { id: 'op-2', label: 'سرعة الرد و جودة خدمة العملاء.', status: 'سرعة رد فائقة مع جودة خدمة عالية' },
            { id: 'op-3', label: 'مدة الشحن.', status: 'من 24 إلى 48 ساعة داخل القاهرة والجيزة' },
            { id: 'op-4', label: 'سياسة الاستبدال والاسترجاع.', status: 'سياسة استبدال واسترجاع سريعة وواضحة خلال 14 يوم' },
            { id: 'op-5', label: 'توفر المخزون.', status: 'المخزون متوفر للأصناف الرئيسية' },
            { id: 'op-6', label: 'هل الفريق يستطيع استقبال عدد كبير من الطلبات؟', status: 'نعم، الفريق جاهز ومؤهل لاستقبال أعداد كبيرة من الطلبات' }
          ]
        };

      case 'salesFunnel':
        return baseClient?.salesFunnel || {
          entrySources: 'إعلانات مباشرة المبيعات والبحث على فيسبوك وإنستجرام وتيك توك.',
          landingPoint: 'صفحة المنتج المخصص أو الواتساب المباشر.',
          purchaseMethod: 'إتمام السلة عبر المتجر أو تأكيد الطلب مع خدمة العملاء.',
          dropOffPoints: 'تأخر العميل عند الدفع وتفضيل خيارات دفع فورية إضافية.',
          checklist: [
            { id: 'sf-1', label: '1. مصدر دخول العميل (منين بيدخل للصفحة؟)', status: 'إعلانات مباشرة المبيعات والبحث.' },
            { id: 'sf-2', label: '2. نقطة الوصول (بعد ضغط الإعلان فين بيروح؟)', status: 'صفحة المنتج أو الواتساب المباشر.' },
            { id: 'sf-3', label: '3. طريقة الشراء (إزاي بيكمل الشراء؟)', status: 'إتمام السلة أو الاتصال بالسيلز.' },
            { id: 'sf-4', label: '4. نقاط التسريب Drop-off Points (فين بيخرجوا؟)', status: 'تأخر العميل عند الدفع.' }
          ]
        };

      case 'unitEconomics':
        return baseClient?.unitEconomics || {
          avgPriceRange: 'متوسط أسعار المنتجات بين 350 و 1500 جنيه مصري.',
          competitorComparison: 'الأسعار في نفس الرينج المتوسط للمنافسين مع تميز بالضمان وخدمة ما بعد البيع.',
          priceJustification: 'السعر مبرر تماماً لأن الجودة ممتازة والمنتجات تأتي بضمان استبدال معتمد.',
          valueVsPrice: 'القيمة مرتفعة وممتازة مقارنة بالسعر المدفوع.',
          offerSupport: 'عروض الشحن المجاني مع طلب منتجين تساعد في رفع قيمة السلة.',
          profitMargin: 'هامش ربح صافي يتراوح بين 35% إلى 45%.',
          allowsAds: 'نعم، هامش الربح ممتاز ويسمح بتشغيل إعلانات ممولة بمرونة عالية.',
          checklist: [
            { id: 'ue-1', label: '1. متوسط أسعار البراند', status: 'رينج متوسط يناسب الفئة.' },
            { id: 'ue-2', label: '2. مقارنة بالمنافسين وفرق التسعير', status: 'نفس رينج المنافسين مع تميز بالضمان.' },
            { id: 'ue-3', label: '3. هل السعر مبرر والقيمة مقابل السعر؟ وهل يوجد عروض تساعد الإعلان؟', status: 'مبرر والقيمة ممتازة وتوجد عروض داعمة للإعلانات.' },
            { id: 'ue-4', label: '4. هامش الربح وهل يسمح بالإعلانات الممولة؟', status: 'هامش ربح يسمح بتشغيل إعلانات ممولة.' }
          ]
        };

      case 'historicalAds':
        return baseClient?.historicalAds || {
          bestCampaign: 'حملة تحويل مبيعات (Sales Campaign) بجمهور مهتم بالألعاب التقنية واستجابة فيديو Reels.',
          worstCampaign: 'حملة زيارات نقرات (Traffic Campaign) بدون هدف تحويل واضح.',
          highestRoas: '6.8x على باقة أجهزة الجيمنج.',
          lowestCpa: '85 EGP لكل طلب مكتمل.',
          bestAudience: 'جمهور Lookalike 1% للمشترين السابقين + مهتمي الإكسسوارات.',
          bestAd: 'فيديو ريلز مدته 18 ثانية يوضح تجربة الماوس والسماعة في الألعاب.',
          successReasons: 'وضوح المنتج بالفيديو، التركيز على الضمان والشحن السريع.',
          failureReasons: 'ضعف الصور الثابتة السابقة وعدم وجود عرض خصم واضح.',
          checklist: [
            { id: 'ha-1', label: 'أفضل حملة.', status: 'حملة تحويل مبيعات واستجابة ريلز' },
            { id: 'ha-2', label: 'أسوأ حملة.', status: 'حملة زيارات بدون هدف تحويل' },
            { id: 'ha-3', label: 'أعلى ROAS.', status: '6.8x' },
            { id: 'ha-4', label: 'أقل CPA.', status: '85 EGP' },
            { id: 'ha-5', label: 'أفضل جمهور.', status: 'Lookalike 1% + مهتمي الإكسسوارات' },
            { id: 'ha-6', label: 'أفضل إعلان.', status: 'فيديو ريلز استعراض واقعي 18 ثانية' },
            { id: 'ha-7', label: 'أسباب النجاح.', status: 'وضوح المنتج بالفيديو والتركيز على الضمان' },
            { id: 'ha-8', label: 'أسباب الفشل.', status: 'ضعف الصور الثابتة وعدم وجود عرض واضح' }
          ]
        };

      case 'competitors':
        return baseClient?.competitors || [
          {
            id: 'comp-1',
            name: 'المنافس الأول - جيك ستور',
            pageLink: 'https://facebook.com/geekstore.eg',
            products: 'إكسسوارات هواتف وألعاب',
            price: 'أرخص بنسبة 10%',
            targetAudience: 'شباب الجيمنج ومهتمي الهواتف الذكية (18-30 سنة)',
            salesChannels: 'صفحة فيسبوك وموقع إلكتروني',
            priceDiffReason: 'بسبب عدم توفير ضمان استبدال محلي',
            offers: 'خصم 15% عند الشراء بـ 1000 جنيه',
            strengths: 'انتشار واسع وتواجد في محلات تجارية',
            weaknesses: 'بطء الرد في خدمة العملاء وعدم وجود متجر إلكتروني سلس',
            marketingMessage: 'أرخص سعر إكسسوارات في مصر',
            photographyStyle: 'تصوير ستوديو تقليدي',
            contentType: 'بوستات ثنائية الأبعاد',
            opportunitiesToExploit: 'التركيز على ثقة الضمان وسرعة الشحن والبيع المباشر عبر الفيديو'
          }
        ];

      case 'swot':
        return baseClient?.swot || {
          strengths: ['تنوع واسع في المنتجات', 'خدمة توصيل سريعة', 'ضمان حقيقي للمنتجات'],
          weaknesses: ['قلة الفيديو ريلز والتفاعل الحي', 'الموقع يفتقد وسيلة دفع بالتقسيط'],
          opportunities: ['التوسع في سوق الألعاب والـ Accessories', 'الحملات التفاعلية مع المؤثرين'],
          threats: ['المنافسة الشديدة في الأسعار من التجار غير المعتمدين']
        };

      case 'customerPersona':
      case 'persona':
        return baseClient?.customerPersona || {
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
          },
          positioningChecklist: [
            { id: 'pos-1', label: 'تميز الهوية البصرية مقارنة بالمنافسين', status: 'هوية مميزة وحديثة' },
            { id: 'pos-2', label: 'اتساق الرسائل التسويقية عبر كافة القنوات', status: 'رسائل متسقة وثابتة' }
          ]
        };

      case 'problems':
      case 'problemsAndSolutions':
        return baseClient?.problemsAndSolutions || [
          {
            id: 'ps-1',
            problem: 'قلة محتوى الفيديوهات القصيرة (Reels) الواقعية للمنتجات',
            impactOnSales: 'تراجع معدل التحويل (CR) للإعلانات الممولة ونقص ثقة العملاء المترددين',
            priorityLevel: 'عالية جداً',
            solutionStrategy: 'إنتاج 8 فيديوهات Unboxing واستعراض للمنتجات شهرياً بالتعاون مع صانعي محتوى تقني',
            status: 'قيد التنفيذ'
          },
          {
            id: 'ps-2',
            problem: 'عدم توفر خيار الدفع بالتقسيط على الموقع الإلكتروني',
            impactOnSales: 'فقدان طلبات المنتجات عالية السعر (أكثر من 1000 جنيه)',
            priorityLevel: 'عالية',
            solutionStrategy: 'الربط المباشر مع بوابات التقسيط مثل (Valu - Sympl - Souhoola)',
            status: 'قيد التنفيذ'
          }
        ];

      default:
        return null;
    }
  };

  // Reset a specific section in the main report view
  const handleResetSection = (sectionKey: string) => {
    if (userRole === 'client') return;
    const defaultData = getDefaultBrandAuditSectionData(clientId, sectionKey);
    if (!defaultData) return;

    const keyMap: Record<string, keyof BrandAudit> = {
      overview: 'overview',
      digitalAssets: 'digitalAssets',
      tracking: 'trackingAudit',
      creative: 'creativeAudit',
      socialMedia: 'socialMediaAudit',
      operations: 'operationsAudit',
      salesFunnel: 'salesFunnel',
      unitEconomics: 'unitEconomics',
      historicalAds: 'historicalAds',
      competitors: 'competitors',
      swot: 'swot',
      persona: 'customerPersona',
      problems: 'problemsAndSolutions'
    };

    const auditKey = keyMap[sectionKey] || (sectionKey as keyof BrandAudit);
    const updatedAudit: BrandAudit = {
      ...currentAudit,
      [auditKey]: JSON.parse(JSON.stringify(defaultData)),
      updatedAt: formatLocalDate()
    };

    onUpdateAudit(clientId, updatedAudit);
    setFormData(JSON.parse(JSON.stringify(updatedAudit)));
    setResetToast('تمت استعادة البيانات الافتراضية للقسم بنجاح ↺');
    setTimeout(() => setResetToast(null), 3000);
  };

  // Reset a specific step inside the full audit modal
  const handleResetModalStep = (stepNumber: number) => {
    const stepToKey: Record<number, string> = {
      1: 'overview',
      2: 'digitalAssets',
      3: 'tracking',
      4: 'creative',
      5: 'socialMedia',
      6: 'operations',
      7: 'salesFunnel',
      8: 'unitEconomics',
      9: 'historicalAds',
      10: 'competitors',
      11: 'swot',
      12: 'persona',
      13: 'problems'
    };

    const sectionKey = stepToKey[stepNumber];
    if (!sectionKey) return;
    const defaultData = getDefaultBrandAuditSectionData(clientId, sectionKey);
    if (!defaultData) return;

    const keyMap: Record<string, keyof BrandAudit> = {
      overview: 'overview',
      digitalAssets: 'digitalAssets',
      tracking: 'trackingAudit',
      creative: 'creativeAudit',
      socialMedia: 'socialMediaAudit',
      operations: 'operationsAudit',
      salesFunnel: 'salesFunnel',
      unitEconomics: 'unitEconomics',
      historicalAds: 'historicalAds',
      competitors: 'competitors',
      swot: 'swot',
      persona: 'customerPersona',
      problems: 'problemsAndSolutions'
    };

    const auditKey = keyMap[sectionKey] || (sectionKey as keyof BrandAudit);
    setFormData((prev) => ({
      ...prev,
      [auditKey]: JSON.parse(JSON.stringify(defaultData))
    }));

    setResetToast('تمت استعادة البيانات الافتراضية للقسم بنجاح ↺');
    setTimeout(() => setResetToast(null), 3000);
  };

  // Reset entire audit to initial defaults
  const handleResetFullAudit = () => {
    if (userRole === 'client') return;
    const baseClient = INITIAL_BRAND_AUDITS[clientId] || INITIAL_BRAND_AUDITS['client-1'];
    const defaultAudit: BrandAudit = JSON.parse(JSON.stringify(baseClient || {
      clientId,
      score: 85,
      auditDate: formatLocalDate(),
      createdAt: formatLocalDate(),
      updatedAt: formatLocalDate(),
      overview: getDefaultBrandAuditSectionData(clientId, 'overview'),
      digitalAssets: getDefaultBrandAuditSectionData(clientId, 'digitalAssets'),
      trackingAudit: getDefaultBrandAuditSectionData(clientId, 'tracking'),
      creativeAudit: getDefaultBrandAuditSectionData(clientId, 'creative'),
      socialMediaAudit: getDefaultBrandAuditSectionData(clientId, 'socialMedia'),
      operationsAudit: getDefaultBrandAuditSectionData(clientId, 'operations'),
      salesFunnel: getDefaultBrandAuditSectionData(clientId, 'salesFunnel'),
      unitEconomics: getDefaultBrandAuditSectionData(clientId, 'unitEconomics'),
      historicalAds: getDefaultBrandAuditSectionData(clientId, 'historicalAds'),
      competitors: getDefaultBrandAuditSectionData(clientId, 'competitors'),
      swot: getDefaultBrandAuditSectionData(clientId, 'swot'),
      customerPersona: getDefaultBrandAuditSectionData(clientId, 'persona'),
      problemsAndSolutions: getDefaultBrandAuditSectionData(clientId, 'problems'),
      socialLinks: {},
      notes: ''
    }));

    onUpdateAudit(clientId, defaultAudit);
    setFormData(JSON.parse(JSON.stringify(defaultAudit)));
    setShowConfirmResetAuditModal(false);
    setResetToast('تمت استعادة تقييم البراند بالكامل بنجاح ↺');
    setTimeout(() => setResetToast(null), 3500);
  };

  const getBuiltInSectionTitle = (sectionId: string, fallback: string) => {
    const savedTitle = currentAudit.builtInSectionSettings?.[sectionId]?.title?.trim();
    const defaultTitle = BUILT_IN_AUDIT_SECTIONS.find(section => section.id === sectionId)?.title || fallback;
    if (!savedTitle) return defaultTitle;
    const legacyDefault = [
      '1. Brand Overview (نبذة عن البراند)',
      '2. Digital Assets Audit (تقييم الأصول الرقمية)',
      '3. Tracking Audit (تقييم التتبع)',
      '4. Creative & Content Audit (تقييم المحتوى والكريتيف)',
      '5. Social Media Audit (تقييم السوشيال ميديا)',
      '6. Operations Audit (تقييم التشغيل)',
      '7. Sales Funnel Audit (تقييم رحلة العميل)',
      '8. Unit Economics & Pricing (ربحية المنتج وتسعيرته)',
      '9. Historical Ads Analysis (تحليل الإعلانات السابقة)',
      '10. Competitor Analysis (تحليل المنافسين الشامل)',
      '12. Customer Persona & Brand Positioning (العميل المستهدف وتموضع البراند)',
      '13. Main Problems & Solutions (أهم المشاكل وحلها)'
    ];
    return legacyDefault.includes(savedTitle) ? defaultTitle : savedTitle;
  };

  const isBuiltInSectionHidden = (sectionId: string) =>
    Boolean(currentAudit.builtInSectionSettings?.[sectionId]?.hidden);

  const updateBuiltInSectionSetting = (sectionId: string, patch: { title?: string; hidden?: boolean }) => {
    if (userRole === 'client') return;
    const currentSetting = currentAudit.builtInSectionSettings?.[sectionId] || {};
    onUpdateAudit(clientId, {
      ...currentAudit,
      builtInSectionSettings: {
        ...(currentAudit.builtInSectionSettings || {}),
        [sectionId]: { ...currentSetting, ...patch }
      },
      updatedAt: formatLocalDate()
    });
  };

  const hideBuiltInSection = (sectionId: string) => {
    if (userRole === 'client') return;
    updateBuiltInSectionSetting(sectionId, { hidden: true });
    if (activeSection === sectionId) setActiveSection('all');
    const hiddenSection = BUILT_IN_AUDIT_SECTIONS.find(section => section.id === sectionId);
    if (hiddenSection?.num === modalActiveTab) {
      const nextVisible = BUILT_IN_AUDIT_SECTIONS.find(section =>
        section.id !== sectionId && !currentAudit.builtInSectionSettings?.[section.id]?.hidden
      );
      setModalActiveTab(nextVisible?.num || 1);
    }
  };

  const restoreBuiltInSection = (sectionId: string) => {
    if (userRole === 'client') return;
    updateBuiltInSectionSetting(sectionId, { hidden: false });
  };

  const getOverviewFieldLabel = (key: string) =>
    currentAudit.overviewFieldLabels?.[key]?.trim() || OVERVIEW_FIELD_DEFAULT_LABELS[key] || key;

  const startOverviewLabelEdit = (key: string) => {
    if (userRole === 'client') return;
    setEditingOverviewLabelKey(key);
    setOverviewLabelDraft(getOverviewFieldLabel(key));
  };

  const saveOverviewLabelEdit = () => {
    if (userRole === 'client' || !editingOverviewLabelKey || !overviewLabelDraft.trim()) return;
    const updatedLabels = {
      ...(currentAudit.overviewFieldLabels || {}),
      [editingOverviewLabelKey]: overviewLabelDraft.trim()
    };
    onUpdateAudit(clientId, {
      ...currentAudit,
      overviewFieldLabels: updatedLabels,
      updatedAt: formatLocalDate()
    });
    setFormData(prev => ({ ...prev, overviewFieldLabels: updatedLabels }));
    setEditingOverviewLabelKey(null);
    setOverviewLabelDraft('');
  };

  const renderOverviewFieldLabelEditor = (key: string, readOnly = false) => (
    <div className="flex items-center gap-1.5 mb-1">
      {editingOverviewLabelKey === key ? (
        <div className="flex items-center gap-1 flex-1">
          <input
            type="text"
            value={overviewLabelDraft}
            onChange={(e) => setOverviewLabelDraft(e.target.value)}
            className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-[#5A5A40] bg-white"
            autoFocus
          />
          <button type="button" onClick={saveOverviewLabelEdit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md" title="حفظ اسم السؤال">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => setEditingOverviewLabelKey(null)} className="p-1 text-[#8E8E85] hover:bg-[#E5E5E0] rounded-md" title="إلغاء">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <label className="font-bold block">{getOverviewFieldLabel(key)}</label>
          {userRole !== 'client' && !readOnly && (
            <button type="button" onClick={() => startOverviewLabelEdit(key)} className="p-1 text-[#8E8E85] hover:text-[#5A5A40] hover:bg-[#E5E5E0] rounded-md" title="تعديل اسم السؤال">
              <Edit2 className="w-3 h-3" />
            </button>
          )}
        </>
      )}
    </div>
  );

  const defaultSectionOrder = [
    ...BUILT_IN_AUDIT_SECTIONS.map(section => section.id),
    ...(currentAudit.customSections || []).map(section => `custom:${section.id}`)
  ];

  const sectionOrder = [
    ...(currentAudit.sectionOrder || []).filter(key => defaultSectionOrder.includes(key)),
    ...defaultSectionOrder.filter(key => !(currentAudit.sectionOrder || []).includes(key))
  ];

  const getSectionOrderIndex = (sectionKey: string) => {
    const index = sectionOrder.indexOf(sectionKey);
    return index >= 0 ? index : sectionOrder.length;
  };

  const moveAuditSection = (sectionKey: string, direction: 'up' | 'down') => {
    if (userRole === 'client') return;
    const currentIndex = sectionOrder.indexOf(sectionKey);
    if (currentIndex < 0) return;
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= sectionOrder.length) return;
    const nextOrder = [...sectionOrder];
    [nextOrder[currentIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[currentIndex]];
    onUpdateAudit(clientId, {
      ...currentAudit,
      sectionOrder: nextOrder,
      updatedAt: formatLocalDate()
    });
  };

  const orderedSectionEntries = sectionOrder.map(sectionKey => {
    if (sectionKey.startsWith('custom:')) {
      const customId = sectionKey.replace('custom:', '');
      const custom = (currentAudit.customSections || []).find(section => section.id === customId);
      return custom ? { key: sectionKey, type: 'custom' as const, custom } : null;
    }
    const builtIn = BUILT_IN_AUDIT_SECTIONS.find(section => section.id === sectionKey);
    return builtIn ? { key: sectionKey, type: 'builtIn' as const, builtIn } : null;
  }).filter(Boolean) as Array<
    | { key: string; type: 'builtIn'; builtIn: typeof BUILT_IN_AUDIT_SECTIONS[number] }
    | { key: string; type: 'custom'; custom: CustomBrandAuditSection }
  >;

  const openAddCustomSection = () => {
    if (userRole === 'client') return;
    setEditingCustomSectionId(null);
    setCustomSectionTitle('');
    setCustomSectionItemsTitle('عناصر التقييم');
    setCustomSectionDate(formatLocalDate());
    setShowCustomSectionModal(true);
  };

  const openEditCustomSection = (section: CustomBrandAuditSection) => {
    if (userRole === 'client') return;
    setEditingCustomSectionId(section.id);
    setCustomSectionTitle(section.title);
    setCustomSectionItemsTitle(section.itemsTitle || 'عناصر التقييم');
    setCustomSectionDate(section.auditDate || formatLocalDate());
    setShowCustomSectionModal(true);
  };

  const saveCustomSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'client' || !customSectionTitle.trim() || !customSectionItemsTitle.trim()) return;
    const existingSections = currentAudit.customSections || [];

    if (editingCustomSectionId) {
      const updatedSections = existingSections.map(section => section.id === editingCustomSectionId
        ? {
            ...section,
            title: customSectionTitle.trim(),
            itemsTitle: customSectionItemsTitle.trim(),
            auditDate: customSectionDate || formatLocalDate()
          }
        : section);
      onUpdateAudit(clientId, {
        ...currentAudit,
        customSections: updatedSections,
        updatedAt: formatLocalDate()
      });
    } else {
      const newSection: CustomBrandAuditSection = {
        id: `custom-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: customSectionTitle.trim(),
        itemsTitle: customSectionItemsTitle.trim(),
        auditDate: customSectionDate || formatLocalDate(),
        items: []
      };
      onUpdateAudit(clientId, {
        ...currentAudit,
        customSections: [...existingSections, newSection],
        sectionOrder: [...sectionOrder, `custom:${newSection.id}`],
        updatedAt: formatLocalDate()
      });
    }

    setShowCustomSectionModal(false);
    setEditingCustomSectionId(null);
  };

  const updateCustomSection = (sectionId: string, patch: Partial<CustomBrandAuditSection>) => {
    if (userRole === 'client') return;
    const updatedSections = (currentAudit.customSections || []).map(section =>
      section.id === sectionId ? { ...section, ...patch } : section
    );
    onUpdateAudit(clientId, {
      ...currentAudit,
      customSections: updatedSections,
      updatedAt: formatLocalDate()
    });
  };

  const deleteCustomSection = (sectionId: string) => {
    if (userRole === 'client') return;
    if (!window.confirm('هل أنت متأكد من حذف السكشن وكل العناصر الموجودة بداخله؟')) return;
    const updatedSections = (currentAudit.customSections || []).filter(section => section.id !== sectionId);
    onUpdateAudit(clientId, {
      ...currentAudit,
      customSections: updatedSections,
      sectionOrder: sectionOrder.filter(key => key !== `custom:${sectionId}`),
      updatedAt: formatLocalDate()
    });
    if (activeSection === `custom:${sectionId}`) setActiveSection('all');
  };

  // Navigation items for the full audit form modal follow the saved section order,
  // including custom sections created from the section manager.
  type ModalStep = {
    num: number;
    title: string;
    type: 'builtIn' | 'custom';
    customId?: string;
  };
  const modalSteps: ModalStep[] = orderedSectionEntries.reduce<ModalStep[]>((steps, entry) => {
    if (entry.type === 'builtIn') {
      if (!isBuiltInSectionHidden(entry.builtIn.id)) {
        steps.push({
          num: entry.builtIn.num,
          title: getBuiltInSectionTitle(entry.builtIn.id, entry.builtIn.title),
          type: 'builtIn'
        });
      }
      return steps;
    }
    const customIndex = (currentAudit.customSections || []).findIndex(section => section.id === entry.custom.id);
    steps.push({
      num: 1000 + Math.max(customIndex, 0),
      title: entry.custom.title,
      type: 'custom',
      customId: entry.custom.id
    });
    return steps;
  }, []);
  const currentModalStepIndex = modalSteps.findIndex(step => step.num === modalActiveTab);
  const activeCustomModalSection = modalActiveTab >= 1000
    ? (currentAudit.customSections || [])[modalActiveTab - 1000]
    : undefined;

  // Section display tabs follow the same saved order, including custom sections.
  const sectionTabs = [
    { id: 'all', label: 'التقرير الشامل (الكل)' },
    ...orderedSectionEntries.flatMap(entry => {
      if (entry.type === 'builtIn') {
        if (isBuiltInSectionHidden(entry.builtIn.id)) return [];
        return [{
          id: entry.builtIn.id,
          label: getBuiltInSectionTitle(entry.builtIn.id, entry.builtIn.title)
        }];
      }
      return [{ id: entry.key, label: entry.custom.title }];
    })
  ];

  const hasAudit = Boolean(
    audit &&
    (audit.auditDate || audit.overview?.brandName || (audit.score && audit.score > 0) || (audit.problemsAndSolutions && audit.problemsAndSolutions.length > 0))
  );

  const renderAuditSectionsContent = (readOnly = false) => (
    <div className="flex flex-col gap-6">
      {/* 1. BRAND OVERVIEW */}
      {!isBuiltInSectionHidden('overview') && (activeSection === 'all' || activeSection === 'overview') && (
        <div style={{ order: getSectionOrderIndex('overview') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs relative">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#5A5A40]" />
              <span>{getBuiltInSectionTitle('overview', '1. Brand Overview (نبذة عن البراند)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('overview')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {[
              { labelKey: 'brandName', label: getOverviewFieldLabel('brandName'), value: currentAudit.overview?.brandName, key: 'overview.brandName' },
              { labelKey: 'industry', label: getOverviewFieldLabel('industry'), value: currentAudit.overview?.industry, key: 'overview.industry' },
              { labelKey: 'coreProducts', label: getOverviewFieldLabel('coreProducts'), value: currentAudit.overview?.coreProducts, key: 'overview.coreProducts' },
              { labelKey: 'targetAudience', label: getOverviewFieldLabel('targetAudience'), value: currentAudit.overview?.targetAudience, key: 'overview.targetAudience' },
              { labelKey: 'avgProductPrice', label: getOverviewFieldLabel('avgProductPrice'), value: currentAudit.overview?.avgProductPrice, key: 'overview.avgProductPrice' },
              { labelKey: 'avgMonthlyOrders', label: getOverviewFieldLabel('avgMonthlyOrders'), value: currentAudit.overview?.avgMonthlyOrders, key: 'overview.avgMonthlyOrders' },
              { labelKey: 'salesLocations', label: getOverviewFieldLabel('salesLocations'), value: currentAudit.overview?.salesLocations, key: 'overview.salesLocations' },
              { labelKey: 'brandStage', label: getOverviewFieldLabel('brandStage'), value: currentAudit.overview?.brandStage, key: 'overview.brandStage' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] relative group">
                <div className="flex items-center justify-between mb-1 gap-2">
                  {editingOverviewLabelKey === item.labelKey && userRole !== 'client' && !readOnly ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        value={overviewLabelDraft}
                        onChange={(e) => setOverviewLabelDraft(e.target.value)}
                        className="w-full px-2 py-1 text-[11px] font-bold rounded-lg border border-[#5A5A40] bg-white"
                        autoFocus
                      />
                      <button type="button" onClick={saveOverviewLabelEdit} className="p-1 text-emerald-600"><Check className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => setEditingOverviewLabelKey(null)} className="p-1 text-[#8E8E85]"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#8E8E85] font-bold block">{item.label}</span>
                      {userRole !== 'client' && !readOnly && (
                        <button type="button" onClick={() => startOverviewLabelEdit(item.labelKey)} className="no-print p-1 text-[#8E8E85] hover:text-[#5A5A40]" title="تعديل اسم السؤال">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                  {item.value && (
                    <button
                      onClick={() =>
                        setDeleteConfirmation({
                          type: 'field',
                          fieldKey: item.key,
                          title: `بند: ${item.label}`
                        })
                      }
                      className="no-print opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:text-rose-700 transition"
                      title="حذف هذا البند"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="font-extrabold text-[#2D2D2A]">{item.value || 'غير محدد'}</span>
              </div>
            ))}

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0]">
              {renderOverviewFieldLabelEditor('salesChannels', readOnly)}
              <div className="flex flex-wrap gap-1 mt-1">
                {(currentAudit.overview?.salesChannels || ['Website', 'Instagram', 'Facebook', 'TikTok', 'Google', 'WhatsApp', 'Marketplace']).map((ch, i) => (
                  <span key={i} className="bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 px-2 py-0.5 rounded-md font-bold text-[10px]">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DIGITAL ASSETS AUDIT */}
      {!isBuiltInSectionHidden('digitalAssets') && (activeSection === 'all' || activeSection === 'digitalAssets') && (
        <div style={{ order: getSectionOrderIndex('digitalAssets') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#5A5A40]" />
              <span>{getBuiltInSectionTitle('digitalAssets', '2. Digital Assets Audit (تقييم الأصول الرقمية)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('digitalAssets')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2.5">
              <h4 className="font-extrabold text-[#5A5A40] border-b border-[#E5E5E0] pb-1.5">🌐 Website / Store (الموقع أو المتجر)</h4>
              <div className="space-y-2.5">
                {(currentAudit.digitalAssets?.websiteChecklist || [
                  { id: 'w-1', label: 'سرعة تحميل الموقع.', status: 'سريع جداً (أقل من 2 ثانية)' },
                  { id: 'w-2', label: 'سهولة الاستخدام.', status: 'سهل ومريح في التصفح' },
                  { id: 'w-3', label: 'هل خطوات الشراء واضحة؟', status: 'نعم، خطوات واضحة ومباشرة' },
                  { id: 'w-4', label: 'هل صفحة المنتج مكتملة؟', status: 'مكتملة بالصور والوصف والتقييمات' },
                  { id: 'w-5', label: 'هل صفحة الدفع سهلة؟', status: 'سهلة وتدعم طرق دفع متعددة' },
                  { id: 'w-6', label: 'هل الموقع مناسب للموبايل؟', status: 'متجاوب تماماً مع الموبايل' }
                ]).map((item) => (
                  <div key={item.id} className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] space-y-1">
                    <span className="font-bold text-[#2D2D2A] block">{item.label}</span>
                    <p className="text-xs text-[#5A5A40] bg-white p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                      {item.status || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2.5">
              <h4 className="font-extrabold text-[#5A5A40] border-b border-[#E5E5E0] pb-1.5">🎯 Landing Page (صفحة الهبوط)</h4>
              <div className="space-y-2.5">
                {(currentAudit.digitalAssets?.landingPageChecklist || [
                  { id: 'lp-1', label: 'هل العرض واضح؟', status: 'نعم، العرض بارز ومباشر' },
                  { id: 'lp-2', label: 'هل عنوان الصفحة يجذب العميل؟', status: 'عنوان جذاب يركز على القيمة' },
                  { id: 'lp-3', label: 'هل يوجد Call To Action (CTA)', status: 'نعم، أزرار CTA بارزة وواضحة' },
                  { id: 'lp-4', label: 'هل العميل يعرف ماذا يفعل بعد دخوله الصفحة؟', status: 'نعم، مسار العميل محدد بوضوح' }
                ]).map((item) => (
                  <div key={item.id} className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] space-y-1">
                    <span className="font-bold text-[#2D2D2A] block">{item.label}</span>
                    <p className="text-xs text-[#5A5A40] bg-white p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                      {item.status || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2.5">
              <h4 className="font-extrabold text-[#5A5A40] border-b border-[#E5E5E0] pb-1.5">📞 Contacts (ارقام التواصل)</h4>
              <div className="space-y-2.5">
                {(currentAudit.digitalAssets?.contactsChecklist || [
                  { id: 'c-1', label: 'هل رقم الواتس اب مهيئ للبيع؟ هل يوجد رقم للتواصل هاتفيا؟ هل يتم البيع هاتفيا؟', status: 'مهيئ بالرد الآلي والكتالوج، ويوجد رقم هاتفي مخصص للبيع' },
                  { id: 'c-2', label: 'هل يوجد فولو اب للارقام اللي بتتواصل مع البراند علي الواتساب؟', status: 'نعم، توجد متابعة دورية للعملاء المحتملين' }
                ]).map((item) => (
                  <div key={item.id} className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] space-y-1">
                    <span className="font-bold text-[#2D2D2A] block">{item.label}</span>
                    <p className="text-xs text-[#5A5A40] bg-white p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                      {item.status || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TRACKING AUDIT */}
      {!isBuiltInSectionHidden('tracking') && (activeSection === 'all' || activeSection === 'tracking') && (
        <div style={{ order: getSectionOrderIndex('tracking') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#5A5A40]" />
              <span>{getBuiltInSectionTitle('tracking', '3. Tracking Audit (تقييم التتبع)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('tracking')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0]">
              <span className="text-[#8E8E85] font-bold block mb-1">Meta Pixel</span>
              <p className="font-extrabold text-[#2D2D2A]">{currentAudit.trackingAudit?.metaPixelStatus || 'موجود ويعمل بنجاح'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0]">
              <span className="text-[#8E8E85] font-bold block mb-1">Conversion API (CAPI)</span>
              <p className="font-extrabold text-[#2D2D2A]">{currentAudit.trackingAudit?.capiStatus || 'مفعل ويعمل بكفاءة'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0]">
              <span className="text-[#8E8E85] font-bold block mb-1">تتبع الأحداث (Events)</span>
              <p className="font-extrabold text-[#2D2D2A]">{currentAudit.trackingAudit?.eventsNotes || 'أحداث الشراء والسلة والصفحة تعمل بدقة'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. CREATIVE & CONTENT AUDIT */}
      {!isBuiltInSectionHidden('creative') && (activeSection === 'all' || activeSection === 'creative') && (
        <div style={{ order: getSectionOrderIndex('creative') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>{getBuiltInSectionTitle('creative', '4. Creative & Content Audit (تقييم المحتوى والكريتيف)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('creative')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Brand Identity */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2.5">
              <h4 className="font-extrabold text-[#5A5A40] border-b border-[#E5E5E0] pb-1.5">🎨 Brand Identity (الهوية البصرية)</h4>
              <div className="space-y-2.5">
                {(currentAudit.creativeAudit?.brandIdentityChecklist || [
                  { id: 'bi-1', label: 'هل الهوية موحدة؟', status: 'نعم، الهوية موحدة ومتناسقة في التصاميم' },
                  { id: 'bi-2', label: 'الألوان.', status: 'ألوان متناسقة ومحددة للبراند' },
                  { id: 'bi-3', label: 'اللوجو.', status: 'لوجو بارز ومستعمل بشكل احترافي' },
                  { id: 'bi-4', label: 'الخطوط.', status: 'خطوط واضحة وعصرية' },
                  { id: 'bi-5', label: 'شكل التصميمات.', status: 'تصاميم مودرن تناسب الفئة المستهدفة' }
                ]).map((item) => (
                  <div key={item.id} className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] space-y-1">
                    <span className="font-bold text-[#2D2D2A] block">{item.label}</span>
                    <p className="text-xs text-[#5A5A40] bg-white p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                      {item.status || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Quality */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2.5">
              <h4 className="font-extrabold text-[#5A5A40] border-b border-[#E5E5E0] pb-1.5">🎬 Content Quality (جودة المحتوى)</h4>
              <div className="space-y-2.5">
                {(currentAudit.creativeAudit?.contentQualityChecklist || [
                  { id: 'cq-1', label: 'جودة الصور.', status: 'صور عالية الجودة بإضاءة ممتازة' },
                  { id: 'cq-2', label: 'جودة الفيديوهات.', status: 'فيديوهات احترافية واضحة' },
                  { id: 'cq-3', label: 'جودة الريلز.', status: 'ريلز سريعة وممتعة وبمونتاج جذاب' },
                  { id: 'cq-4', label: 'هل المحتوى مناسب للإعلانات؟', status: 'مناسب جداً للإعلانات المباشرة' },
                  { id: 'cq-5', label: 'هل يوجد تنوع؟', status: 'نعم، يوجد تنوع بين صور وفيديوهات وشرح' }
                ]).map((item) => (
                  <div key={item.id} className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] space-y-1">
                    <span className="font-bold text-[#2D2D2A] block">{item.label}</span>
                    <p className="text-xs text-[#5A5A40] bg-white p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                      {item.status || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* UGC Content */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2.5">
              <h4 className="font-extrabold text-[#5A5A40] border-b border-[#E5E5E0] pb-1.5">🤳 UGC Content</h4>
              <div className="space-y-2.5">
                {(currentAudit.creativeAudit?.ugcChecklist || [
                  { id: 'ugc-1', label: 'هل موجود؟', status: 'موجود بنسبة متوسطة' },
                  { id: 'ugc-2', label: 'هل يحتاج تطوير؟', status: 'يحتاج زيادتها والتركيز على تجارب العملاء' }
                ]).map((item) => (
                  <div key={item.id} className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] space-y-1">
                    <span className="font-bold text-[#2D2D2A] block">{item.label}</span>
                    <p className="text-xs text-[#5A5A40] bg-white p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                      {item.status || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hooks */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2.5">
              <h4 className="font-extrabold text-[#5A5A40] border-b border-[#E5E5E0] pb-1.5">🪝 Hooks</h4>
              <div className="space-y-2.5">
                {(currentAudit.creativeAudit?.hooksChecklist || [
                  { id: 'hook-1', label: 'هل الـ Hook قوي؟', status: 'قوي ويجذب الانتباه في أول 3 ثواني' }
                ]).map((item) => (
                  <div key={item.id} className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] space-y-1">
                    <span className="font-bold text-[#2D2D2A] block">{item.label}</span>
                    <p className="text-xs text-[#5A5A40] bg-white p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                      {item.status || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Proposition */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2.5">
              <h4 className="font-extrabold text-[#5A5A40] border-b border-[#E5E5E0] pb-1.5">💡 Value Proposition</h4>
              <div className="space-y-2.5">
                {(currentAudit.creativeAudit?.valuePropChecklist || [
                  { id: 'vp-1', label: 'هل واضحة؟', status: 'واضحة وتركز على حل المشكلة والضمان' }
                ]).map((item) => (
                  <div key={item.id} className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] space-y-1">
                    <span className="font-bold text-[#2D2D2A] block">{item.label}</span>
                    <p className="text-xs text-[#5A5A40] bg-white p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                      {item.status || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Offers */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2.5">
              <h4 className="font-extrabold text-[#5A5A40] border-b border-[#E5E5E0] pb-1.5">🎁 Offers</h4>
              <div className="space-y-2.5">
                {(currentAudit.creativeAudit?.offersChecklist || [
                  { id: 'off-1', label: 'هل العروض قوية؟و ما هي؟', status: 'عروض باقات وخصم عند شراء قطعتين' },
                  { id: 'off-2', label: 'هل يوجد سبب مقنع للشراء الآن؟', status: 'نعم، العرض لفترة محدودة وبكميات خاصة' }
                ]).map((item) => (
                  <div key={item.id} className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] space-y-1">
                    <span className="font-bold text-[#2D2D2A] block">{item.label}</span>
                    <p className="text-xs text-[#5A5A40] bg-white p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                      {item.status || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SOCIAL MEDIA AUDIT */}
      {!isBuiltInSectionHidden('socialMedia') && (activeSection === 'all' || activeSection === 'socialMedia') && (
        <div style={{ order: getSectionOrderIndex('socialMedia') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#5A5A40]" />
              <span>{getBuiltInSectionTitle('socialMedia', '5. Social Media Audit (تقييم السوشيال ميديا)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('socialMedia')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {(currentAudit.socialMediaAudit?.checklist !== undefined
              ? currentAudit.socialMediaAudit.checklist
              : [
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
                  { id: 'sm-12', label: 'تقييمات العملاء.', status: 'تقييمات إيجابية وآراء ممتازة' }
                ]
            ).map((item) => (
              <div key={item.id} className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                <span className="font-extrabold text-[#5A5A40] block">{item.label}</span>
                <p className="text-xs text-[#2D2D2A] bg-[#F9F8F6] p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                  {item.status || '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. OPERATIONS AUDIT */}
      {!isBuiltInSectionHidden('operations') && (activeSection === 'all' || activeSection === 'operations') && (
        <div style={{ order: getSectionOrderIndex('operations') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#5A5A40]" />
              <span>{getBuiltInSectionTitle('operations', '6. Operations Audit (تقييم التشغيل)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('operations')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {(currentAudit.operationsAudit?.checklist !== undefined
              ? currentAudit.operationsAudit.checklist
              : [
                  { id: 'op-1', label: 'التغليف و الهدايا.', status: 'تغليف ممتاز ومحكم مع هدايا مميزة' },
                  { id: 'op-2', label: 'سرعة الرد و جودة خدمة العملاء.', status: 'سرعة رد فائقة مع جودة خدمة عالية' },
                  { id: 'op-3', label: 'مدة الشحن.', status: 'من 24 إلى 48 ساعة داخل القاهرة والجيزة' },
                  { id: 'op-4', label: 'سياسة الاستبدال والاسترجاع.', status: 'سياسة استبدال واسترجاع سريعة وواضحة خلال 14 يوم' },
                  { id: 'op-5', label: 'توفر المخزون.', status: 'المخزون متوفر للأصناف الرئيسية' },
                  { id: 'op-6', label: 'هل الفريق يستطيع استقبال عدد كبير من الطلبات؟', status: 'نعم، الفريق جاهز ومؤهل لاستقبال أعداد كبيرة من الطلبات' }
                ]
            ).map((item) => (
              <div key={item.id} className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                <span className="font-extrabold text-[#5A5A40] block">{item.label}</span>
                <p className="text-xs text-[#2D2D2A] bg-[#F9F8F6] p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                  {item.status || '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SALES FUNNEL AUDIT */}
      {!isBuiltInSectionHidden('salesFunnel') && (activeSection === 'all' || activeSection === 'salesFunnel') && (
        <div style={{ order: getSectionOrderIndex('salesFunnel') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#5A5A40]" />
              <span>{getBuiltInSectionTitle('salesFunnel', '7. Sales Funnel Audit (تقييم رحلة العميل)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('salesFunnel')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">1. مصدر دخول العميل:</span>
              <p className="text-[#2D2D2A] leading-relaxed">{currentAudit.salesFunnel?.entrySources || 'إعلانات مباشرة المبيعات والبحث.'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">2. نقطة الوصول بعد الضغط:</span>
              <p className="text-[#2D2D2A] leading-relaxed">{currentAudit.salesFunnel?.landingPoint || 'صفحة المنتج أو الواتساب المباشر.'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">3. طريقة الشراء:</span>
              <p className="text-[#2D2D2A] leading-relaxed">{currentAudit.salesFunnel?.purchaseMethod || 'إتمام السلة أو الاتصال بالسيلز.'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-rose-700 block">4. نقاط التسريب (Drop-off Points):</span>
              <p className="text-[#2D2D2A] leading-relaxed">{currentAudit.salesFunnel?.dropOffPoints || 'تأخر العميل عند الدفع.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. UNIT ECONOMICS AND PRICING */}
      {!isBuiltInSectionHidden('unitEconomics') && (activeSection === 'all' || activeSection === 'unitEconomics') && (
        <div style={{ order: getSectionOrderIndex('unitEconomics') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>{getBuiltInSectionTitle('unitEconomics', '8. Unit Economics & Pricing (ربحية المنتج وتسعيرته)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('unitEconomics')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {UNIT_ECONOMICS_SECTIONS.map(section => {
              const items = getUnitEconomicsSectionItems(currentAudit.unitEconomics, section.id);
              return (
                <div key={section.id} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-base" aria-hidden="true">{section.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-[#5A5A40]">{section.title}</h4>
                      <p className="text-[10px] font-bold text-[#8E8E85]">{section.subtitle}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map(item => (
                      <div key={item.id} className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="font-extrabold text-emerald-800 block leading-relaxed">{item.label}</span>
                        <p className="text-[#2D2D2A] leading-relaxed">{item.status || 'لم تُسجل إجابة بعد.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 9. HISTORICAL ADS ANALYSIS */}
      {!isBuiltInSectionHidden('historicalAds') && (activeSection === 'all' || activeSection === 'historicalAds') && (
        <div style={{ order: getSectionOrderIndex('historicalAds') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5A5A40]" />
              <span>{getBuiltInSectionTitle('historicalAds', '9. Historical Ads Analysis (تحليل الإعلانات السابقة)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('historicalAds')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs font-bold text-[#5A5A40] bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80">
            إذا سبق للبراند تشغيل إعلانات:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">أفضل حملة.</span>
              <p className="text-[#2D2D2A]">{currentAudit.historicalAds?.bestCampaign || '—'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">أسوأ حملة.</span>
              <p className="text-[#2D2D2A]">{currentAudit.historicalAds?.worstCampaign || '—'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">أعلى ROAS.</span>
              <p className="text-[#2D2D2A]">{currentAudit.historicalAds?.highestRoas || '—'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">أقل CPA.</span>
              <p className="text-[#2D2D2A]">{currentAudit.historicalAds?.lowestCpa || '—'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">أفضل جمهور.</span>
              <p className="text-[#2D2D2A]">{currentAudit.historicalAds?.bestAudience || '—'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">أفضل إعلان.</span>
              <p className="text-[#2D2D2A]">{currentAudit.historicalAds?.bestAd || '—'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">أسباب النجاح.</span>
              <p className="text-[#2D2D2A]">{currentAudit.historicalAds?.successReasons || '—'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="font-extrabold text-[#5A5A40] block">أسباب الفشل.</span>
              <p className="text-[#2D2D2A]">{currentAudit.historicalAds?.failureReasons || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 10. COMPETITOR ANALYSIS */}
      {!isBuiltInSectionHidden('competitors') && (activeSection === 'all' || activeSection === 'competitors') && (
        <div style={{ order: getSectionOrderIndex('competitors') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5A5A40]" />
                <span>{getBuiltInSectionTitle('competitors', '10. Competitor Analysis (تحليل المنافسين الشامل)')}</span>
              </h3>
              <p className="text-[11px] text-[#78786E] font-medium mt-0.5">
                تحليل تفصيلي لـ 9 محاور استراتيجية متكاملة لكل منافس
              </p>
            </div>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('competitors')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenAddCompetitor}
                  className="px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة منافس</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {(!currentAudit.competitors || currentAudit.competitors.length === 0) ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-[#E5E5E0] p-6 space-y-2">
                <Users className="w-8 h-8 text-[#8E8E85] mx-auto opacity-50" />
                <p className="text-[#8E8E85] font-bold">لا يوجد منافسين مضافين حالياً في هذا التدقيق.</p>
                {userRole !== 'client' && (
                  <button
                    onClick={handleOpenAddCompetitor}
                    className="px-4 py-2 bg-[#5A5A40] text-white text-xs font-extrabold rounded-xl hover:bg-[#4a4a34] transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة أول منافس الآن</span>
                  </button>
                )}
              </div>
            ) : (
              currentAudit.competitors.map((comp, compIdx) => {
                const isExpanded = expandedCompIds[comp.id] !== false; // expanded by default
                const compType = comp.competitorType || 'مباشر';

                return (
                  <div key={comp.id} className="bg-white rounded-2xl border border-[#E5E5E0] shadow-2xs overflow-hidden transition-all">
                    {/* Competitor Header */}
                    <div className="p-4 sm:p-5 bg-linear-to-r from-[#F9F8F6] to-white border-b border-[#E5E5E0] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="w-7 h-7 rounded-xl bg-[#5A5A40] text-white font-black flex items-center justify-center text-xs shadow-2xs">
                          {compIdx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-base text-[#2D2D2A]">{comp.name || 'منافس بدون اسم'}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              compType === 'مباشر'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : compType === 'غير مباشر'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}>
                              نوع المنافس: {compType}
                            </span>
                          </div>
                          {comp.products && (
                            <p className="text-[11px] text-[#78786E] font-semibold mt-0.5">
                              {comp.products}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 no-print">
                        {comp.pageLink && (
                          <a
                            href={comp.pageLink.startsWith('http') ? comp.pageLink : `https://${comp.pageLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-[11px] font-bold flex items-center gap-1 transition"
                            title="فتح رابط المنافس"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>رابط الحساب/الموقع</span>
                          </a>
                        )}

                        {userRole !== 'client' && (
                          <>
                            <button
                              onClick={() => handleOpenEditCompetitor(comp)}
                              className="p-1.5 text-[#5A5A40] hover:text-[#2D2D2A] hover:bg-[#E5E5E0] rounded-xl transition cursor-pointer"
                              title="تعديل المنافس"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: 'competitor',
                                  idOrIndex: comp.id,
                                  title: `منافس: ${comp.name}`
                                })
                              }
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                              title="حذف المنافس"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            setExpandedCompIds((prev) => ({
                              ...prev,
                              [comp.id]: !isExpanded
                            }))
                          }
                          className="p-1.5 text-[#78786E] hover:text-[#2D2D2A] hover:bg-[#E5E5E0] rounded-xl transition cursor-pointer flex items-center gap-1"
                          title={isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Strategic Highlight Banner */}
                    <div className="p-4 bg-amber-50/40 border-b border-amber-100/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                        <span className="text-[10px] font-extrabold text-[#78786E] block mb-0.5">💰 متوسط السعر:</span>
                        <span className="font-black text-[#2D2D2A] text-xs">{comp.price || '—'}</span>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                        <span className="text-[10px] font-extrabold text-[#78786E] block mb-0.5">💪 نقطة القوة الأبرز:</span>
                        <span className="font-bold text-emerald-800 text-xs line-clamp-1">{comp.strengths || '—'}</span>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                        <span className="text-[10px] font-extrabold text-[#78786E] block mb-0.5">⚠️ أكبر تهديد:</span>
                        <span className="font-bold text-rose-800 text-xs line-clamp-1">{comp.biggestThreat || '—'}</span>
                      </div>
                      <div className="bg-[#5A5A40] text-white p-2.5 rounded-xl border border-[#4a4a34] shadow-2xs">
                        <span className="text-[10px] font-extrabold text-amber-200 block mb-0.5">🎯 الإجراء المقترح للبراند:</span>
                        <span className="font-black text-xs line-clamp-1">{comp.recommendedAction || '—'}</span>
                      </div>
                    </div>

                    {/* Full 9 Sections Details */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {/* 1. Competitor Profile */}
                          <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-[#E5E5E0] space-y-2">
                            <h5 className="font-extrabold text-[#5A5A40] text-xs border-b border-[#E5E5E0] pb-1.5 flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5" />
                              <span>1. بيانات المنافس | Profile</span>
                            </h5>
                            <div className="space-y-1.5 text-[11px]">
                              <div><span className="text-[#8E8E85] font-bold">اسم المنافس: </span><span className="font-black text-[#2D2D2A]">{comp.name || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">نوع المنافس: </span><span className="font-bold text-[#2D2D2A]">{comp.competitorType || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">المنتجات والخدمات: </span><span className="font-bold text-[#2D2D2A]">{comp.products || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">الجمهور المستهدف: </span><span className="font-bold text-[#2D2D2A]">{comp.targetAudience || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">قنوات البيع: </span><span className="font-bold text-[#2D2D2A]">{comp.salesChannels || '—'}</span></div>
                            </div>
                          </div>

                          {/* 2. Pricing & Offers */}
                          <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-[#E5E5E0] space-y-2">
                            <h5 className="font-extrabold text-emerald-800 text-xs border-b border-[#E5E5E0] pb-1.5 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5" />
                              <span>2. التسعير والعروض | Pricing & Offers</span>
                            </h5>
                            <div className="space-y-1.5 text-[11px]">
                              <div><span className="text-[#8E8E85] font-bold">متوسط الأسعار: </span><span className="font-black text-[#2D2D2A]">{comp.price || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">العروض الحالية: </span><span className="font-bold text-[#2D2D2A]">{comp.offers || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">الخصومات: </span><span className="font-bold text-[#2D2D2A]">{comp.discounts || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">الـBundles: </span><span className="font-bold text-[#2D2D2A]">{comp.bundles || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">الهدايا والمزايا: </span><span className="font-bold text-[#2D2D2A]">{comp.giftsAndExtras || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">الضمان والاسترجاع: </span><span className="font-bold text-[#2D2D2A]">{comp.warrantyAndReturns || '—'}</span></div>
                            </div>
                          </div>

                          {/* 3. Marketing & Content */}
                          <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-[#E5E5E0] space-y-2">
                            <h5 className="font-extrabold text-blue-800 text-xs border-b border-[#E5E5E0] pb-1.5 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>3. التسويق والمحتوى | Marketing & Content</span>
                            </h5>
                            <div className="space-y-1.5 text-[11px]">
                              <div><span className="text-[#8E8E85] font-bold">قنوات التسويق: </span><span className="font-bold text-[#2D2D2A]">{comp.marketingChannels || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">تكرار النشر: </span><span className="font-bold text-[#2D2D2A]">{comp.postingFrequency || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">أنواع المحتوى: </span><span className="font-bold text-[#2D2D2A]">{comp.contentType || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">أفضل محتوى + سبب النجاح: </span><span className="font-bold text-[#2D2D2A]">{comp.bestPerformingContent || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">الرسائل الأساسية: </span><span className="font-bold text-[#2D2D2A]">{comp.marketingMessage || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">أسلوب التصوير (Style): </span><span className="font-bold text-[#2D2D2A]">{comp.photographyStyle || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">الـCTA الأساسي: </span><span className="font-bold text-[#2D2D2A]">{comp.primaryCta || '—'}</span></div>
                            </div>
                          </div>

                          {/* 4. Advertising */}
                          <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-[#E5E5E0] space-y-2">
                            <h5 className="font-extrabold text-indigo-800 text-xs border-b border-[#E5E5E0] pb-1.5 flex items-center gap-1.5">
                              <Megaphone className="w-3.5 h-3.5" />
                              <span>4. الإعلانات | Advertising</span>
                            </h5>
                            <div className="space-y-1.5 text-[11px]">
                              <div><span className="text-[#8E8E85] font-bold">الإعلانات الحالية: </span><span className="font-bold text-[#2D2D2A]">{comp.currentAds || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">Ad Copy: </span><span className="font-bold text-[#2D2D2A]">{comp.adCopy || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">Hook: </span><span className="font-bold text-[#2D2D2A]">{comp.adHook || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">CTA الإعلاني: </span><span className="font-bold text-[#2D2D2A]">{comp.adCta || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">Landing Page / الشراء: </span><span className="font-bold text-[#2D2D2A]">{comp.landingPageOrPurchaseLink || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">نوع الـOffer المستخدم: </span><span className="font-bold text-[#2D2D2A]">{comp.offerTypeUsed || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">ملاحظات الاستراتيجية: </span><span className="font-bold text-[#2D2D2A]">{comp.adStrategyNotes || '—'}</span></div>
                            </div>
                          </div>

                          {/* 5. Customer Experience */}
                          <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-[#E5E5E0] space-y-2">
                            <h5 className="font-extrabold text-amber-900 text-xs border-b border-[#E5E5E0] pb-1.5 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>5. تجربة العميل | Customer Experience</span>
                            </h5>
                            <div className="space-y-1.5 text-[11px]">
                              <div><span className="text-[#8E8E85] font-bold">جودة صفحة الهبوط: </span><span className="font-bold text-[#2D2D2A]">{comp.landingPageQuality || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">سهولة الشراء: </span><span className="font-bold text-[#2D2D2A]">{comp.easeOfPurchase || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">خدمة ما بعد البيع: </span><span className="font-bold text-[#2D2D2A]">{comp.afterSalesService || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">الريفيوز وملاحظات العملاء: </span><span className="font-bold text-[#2D2D2A]">{comp.reviewsAndFeedback || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">أكثر الاعتراضات المتكررة: </span><span className="font-bold text-rose-700">{comp.recurringComplaintsOrObjections || '—'}</span></div>
                            </div>
                          </div>

                          {/* 6. Competitive Assessment */}
                          <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-[#E5E5E0] space-y-2">
                            <h5 className="font-extrabold text-purple-900 text-xs border-b border-[#E5E5E0] pb-1.5 flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5" />
                              <span>6. أداء المنافس | Assessment</span>
                            </h5>
                            <div className="space-y-1.5 text-[11px]">
                              <div><span className="text-emerald-700 font-bold">نقاط القوة: </span><span className="font-bold text-[#2D2D2A]">{comp.strengths || '—'}</span></div>
                              <div><span className="text-rose-700 font-bold">نقاط الضعف: </span><span className="font-bold text-[#2D2D2A]">{comp.weaknesses || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">مستوى التفاعل: </span><span className="font-bold text-[#2D2D2A]">{comp.engagementLevel || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">Winning Patterns: </span><span className="font-bold text-[#2D2D2A]">{comp.winningPatterns || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">ما يميزه عن الباقين: </span><span className="font-bold text-[#2D2D2A]">{comp.keyDifferentiator || '—'}</span></div>
                            </div>
                          </div>

                          {/* 7. Market Opportunities */}
                          <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-[#E5E5E0] space-y-2">
                            <h5 className="font-extrabold text-cyan-900 text-xs border-b border-[#E5E5E0] pb-1.5 flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5" />
                              <span>7. فرص السوق | Market Opportunities</span>
                            </h5>
                            <div className="space-y-1.5 text-[11px]">
                              <div><span className="text-[#8E8E85] font-bold">Gaps السوق: </span><span className="font-bold text-[#2D2D2A]">{comp.marketGaps || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">احتياجات غير مستغلة: </span><span className="font-bold text-[#2D2D2A]">{comp.unexploitedNeeds || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">فرص يمكن استغلالها: </span><span className="font-bold text-[#2D2D2A]">{comp.opportunitiesToExploit || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">أفكار يمكن اختبارها: </span><span className="font-bold text-[#2D2D2A]">{comp.ideasToTest || '—'}</span></div>
                            </div>
                          </div>

                          {/* 8. Competitive Threats */}
                          <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-[#E5E5E0] space-y-2">
                            <h5 className="font-extrabold text-rose-900 text-xs border-b border-[#E5E5E0] pb-1.5 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>8. التهديدات | Competitive Threats</span>
                            </h5>
                            <div className="space-y-1.5 text-[11px]">
                              <div><span className="text-rose-700 font-bold">أكبر تهديد من المنافس: </span><span className="font-bold text-[#2D2D2A]">{comp.biggestThreat || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">لماذا يختاره العميل بدلاً منا؟: </span><span className="font-bold text-[#2D2D2A]">{comp.whyCustomerChoosesThem || '—'}</span></div>
                              <div><span className="text-[#8E8E85] font-bold">تحركات تستحق المتابعة: </span><span className="font-bold text-[#2D2D2A]">{comp.movementsToWatch || '—'}</span></div>
                            </div>
                          </div>

                          {/* 9. Strategic Takeaways & Recommended Action (Featured Highlight Box) */}
                          <div className="bg-linear-to-br from-amber-50 to-emerald-50/50 p-4 rounded-xl border-2 border-[#5A5A40]/30 space-y-2.5 sm:col-span-2 md:col-span-2 lg:col-span-3 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#5A5A40]/20 pb-2">
                              <h5 className="font-black text-[#5A5A40] text-xs flex items-center gap-1.5">
                                <Flame className="w-4 h-4 text-amber-600" />
                                <span>9. التوصيات الاستراتيجية والإجراء المقترح | Strategic Takeaways</span>
                              </h5>
                              <span className="bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-md text-[10px] font-black">
                                أهم إضافة استراتيجية
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                                <span className="font-extrabold text-blue-900 block mb-0.5">💡 ماذا نتعلم من المنافس؟</span>
                                <p className="text-[#2D2D2A] font-bold leading-relaxed">{comp.whatToLearn || '—'}</p>
                              </div>
                              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                                <span className="font-extrabold text-rose-900 block mb-0.5">🚫 ماذا لا يجب أن ننسخه؟</span>
                                <p className="text-[#2D2D2A] font-bold leading-relaxed">{comp.whatNotToCopy || '—'}</p>
                              </div>
                              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                                <span className="font-extrabold text-purple-900 block mb-0.5">🧪 ما الذي يمكن اختباره؟</span>
                                <p className="text-[#2D2D2A] font-bold leading-relaxed">{comp.whatToTest || '—'}</p>
                              </div>
                              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                                <span className="font-extrabold text-emerald-900 block mb-0.5">🎯 ما الفرصة المستغلة؟</span>
                                <p className="text-[#2D2D2A] font-bold leading-relaxed">{comp.opportunityToExploit || '—'}</p>
                              </div>
                            </div>

                            <div className="bg-[#5A5A40] text-white p-3 rounded-xl border border-[#4a4a34] mt-2 shadow-xs">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                <span className="font-black text-xs text-amber-200">الإجراء المقترح للبراند | Recommended Action:</span>
                              </div>
                              <p className="text-white font-extrabold text-xs leading-relaxed">
                                {comp.recommendedAction || 'لم يتم تحديد إجراء مقترح بعد.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 11. SWOT ANALYSIS */}
      {!isBuiltInSectionHidden('swot') && (activeSection === 'all' || activeSection === 'swot') && (
        <div style={{ order: getSectionOrderIndex('swot') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
              <span>{getBuiltInSectionTitle('swot', '11. SWOT Analysis (تحليل SWOT)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('swot')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Strengths */}
            <div className="bg-white border border-[#E5E5E0] p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-2xs">
              <div className="border-b border-[#E5E5E0] pb-2.5">
                <h3 className="text-base font-black text-emerald-800 tracking-tight"> Strengths</h3>
                <p className="text-xs font-extrabold text-[#8E8E85] mt-0.5">نقاط القوة.</p>
              </div>

              <hr className="border-[#E5E5E0]" />

              <div className="space-y-2">
                {(currentAudit.swot.strengths || []).length === 0 ? (
                  <p className="text-[#8E8E85] italic py-1">لا يوجد نقاط قوة مضافة.</p>
                ) : (
                  (currentAudit.swot.strengths || []).map((st, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                      {editingSwotItem?.category === 'strengths' && editingSwotItem.index === i ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            value={editingSwotItem.text}
                            onChange={(e) => setEditingSwotItem({ ...editingSwotItem, text: e.target.value })}
                            className="flex-1 p-1.5 bg-white border border-[#5A5A40] rounded-lg text-xs font-bold text-[#2D2D2A] focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateSwot('strengths', i, editingSwotItem.text);
                                setEditingSwotItem(null);
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              handleUpdateSwot('strengths', i, editingSwotItem.text);
                              setEditingSwotItem(null);
                            }}
                            className="px-2.5 py-1.5 bg-[#5A5A40] text-white rounded-lg font-bold hover:bg-[#4a4a34] transition cursor-pointer shrink-0"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingSwotItem(null)}
                            className="px-2.5 py-1.5 bg-white border border-[#E5E5E0] text-[#2D2D2A] rounded-lg font-bold hover:bg-[#E5E5E0] transition cursor-pointer shrink-0"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-[#2D2D2A] font-bold leading-relaxed">• {st}</span>
                          {userRole !== 'client' && (
                            <div className="flex items-center gap-1 no-print shrink-0 mr-2">
                              <button
                                onClick={() => setEditingSwotItem({ category: 'strengths', index: i, text: st })}
                                title="تعديل"
                                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-white rounded-lg transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'swot',
                                    swotCategory: 'strengths',
                                    idOrIndex: i,
                                    title: `نقطة قوة: ${st}`
                                  })
                                }
                                title="حذف"
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Input */}
              {userRole !== 'client' && (
                <div className="no-print pt-2 border-t border-[#E5E5E0]">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      id="add-str-input"
                      placeholder="إضافة نقطة قوة..."
                      className="flex-1 p-2 bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const el = e.currentTarget;
                          if (el.value.trim()) {
                            handleAddSwot('strengths', el.value);
                            el.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('add-str-input') as HTMLInputElement;
                        if (el && el.value.trim()) {
                          handleAddSwot('strengths', el.value);
                          el.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-[#5A5A40] text-white rounded-xl text-xs font-extrabold hover:bg-[#4a4a34] transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Weaknesses */}
            <div className="bg-white border border-[#E5E5E0] p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-2xs">
              <div className="border-b border-[#E5E5E0] pb-2.5">
                <h3 className="text-base font-black text-rose-800 tracking-tight"> Weaknesses</h3>
                <p className="text-xs font-extrabold text-[#8E8E85] mt-0.5">نقاط الضعف.</p>
              </div>

              <hr className="border-[#E5E5E0]" />

              <div className="space-y-2">
                {(currentAudit.swot.weaknesses || []).length === 0 ? (
                  <p className="text-[#8E8E85] italic py-1">لا يوجد نقاط ضعف مضافة.</p>
                ) : (
                  (currentAudit.swot.weaknesses || []).map((wk, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                      {editingSwotItem?.category === 'weaknesses' && editingSwotItem.index === i ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            value={editingSwotItem.text}
                            onChange={(e) => setEditingSwotItem({ ...editingSwotItem, text: e.target.value })}
                            className="flex-1 p-1.5 bg-white border border-[#5A5A40] rounded-lg text-xs font-bold text-[#2D2D2A] focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateSwot('weaknesses', i, editingSwotItem.text);
                                setEditingSwotItem(null);
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              handleUpdateSwot('weaknesses', i, editingSwotItem.text);
                              setEditingSwotItem(null);
                            }}
                            className="px-2.5 py-1.5 bg-[#5A5A40] text-white rounded-lg font-bold hover:bg-[#4a4a34] transition cursor-pointer shrink-0"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingSwotItem(null)}
                            className="px-2.5 py-1.5 bg-white border border-[#E5E5E0] text-[#2D2D2A] rounded-lg font-bold hover:bg-[#E5E5E0] transition cursor-pointer shrink-0"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-[#2D2D2A] font-bold leading-relaxed">• {wk}</span>
                          {userRole !== 'client' && (
                            <div className="flex items-center gap-1 no-print shrink-0 mr-2">
                              <button
                                onClick={() => setEditingSwotItem({ category: 'weaknesses', index: i, text: wk })}
                                title="تعديل"
                                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-white rounded-lg transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'swot',
                                    swotCategory: 'weaknesses',
                                    idOrIndex: i,
                                    title: `نقطة ضعف: ${wk}`
                                  })
                                }
                                title="حذف"
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Input */}
              {userRole !== 'client' && (
                <div className="no-print pt-2 border-t border-[#E5E5E0]">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      id="add-wk-input"
                      placeholder="إضافة نقطة ضعف..."
                      className="flex-1 p-2 bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const el = e.currentTarget;
                          if (el.value.trim()) {
                            handleAddSwot('weaknesses', el.value);
                            el.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('add-wk-input') as HTMLInputElement;
                        if (el && el.value.trim()) {
                          handleAddSwot('weaknesses', el.value);
                          el.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-[#5A5A40] text-white rounded-xl text-xs font-extrabold hover:bg-[#4a4a34] transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Opportunities */}
            <div className="bg-white border border-[#E5E5E0] p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-2xs">
              <div className="border-b border-[#E5E5E0] pb-2.5">
                <h3 className="text-base font-black text-blue-800 tracking-tight"> Opportunities</h3>
                <p className="text-xs font-extrabold text-[#8E8E85] mt-0.5">الفرص.</p>
              </div>

              <hr className="border-[#E5E5E0]" />

              <div className="space-y-2">
                {(currentAudit.swot.opportunities || []).length === 0 ? (
                  <p className="text-[#8E8E85] italic py-1">لا يوجد فرص مضافة.</p>
                ) : (
                  (currentAudit.swot.opportunities || []).map((op, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                      {editingSwotItem?.category === 'opportunities' && editingSwotItem.index === i ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            value={editingSwotItem.text}
                            onChange={(e) => setEditingSwotItem({ ...editingSwotItem, text: e.target.value })}
                            className="flex-1 p-1.5 bg-white border border-[#5A5A40] rounded-lg text-xs font-bold text-[#2D2D2A] focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateSwot('opportunities', i, editingSwotItem.text);
                                setEditingSwotItem(null);
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              handleUpdateSwot('opportunities', i, editingSwotItem.text);
                              setEditingSwotItem(null);
                            }}
                            className="px-2.5 py-1.5 bg-[#5A5A40] text-white rounded-lg font-bold hover:bg-[#4a4a34] transition cursor-pointer shrink-0"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingSwotItem(null)}
                            className="px-2.5 py-1.5 bg-white border border-[#E5E5E0] text-[#2D2D2A] rounded-lg font-bold hover:bg-[#E5E5E0] transition cursor-pointer shrink-0"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-[#2D2D2A] font-bold leading-relaxed">• {op}</span>
                          {userRole !== 'client' && (
                            <div className="flex items-center gap-1 no-print shrink-0 mr-2">
                              <button
                                onClick={() => setEditingSwotItem({ category: 'opportunities', index: i, text: op })}
                                title="تعديل"
                                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-white rounded-lg transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'swot',
                                    swotCategory: 'opportunities',
                                    idOrIndex: i,
                                    title: `فرصة: ${op}`
                                  })
                                }
                                title="حذف"
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Input */}
              {userRole !== 'client' && (
                <div className="no-print pt-2 border-t border-[#E5E5E0]">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      id="add-op-input"
                      placeholder="إضافة فرصة..."
                      className="flex-1 p-2 bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const el = e.currentTarget;
                          if (el.value.trim()) {
                            handleAddSwot('opportunities', el.value);
                            el.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('add-op-input') as HTMLInputElement;
                        if (el && el.value.trim()) {
                          handleAddSwot('opportunities', el.value);
                          el.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-[#5A5A40] text-white rounded-xl text-xs font-extrabold hover:bg-[#4a4a34] transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Threats */}
            <div className="bg-white border border-[#E5E5E0] p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-2xs">
              <div className="border-b border-[#E5E5E0] pb-2.5">
                <h3 className="text-base font-black text-amber-800 tracking-tight"> Threats</h3>
                <p className="text-xs font-extrabold text-[#8E8E85] mt-0.5">التهديدات.</p>
              </div>

              <hr className="border-[#E5E5E0]" />

              <div className="space-y-2">
                {(currentAudit.swot.threats || []).length === 0 ? (
                  <p className="text-[#8E8E85] italic py-1">لا يوجد تهديدات مضافة.</p>
                ) : (
                  (currentAudit.swot.threats || []).map((th, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                      {editingSwotItem?.category === 'threats' && editingSwotItem.index === i ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            value={editingSwotItem.text}
                            onChange={(e) => setEditingSwotItem({ ...editingSwotItem, text: e.target.value })}
                            className="flex-1 p-1.5 bg-white border border-[#5A5A40] rounded-lg text-xs font-bold text-[#2D2D2A] focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateSwot('threats', i, editingSwotItem.text);
                                setEditingSwotItem(null);
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              handleUpdateSwot('threats', i, editingSwotItem.text);
                              setEditingSwotItem(null);
                            }}
                            className="px-2.5 py-1.5 bg-[#5A5A40] text-white rounded-lg font-bold hover:bg-[#4a4a34] transition cursor-pointer shrink-0"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingSwotItem(null)}
                            className="px-2.5 py-1.5 bg-white border border-[#E5E5E0] text-[#2D2D2A] rounded-lg font-bold hover:bg-[#E5E5E0] transition cursor-pointer shrink-0"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-[#2D2D2A] font-bold leading-relaxed">• {th}</span>
                          {userRole !== 'client' && (
                            <div className="flex items-center gap-1 no-print shrink-0 mr-2">
                              <button
                                onClick={() => setEditingSwotItem({ category: 'threats', index: i, text: th })}
                                title="تعديل"
                                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-white rounded-lg transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'swot',
                                    swotCategory: 'threats',
                                    idOrIndex: i,
                                    title: `تهديد: ${th}`
                                  })
                                }
                                title="حذف"
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Input */}
              {userRole !== 'client' && (
                <div className="no-print pt-2 border-t border-[#E5E5E0]">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      id="add-th-input"
                      placeholder="إضافة تهديد..."
                      className="flex-1 p-2 bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const el = e.currentTarget;
                          if (el.value.trim()) {
                            handleAddSwot('threats', el.value);
                            el.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('add-th-input') as HTMLInputElement;
                        if (el && el.value.trim()) {
                          handleAddSwot('threats', el.value);
                          el.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-[#5A5A40] text-white rounded-xl text-xs font-extrabold hover:bg-[#4a4a34] transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 12. CUSTOMER PERSONA */}
      {!isBuiltInSectionHidden('persona') && (activeSection === 'all' || activeSection === 'persona') && (
        <div style={{ order: getSectionOrderIndex('persona') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#5A5A40]" />
              <span>{getBuiltInSectionTitle('persona', '12. Customer Persona (العميل المستهدف)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('persona')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenFullModal}
                  title="تعديل بنود التقييم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6 text-xs text-[#2D2D2A]">
            {/* 1. Target Audience */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E5E0] space-y-3">
              <h4 className="text-base font-black text-[#2D2D2A]"> 1. Target Audience</h4>
              <blockquote className="p-3 bg-[#F9F8F6] border-r-4 border-[#5A5A40] rounded-l-xl text-xs font-bold text-[#5A5A40]">
                من هو العميل المثالي للبراند؟
              </blockquote>
              <ul className="space-y-2 pt-1 font-bold">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>الفئة العمرية: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.targetAudienceDetails?.ageRange || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>الجنس: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.targetAudienceDetails?.gender || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>المستوى المادي: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.targetAudienceDetails?.incomeLevel || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>الاهتمامات: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.targetAudienceDetails?.interests || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>أسلوب الحياة: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.targetAudienceDetails?.lifestyle || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>مكان الإقامة: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.targetAudienceDetails?.location || 'غير محدد'}</span></span>
                </li>
              </ul>
            </div>

            <hr className="border-[#E5E5E0]" />

            {/* 2. Customer Insights */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E5E0] space-y-4">
              <h4 className="text-base font-black text-[#2D2D2A]"> 2. Customer Insights</h4>
              <blockquote className="p-3 bg-[#F9F8F6] border-r-4 border-[#5A5A40] rounded-l-xl text-xs font-bold text-[#5A5A40]">
                فهم سلوك العميل ودوافعه.
              </blockquote>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] space-y-1">
                  <h5 className="font-black text-sm text-[#2D2D2A]"> Pain Points</h5>
                  <p className="text-[11px] font-bold text-[#8E8E85]">المشاكل التي يعاني منها العميل ويحلها المنتج.</p>
                  <p className="text-xs font-bold text-[#2D2D2A] pt-1">{currentAudit.customerPersona?.insights?.painPoints || 'غير محدد'}</p>
                </div>

                <div className="p-3.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] space-y-1">
                  <h5 className="font-black text-sm text-[#2D2D2A]"> Buying Motivation</h5>
                  <p className="text-[11px] font-bold text-[#8E8E85]">لماذا قد يشتري هذا المنتج؟</p>
                  <p className="text-xs font-bold text-[#2D2D2A] pt-1">{currentAudit.customerPersona?.insights?.buyingMotivation || 'غير محدد'}</p>
                </div>

                <div className="p-3.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] space-y-1">
                  <h5 className="font-black text-sm text-[#2D2D2A]"> Buying Triggers</h5>
                  <p className="text-[11px] font-bold text-[#8E8E85]">ما الذي يدفعه لاتخاذ قرار الشراء بسرعة؟</p>
                  <p className="text-xs font-bold text-[#2D2D2A] pt-1">{currentAudit.customerPersona?.insights?.buyingTriggers || 'غير محدد'}</p>
                </div>

                <div className="p-3.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] space-y-1">
                  <h5 className="font-black text-sm text-[#2D2D2A]"> Objections</h5>
                  <p className="text-[11px] font-bold text-[#8E8E85]">ما الاعتراضات أو المخاوف التي تمنعه من الشراء؟</p>
                  <p className="text-xs font-bold text-[#2D2D2A] pt-1">{currentAudit.customerPersona?.insights?.objections || 'غير محدد'}</p>
                </div>
              </div>
            </div>

            <hr className="border-[#E5E5E0]" />

            {/* 3. Brand Positioning */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E5E0] space-y-3">
              <h4 className="text-base font-black text-[#2D2D2A]"> 3. Brand Positioning</h4>
              <ul className="space-y-2 pt-1 font-bold">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>القيمة الأساسية التي يقدمها البراند: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.positioning?.coreValue || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>الميزة التنافسية (USP): <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.positioning?.usp || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>الرسالة الأساسية للبراند: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.positioning?.coreMessage || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>الانطباع الأول: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.positioning?.firstImpression || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>مكانة البراند في السوق (اقتصادي - متوسط - Premium): <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.positioning?.marketTier || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>مدى وضوح الهوية: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.positioning?.identityClarity || 'غير محدد'}</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#5A5A40]">•</span>
                  <span>تقييم جاهزية البراند للنمو: <span className="font-normal text-[#2D2D2A]">{currentAudit.customerPersona?.positioning?.growthReadiness || 'غير محدد'}</span></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 13. MAIN PROBLEMS & SOLUTIONS */}
      {!isBuiltInSectionHidden('problems') && (activeSection === 'all' || activeSection === 'problems') && (
        <div style={{ order: getSectionOrderIndex('problems') }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{getBuiltInSectionTitle('problems', '13. Main Problems & Solutions (أهم المشاكل وحلها)')}</span>
            </h3>
            {userRole !== 'client' && (
              <div className="flex items-center gap-1.5 no-print">
                <button
                  onClick={() => handleResetSection('problems')}
                  title="استعادة الافتراضي لهذا القسم"
                  className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8E8E85]" />
                </button>
                <button
                  onClick={handleOpenAddProblem}
                  className="no-print px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مشكلة جديدة</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 text-xs">
            {(!currentAudit.problemsAndSolutions || currentAudit.problemsAndSolutions.length === 0) ? (
              <p className="text-[#8E8E85] text-center py-6">
                {userRole === 'client' ? 'لا توجد مشاكل مسجلة حالياً.' : 'لا توجد مشاكل مضافة بعد. اضغط على "إضافة مشكلة جديدة" للبدء.'}
              </p>
            ) : (
              currentAudit.problemsAndSolutions.map((prob) => (
                <div key={prob.id} className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-3 relative">
                  <div className="flex flex-wrap items-center justify-between border-b border-[#E5E5E0] pb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${prob.status === 'تم التنفيذ' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <h4 className="font-extrabold text-sm text-[#2D2D2A]">المشكلة: {prob.problem}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {userRole !== 'client' && !readOnly ? (
                        <button
                          type="button"
                          onClick={() => toggleProblemStatus(prob.id)}
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] flex items-center gap-1 transition cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${
                            prob.status === 'تم التنفيذ'
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                          }`}
                          title="اضغط لتغيير الحالة مباشرة"
                        >
                          {prob.status === 'تم التنفيذ' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>تم التنفيذ</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>قيد التنفيذ</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] flex items-center gap-1 ${
                            prob.status === 'تم التنفيذ'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {prob.status === 'تم التنفيذ' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>تم التنفيذ</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>قيد التنفيذ</span>
                            </>
                          )}
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-rose-100 text-rose-800 border border-rose-200">
                        الأولوية: {prob.priorityLevel || 'عالية'}
                      </span>

                      {userRole !== 'client' && (
                        <div className="flex items-center gap-1 no-print">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProblem(prob)}
                            className="p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F9F8F6] rounded-lg transition"
                            title="تعديل المشكلة"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'problem',
                                idOrIndex: prob.id,
                                title: `مشكلة: ${prob.problem}`
                              })
                            }
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="حذف المشكلة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#E5E5E0]">
                      <span className="font-bold text-[#8E8E85] block mb-0.5">تأثيرها على المبيعات:</span>
                      <p className="text-[#2D2D2A] leading-relaxed">{prob.impactOnSales}</p>
                    </div>

                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                      <span className="font-bold text-emerald-900 block mb-0.5">طريقة الحل والخدمة المطلوبة:</span>
                      <p className="text-emerald-950 font-bold leading-relaxed">{prob.solutionStrategy}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CUSTOM BRAND AUDIT SECTIONS */}
      {(currentAudit.customSections || []).map((section, index) => {
        const visible = activeSection === 'all' || activeSection === `custom:${section.id}`;
        if (!visible) return null;
        return (
          <div key={section.id} style={{ order: getSectionOrderIndex(`custom:${section.id}`) }} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-[#E5E5E0] pb-3">
              <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5A5A40]" />
                <span>{14 + index}. {section.title}</span>
              </h3>
              {userRole !== 'client' && (
                <div className="flex items-center gap-1.5 no-print">
                  <button
                    type="button"
                    onClick={() => openEditCustomSection(section)}
                    className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-xl text-[#78786E] hover:text-[#2D2D2A] transition cursor-pointer"
                    title="تعديل بيانات السكشن"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCustomSection(section.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-600 transition cursor-pointer"
                    title="حذف السكشن"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
              <label className="block text-xs font-extrabold text-[#2D2D2A] mb-2">تاريخ التقييم (Audit Date)</label>
              <input
                type="date"
                value={section.auditDate || ''}
                onChange={(e) => updateCustomSection(section.id, { auditDate: e.target.value })}
                disabled={userRole === 'client' || readOnly}
                className="w-full bg-white border border-[#E5E5E0] rounded-xl px-4 py-3 text-sm font-bold text-[#2D2D2A] outline-none focus:border-[#5A5A40] disabled:bg-[#F9F8F6] disabled:cursor-default"
              />
            </div>

            {userRole !== 'client' && !readOnly ? (
              <ChecklistEditorSection
                title={section.itemsTitle || 'عناصر التقييم'}
                items={section.items || []}
                onUpdate={(items) => updateCustomSection(section.id, { items })}
                placeholderAnswer="اكتب نتيجة التقييم أو الملاحظة..."
                columns={2}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E5E5E0]">
                  <h4 className="font-extrabold text-sm text-[#2D2D2A]">{section.itemsTitle || 'عناصر التقييم'}</h4>
                  <span className="text-xs font-bold text-[#8E8E85]">({section.items?.length || 0})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {(section.items || []).map(item => (
                    <div key={item.id} className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1">
                      <span className="font-extrabold text-[#5A5A40] block">{item.label}</span>
                      <p className="text-[#2D2D2A] bg-[#F9F8F6] p-2 rounded-lg border border-[#E5E5E0] font-medium leading-relaxed">
                        {item.status || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* PRINT-ONLY CSS STYLES */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 12mm 15mm 12mm;
          }
          body {
            background-color: #ffffff !important;
            color: #2D2D2A !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: relative !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: #2D2D2A !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          h1, h2, h3, h4, h5, h6 {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
          p, blockquote, li {
            orphans: 3;
            widows: 3;
          }
          #print-area .bg-white,
          #print-area [class*="rounded-"],
          #print-area blockquote,
          #print-area .p-3,
          #print-area .p-3\\.5,
          #print-area .p-4,
          #print-area .p-5,
          #print-area .grid > div {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* SUMMARY BAR WHEN AUDIT IS RECORDED */}
      {hasAudit ? (
        <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs no-print">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-[#2D2D2A]">
                  {currentAudit.overview?.brandName || 'تقييم البراند الشامل'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>تم تسجيل التقييم ({BUILT_IN_AUDIT_SECTIONS.filter(section => !isBuiltInSectionHidden(section.id)).length + (currentAudit.customSections?.length || 0)} محور)</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8E8E85] mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-[#E5E5E0] font-bold text-[#2D2D2A]">
                  <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>تاريخ التقييم: {currentAudit.auditDate || formatLocalDate()}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {userRole === 'client' ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowViewDetailsModal(true)}
                  className="px-3.5 py-2.5 bg-white hover:bg-[#E5E5E0] text-[#2D2D2A] border border-[#E5E5E0] font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  title="معاينة تقرير تقييم البراند"
                >
                  <Eye className="w-4 h-4 text-[#5A5A40]" />
                  <span>معاينة التقييم</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isExportingPdf}
                  className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-wait text-white font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  title="تحميل التقرير PDF"
                >
                  {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{isExportingPdf ? 'جاري التحميل...' : 'تحميل التقرير PDF'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openAddCustomSection}
                  className="px-3.5 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  title="إضافة سكشن جديد للتقييم"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة سكشن</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBuiltInSectionsModal(true)}
                  className="px-3.5 py-2.5 bg-white hover:bg-[#E5E5E0] text-[#2D2D2A] border border-[#E5E5E0] font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  title="تعديل أو إخفاء السكاشن الأساسية"
                >
                  <Layers className="w-4 h-4 text-[#5A5A40]" />
                  <span>إدارة السكاشن</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowViewDetailsModal(true)}
                  className="p-2.5 bg-white hover:bg-[#E5E5E0] text-[#2D2D2A] border border-[#E5E5E0] font-extrabold rounded-2xl text-xs transition flex items-center justify-center shadow-2xs cursor-pointer"
                  title="عرض جميع تفاصيل التقييم"
                >
                  <Eye className="w-4 h-4 text-[#5A5A40]" />
                </button>

                <button
                  type="button"
                  onClick={handleOpenFullModal}
                  className="p-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-2xl text-xs transition flex items-center justify-center shadow-xs cursor-pointer"
                  title="تعديل بنود التقييم"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isExportingPdf}
                  className="p-2.5 bg-white hover:bg-[#F9F8F6] disabled:opacity-60 disabled:cursor-wait text-[#2D2D2A] border border-[#E5E5E0] font-extrabold rounded-2xl text-xs transition flex items-center justify-center shadow-2xs cursor-pointer"
                  title="تحميل التقرير PDF"
                >
                  {isExportingPdf ? <Loader2 className="w-4 h-4 text-[#5A5A40] animate-spin" /> : <Download className="w-4 h-4 text-[#5A5A40]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmResetAuditModal(true)}
                  className="p-2.5 bg-white hover:bg-[#E5E5E0] text-[#2D2D2A] border border-[#E5E5E0] font-extrabold rounded-2xl text-xs transition flex items-center justify-center shadow-2xs cursor-pointer hover:text-amber-700"
                  title="استعادة الافتراضي للتقييم بالكامل"
                >
                  <RotateCcw className="w-4 h-4 text-[#8E8E85]" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteAuditModal(true)}
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold rounded-2xl text-xs transition flex items-center justify-center shadow-2xs cursor-pointer"
                  title="حذف تقييم البراند بالكامل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* EMPTY STATE WHEN NO AUDIT EXISTS */
        <div className="bg-[#F9F8F6] border-2 border-dashed border-[#E5E5E0] rounded-3xl p-8 sm:p-12 text-center space-y-4 no-print">
          <div className="w-16 h-16 rounded-3xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-extrabold text-[#2D2D2A]">
              لم يتم تسجيل تقييم للبراند بعد
            </h3>
            <p className="text-xs text-[#8E8E85] leading-relaxed">
              {userRole === 'client'
                ? 'سيتم إتاحة تقرير الفحص والتقييم الشامل للبراند فور الانتهاء من إعداده بواسطة الإدارة.'
                : 'يمكنك إضافة تقييم شامل للبراند يشمل 13 محوّر فني (نبذة البراند، الأصول الرقمية، التتبع، المحتوى، السوشيال ميديا، التشغيل، رحلة العميل، ربحية المنتج، الإعلانات السابقة، المنافسين، SWOT، والحلول).'}
            </p>
          </div>
          {userRole !== 'client' && (
            <button
              type="button"
              onClick={handleOpenFullModal}
              className="px-6 py-3 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-2xl text-xs transition inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span>إضافة تقييم جديد للبراند</span>
            </button>
          )}
        </div>
      )}

      {/* VIEW FULL DETAILS MODAL */}
      {showViewDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E5E5E0] overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[#E5E5E0] bg-[#F9F8F6] flex items-center justify-between gap-4 shrink-0">
              <div>
                <h3 className="font-black text-base sm:text-lg text-[#2D2D2A]">
                  تقرير فحص وتقييم البراند (Brand Audit)
                </h3>
                <p className="text-xs text-[#8E8E85] font-bold">
                  {currentAudit.overview?.brandName || clientId} • تاريخ التقييم: {currentAudit.auditDate}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isExportingPdf}
                  title="تحميل PDF"
                  className="p-2 bg-white border border-[#E5E5E0] hover:bg-[#E5E5E0] disabled:opacity-60 disabled:cursor-wait text-[#2D2D2A] font-extrabold rounded-xl text-xs transition flex items-center justify-center cursor-pointer"
                >
                  {isExportingPdf ? <Loader2 className="w-4 h-4 text-[#5A5A40] animate-spin" /> : <Download className="w-4 h-4 text-[#5A5A40]" />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowViewDetailsModal(false)}
                  className="p-2 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#E5E5E0] rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Section Filter Tabs */}
            <div className="p-3 border-b border-[#E5E5E0] bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    activeSection === tab.id
                      ? 'bg-[#5A5A40] text-white shadow-2xs'
                      : 'bg-[#F9F8F6] border border-[#E5E5E0] text-[#2D2D2A] hover:bg-[#E5E5E0]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body - 13 Sections */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {renderAuditSectionsContent()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5E5E0] bg-[#F9F8F6] flex items-center justify-between shrink-0">
              {userRole !== 'client' ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowViewDetailsModal(false);
                    handleOpenFullModal();
                  }}
                  title="تعديل هذا التقرير"
                  className="p-2.5 bg-[#5A5A40] text-white font-extrabold rounded-xl text-xs hover:bg-[#4a4a34] transition flex items-center justify-center cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isExportingPdf}
                  title="تحميل التقرير PDF"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-wait text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{isExportingPdf ? 'جاري التحميل...' : 'تحميل التقرير PDF'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowViewDetailsModal(false)}
                className="px-5 py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-extrabold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE ALL BRAND AUDIT SECTIONS */}
      {showBuiltInSectionsModal && userRole !== 'client' && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#E5E5E0] overflow-hidden">
            <div className="p-5 border-b border-[#E5E5E0] bg-[#F9F8F6] flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-[#2D2D2A]">إدارة سكاشن الـ Brand Audit</h3>
                <p className="text-[11px] text-[#8E8E85] mt-1">ضيفي سكشن جديد، غيري أسماء السكاشن، اخفي أو استعيدي أي سكشن، ورتبيهم بالترتيب اللي يناسبك.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAddCustomSection}
                  className="px-3.5 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة سكشن</span>
                </button>
                <button type="button" onClick={() => setShowBuiltInSectionsModal(false)} className="p-2 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#E5E5E0] rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              {orderedSectionEntries.map((entry, index) => {
                const isFirst = index === 0;
                const isLast = index === orderedSectionEntries.length - 1;

                if (entry.type === 'builtIn') {
                  const section = entry.builtIn;
                  const hidden = isBuiltInSectionHidden(section.id);
                  return (
                    <div key={entry.key} className={`p-3.5 rounded-2xl border space-y-2 ${hidden ? 'bg-[#F5F5F0] border-dashed border-[#D5D5CE] opacity-80' : 'bg-white border-[#E5E5E0]'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center text-[11px] font-black">{index + 1}</span>
                          <span className="text-[11px] font-extrabold text-[#8E8E85]">سكشن أساسي</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => moveAuditSection(entry.key, 'up')} disabled={isFirst} className="p-1.5 rounded-lg border border-[#E5E5E0] text-[#5A5A40] hover:bg-[#F9F8F6] disabled:opacity-30 disabled:cursor-not-allowed" title="تحريك لأعلى">
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => moveAuditSection(entry.key, 'down')} disabled={isLast} className="p-1.5 rounded-lg border border-[#E5E5E0] text-[#5A5A40] hover:bg-[#F9F8F6] disabled:opacity-30 disabled:cursor-not-allowed" title="تحريك لأسفل">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          {hidden ? (
                            <button type="button" onClick={() => restoreBuiltInSection(section.id)} className="px-3 py-1.5 text-[11px] font-extrabold rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                              استعادة
                            </button>
                          ) : (
                            <button type="button" onClick={() => hideBuiltInSection(section.id)} className="px-3 py-1.5 text-[11px] font-extrabold rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100">
                              إخفاء / حذف
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        key={`${section.id}-${getBuiltInSectionTitle(section.id, section.title)}`}
                        type="text"
                        defaultValue={getBuiltInSectionTitle(section.id, section.title)}
                        onBlur={(e) => {
                          const title = e.target.value.trim();
                          if (title) updateBuiltInSectionSetting(section.id, { title });
                        }}
                        disabled={hidden}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] disabled:cursor-not-allowed text-xs font-bold text-[#2D2D2A] focus:bg-white focus:border-[#5A5A40] outline-none"
                      />
                    </div>
                  );
                }

                const section = entry.custom;
                return (
                  <div key={entry.key} className="p-3.5 rounded-2xl border border-[#E5E5E0] bg-white space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center text-[11px] font-black">{index + 1}</span>
                        <span className="text-[11px] font-extrabold text-[#8E8E85]">سكشن مضاف</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => moveAuditSection(entry.key, 'up')} disabled={isFirst} className="p-1.5 rounded-lg border border-[#E5E5E0] text-[#5A5A40] hover:bg-[#F9F8F6] disabled:opacity-30 disabled:cursor-not-allowed" title="تحريك لأعلى">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => moveAuditSection(entry.key, 'down')} disabled={isLast} className="p-1.5 rounded-lg border border-[#E5E5E0] text-[#5A5A40] hover:bg-[#F9F8F6] disabled:opacity-30 disabled:cursor-not-allowed" title="تحريك لأسفل">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => openEditCustomSection(section)} className="p-1.5 rounded-lg border border-[#E5E5E0] text-[#5A5A40] hover:bg-[#F9F8F6]" title="تعديل السكشن">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => deleteCustomSection(section.id)} className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100" title="حذف السكشن">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-xs font-bold text-[#2D2D2A]">
                      {section.title}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-[#E5E5E0] bg-[#F9F8F6] flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-[#8E8E85]">استخدمي ↑ ↓ لتغيير ترتيب السكاشن.</span>
              <button type="button" onClick={() => setShowBuiltInSectionsModal(false)} className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs">
                تم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOM BRAND AUDIT SECTION MODAL */}
      {showCustomSectionModal && (
        <div className="fixed inset-0 z-80 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-[#E5E5E0]">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#2D2D2A]">
                  {editingCustomSectionId ? 'تعديل السكشن' : 'إضافة سكشن جديد'}
                </h3>
                <p className="text-[11px] text-[#8E8E85] mt-0.5">السكشن الجديد هيظهر بنفس نظام أقسام الـ Brand Audit.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomSectionModal(false)}
                className="p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F9F8F6] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveCustomSection} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-[#2D2D2A] block mb-1">اسم السكشن</label>
                <input
                  type="text"
                  required
                  value={customSectionTitle}
                  onChange={(e) => setCustomSectionTitle(e.target.value)}
                  placeholder="مثال: Customer Experience Audit"
                  className="w-full p-3 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] font-bold outline-none focus:bg-white focus:border-[#5A5A40]"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-extrabold text-[#2D2D2A] block mb-1">عنوان العناصر داخل السكشن</label>
                <input
                  type="text"
                  required
                  value={customSectionItemsTitle}
                  onChange={(e) => setCustomSectionItemsTitle(e.target.value)}
                  placeholder="مثال: عناصر تقييم تجربة العميل"
                  className="w-full p-3 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] font-bold outline-none focus:bg-white focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="font-extrabold text-[#2D2D2A] block mb-1">تاريخ التقييم</label>
                <input
                  type="date"
                  required
                  value={customSectionDate}
                  onChange={(e) => setCustomSectionDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E5E5E0] bg-white text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomSectionModal(false)}
                  className="px-4 py-2 bg-[#F9F8F6] hover:bg-[#E5E5E0] border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl shadow-xs"
                >
                  {editingCustomSectionId ? 'حفظ التعديلات' : 'إضافة السكشن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ENTIRE AUDIT MODAL */}
      {showConfirmDeleteAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-[#E5E5E0] text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D2D2A]">تأكيد حذف تقييم البراند</h3>
              <p className="text-xs text-[#8E8E85] mt-1">هل أنت متأكد من رغبتك في حذف تقييم البراند بالكامل؟</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDeleteAuditModal(false)}
                className="px-4 py-2 bg-[#F9F8F6] border border-[#E5E5E0] font-extrabold rounded-xl text-xs text-[#2D2D2A]"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateAudit(clientId, {
                    clientId,
                    score: 0,
                    auditDate: '',
                    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] }
                  } as unknown as BrandAudit);
                  setShowConfirmDeleteAuditModal(false);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-xs"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE CONTAINER FOR PDF GENERATION */}
      <div id="print-area" className="hidden print:block space-y-6">
        <div className="border-b-2 border-[#5A5A40] pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-[#2D2D2A]">تقرير فحص وتقييم البراند (Brand Audit)</h1>
              <p className="text-sm font-bold text-[#5A5A40] mt-1">العميل: {currentAudit.overview?.brandName || clientId}</p>
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-[#5A5A40]">{currentAudit.score}%</div>
              <p className="text-xs text-[#8E8E85]">تاريخ التقييم: {currentAudit.auditDate}</p>
            </div>
          </div>
        </div>

        {renderAuditSectionsContent(true)}
      </div>

      {/* FULL BRAND AUDIT POP-UP MODAL (بوب اب بكل الأسئلة بنفس الترتيب) */}
      {showFullAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E5E5E0] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between bg-[#F9F8F6] rounded-t-3xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5A5A40] text-white font-black flex items-center justify-center text-sm shadow-xs">
                  FA
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#2D2D2A]">
                     إضافة تقييم شامل للبراند (Brand Audit Form)
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {userRole !== 'client' && (
                  <button
                    type="button"
                    onClick={() => setShowBuiltInSectionsModal(true)}
                    title="إدارة السكاشن الأساسية"
                    className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] text-[#2D2D2A] rounded-2xl transition cursor-pointer flex items-center justify-center"
                  >
                    <Layers className="w-4 h-4 text-[#5A5A40]" />
                  </button>
                )}
                {userRole !== 'client' && modalActiveTab < 1000 && (
                  <button
                    type="button"
                    onClick={() => handleResetModalStep(modalActiveTab)}
                    title="استعادة الافتراضي لهذا القسم الحالي"
                    className="p-2 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] text-[#2D2D2A] rounded-2xl transition cursor-pointer flex items-center justify-center hover:text-amber-700"
                  >
                    <RotateCcw className="w-4 h-4 text-[#8E8E85]" />
                  </button>
                )}
                <button
                  onClick={() => setShowFullAuditModal(false)}
                  className="p-2 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#E5E5E0] rounded-2xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Steps / Sections Tabs inside Modal */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-3 border-b border-[#E5E5E0] bg-[#F9F8F6]/60 scrollbar-none shrink-0">
              {modalSteps.map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setModalActiveTab(s.num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                    modalActiveTab === s.num
                      ? 'bg-[#5A5A40] text-white shadow-2xs'
                      : 'bg-white border border-[#E5E5E0] text-[#2D2D2A] hover:bg-white'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs flex-1">
              {/* DATE BAR - built-in sections only */}
              {!activeCustomModalSection && (
                <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0]">
                  <div>
                    <label className="font-extrabold text-[#2D2D2A] block mb-1">تاريخ التقييم (Audit Date)</label>
                    <input
                      type="date"
                      value={formData.auditDate || formatLocalDate()}
                      onChange={(e) => setFormData({ ...formData, auditDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white font-bold text-[#2D2D2A]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 1: BRAND OVERVIEW */}
              {modalActiveTab === 1 && (
                <div className="space-y-5">
                  <h4 className="font-extrabold text-sm text-[#5A5A40] border-b border-[#E5E5E0] pb-2">
                    {getBuiltInSectionTitle('overview', '1. Brand Overview (نبذة عن البراند)')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      {renderOverviewFieldLabelEditor('brandName')}
                      <input
                        type="text"
                        value={formData.overview?.brandName || ''}
                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, brandName: e.target.value } })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white"
                      />
                    </div>

                    <div>
                      {renderOverviewFieldLabelEditor('industry')}
                      <input
                        type="text"
                        value={formData.overview?.industry || ''}
                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, industry: e.target.value } })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      {renderOverviewFieldLabelEditor('coreProducts')}
                      <input
                        type="text"
                        value={formData.overview?.coreProducts || ''}
                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, coreProducts: e.target.value } })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white"
                      />
                    </div>

                    <div>
                      {renderOverviewFieldLabelEditor('targetAudience')}
                      <input
                        type="text"
                        value={formData.overview?.targetAudience || ''}
                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, targetAudience: e.target.value } })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white"
                      />
                    </div>

                    <div>
                      {renderOverviewFieldLabelEditor('avgProductPrice')}
                      <input
                        type="text"
                        value={formData.overview?.avgProductPrice || ''}
                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, avgProductPrice: e.target.value } })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white"
                      />
                    </div>

                    <div>
                      {renderOverviewFieldLabelEditor('avgMonthlyOrders')}
                      <input
                        type="text"
                        value={formData.overview?.avgMonthlyOrders || ''}
                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, avgMonthlyOrders: e.target.value } })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      {renderOverviewFieldLabelEditor('salesChannels')}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['Website', 'Instagram', 'Facebook', 'TikTok', 'Google', 'WhatsApp', 'Marketplace'].map((channel) => {
                          const currentChannels = formData.overview?.salesChannels || ['Website', 'Instagram', 'Facebook', 'TikTok', 'Google', 'WhatsApp', 'Marketplace'];
                          const isSelected = currentChannels.includes(channel);
                          return (
                            <button
                              type="button"
                              key={channel}
                              onClick={() => {
                                const updated = isSelected
                                  ? currentChannels.filter((c) => c !== channel)
                                  : [...currentChannels, channel];
                                setFormData({
                                  ...formData,
                                  overview: { ...formData.overview, salesChannels: updated }
                                });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                                  : 'bg-white text-[#8E8E85] border-[#E5E5E0] hover:border-[#5A5A40]'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {channel}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      {renderOverviewFieldLabelEditor('salesLocations')}
                      <input
                        type="text"
                        value={formData.overview?.salesLocations || ''}
                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, salesLocations: e.target.value } })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white"
                      />
                    </div>

                    <div>
                      {renderOverviewFieldLabelEditor('brandStage')}
                      <select
                        value={formData.overview?.brandStage || 'جديد'}
                        onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, brandStage: e.target.value } })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white font-bold"
                      >
                        <option value="جديد">جديد</option>
                        <option value="شغال">شغال</option>
                        <option value="بيعمل Scale">بيعمل Scale</option>
                      </select>
                    </div>
                  </div>

                  {/* Overview Additional Checklist */}
                  <ChecklistEditorSection
                    title="📋 بنود تقييم إضافية لنبذة البراند"
                    items={formData.overview?.checklist || []}
                    defaultItems={[
                      { id: 'ov-1', label: 'جاهزية البراند للإطلاق والتوسع', status: 'جاهز للإطلاق والتوسع' },
                      { id: 'ov-2', label: 'وضوح النموذج الربحي وتنوع المنتجات', status: 'نموذج ربحي واضح مع تنوع جيد' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        overview: {
                          ...formData.overview,
                          checklist: items
                        }
                      })
                    }
                  />
                </div>
              )}

              {/* STEP 2: DIGITAL ASSETS */}
              {modalActiveTab === 2 && (
                <div className="space-y-5">
                  <h4 className="font-extrabold text-sm text-[#5A5A40] border-b border-[#E5E5E0] pb-2">
                    {getBuiltInSectionTitle('digitalAssets', '2. Digital Assets Audit (تقييم الأصول الرقمية)')}
                  </h4>

                  {/* Website / Store */}
                  <ChecklistEditorSection
                    title="🌐 Website / Store (الموقع أو المتجر)"
                    items={formData.digitalAssets?.websiteChecklist || []}
                    defaultItems={[
                      { id: 'w-1', label: 'سرعة تحميل الموقع.', status: 'سريع جداً (أقل من 2 ثانية)' },
                      { id: 'w-2', label: 'سهولة الاستخدام.', status: 'سهل ومريح في التصفح' },
                      { id: 'w-3', label: 'هل خطوات الشراء واضحة؟', status: 'نعم، خطوات واضحة ومباشرة' },
                      { id: 'w-4', label: 'هل صفحة المنتج مكتملة؟', status: 'مكتملة بالصور والوصف والتقييمات' },
                      { id: 'w-5', label: 'هل صفحة الدفع سهلة؟', status: 'سهلة وتدعم طرق دفع متعددة' },
                      { id: 'w-6', label: 'هل الموقع مناسب للموبايل؟', status: 'متجاوب تماماً مع الموبايل' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        digitalAssets: {
                          ...formData.digitalAssets,
                          websiteChecklist: items
                        }
                      })
                    }
                  />

                  {/* Landing Page */}
                  <ChecklistEditorSection
                    title="🎯 Landing Page (صفحة الهبوط)"
                    items={formData.digitalAssets?.landingPageChecklist || []}
                    defaultItems={[
                      { id: 'lp-1', label: 'هل العرض واضح؟', status: 'نعم، العرض بارز ومباشر' },
                      { id: 'lp-2', label: 'هل عنوان الصفحة يجذب العميل؟', status: 'عنوان جذاب يركز على القيمة' },
                      { id: 'lp-3', label: 'هل يوجد Call To Action (CTA)', status: 'نعم، أزرار CTA بارزة وواضحة' },
                      { id: 'lp-4', label: 'هل العميل يعرف ماذا يفعل بعد دخوله الصفحة؟', status: 'نعم، مسار العميل محدد بوضوح' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        digitalAssets: {
                          ...formData.digitalAssets,
                          landingPageChecklist: items
                        }
                      })
                    }
                  />

                  {/* Contacts */}
                  <ChecklistEditorSection
                    title="📞 Contacts (ارقام التواصل)"
                    items={formData.digitalAssets?.contactsChecklist || []}
                    columns={1}
                    defaultItems={[
                      { id: 'c-1', label: 'هل رقم الواتس اب مهيئ للبيع؟ هل يوجد رقم للتواصل هاتفيا؟ هل يتم البيع هاتفيا؟', status: 'مهيئ بالرد الآلي والكتالوج، ويوجد رقم هاتفي مخصص للبيع' },
                      { id: 'c-2', label: 'هل يوجد فولو اب للارقام اللي بتتواصل مع البراند علي الواتساب؟', status: 'نعم، توجد متابعة دورية للعملاء المحتملين' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        digitalAssets: {
                          ...formData.digitalAssets,
                          contactsChecklist: items
                        }
                      })
                    }
                  />
                </div>
              )}

              {/* STEP 3: TRACKING */}
              {modalActiveTab === 3 && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-[#5A5A40] border-b border-[#E5E5E0] pb-2">
                    {getBuiltInSectionTitle('tracking', '3. Tracking Audit (تقييم التتبع)')}
                  </h4>
                  <ChecklistEditorSection
                    title="📊 عناصر تقييم التتبع والبيانات"
                    items={
                      formData.trackingAudit?.checklist && formData.trackingAudit.checklist.length > 0
                        ? formData.trackingAudit.checklist
                        : [
                            { id: 'tr-1', label: 'Meta Pixel (هل موجود؟ وهل يعمل بوضوح؟)', status: formData.trackingAudit?.metaPixelStatus || 'موجود ويعمل بنجاح' },
                            { id: 'tr-2', label: 'Conversion API (CAPI) (هل مفعل وهل يعمل؟)', status: formData.trackingAudit?.capiStatus || 'مفعل ويعمل بكفاءة' },
                            { id: 'tr-3', label: 'Events (هل جميع الأحداث تعمل؟ وما هي؟)', status: formData.trackingAudit?.eventsNotes || 'أحداث الشراء والسلة والصفحة تعمل بدقة' }
                          ]
                    }
                    defaultItems={[
                      { id: 'tr-1', label: 'Meta Pixel (هل موجود؟ وهل يعمل بوضوح؟)', status: 'موجود ويعمل بنجاح' },
                      { id: 'tr-2', label: 'Conversion API (CAPI) (هل مفعل وهل يعمل؟)', status: 'مفعل ويعمل بكفاءة' },
                      { id: 'tr-3', label: 'Events (هل جميع الأحداث تعمل؟ وما هي؟)', status: 'أحداث الشراء والسلة والصفحة تعمل بدقة' }
                    ]}
                    onUpdate={(items) => {
                      const metaItem = items.find((i) => i.id === 'tr-1' || i.label.includes('Pixel'));
                      const capiItem = items.find((i) => i.id === 'tr-2' || i.label.includes('CAPI'));
                      const eventsItem = items.find((i) => i.id === 'tr-3' || i.label.includes('Events'));
                      setFormData({
                        ...formData,
                        trackingAudit: {
                          ...formData.trackingAudit,
                          metaPixelStatus: metaItem?.status || formData.trackingAudit?.metaPixelStatus || '',
                          capiStatus: capiItem?.status || formData.trackingAudit?.capiStatus || '',
                          eventsNotes: eventsItem?.status || formData.trackingAudit?.eventsNotes || '',
                          checklist: items
                        }
                      });
                    }}
                  />
                </div>
              )}

              {/* STEP 4: CREATIVE & CONTENT */}
              {modalActiveTab === 4 && (
                <div className="space-y-5">
                  <h4 className="font-extrabold text-sm text-[#5A5A40] border-b border-[#E5E5E0] pb-2">
                    {getBuiltInSectionTitle('creative', '4. Creative & Content Audit (تقييم المحتوى والكريتيف)')}
                  </h4>

                  {/* Brand Identity */}
                  <ChecklistEditorSection
                    title="🎨 Brand Identity (الهوية البصرية)"
                    items={formData.creativeAudit?.brandIdentityChecklist || []}
                    defaultItems={[
                      { id: 'bi-1', label: 'هل الهوية موحدة؟', status: 'نعم، الهوية موحدة ومتناسقة في التصاميم' },
                      { id: 'bi-2', label: 'الألوان.', status: 'ألوان متناسقة ومحددة للبراند' },
                      { id: 'bi-3', label: 'اللوجو.', status: 'لوجو بارز ومستعمل بشكل احترافي' },
                      { id: 'bi-4', label: 'الخطوط.', status: 'خطوط واضحة وعصرية' },
                      { id: 'bi-5', label: 'شكل التصميمات.', status: 'تصاميم مودرن تناسب الفئة المستهدفة' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        creativeAudit: { ...formData.creativeAudit, brandIdentityChecklist: items }
                      })
                    }
                  />

                  {/* Content Quality */}
                  <ChecklistEditorSection
                    title="🎬 Content Quality (جودة المحتوى)"
                    items={formData.creativeAudit?.contentQualityChecklist || []}
                    defaultItems={[
                      { id: 'cq-1', label: 'جودة الصور.', status: 'صور عالية الجودة بإضاءة ممتازة' },
                      { id: 'cq-2', label: 'جودة الفيديوهات.', status: 'فيديوهات احترافية واضحة' },
                      { id: 'cq-3', label: 'جودة الريلز.', status: 'ريلز سريعة وممتعة وبمونتاج جذاب' },
                      { id: 'cq-4', label: 'هل المحتوى مناسب للإعلانات؟', status: 'مناسب جداً للإعلانات المباشرة' },
                      { id: 'cq-5', label: 'هل يوجد تنوع؟', status: 'نعم، يوجد تنوع بين صور وفيديوهات وشرح' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        creativeAudit: { ...formData.creativeAudit, contentQualityChecklist: items }
                      })
                    }
                  />

                  {/* UGC Content */}
                  <ChecklistEditorSection
                    title="🤳 UGC Content"
                    items={formData.creativeAudit?.ugcChecklist || []}
                    defaultItems={[
                      { id: 'ugc-1', label: 'هل موجود؟', status: 'موجود بنسبة متوسطة' },
                      { id: 'ugc-2', label: 'هل يحتاج تطوير؟', status: 'يحتاج زيادتها والتركيز على تجارب العملاء' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        creativeAudit: { ...formData.creativeAudit, ugcChecklist: items }
                      })
                    }
                  />

                  {/* Hooks */}
                  <ChecklistEditorSection
                    title="🪝 Hooks"
                    items={formData.creativeAudit?.hooksChecklist || []}
                    columns={1}
                    defaultItems={[
                      { id: 'hook-1', label: 'هل الـ Hook قوي؟', status: 'قوي ويجذب الانتباه في أول 3 ثواني' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        creativeAudit: { ...formData.creativeAudit, hooksChecklist: items }
                      })
                    }
                  />

                  {/* Value Proposition */}
                  <ChecklistEditorSection
                    title="💡 Value Proposition"
                    items={formData.creativeAudit?.valuePropChecklist || []}
                    columns={1}
                    defaultItems={[
                      { id: 'vp-1', label: 'هل واضحة؟', status: 'واضحة وتركز على حل المشكلة والضمان' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        creativeAudit: { ...formData.creativeAudit, valuePropChecklist: items }
                      })
                    }
                  />

                  {/* Offers */}
                  <ChecklistEditorSection
                    title="🎁 Offers"
                    items={formData.creativeAudit?.offersChecklist || []}
                    defaultItems={[
                      { id: 'off-1', label: 'هل العروض قوية؟و ما هي؟', status: 'عروض باقات وخصم عند شراء قطعتين' },
                      { id: 'off-2', label: 'هل يوجد سبب مقنع للشراء الآن؟', status: 'نعم، العرض لفترة محدودة وبكميات خاصة' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        creativeAudit: { ...formData.creativeAudit, offersChecklist: items }
                      })
                    }
                  />
                </div>
              )}

              {/* STEP 5: SOCIAL MEDIA AUDIT */}
              {modalActiveTab === 5 && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-[#5A5A40] border-b border-[#E5E5E0] pb-2">
                    {getBuiltInSectionTitle('socialMedia', '5. Social Media Audit (تقييم السوشيال ميديا)')}
                  </h4>
                  <ChecklistEditorSection
                    title="📱 عناصر تقييم السوشيال ميديا"
                    items={formData.socialMediaAudit?.checklist || []}
                    defaultItems={[
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
                      { id: 'sm-12', label: 'تقييمات العملاء.', status: 'تقييمات إيجابية وآراء ممتازة' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        socialMediaAudit: { ...formData.socialMediaAudit, checklist: items }
                      })
                    }
                  />
                </div>
              )}

              {/* STEP 6: OPERATIONS AUDIT */}
              {modalActiveTab === 6 && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-[#5A5A40] border-b border-[#E5E5E0] pb-2">
                    {getBuiltInSectionTitle('operations', '6. Operations Audit (تقييم التشغيل)')}
                  </h4>
                  <ChecklistEditorSection
                    title="⚙️ عناصر تقييم التشغيل واللوجستيات"
                    items={formData.operationsAudit?.checklist || []}
                    defaultItems={[
                      { id: 'op-1', label: 'التغليف و الهدايا.', status: 'تغليف ممتاز ومحكم مع هدايا مميزة' },
                      { id: 'op-2', label: 'سرعة الرد و جودة خدمة العملاء.', status: 'سرعة رد فائقة مع جودة خدمة عالية' },
                      { id: 'op-3', label: 'مدة الشحن.', status: 'من 24 إلى 48 ساعة داخل القاهرة والجيزة' },
                      { id: 'op-4', label: 'سياسة الاستبدال والاسترجاع.', status: 'سياسة استبدال واسترجاع سريعة وواضحة خلال 14 يوم' },
                      { id: 'op-5', label: 'توفر المخزون.', status: 'المخزون متوفر للأصناف الرئيسية' },
                      { id: 'op-6', label: 'هل الفريق يستطيع استقبال عدد كبير من الطلبات؟', status: 'نعم، الفريق جاهز ومؤهل لاستقبال أعداد كبيرة من الطلبات' }
                    ]}
                    onUpdate={(items) =>
                      setFormData({
                        ...formData,
                        operationsAudit: { ...formData.operationsAudit, checklist: items }
                      })
                    }
                  />
                </div>
              )}

              {/* STEP 7: SALES FUNNEL */}
              {modalActiveTab === 7 && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-[#5A5A40] border-b border-[#E5E5E0] pb-2">
                    {getBuiltInSectionTitle('salesFunnel', '7. Sales Funnel Audit (تقييم رحلة العميل)')}
                  </h4>
                  <ChecklistEditorSection
                    title="🛒 مراحل وفحص مسار المبيعات"
                    items={
                      formData.salesFunnel?.checklist && formData.salesFunnel.checklist.length > 0
                        ? formData.salesFunnel.checklist
                        : [
                            { id: 'sf-1', label: '1. مصدر دخول العميل (منين بيدخل للصفحة؟)', status: formData.salesFunnel?.entrySources || 'إعلانات مباشرة المبيعات والبحث.' },
                            { id: 'sf-2', label: '2. نقطة الوصول (بعد ضغط الإعلان فين بيروح؟)', status: formData.salesFunnel?.landingPoint || 'صفحة المنتج أو الواتساب المباشر.' },
                            { id: 'sf-3', label: '3. طريقة الشراء (إزاي بيكمل الشراء؟)', status: formData.salesFunnel?.purchaseMethod || 'إتمام السلة أو الاتصال بالسيلز.' },
                            { id: 'sf-4', label: '4. نقاط التسريب Drop-off Points (فين بيخرجوا؟)', status: formData.salesFunnel?.dropOffPoints || 'تأخر العميل عند الدفع.' }
                          ]
                    }
                    defaultItems={[
                      { id: 'sf-1', label: '1. مصدر دخول العميل (منين بيدخل للصفحة؟)', status: 'إعلانات مباشرة المبيعات والبحث.' },
                      { id: 'sf-2', label: '2. نقطة الوصول (بعد ضغط الإعلان فين بيروح؟)', status: 'صفحة المنتج أو الواتساب المباشر.' },
                      { id: 'sf-3', label: '3. طريقة الشراء (إزاي بيكمل الشراء؟)', status: 'إتمام السلة أو الاتصال بالسيلز.' },
                      { id: 'sf-4', label: '4. نقاط التسريب Drop-off Points (فين بيخرجوا؟)', status: 'تأخر العميل عند الدفع.' }
                    ]}
                    onUpdate={(items) => {
                      const s1 = items.find((i) => i.id === 'sf-1');
                      const s2 = items.find((i) => i.id === 'sf-2');
                      const s3 = items.find((i) => i.id === 'sf-3');
                      const s4 = items.find((i) => i.id === 'sf-4');
                      setFormData({
                        ...formData,
                        salesFunnel: {
                          ...formData.salesFunnel,
                          entrySources: s1?.status || formData.salesFunnel?.entrySources || '',
                          landingPoint: s2?.status || formData.salesFunnel?.landingPoint || '',
                          purchaseMethod: s3?.status || formData.salesFunnel?.purchaseMethod || '',
                          dropOffPoints: s4?.status || formData.salesFunnel?.dropOffPoints || '',
                          checklist: items
                        }
                      });
                    }}
                  />
                </div>
              )}

              {/* STEP 8: UNIT ECONOMICS & PRICING */}
              {modalActiveTab === 8 && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5E5E0] pb-3">
                    <h4 className="font-extrabold text-sm text-[#5A5A40]">
                      {getBuiltInSectionTitle('unitEconomics', '8. Unit Economics & Pricing (ربحية المنتج وتسعيرته)')}
                    </h4>
                    <p className="text-[11px] text-[#8E8E85] mt-1">
                      اجمع الأرقام الفعلية قدر الإمكان لتحديد CPA وROAS المناسبين للبراند.
                    </p>
                  </div>

                  {UNIT_ECONOMICS_SECTIONS.map(section => {
                    const allItems = getUnitEconomicsChecklist(formData.unitEconomics);
                    const sectionItems = allItems.filter(item => item.id.startsWith(`ue-${section.id}-`));
                    return (
                      <div key={section.id} className="space-y-2">
                        <ChecklistEditorSection
                          title={`${section.icon} ${section.title} (${section.subtitle})`}
                          items={sectionItems}
                          defaultItems={section.items.map(item => ({ ...item }))}
                          placeholderAnswer="اكتب الرقم أو النسبة أو الإجابة المتاحة..."
                          columns={2}
                          onUpdate={(items) => {
                            const sectionItemIds = new Set(sectionItems.map(item => item.id));
                            const normalizedItems = items.map(item => item.id.startsWith(`ue-${section.id}-`)
                              ? item
                              : { ...item, id: `ue-${section.id}-custom-${item.id}` });
                            const nextChecklist = [
                              ...allItems.filter(item => !sectionItemIds.has(item.id)),
                              ...normalizedItems
                            ];
                            const actualSellingPrice = nextChecklist.find(item => item.id === 'ue-selling-actual-price');
                            const grossMargin = nextChecklist.find(item => item.id === 'ue-selling-gross-margin');
                            setFormData({
                              ...formData,
                              unitEconomics: {
                                ...formData.unitEconomics,
                                avgPriceRange: actualSellingPrice?.status || '',
                                profitMargin: grossMargin?.status || '',
                                checklist: nextChecklist
                              }
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STEP 9: HISTORICAL ADS */}
              {modalActiveTab === 9 && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-[#5A5A40] border-b border-[#E5E5E0] pb-2">
                    {getBuiltInSectionTitle('historicalAds', '9. Historical Ads Analysis (تحليل الإعلانات السابقة)')}
                  </h4>
                  <ChecklistEditorSection
                    title="📈 بنود تحليل الحملات الإعلانية السابقة"
                    items={
                      formData.historicalAds?.checklist && formData.historicalAds.checklist.length > 0
                        ? formData.historicalAds.checklist
                        : [
                            { id: 'ha-1', label: 'أفضل حملة.', status: formData.historicalAds?.bestCampaign || '—' },
                            { id: 'ha-2', label: 'أسوأ حملة.', status: formData.historicalAds?.worstCampaign || '—' },
                            { id: 'ha-3', label: 'أعلى ROAS.', status: formData.historicalAds?.highestRoas || '—' },
                            { id: 'ha-4', label: 'أقل CPA.', status: formData.historicalAds?.lowestCpa || '—' },
                            { id: 'ha-5', label: 'أفضل جمهور.', status: formData.historicalAds?.bestAudience || '—' },
                            { id: 'ha-6', label: 'أفضل إعلان.', status: formData.historicalAds?.bestAd || '—' },
                            { id: 'ha-7', label: 'أسباب النجاح.', status: formData.historicalAds?.successReasons || '—' },
                            { id: 'ha-8', label: 'أسباب الفشل.', status: formData.historicalAds?.failureReasons || '—' }
                          ]
                    }
                    defaultItems={[
                      { id: 'ha-1', label: 'أفضل حملة.', status: '—' },
                      { id: 'ha-2', label: 'أسوأ حملة.', status: '—' },
                      { id: 'ha-3', label: 'أعلى ROAS.', status: '—' },
                      { id: 'ha-4', label: 'أقل CPA.', status: '—' },
                      { id: 'ha-5', label: 'أفضل جمهور.', status: '—' },
                      { id: 'ha-6', label: 'أفضل إعلان.', status: '—' },
                      { id: 'ha-7', label: 'أسباب النجاح.', status: '—' },
                      { id: 'ha-8', label: 'أسباب الفشل.', status: '—' }
                    ]}
                    onUpdate={(items) => {
                      const h1 = items.find((i) => i.id === 'ha-1');
                      const h2 = items.find((i) => i.id === 'ha-2');
                      const h3 = items.find((i) => i.id === 'ha-3');
                      const h4 = items.find((i) => i.id === 'ha-4');
                      const h5 = items.find((i) => i.id === 'ha-5');
                      const h6 = items.find((i) => i.id === 'ha-6');
                      const h7 = items.find((i) => i.id === 'ha-7');
                      const h8 = items.find((i) => i.id === 'ha-8');
                      setFormData({
                        ...formData,
                        historicalAds: {
                          ...formData.historicalAds,
                          bestCampaign: h1?.status || formData.historicalAds?.bestCampaign || '',
                          worstCampaign: h2?.status || formData.historicalAds?.worstCampaign || '',
                          highestRoas: h3?.status || formData.historicalAds?.highestRoas || '',
                          lowestCpa: h4?.status || formData.historicalAds?.lowestCpa || '',
                          bestAudience: h5?.status || formData.historicalAds?.bestAudience || '',
                          bestAd: h6?.status || formData.historicalAds?.bestAd || '',
                          successReasons: h7?.status || formData.historicalAds?.successReasons || '',
                          failureReasons: h8?.status || formData.historicalAds?.failureReasons || '',
                          checklist: items
                        }
                      });
                    }}
                  />
                </div>
              )}

              {/* STEP 10: COMPETITORS */}
              {modalActiveTab === 10 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
                    <h4 className="font-extrabold text-sm text-[#5A5A40]">{getBuiltInSectionTitle('competitors', '10. Competitor Analysis (تحليل المنافسين الشامل)')}</h4>
                    <button
                      type="button"
                      onClick={handleOpenAddCompetitor}
                      className="px-3 py-1 bg-[#5A5A40] text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة منافس</span>
                    </button>
                  </div>
                  <p className="text-[#8E8E85]">المنافسون المضافون حالياً ({currentAudit.competitors?.length || 0}):</p>
                  <div className="space-y-2">
                    {(currentAudit.competitors || []).map((c) => (
                      <div key={c.id} className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] flex justify-between items-center">
                        <span className="font-bold">{c.name} ({c.products})</span>
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => handleOpenEditCompetitor(c)} title="تعديل" className="p-1.5 text-[#5A5A40] hover:bg-[#E5E5E0] rounded-lg transition cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'competitor',
                                idOrIndex: c.id,
                                title: `منافس: ${c.name}`
                              })
                            }
                            title="حذف"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 11: SWOT */}
              {modalActiveTab === 11 && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-[#5A5A40] border-b border-[#E5E5E0] pb-2">
                    {getBuiltInSectionTitle('swot', '11. SWOT Analysis (تحليل SWOT)')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-3.5 bg-[#F9F8F6] rounded-2xl border border-[#E5E5E0] space-y-3">
                      <div>
                        <span className="font-black text-[#2D2D2A] text-sm block">Strengths</span>
                        <span className="text-xs font-bold text-[#8E8E85]">نقاط القوة.</span>
                      </div>
                      <div className="space-y-1.5">
                        {(currentAudit.swot.strengths || []).map((st, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-2 rounded-xl border border-[#E5E5E0]">
                            <span className="font-bold text-xs text-[#2D2D2A]">• {st}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const newText = prompt('تعديل نقطة القوة:', st);
                                  if (newText && newText.trim()) {
                                    handleUpdateSwot('strengths', i, newText.trim());
                                  }
                                }}
                                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A]"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'swot',
                                    swotCategory: 'strengths',
                                    idOrIndex: i,
                                    title: `نقطة قوة: ${st}`
                                  })
                                }
                                className="p-1 text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          id="swot-str-input-modal"
                          placeholder="أضف نقطة قوة..."
                          className="w-full p-2 text-xs rounded-xl border border-[#E5E5E0] bg-white text-[#2D2D2A]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('swot-str-input-modal') as HTMLInputElement;
                            if (el && el.value.trim()) {
                              handleAddSwot('strengths', el.value.trim());
                              el.value = '';
                            }
                          }}
                          className="px-3 bg-[#5A5A40] text-white rounded-xl font-bold text-xs shrink-0"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>

                    {/* Weaknesses */}
                    <div className="p-3.5 bg-[#F9F8F6] rounded-2xl border border-[#E5E5E0] space-y-3">
                      <div>
                        <span className="font-black text-[#2D2D2A] text-sm block">Weaknesses</span>
                        <span className="text-xs font-bold text-[#8E8E85]">نقاط الضعف.</span>
                      </div>
                      <div className="space-y-1.5">
                        {(currentAudit.swot.weaknesses || []).map((wk, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-2 rounded-xl border border-[#E5E5E0]">
                            <span className="font-bold text-xs text-[#2D2D2A]">• {wk}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const newText = prompt('تعديل نقطة الضعف:', wk);
                                  if (newText && newText.trim()) {
                                    handleUpdateSwot('weaknesses', i, newText.trim());
                                  }
                                }}
                                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A]"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'swot',
                                    swotCategory: 'weaknesses',
                                    idOrIndex: i,
                                    title: `نقطة ضعف: ${wk}`
                                  })
                                }
                                className="p-1 text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          id="swot-wk-input-modal"
                          placeholder="أضف نقطة ضعف..."
                          className="w-full p-2 text-xs rounded-xl border border-[#E5E5E0] bg-white text-[#2D2D2A]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('swot-wk-input-modal') as HTMLInputElement;
                            if (el && el.value.trim()) {
                              handleAddSwot('weaknesses', el.value.trim());
                              el.value = '';
                            }
                          }}
                          className="px-3 bg-[#5A5A40] text-white rounded-xl font-bold text-xs shrink-0"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>

                    {/* Opportunities */}
                    <div className="p-3.5 bg-[#F9F8F6] rounded-2xl border border-[#E5E5E0] space-y-3">
                      <div>
                        <span className="font-black text-[#2D2D2A] text-sm block">Opportunities</span>
                        <span className="text-xs font-bold text-[#8E8E85]">الفرص.</span>
                      </div>
                      <div className="space-y-1.5">
                        {(currentAudit.swot.opportunities || []).map((op, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-2 rounded-xl border border-[#E5E5E0]">
                            <span className="font-bold text-xs text-[#2D2D2A]">• {op}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const newText = prompt('تعديل الفرصة:', op);
                                  if (newText && newText.trim()) {
                                    handleUpdateSwot('opportunities', i, newText.trim());
                                  }
                                }}
                                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A]"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'swot',
                                    swotCategory: 'opportunities',
                                    idOrIndex: i,
                                    title: `فرصة: ${op}`
                                  })
                                }
                                className="p-1 text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          id="swot-op-input-modal"
                          placeholder="أضف فرصة..."
                          className="w-full p-2 text-xs rounded-xl border border-[#E5E5E0] bg-white text-[#2D2D2A]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('swot-op-input-modal') as HTMLInputElement;
                            if (el && el.value.trim()) {
                              handleAddSwot('opportunities', el.value.trim());
                              el.value = '';
                            }
                          }}
                          className="px-3 bg-[#5A5A40] text-white rounded-xl font-bold text-xs shrink-0"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>

                    {/* Threats */}
                    <div className="p-3.5 bg-[#F9F8F6] rounded-2xl border border-[#E5E5E0] space-y-3">
                      <div>
                        <span className="font-black text-[#2D2D2A] text-sm block">Threats</span>
                        <span className="text-xs font-bold text-[#8E8E85]">التهديدات.</span>
                      </div>
                      <div className="space-y-1.5">
                        {(currentAudit.swot.threats || []).map((th, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-2 rounded-xl border border-[#E5E5E0]">
                            <span className="font-bold text-xs text-[#2D2D2A]">• {th}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const newText = prompt('تعديل التهديد:', th);
                                  if (newText && newText.trim()) {
                                    handleUpdateSwot('threats', i, newText.trim());
                                  }
                                }}
                                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A]"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'swot',
                                    swotCategory: 'threats',
                                    idOrIndex: i,
                                    title: `تهديد: ${th}`
                                  })
                                }
                                className="p-1 text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          id="swot-th-input-modal"
                          placeholder="أضف تهديد..."
                          className="w-full p-2 text-xs rounded-xl border border-[#E5E5E0] bg-white text-[#2D2D2A]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('swot-th-input-modal') as HTMLInputElement;
                            if (el && el.value.trim()) {
                              handleAddSwot('threats', el.value.trim());
                              el.value = '';
                            }
                          }}
                          className="px-3 bg-[#5A5A40] text-white rounded-xl font-bold text-xs shrink-0"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 12: PERSONA */}
              {modalActiveTab === 12 && (
                <div className="space-y-6 text-xs text-[#2D2D2A]">
                  <h4 className="font-extrabold text-sm text-[#5A5A40] border-b border-[#E5E5E0] pb-2">
                    Customer Persona (العميل المستهدف)
                  </h4>

                  {/* 1. Target Audience */}
                  <div className="p-4 bg-[#F9F8F6] rounded-2xl border border-[#E5E5E0] space-y-4">
                    <div>
                      <h5 className="font-black text-sm text-[#2D2D2A]">1. Target Audience</h5>
                      <p className="text-xs font-bold text-[#8E8E85] mt-0.5">من هو العميل المثالي للبراند؟</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">الفئة العمرية</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.targetAudienceDetails?.ageRange || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              targetAudienceDetails: { ...formData.customerPersona?.targetAudienceDetails, ageRange: e.target.value }
                            }
                          })}
                          placeholder="مثال: 18 - 35 سنة"
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">الجنس</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.targetAudienceDetails?.gender || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              targetAudienceDetails: { ...formData.customerPersona?.targetAudienceDetails, gender: e.target.value }
                            }
                          })}
                          placeholder="مثال: ذكور وإناث"
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">المستوى المادي</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.targetAudienceDetails?.incomeLevel || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              targetAudienceDetails: { ...formData.customerPersona?.targetAudienceDetails, incomeLevel: e.target.value }
                            }
                          })}
                          placeholder="مثال: متوسط إلى فوق المتوسط"
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">الاهتمامات</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.targetAudienceDetails?.interests || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              targetAudienceDetails: { ...formData.customerPersona?.targetAudienceDetails, interests: e.target.value }
                            }
                          })}
                          placeholder="مثال: التقنية والألعاب والإكسسوارات"
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">أسلوب الحياة</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.targetAudienceDetails?.lifestyle || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              targetAudienceDetails: { ...formData.customerPersona?.targetAudienceDetails, lifestyle: e.target.value }
                            }
                          })}
                          placeholder="مثال: شباب عملي يبحث عن الجودة والتسوق السريع"
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">مكان الإقامة</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.targetAudienceDetails?.location || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              targetAudienceDetails: { ...formData.customerPersona?.targetAudienceDetails, location: e.target.value }
                            }
                          })}
                          placeholder="مثال: القاهرة الكبرى والمحافظات الرئيسية"
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>
                    </div>

                    <ChecklistEditorSection
                      title="📋 بنود تقييم الجمهور المستهدف"
                      items={formData.customerPersona?.targetAudienceChecklist || []}
                      defaultItems={[
                        { id: 'ta-1', label: 'وضوح الشريحة المستهدفة وسهولة استهدافها', status: 'واضحة ومحددة بدقة' },
                        { id: 'ta-2', label: 'توافق الرسالة الإعلانية مع الفئة', status: 'متوافقة جداً مع تطلعاتهم' }
                      ]}
                      onUpdate={(items) =>
                        setFormData({
                          ...formData,
                          customerPersona: {
                            ...formData.customerPersona,
                            targetAudienceChecklist: items
                          }
                        })
                      }
                    />
                  </div>

                  {/* 2. Customer Insights */}
                  <div className="p-4 bg-[#F9F8F6] rounded-2xl border border-[#E5E5E0] space-y-4">
                    <div>
                      <h5 className="font-black text-sm text-[#2D2D2A]">2. Customer Insights</h5>
                      <p className="text-xs font-bold text-[#8E8E85] mt-0.5">فهم سلوك العميل ودوافعه.</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="font-bold block mb-0.5 text-[#2D2D2A]">Pain Points</label>
                        <span className="text-[11px] text-[#8E8E85] block mb-1">المشاكل التي يعاني منها العميل ويحلها المنتج.</span>
                        <textarea
                          rows={2}
                          value={formData.customerPersona?.insights?.painPoints || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              insights: { ...formData.customerPersona?.insights, painPoints: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-0.5 text-[#2D2D2A]">Buying Motivation</label>
                        <span className="text-[11px] text-[#8E8E85] block mb-1">لماذا قد يشتري هذا المنتج؟</span>
                        <textarea
                          rows={2}
                          value={formData.customerPersona?.insights?.buyingMotivation || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              insights: { ...formData.customerPersona?.insights, buyingMotivation: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-0.5 text-[#2D2D2A]">Buying Triggers</label>
                        <span className="text-[11px] text-[#8E8E85] block mb-1">ما الذي يدفعه لاتخاذ قرار الشراء بسرعة؟</span>
                        <textarea
                          rows={2}
                          value={formData.customerPersona?.insights?.buyingTriggers || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              insights: { ...formData.customerPersona?.insights, buyingTriggers: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-0.5 text-[#2D2D2A]">Objections</label>
                        <span className="text-[11px] text-[#8E8E85] block mb-1">ما الاعتراضات أو المخاوف التي تمنعه من الشراء؟</span>
                        <textarea
                          rows={2}
                          value={formData.customerPersona?.insights?.objections || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              insights: { ...formData.customerPersona?.insights, objections: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>
                    </div>

                    <ChecklistEditorSection
                      title="📋 بنود تقييم رؤى وتفضيلات العملاء"
                      items={formData.customerPersona?.insightsChecklist || []}
                      defaultItems={[
                        { id: 'in-1', label: 'معالجة الاعتراضات في صفحات الهبوط والإعلانات', status: 'تتم معالجتها بالضمانات وتقييمات العملاء' },
                        { id: 'in-2', label: 'قوة محفزات الشراء السريع', status: 'عروض محدودة بوقت مع شحن مجاني' }
                      ]}
                      onUpdate={(items) =>
                        setFormData({
                          ...formData,
                          customerPersona: {
                            ...formData.customerPersona,
                            insightsChecklist: items
                          }
                        })
                      }
                    />
                  </div>

                  {/* 3. Brand Positioning */}
                  <div className="p-4 bg-[#F9F8F6] rounded-2xl border border-[#E5E5E0] space-y-4">
                    <div>
                      <h5 className="font-black text-sm text-[#2D2D2A]">3. Brand Positioning</h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">القيمة الأساسية التي يقدمها البراند</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.positioning?.coreValue || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              positioning: { ...formData.customerPersona?.positioning, coreValue: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">الميزة التنافسية (USP)</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.positioning?.usp || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              positioning: { ...formData.customerPersona?.positioning, usp: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">الرسالة الأساسية للبراند</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.positioning?.coreMessage || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              positioning: { ...formData.customerPersona?.positioning, coreMessage: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">الانطباع الأول</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.positioning?.firstImpression || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              positioning: { ...formData.customerPersona?.positioning, firstImpression: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">مكانة البراند في السوق (اقتصادي - متوسط - Premium)</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.positioning?.marketTier || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              positioning: { ...formData.customerPersona?.positioning, marketTier: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#5A5A40]">مدى وضوح الهوية</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.positioning?.identityClarity || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              positioning: { ...formData.customerPersona?.positioning, identityClarity: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold block mb-1 text-[#5A5A40]">تقييم جاهزية البراند للنمو</label>
                        <input
                          type="text"
                          value={formData.customerPersona?.positioning?.growthReadiness || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            customerPersona: {
                              ...formData.customerPersona,
                              positioning: { ...formData.customerPersona?.positioning, growthReadiness: e.target.value }
                            }
                          })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-medium text-[#2D2D2A]"
                        />
                      </div>
                    </div>

                    <ChecklistEditorSection
                      title="📋 بنود تقييم تموضع البراند في السوق"
                      items={formData.customerPersona?.positioningChecklist || []}
                      defaultItems={[
                        { id: 'pos-1', label: 'تميز الهوية البصرية مقارنة بالمنافسين', status: 'هوية مميزة وحديثة' },
                        { id: 'pos-2', label: 'اتساق الرسائل التسويقية عبر كافة القنوات', status: 'رسائل متسقة وثابتة' }
                      ]}
                      onUpdate={(items) =>
                        setFormData({
                          ...formData,
                          customerPersona: {
                            ...formData.customerPersona,
                            positioningChecklist: items
                          }
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* STEP 13: PROBLEMS & SOLUTIONS */}
              {modalActiveTab === 13 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
                    <h4 className="font-extrabold text-sm text-[#5A5A40]">{getBuiltInSectionTitle('problems', '13. Main Problems & Solutions (أهم المشاكل وحلها)')}</h4>
                    <button
                      type="button"
                      onClick={handleOpenAddProblem}
                      className="px-3 py-1 bg-[#5A5A40] text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة مشكلة</span>
                    </button>
                  </div>
                  <p className="text-[#8E8E85]">المشاكل المضافة حالياً ({currentAudit.problemsAndSolutions?.length || 0}):</p>
                  <div className="space-y-2">
                    {(currentAudit.problemsAndSolutions || []).map((p) => (
                      <div key={p.id} className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">{p.problem}</span>
                          <span className="text-[#8E8E85] text-[11px]">({p.priorityLevel})</span>
                          <button
                            type="button"
                            onClick={() => toggleProblemStatus(p.id)}
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 transition cursor-pointer ${
                              p.status === 'تم التنفيذ'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {p.status === 'تم التنفيذ' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>تم التنفيذ</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>قيد التنفيذ</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => handleOpenEditProblem(p)} title="تعديل المشكلة" className="p-1.5 text-[#5A5A40] hover:bg-[#E5E5E0] rounded-lg transition cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'problem',
                                idOrIndex: p.id,
                                title: `مشكلة: ${p.problem}`
                              })
                            }
                            title="حذف المشكلة"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CUSTOM SECTION CREATED FROM SECTION MANAGER */}
              {activeCustomModalSection && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3 border-b border-[#E5E5E0] pb-3">
                    <h4 className="font-extrabold text-sm text-[#2D2D2A]">{activeCustomModalSection.title}</h4>
                    <button
                      type="button"
                      onClick={() => openEditCustomSection(activeCustomModalSection)}
                      className="p-2 rounded-xl border border-[#E5E5E0] text-[#5A5A40] hover:bg-[#F9F8F6]"
                      title="تعديل بيانات السكشن"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0]">
                    <label className="font-extrabold text-[#2D2D2A] block mb-2">تاريخ التقييم (Audit Date)</label>
                    <input
                      type="date"
                      value={activeCustomModalSection.auditDate || formatLocalDate()}
                      onChange={(e) => updateCustomSection(activeCustomModalSection.id, { auditDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-white font-bold text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                    />
                  </div>

                  <ChecklistEditorSection
                    title={activeCustomModalSection.itemsTitle || 'عناصر التقييم'}
                    items={activeCustomModalSection.items || []}
                    onUpdate={(items) => updateCustomSection(activeCustomModalSection.id, { items })}
                    placeholderAnswer="اكتب نتيجة التقييم أو الملاحظة..."
                    columns={2}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-[#E5E5E0] bg-[#F9F8F6] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                {currentModalStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setModalActiveTab(modalSteps[currentModalStepIndex - 1].num)}
                    className="px-4 py-2 bg-white border border-[#E5E5E0] font-bold rounded-xl hover:bg-[#E5E5E0] text-xs transition cursor-pointer"
                  >
                    السابق
                  </button>
                )}
                {currentModalStepIndex >= 0 && currentModalStepIndex < modalSteps.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setModalActiveTab(modalSteps[currentModalStepIndex + 1].num)}
                    className="px-4 py-2 bg-white border border-[#E5E5E0] font-bold rounded-xl hover:bg-[#E5E5E0] text-xs transition cursor-pointer"
                  >
                    التالي
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFullAuditModal(false)}
                  className="px-4 py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-extrabold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveFullAudit}
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التقرير بالكامل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROBLEM & SOLUTION MODAL */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E5E5E0]">
            <div className="flex justify-between items-center border-b border-[#E5E5E0] pb-3">
              <h3 className="font-extrabold text-base text-[#2D2D2A]">
                {editingProblem ? 'تعديل بيانات المشكلة والحل' : 'إضافة مشكلة وحل بالـ 4 محاور'}
              </h3>
              <button onClick={() => setShowProblemModal(false)} className="text-[#8E8E85] hover:text-[#2D2D2A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProblem} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-[#2D2D2A] block mb-1">1. المشكلة</label>
                <input
                  type="text"
                  required
                  value={probTitle}
                  onChange={(e) => setProbTitle(e.target.value)}
                  placeholder="مثلاً: عدم وجود فيديوهات Reels للمنتجات..."
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] font-bold"
                />
              </div>

              <div>
                <label className="font-extrabold text-[#2D2D2A] block mb-1">2. تأثيرها على المبيعات</label>
                <textarea
                  required
                  rows={2}
                  value={probImpact}
                  onChange={(e) => setProbImpact(e.target.value)}
                  placeholder="مثلاً: ضعف ثقة العملاء المترددين وتراجع معدل التحويل..."
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A]"
                />
              </div>

              <div>
                <label className="font-extrabold text-[#2D2D2A] block mb-1">3. درجة الأولوية</label>
                <select
                  value={probPriority}
                  onChange={(e) => setProbPriority(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] font-bold text-[#2D2D2A]"
                >
                  <option value="عالية جداً">عالية جداً</option>
                  <option value="عالية">عالية</option>
                  <option value="متوسطة">متوسطة</option>
                  <option value="منخفضة">منخفضة</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-[#2D2D2A] block mb-1">4. طريقة حلها (الاستراتيجية والخدمة)</label>
                <textarea
                  required
                  rows={3}
                  value={probSolution}
                  onChange={(e) => setProbSolution(e.target.value)}
                  placeholder="مثلاً: تصوير 6 فيديوهات Reels واقعية وتجهيز حملة Reels جديدة..."
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A]"
                />
              </div>

              <div>
                <label className="font-extrabold text-[#2D2D2A] block mb-1">5. حالة معالجة المشكلة</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProbStatus('قيد التنفيذ')}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      probStatus === 'قيد التنفيذ'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                        : 'bg-[#F9F8F6] border-[#E5E5E0] text-[#78786E] hover:bg-[#E5E5E0]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>قيد التنفيذ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProbStatus('تم التنفيذ')}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      probStatus === 'تم التنفيذ'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs'
                        : 'bg-[#F9F8F6] border-[#E5E5E0] text-[#78786E] hover:bg-[#E5E5E0]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم التنفيذ</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProblemModal(false)}
                  className="px-4 py-2 bg-[#F9F8F6] border border-[#E5E5E0] font-extrabold rounded-xl text-xs hover:bg-[#E5E5E0]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs shadow-xs"
                >
                  حفظ المشكلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPETITOR MODAL (9 COMPREHENSIVE SECTIONS) */}
      {showCompetitorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E5E5E0] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#E5E5E0] px-5 py-4 shrink-0 bg-[#F9F8F6]">
              <div>
                <h3 className="font-black text-base text-[#2D2D2A] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#5A5A40]" />
                  <span>{editingCompetitor ? `تعديل بيانات المنافس: ${compFormData.name || ''}` : 'إضافة وتحليل منافس جديد'}</span>
                </h3>
                <p className="text-[11px] text-[#78786E] font-medium mt-0.5">
                  نموذج التحليل الاستراتيجي الشامل للمنافس (9 محاور رئيسية)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompetitorModal(false)}
                className="text-[#8E8E85] hover:text-[#2D2D2A] p-1.5 rounded-xl hover:bg-[#E5E5E0]/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 9-Section Category Nav */}
            <div className="px-5 py-2.5 bg-white border-b border-[#E5E5E0] shrink-0 overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                {[
                  { id: 1, label: '1. بيانات المنافس', icon: Building },
                  { id: 2, label: '2. التسعير والعروض', icon: Tag },
                  { id: 3, label: '3. التسويق والمحتوى', icon: Sparkles },
                  { id: 4, label: '4. الإعلانات', icon: Megaphone },
                  { id: 5, label: '5. تجربة العميل', icon: MessageSquare },
                  { id: 6, label: '6. أداء المنافس', icon: Award },
                  { id: 7, label: '7. فرص السوق', icon: Lightbulb },
                  { id: 8, label: '8. التهديدات', icon: AlertTriangle },
                  { id: 9, label: '9. التوصيات الاستراتيجية ⭐', icon: Flame }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = compActiveModalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCompActiveModalTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                        isActive
                          ? tab.id === 9
                            ? 'bg-amber-100 border border-amber-300 text-amber-900 shadow-2xs'
                            : 'bg-[#5A5A40] text-white shadow-2xs'
                          : 'bg-[#F9F8F6] text-[#78786E] border border-[#E5E5E0] hover:bg-[#E5E5E0]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Form Content - Scrollable */}
            <form
              id="competitor-modal-form"
              onSubmit={handleSaveCompetitor}
              className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs"
            >
              {/* TAB 1: COMPETITOR PROFILE */}
              {compActiveModalTab === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5E5E0] pb-2 flex items-center justify-between">
                    <h4 className="font-black text-sm text-[#5A5A40] flex items-center gap-1.5">
                      <Building className="w-4 h-4" />
                      <span>1. بيانات المنافس | Competitor Profile</span>
                    </h4>
                    <span className="text-[11px] text-[#78786E] font-bold">البيانات التعريفية والأساسية</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        اسم المنافس <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={compFormData.name}
                        onChange={(e) => setCompFormData({ ...compFormData, name: e.target.value })}
                        placeholder="اسم البراند أو الشركة المنافسة..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] font-bold focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        نوع المنافس
                      </label>
                      <select
                        value={compFormData.competitorType || 'مباشر'}
                        onChange={(e) => setCompFormData({ ...compFormData, competitorType: e.target.value as 'مباشر' | 'غير مباشر' | 'كبير' })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] font-bold focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      >
                        <option value="مباشر">منافس مباشر (Direct Competitor)</option>
                        <option value="غير مباشر">منافس غير مباشر (Indirect Competitor)</option>
                        <option value="كبير">منافس كبير / رائد سوق (Market Leader)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        رابط الحساب / الموقع
                      </label>
                      <input
                        type="text"
                        value={compFormData.pageLink || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, pageLink: e.target.value })}
                        placeholder="رابط الموقع، فيسبوك، إنستجرام، تيك توك..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        المنتجات والخدمات
                      </label>
                      <input
                        type="text"
                        value={compFormData.products || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, products: e.target.value })}
                        placeholder="أهم تصنيفات المنتجات والخدمات التي يقدمها المنافس..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الجمهور المستهدف
                      </label>
                      <input
                        type="text"
                        value={compFormData.targetAudience || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, targetAudience: e.target.value })}
                        placeholder="الفئة العمرية، الاهتمامات، الطبقة المستهدفة..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        قنوات البيع
                      </label>
                      <input
                        type="text"
                        value={compFormData.salesChannels || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, salesChannels: e.target.value })}
                        placeholder="الموقع الإلكتروني، وتساب، رسائل السوشيال، فروع..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & OFFERS */}
              {compActiveModalTab === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5E5E0] pb-2 flex items-center justify-between">
                    <h4 className="font-black text-sm text-emerald-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      <span>2. التسعير والعروض | Pricing & Offers</span>
                    </h4>
                    <span className="text-[11px] text-[#78786E] font-bold">هيكل الأسعار والعروض التنافسية</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        متوسط الأسعار
                      </label>
                      <input
                        type="text"
                        value={compFormData.price || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, price: e.target.value })}
                        placeholder="مثلاً: 350 - 750 جنيه (أو رخيص / متوسط / مرتفع)..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        العروض الحالية
                      </label>
                      <input
                        type="text"
                        value={compFormData.offers || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, offers: e.target.value })}
                        placeholder="مثلاً: اشتري 2 واحصل على 1 مجاناً، شحن مجاني..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الخصومات
                      </label>
                      <input
                        type="text"
                        value={compFormData.discounts || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, discounts: e.target.value })}
                        placeholder="نسب أو قيم الخصومات المباشرة..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الـ Bundles (الباقات والحزم)
                      </label>
                      <input
                        type="text"
                        value={compFormData.bundles || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, bundles: e.target.value })}
                        placeholder="باقات المنتجات المجمعة وأسعارها..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الهدايا والمزايا الإضافية
                      </label>
                      <input
                        type="text"
                        value={compFormData.giftsAndExtras || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, giftsAndExtras: e.target.value })}
                        placeholder="هدايا مع كل طلب، عينات تجربة، نقاط ولاء..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        شروط الضمان والاسترجاع
                      </label>
                      <input
                        type="text"
                        value={compFormData.warrantyAndReturns || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, warrantyAndReturns: e.target.value })}
                        placeholder="ضمان 14 يوم، معاينة قبل الاستلام، استرجاع مجاني..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MARKETING & CONTENT */}
              {compActiveModalTab === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5E5E0] pb-2 flex items-center justify-between">
                    <h4 className="font-black text-sm text-blue-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>3. التسويق والمحتوى | Marketing & Content</span>
                    </h4>
                    <span className="text-[11px] text-[#78786E] font-bold">استراتيجية المحتوى والتفاعل</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        قنوات التسويق
                      </label>
                      <input
                        type="text"
                        value={compFormData.marketingChannels || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, marketingChannels: e.target.value })}
                        placeholder="إنستجرام، فيسبوك، تيك توك، سناب شات، جوجل..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        تكرار النشر
                      </label>
                      <input
                        type="text"
                        value={compFormData.postingFrequency || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, postingFrequency: e.target.value })}
                        placeholder="مثلاً: يومياً، 3 بوستات أسبوعياً، ستوريز مستمرة..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        أنواع المحتوى
                      </label>
                      <input
                        type="text"
                        value={compFormData.contentType || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, contentType: e.target.value })}
                        placeholder="Reels قصيرة، UGC، صور منتجات، كاورسل، لايف..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الـ CTA الأساسي
                      </label>
                      <input
                        type="text"
                        value={compFormData.primaryCta || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, primaryCta: e.target.value })}
                        placeholder="مثلاً: اطلب الآن، تواصل عبر الواتساب، احصل على الخصم..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        أفضل المحتوى + سبب نجاحه
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.bestPerformingContent || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, bestPerformingContent: e.target.value })}
                        placeholder="أعلى ريلز أو بوست حقق تفاعل وسبب وصوله للجمهور..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الرسائل التسويقية الأساسية
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.marketingMessage || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, marketingMessage: e.target.value })}
                        placeholder="الوعود والرسائل والشعارات الرئيسية..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        أسلوب التصوير والـ Creative Style
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.photographyStyle || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, photographyStyle: e.target.value })}
                        placeholder="تصوير ستوديو نظيف، تصوير هاتف طبيعي UGC، إضاءة سينمائية..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ADVERTISING */}
              {compActiveModalTab === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5E5E0] pb-2 flex items-center justify-between">
                    <h4 className="font-black text-sm text-indigo-800 flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4" />
                      <span>4. الإعلانات | Advertising</span>
                    </h4>
                    <span className="text-[11px] text-[#78786E] font-bold">تحليل الحملات الممولة ونصوص الإعلانات</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الإعلانات الحالية النشطة
                      </label>
                      <input
                        type="text"
                        value={compFormData.currentAds || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, currentAds: e.target.value })}
                        placeholder="عدد الإعلانات الشغالة في الـ Ad Library، التركيز على أي منتجات..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الـ Hook الإعلاني
                      </label>
                      <input
                        type="text"
                        value={compFormData.adHook || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, adHook: e.target.value })}
                        placeholder="الجملة الافتتاحية / أول 3 ثوانٍ في الفيديو..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الـ CTA في الإعلان
                      </label>
                      <input
                        type="text"
                        value={compFormData.adCta || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, adCta: e.target.value })}
                        placeholder="Shop Now, Send Message, Order WhatsApp..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الـ Ad Copy (نص الإعلان)
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.adCopy || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, adCopy: e.target.value })}
                        placeholder="هيكل الكوبي الإعلاني (قصة، نقاط بيع، عاطفة، خوف من التفويت)..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        Landing Page / رابط الشراء
                      </label>
                      <input
                        type="text"
                        value={compFormData.landingPageOrPurchaseLink || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, landingPageOrPurchaseLink: e.target.value })}
                        placeholder="رابط صفحة الهبوط أو صفحة المنتج الموجه إليها الإعلان..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        نوع الـ Offer المستخدم
                      </label>
                      <input
                        type="text"
                        value={compFormData.offerTypeUsed || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, offerTypeUsed: e.target.value })}
                        placeholder="عرض السعر، باقة مجانية، خصم لفترة محدودة، تجربة أولى..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        ملاحظات على استراتيجية الإعلان
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.adStrategyNotes || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, adStrategyNotes: e.target.value })}
                        placeholder="تحليل التكتيكات الإعلانية ومواضع التميز أو الضعف في إعلاناتهم..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CUSTOMER EXPERIENCE */}
              {compActiveModalTab === 5 && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5E5E0] pb-2 flex items-center justify-between">
                    <h4 className="font-black text-sm text-amber-900 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>5. تجربة العميل | Customer Experience</span>
                    </h4>
                    <span className="text-[11px] text-[#78786E] font-bold">رحلة الشراء ورأي العملاء</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        جودة صفحة الهبوط
                      </label>
                      <input
                        type="text"
                        value={compFormData.landingPageQuality || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, landingPageQuality: e.target.value })}
                        placeholder="سرعة التحميل، تصميم احترافي، وضوح الصور، متجاوب..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        سهولة الشراء
                      </label>
                      <input
                        type="text"
                        value={compFormData.easeOfPurchase || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, easeOfPurchase: e.target.value })}
                        placeholder="خطوات شراء سريعة بضغطة واحدة، فورم سلس، طرق دفع متعددة..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        خدمة ما بعد البيع
                      </label>
                      <input
                        type="text"
                        value={compFormData.afterSalesService || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, afterSalesService: e.target.value })}
                        placeholder="متابعة الشحن، سرعة الرد على الشكاوى، استبدال سريع..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        أكثر الاعتراضات أو المشاكل المتكررة
                      </label>
                      <input
                        type="text"
                        value={compFormData.recurringComplaintsOrObjections || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, recurringComplaintsOrObjections: e.target.value })}
                        placeholder="تأخر الشحن، جودة التغليف، صعوبة التواصل مع السيلز..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-rose-700 font-bold focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الريفيوز وملاحظات العملاء
                      </label>
                      <textarea
                        rows={3}
                        value={compFormData.reviewsAndFeedback || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, reviewsAndFeedback: e.target.value })}
                        placeholder="أبرز ما يشيد به العملاء في التعليقات وما يشتكون منه..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: COMPETITIVE ASSESSMENT */}
              {compActiveModalTab === 6 && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5E5E0] pb-2 flex items-center justify-between">
                    <h4 className="font-black text-sm text-purple-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>6. أداء المنافس | Competitive Assessment</span>
                    </h4>
                    <span className="text-[11px] text-[#78786E] font-bold">تقييم القوة والضعف والأنماط الرابحة</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-extrabold text-emerald-800 block mb-1">
                        نقاط القوة
                      </label>
                      <textarea
                        rows={3}
                        value={compFormData.strengths || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, strengths: e.target.value })}
                        placeholder="المزايا التنافسية، جودة المحتوى، قوة البراندينج، خدمة العملاء..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-rose-800 block mb-1">
                        نقاط الضعف
                      </label>
                      <textarea
                        rows={3}
                        value={compFormData.weaknesses || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, weaknesses: e.target.value })}
                        placeholder="الثغرات، ضعف التفاعل، بطء الموقع، أسعار مرتفعة غير مبررة..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        مستوى التفاعل
                      </label>
                      <input
                        type="text"
                        value={compFormData.engagementLevel || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, engagementLevel: e.target.value })}
                        placeholder="تفاعل عالي، تعليقات إيجابية، شيرات كثيرة، تفاعل منخفض..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        أهم الـ Winning Patterns
                      </label>
                      <input
                        type="text"
                        value={compFormData.winningPatterns || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, winningPatterns: e.target.value })}
                        placeholder="أنماط المحتوى والإعلانات والعروض الأكثر نجاحاً وتكراراً لديه..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        ما الذي يميزه عن باقي المنافسين؟ (Key Differentiator)
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.keyDifferentiator || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, keyDifferentiator: e.target.value })}
                        placeholder="العنصر الفريد الذي يجعل المنافس متصدراً أو متميزاً في السوق..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: MARKET OPPORTUNITIES */}
              {compActiveModalTab === 7 && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5E5E0] pb-2 flex items-center justify-between">
                    <h4 className="font-black text-sm text-cyan-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      <span>7. فرص السوق | Market Opportunities</span>
                    </h4>
                    <span className="text-[11px] text-[#78786E] font-bold">الثغرات والفرص غير المستغلة</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        الـ Gaps الموجودة في السوق
                      </label>
                      <textarea
                        rows={3}
                        value={compFormData.marketGaps || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, marketGaps: e.target.value })}
                        placeholder="الفجوات التي يتركها المنافس في التغطية أو الخدمة أو الأسعار..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        احتياجات غير مستغلة للعملاء
                      </label>
                      <textarea
                        rows={3}
                        value={compFormData.unexploitedNeeds || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, unexploitedNeeds: e.target.value })}
                        placeholder="مطالب يبحث عنها العملاء ولم يجدوها عند المنافسين..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#5A5A40] block mb-1">
                        فرص يمكن للبراند استغلالها
                      </label>
                      <textarea
                        rows={3}
                        value={compFormData.opportunitiesToExploit || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, opportunitiesToExploit: e.target.value })}
                        placeholder="كيف يمكن لبراندنا اقتناص حصة سوقية من هذا المنافس..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] font-bold focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        أفكار يمكن اختبارها
                      </label>
                      <textarea
                        rows={3}
                        value={compFormData.ideasToTest || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, ideasToTest: e.target.value })}
                        placeholder="تجارب، عروض، أو زوايا محتوى جديدة مستوحاة من التحليل..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: COMPETITIVE THREATS */}
              {compActiveModalTab === 8 && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5E5E0] pb-2 flex items-center justify-between">
                    <h4 className="font-black text-sm text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>8. التهديدات | Competitive Threats</span>
                    </h4>
                    <span className="text-[11px] text-[#78786E] font-bold">المخاطر التنافسية وعوامل الحذر</span>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="font-extrabold text-rose-800 block mb-1">
                        أكبر تهديد من هذا المنافس
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.biggestThreat || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, biggestThreat: e.target.value })}
                        placeholder="ما هو أخطر عامل يهدد مبيعات أو حصة براندنا من هذا المنافس..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] font-bold focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        ما الذي يجعل العميل يختاره بدلًا من البراند؟
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.whyCustomerChoosesThem || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, whyCustomerChoosesThem: e.target.value })}
                        placeholder="أسباب تفضيل الجمهور لهذا المنافس (سعر، ثقة، سرعة، شهرة)..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-[#2D2D2A] block mb-1">
                        أي تحركات تستحق المتابعة
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.movementsToWatch || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, movementsToWatch: e.target.value })}
                        placeholder="إطلاق منتجات جديدة، توسع جغرافي، شراكات مؤثرين، حملات موسمية..."
                        className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: STRATEGIC TAKEAWAYS & RECOMMENDED ACTION */}
              {compActiveModalTab === 9 && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5E5E0] pb-2 flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-[#5A5A40] flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-600" />
                        <span>9. التوصيات الاستراتيجية والإجراء المقترح | Strategic Takeaways</span>
                      </h4>
                      <p className="text-[11px] text-amber-900 font-extrabold mt-0.5">
                        ⭐ أهم قسم استراتيجي في التحليل — يحدد خطة العمل للبراند
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200/60">
                      <label className="font-extrabold text-blue-900 block mb-1">
                        1. ماذا نتعلم من المنافس؟
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.whatToLearn || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, whatToLearn: e.target.value })}
                        placeholder="الدروس والتكتيكات الناجحة التي يمكن الاستفادة منها..."
                        className="w-full p-2 rounded-lg border border-blue-200 bg-white text-[#2D2D2A] text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/60">
                      <label className="font-extrabold text-rose-900 block mb-1">
                        2. ماذا لا يجب أن ننسخه؟
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.whatNotToCopy || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, whatNotToCopy: e.target.value })}
                        placeholder="الأخطاء والأنماط السلبية أو التي لا تناسب هوية براندنا..."
                        className="w-full p-2 rounded-lg border border-rose-200 bg-white text-[#2D2D2A] text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200/60">
                      <label className="font-extrabold text-purple-900 block mb-1">
                        3. ما الذي يمكن اختباره؟
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.whatToTest || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, whatToTest: e.target.value })}
                        placeholder="تجارب محتوى، هوك إعلاني، أو أوفر لاختباره فوراً..."
                        className="w-full p-2 rounded-lg border border-purple-200 bg-white text-[#2D2D2A] text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/60">
                      <label className="font-extrabold text-emerald-900 block mb-1">
                        4. ما الفرصة التي يجب استغلالها؟
                      </label>
                      <textarea
                        rows={2}
                        value={compFormData.opportunityToExploit || ''}
                        onChange={(e) => setCompFormData({ ...compFormData, opportunityToExploit: e.target.value })}
                        placeholder="الفرصة الأكبر للتفوق السريع على هذا المنافس..."
                        className="w-full p-2 rounded-lg border border-emerald-200 bg-white text-[#2D2D2A] text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Highlighted Recommended Action Field */}
                  <div className="bg-[#5A5A40] text-white p-4 rounded-2xl border border-[#4a4a34] shadow-md space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      <label className="font-black text-xs text-amber-200">
                        5. الإجراء المقترح للبراند | Recommended Action <span className="text-white">*</span>
                      </label>
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={compFormData.recommendedAction || ''}
                      onChange={(e) => setCompFormData({ ...compFormData, recommendedAction: e.target.value })}
                      placeholder="القرار العملي الموصى به لفريق العمل والتسويق بخصوص هذا المنافس..."
                      className="w-full p-3 rounded-xl border border-white/20 bg-white text-[#2D2D2A] font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer with Step Navigation */}
            <div className="border-t border-[#E5E5E0] p-4 bg-[#F9F8F6] flex items-center justify-between gap-2 shrink-0 rounded-b-3xl">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={compActiveModalTab === 1}
                  onClick={() => setCompActiveModalTab((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-extrabold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <button
                  type="button"
                  disabled={compActiveModalTab === 9}
                  onClick={() => setCompActiveModalTab((prev) => Math.min(9, prev + 1))}
                  className="px-3 py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-extrabold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
                <span className="text-[11px] text-[#78786E] font-bold mr-2 hidden sm:inline">
                  (القسم {compActiveModalTab} من 9)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompetitorModal(false)}
                  className="px-4 py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-extrabold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  form="competitor-modal-form"
                  className="px-5 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ بيانات المنافس</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-[#E5E5E0] text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D2D2A]">تأكيد عملية الحذف</h3>
              <p className="text-xs text-[#8E8E85] mt-1">هل أنت متأكد من رغبتك في حذف <span className="font-bold text-rose-600">({deleteConfirmation.title})</span>؟ لا يمكن التراجع عن هذا الإجراء.</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-[#F9F8F6] hover:bg-[#E5E5E0] border border-[#E5E5E0] font-extrabold rounded-xl text-xs text-[#2D2D2A] transition cursor-pointer"
              >
                إلغاء وتراجع
              </button>
              <button
                type="button"
                onClick={executeConfirmedDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                نعم، تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CONFIRM RESET ENTIRE AUDIT MODAL */}
      {showConfirmResetAuditModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-[#E5E5E0] text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D2D2A]">استعادة الافتراضي للتقييم</h3>
              <p className="text-xs text-[#8E8E85] mt-1">هل أنت متأكد من استعادة كافة بيانات تقييم البراند (13 قسماً) إلى النموذج الافتراضي؟ سيتم استبدال البيانات الحالية بالقيم النموذجية الافتراضية.</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmResetAuditModal(false)}
                className="px-4 py-2 bg-[#F9F8F6] hover:bg-[#E5E5E0] border border-[#E5E5E0] font-extrabold rounded-xl text-xs text-[#2D2D2A] transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleResetFullAudit}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>نعم، استعادة الافتراضي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION FOR RESET */}
      {resetToast && (
        <div className="fixed bottom-6 left-6 z-[80] bg-[#2D2D2A] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#E5E5E0]/20 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <RotateCcw className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-extrabold">{resetToast}</p>
        </div>
      )}
    </div>
  );
};

