import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Megaphone,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Globe,
  Share2,
  Lightbulb,
  Check
} from 'lucide-react';
import {
  AdsPlanItem,
  CampaignPlanEntry,
  AdSetItem,
  AdItem,
  StrategyDetails,
  CampaignActualResults,
  CampaignLearningsAndDecision,
  AdStageType,
  AdPhaseStatus,
  AdCreativeType,
  AdItemStatus
} from '../../../types';

interface StrategyAndAdsPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  brandName?: string;
  initialData?: AdsPlanItem | null;
  onSave: (itemData: Partial<AdsPlanItem>) => void;
}

export const StrategyAndAdsPlanModal: React.FC<StrategyAndAdsPlanModalProps> = ({
  isOpen,
  onClose,
  clientId,
  brandName,
  initialData,
  onSave
}) => {
  // Navigation Tabs: 'strategy' | 'campaigns_and_ads' | 'results_learnings'
  const [activeTab, setActiveTab] = useState<'strategy' | 'campaigns_and_ads' | 'results_learnings'>('strategy');

  // Strategy State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stage, setStage] = useState<AdStageType>('Testing');
  const [phaseStatus, setPhaseStatus] = useState<AdPhaseStatus>('In Progress');
  const [overallStrategy, setOverallStrategy] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [totalBudget, setTotalBudget] = useState<string | number>('');
  const [strategyNotes, setStrategyNotes] = useState('');
  const [strategicGoals, setStrategicGoals] = useState<string[]>([]);
  const [newGoalInput, setNewGoalInput] = useState('');

  // Campaigns & AdSets & Ads State
  const [campaigns, setCampaigns] = useState<CampaignPlanEntry[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string>('');

  // Re-sync all states whenever modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    setActiveTab('strategy');
    const defaultStart =
      initialData?.strategy?.startDate ||
      initialData?.startDate ||
      new Date().toISOString().split('T')[0];
    const defaultEnd =
      initialData?.strategy?.endDate ||
      initialData?.endDate ||
      (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
      })();

    setTitle(
      initialData?.title ||
        initialData?.campaignName ||
        `استراتيجية وخطة إعلانات - ${new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}`
    );
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setStage(initialData?.strategy?.stage || initialData?.campaignStage || 'Testing');
    setPhaseStatus(initialData?.strategy?.phaseStatus || 'In Progress');
    setOverallStrategy(initialData?.strategy?.overallStrategy || initialData?.campaignStrategyNotes || '');
    setTargetAudience(initialData?.strategy?.targetAudience || initialData?.targetAudience || '');
    setTotalBudget(initialData?.strategy?.totalBudget || initialData?.campaignBudget || '');
    setStrategyNotes(initialData?.strategy?.notes || '');
    setStrategicGoals(
      initialData?.strategy?.strategicGoals && initialData.strategy.strategicGoals.length > 0
        ? initialData.strategy.strategicGoals
        : ['زيادة المبيعات المباشرة وتحقيق ROAS لا يقل عن 3.5X', 'اختبار 4 زوايا إعلانية مختلفة وتحديد أفضل زاوية فائزة']
    );
    setNewGoalInput('');

    let initialCampaigns: CampaignPlanEntry[] = [];
    if (initialData?.campaigns && initialData.campaigns.length > 0) {
      initialCampaigns = initialData.campaigns;
    } else if (initialData?.campaignName) {
      initialCampaigns = [
        {
          id: 'camp-' + Math.random().toString(36).substr(2, 9),
          campaignName: initialData.campaignName,
          platform: initialData.platform || 'Meta (Instagram & Facebook)',
          campaignStage: initialData.campaignStage || 'Testing',
          startDate: initialData.startDate || defaultStart,
          endDate: initialData.endDate || defaultEnd,
          objective: initialData.objective || 'مبيعات مباشرة',
          campaignType: initialData.campaignType || 'CBO',
          campaignBudget: initialData.campaignBudget || 0,
          primaryKpi: initialData.primaryKpi || 'ROAS & CPA',
          targetKpi: initialData.targetKpi || '',
          testingHypothesis: initialData.testingHypothesis || '',
          campaignStrategyNotes: initialData.campaignStrategyNotes || '',
          status: initialData.status || 'active',
          adSets: initialData.adSets || [],
          results: initialData.results,
          learnings: initialData.learnings
        }
      ];
    } else {
      // Default initial campaign template
      initialCampaigns = [
        {
          id: 'camp-' + Math.random().toString(36).substr(2, 9),
          campaignName: 'حملة تحويل المبيعات واختبار الكرياتيفز',
          platform: 'Meta (Instagram & Facebook)',
          campaignStage: 'Testing',
          startDate: defaultStart,
          endDate: defaultEnd,
          objective: 'مبيعات مباشرة (Sales Conversion)',
          campaignType: 'CBO',
          campaignBudget: 10000,
          primaryKpi: 'ROAS & CPA',
          targetKpi: 'ROAS >= 4.0 | CPA <= 60 EGP',
          testingHypothesis:
            'اختبار زاوية حل المشكلة (Problem-Solution) عبر فيديوهات UGC حقيقية سيرفع معدل التحويل ويخفض تكلفة الاستحواذ.',
          campaignStrategyNotes: 'التركيز على مبيعات المنتجات الأكثر طلباً مع إبراز الضمان وسرعة الشحن.',
          status: 'active',
          adSets: [
            {
              id: 'adset-' + Math.random().toString(36).substr(2, 9),
              name: 'AdSet 01 - Broad Audience (الجمهور العام)',
              objectiveOrRole: 'Top of Funnel & Broad Scale',
              budgetType: 'Campaign Controlled',
              budget: 0,
              audienceTargeting: 'استهداف عام مفتوح بدون اهتمامات محددة (Advantage+ Audience)',
              location: 'مصر (المحافظات الرئيسية)',
              age: '18 - 40 سنة',
              gender: 'الكل',
              placements: 'Advantage+ Placements',
              notes: 'اختبار خوارزمية ميتا لاختيار أفضل جمهور مستجيب للكرياتيفز.',
              ads: [
                {
                  id: 'ad-' + Math.random().toString(36).substr(2, 9),
                  name: 'Ad 01 - UGC Video (تجربة واقعية للمنتج)',
                  creative: 'رابط فيديو UGC رقم 1 على درايف / مكتبة الإعلانات',
                  creativeType: 'UGC',
                  angle: 'Problem-Solution & Quick Value',
                  hook: 'لو بتدور على أفضل جودة مع ضمان حقيقي.. شوف الفيديو ده!',
                  primaryText: 'احصل على أفضل المنتجات مع ضمان استبدال مجاني وشحن سريع لباب بيتك.',
                  headline: 'خصم خاص لفترة محدودة + شحن مجاني ⚡',
                  cta: 'Shop Now',
                  destination: 'Website',
                  notes: 'الفيديو يركز على أول 3 ثواني لإيقاف التمرير (Thumb-stop).',
                  status: 'Ready'
                }
              ]
            }
          ],
          results: {
            actualSpend: '',
            impressions: '',
            reach: '',
            ctr: '',
            cpc: '',
            cpm: '',
            atc: '',
            purchasesOrLeads: '',
            cpaOrCac: '',
            cvr: '',
            roas: '',
            performanceStatus: 'Needs More Data'
          },
          learnings: {
            whatWorked: '',
            whatDidntWork: '',
            bestCreative: '',
            bestAngle: '',
            bestAudience: '',
            insightsNotes: '',
            decision: 'Scale',
            nextStep: ''
          }
        }
      ];
    }
    setCampaigns(initialCampaigns);
    setActiveCampaignId(initialCampaigns[0]?.id || '');
  }, [isOpen, initialData]);

  useEffect(() => {
    if (campaigns.length > 0 && !campaigns.some((c) => c.id === activeCampaignId)) {
      setActiveCampaignId(campaigns[0].id);
    }
  }, [campaigns, activeCampaignId]);

  // Handle Strategic Goals
  const handleAddGoal = () => {
    if (!newGoalInput.trim()) return;
    setStrategicGoals((prev) => [...prev, newGoalInput.trim()]);
    setNewGoalInput('');
  };

  const handleRemoveGoal = (idx: number) => {
    setStrategicGoals((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateGoal = (idx: number, newVal: string) => {
    setStrategicGoals((prev) => prev.map((g, i) => (i === idx ? newVal : g)));
  };

  // Campaign Handlers
  const handleAddCampaign = () => {
    const newCamp: CampaignPlanEntry = {
      id: 'camp-' + Math.random().toString(36).substr(2, 9),
      campaignName: `حملة إعلانية جديدة #${campaigns.length + 1}`,
      platform: 'Meta (Instagram & Facebook)',
      campaignStage: stage,
      startDate: startDate,
      endDate: endDate,
      objective: 'مبيعات مباشرة',
      campaignType: 'CBO',
      campaignBudget: 5000,
      primaryKpi: 'ROAS & CPA',
      targetKpi: '',
      testingHypothesis: '',
      campaignStrategyNotes: '',
      status: 'planned',
      adSets: [],
      results: {
        actualSpend: '',
        impressions: '',
        reach: '',
        ctr: '',
        cpc: '',
        cpm: '',
        atc: '',
        purchasesOrLeads: '',
        cpaOrCac: '',
        cvr: '',
        roas: '',
        performanceStatus: 'Needs More Data'
      },
      learnings: {
        whatWorked: '',
        whatDidntWork: '',
        bestCreative: '',
        bestAngle: '',
        bestAudience: '',
        insightsNotes: '',
        decision: 'Keep',
        nextStep: ''
      }
    };
    setCampaigns((prev) => [...prev, newCamp]);
    setActiveCampaignId(newCamp.id);
  };

  const handleUpdateCampaign = (campaignId: string, fields: Partial<CampaignPlanEntry>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, ...fields } : c))
    );
  };

  const [formError, setFormError] = useState<string | null>(null);

  const handleDeleteCampaign = (campaignId: string) => {
    if (campaigns.length <= 1) {
      setFormError('يجب أن تحتوي الخطة على حملة إعلانية واحدة على الأقل.');
      return;
    }
    setFormError(null);
    const remaining = campaigns.filter((c) => c.id !== campaignId);
    setCampaigns(remaining);
    if (activeCampaignId === campaignId && remaining.length > 0) {
      setActiveCampaignId(remaining[0].id);
    }
  };

  // AdSet Handlers (Unlimited Ad Sets)
  const handleAddAdSet = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const currentAdSets = campaign.adSets || [];
    const newAdSet: AdSetItem = {
      id: 'adset-' + Math.random().toString(36).substr(2, 9),
      name: `AdSet #${currentAdSets.length + 1} - اسم مجموعة الإعلانات`,
      objectiveOrRole: 'Broad / Interest / Lookalike',
      budgetType: campaign.campaignType === 'CBO' ? 'Campaign Controlled' : 'Ad Set Controlled',
      budget: campaign.campaignType === 'ABO' ? 500 : 0,
      audienceTargeting: 'استهداف عام مفتوح (Broad) أو اهتمامات محددة',
      location: 'مصر (كافة المحافظات)',
      age: '20 - 45 سنة',
      gender: 'الكل',
      placements: 'Advantage+ Placements',
      notes: 'شرح استراتيجية المجموعة وسبب اختيار هذا الاستهداف...',
      ads: []
    };

    handleUpdateCampaign(campaignId, { adSets: [...currentAdSets, newAdSet] });
  };

  const handleDuplicateAdSet = (campaignId: string, adSet: AdSetItem) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const currentAdSets = campaign.adSets || [];
    const duplicatedAdSet: AdSetItem = {
      ...adSet,
      id: 'adset-' + Math.random().toString(36).substr(2, 9),
      name: `${adSet.name} (نسخة مكررة)`,
      ads: (adSet.ads || []).map((ad) => ({
        ...ad,
        id: 'ad-' + Math.random().toString(36).substr(2, 9),
        name: `${ad.name} (نسخة)`
      }))
    };

    handleUpdateCampaign(campaignId, { adSets: [...currentAdSets, duplicatedAdSet] });
  };

  const handleUpdateAdSet = (
    campaignId: string,
    adSetId: string,
    fields: Partial<AdSetItem>
  ) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const updatedAdSets = (campaign.adSets || []).map((s) =>
      s.id === adSetId ? { ...s, ...fields } : s
    );
    handleUpdateCampaign(campaignId, { adSets: updatedAdSets });
  };

  const handleDeleteAdSet = (campaignId: string, adSetId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const updatedAdSets = (campaign.adSets || []).filter((s) => s.id !== adSetId);
    handleUpdateCampaign(campaignId, { adSets: updatedAdSets });
  };

  // Ads Handlers (Unlimited Ads)
  const handleAddAd = (campaignId: string, adSetId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const updatedAdSets = (campaign.adSets || []).map((set) => {
      if (set.id !== adSetId) return set;
      const currentAds = set.ads || [];
      const newAd: AdItem = {
        id: 'ad-' + Math.random().toString(36).substr(2, 9),
        name: `Ad #${currentAds.length + 1} - اسم الإعلان الجديد`,
        creative: '',
        creativeType: 'UGC',
        angle: 'Problem-Solution',
        hook: 'الهوك: أول 3 ثواني لإيقاف التمرير وجذب العميل...',
        primaryText: 'النص الأساسي للإعلان وشرح القيمة والعرض ورابط الشراء...',
        headline: 'العنوان الجذاب للإعلان',
        cta: 'Shop Now',
        destination: 'Website',
        notes: 'ملاحظات الإعلان الإضافية...',
        status: 'Ready'
      };
      return { ...set, ads: [...currentAds, newAd] };
    });

    handleUpdateCampaign(campaignId, { adSets: updatedAdSets });
  };

  const handleDuplicateAd = (campaignId: string, adSetId: string, ad: AdItem) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const updatedAdSets = (campaign.adSets || []).map((set) => {
      if (set.id !== adSetId) return set;
      const newAd: AdItem = {
        ...ad,
        id: 'ad-' + Math.random().toString(36).substr(2, 9),
        name: `${ad.name} (نسخة)`
      };
      return { ...set, ads: [...(set.ads || []), newAd] };
    });

    handleUpdateCampaign(campaignId, { adSets: updatedAdSets });
  };

  const handleUpdateAd = (
    campaignId: string,
    adSetId: string,
    adId: string,
    fields: Partial<AdItem>
  ) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const updatedAdSets = (campaign.adSets || []).map((set) => {
      if (set.id !== adSetId) return set;
      const updatedAds = (set.ads || []).map((a) =>
        a.id === adId ? { ...a, ...fields } : a
      );
      return { ...set, ads: updatedAds };
    });

    handleUpdateCampaign(campaignId, { adSets: updatedAdSets });
  };

  const handleDeleteAd = (campaignId: string, adSetId: string, adId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const updatedAdSets = (campaign.adSets || []).map((set) => {
      if (set.id !== adSetId) return set;
      return { ...set, ads: (set.ads || []).filter((a) => a.id !== adId) };
    });

    handleUpdateCampaign(campaignId, { adSets: updatedAdSets });
  };

  // Results & Learnings Update Handlers
  const handleUpdateCampaignResults = (
    campaignId: string,
    resultsFields: Partial<CampaignActualResults>
  ) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    const updatedResults = { ...(campaign.results || {}), ...resultsFields };
    handleUpdateCampaign(campaignId, { results: updatedResults });
  };

  const handleUpdateCampaignLearnings = (
    campaignId: string,
    learningsFields: Partial<CampaignLearningsAndDecision>
  ) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    const updatedLearnings = { ...(campaign.learnings || {}), ...learningsFields };
    handleUpdateCampaign(campaignId, { learnings: updatedLearnings });
  };

  // Submit Form Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setFormError('يرجى تحديد تاريخ بداية ونهاية الاستراتيجية في القسم الأول.');
      setActiveTab('strategy');
      return;
    }
    setFormError(null);

    const calculatedTotalBudget =
      Number(totalBudget) ||
      campaigns.reduce((sum, c) => sum + (Number(c.campaignBudget) || 0), 0);

    const strategyData: StrategyDetails = {
      startDate,
      endDate,
      stage,
      phaseStatus,
      overallStrategy,
      targetAudience,
      strategicGoals,
      totalBudget: calculatedTotalBudget,
      notes: strategyNotes
    };

    const firstCampaign = campaigns[0] || {};

    const fullPlanData: Partial<AdsPlanItem> = {
      clientId,
      title: title.trim() || `خطة واستراتيجية: ${startDate} إلى ${endDate}`,
      startDate,
      endDate,
      campaignStage: stage,
      strategy: strategyData,
      campaigns: campaigns,

      // Top-level legacy fields compatibility
      campaignName: firstCampaign.campaignName || title,
      platform: firstCampaign.platform || 'Meta Ads',
      objective: firstCampaign.objective || 'مبيعات مباشرة',
      campaignType: firstCampaign.campaignType || 'CBO',
      campaignBudget: calculatedTotalBudget,
      primaryKpi: firstCampaign.primaryKpi || 'ROAS & CPA',
      targetKpi: firstCampaign.targetKpi,
      testingHypothesis: firstCampaign.testingHypothesis,
      campaignStrategyNotes: overallStrategy,
      status: phaseStatus === 'Completed' ? 'completed' : 'active',
      adSets: firstCampaign.adSets || [],
      results: firstCampaign.results,
      learnings: firstCampaign.learnings
    };

    onSave(fullPlanData);
    onClose();
  };

  if (!isOpen) return null;

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-[#E5E5E0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs shrink-0">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20">
                  {initialData ? 'تعديل الاستراتيجية والخطة' : 'خطة جديدة'}
                </span>
                {brandName && (
                  <span className="text-[11px] sm:text-xs font-bold text-[#8E8E85] truncate">| {brandName}</span>
                )}
              </div>
              <h2 className="text-sm sm:text-lg font-black text-[#2D2D2A] truncate">
                {title || 'استراتيجية وخطة إعلانات'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* THREE UNIFIED NAVIGATION TABS */}
        <div className="px-3 sm:px-6 pt-2 sm:pt-3 bg-white border-b border-[#E5E5E0] shrink-0">
          <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
            {/* TAB 1: STRATEGY */}
            <button
              type="button"
              onClick={() => setActiveTab('strategy')}
              className={`flex items-center gap-1.5 pb-2.5 sm:pb-3 text-xs sm:text-sm font-extrabold transition cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'strategy'
                  ? 'border-[#5A5A40] text-[#5A5A40]'
                  : 'border-transparent text-[#8E8E85] hover:text-[#2D2D2A]'
              }`}
            >
              <Target className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">1. الاستراتيجية وتحديد الفترة (Strategy)</span>
              <span className="sm:hidden">1. الاستراتيجية</span>
            </button>

            {/* TAB 2: CAMPAIGNS, AD SETS & ADS */}
            <button
              type="button"
              onClick={() => setActiveTab('campaigns_and_ads')}
              className={`flex items-center gap-1.5 pb-2.5 sm:pb-3 text-xs sm:text-sm font-extrabold transition cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'campaigns_and_ads'
                  ? 'border-[#5A5A40] text-[#5A5A40]'
                  : 'border-transparent text-[#8E8E85] hover:text-[#2D2D2A]'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">2. الحملات والمجموعات والإعلانات (Campaigns & Ad Sets)</span>
              <span className="sm:hidden">2. الحملات</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40]">
                {campaigns.length}
              </span>
            </button>

            {/* TAB 3: RESULTS & LEARNINGS */}
            <button
              type="button"
              onClick={() => setActiveTab('results_learnings')}
              className={`flex items-center gap-1.5 pb-2.5 sm:pb-3 text-xs sm:text-sm font-extrabold transition cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'results_learnings'
                  ? 'border-[#5A5A40] text-[#5A5A40]'
                  : 'border-transparent text-[#8E8E85] hover:text-[#2D2D2A]'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">3. النتائج والتعلم والقرارات (Results & Learnings)</span>
              <span className="sm:hidden">3. النتائج</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs font-bold text-rose-800 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-rose-600 hover:text-rose-900 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {/* ================= TAB 1: STRATEGY & PERIOD ================= */}
          {activeTab === 'strategy' && (
            <div className="space-y-6">
              {/* Plan Title & Stage Info */}
              <div className="bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>تحديد عنوان الخطة والفترة الزمنية (Strategy Timeline)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6 space-y-1.5">
                    <label className="text-xs font-bold text-[#2D2D2A]">
                      عنوان تسجيل الخطة والاستراتيجية
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: استراتيجية إعلانات رمضان واختبار المنتجات الجديدة"
                      className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-[#2D2D2A]">تاريخ بداية الخطة</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-[#2D2D2A]">تاريخ نهاية الخطة</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E5E5E0]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D2D2A]">
                      مرحلة الإعلانات الحالية (Ad Stage)
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as AdStageType)}
                      className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                    >
                      <option value="Launch">Launch (إطلاق البراند / منتج جديد)</option>
                      <option value="Testing">Testing (اختبار الكرياتيفز والزوايا)</option>
                      <option value="Validation">Validation (تأكيد النتائج والاستقرار)</option>
                      <option value="Scaling">Scaling (التوسع ورفع الميزانية)</option>
                      <option value="Retargeting">Retargeting (إعادة الاستهداف)</option>
                      <option value="Creative Refresh">Creative Refresh (تجديد الكرياتيفز المنهكة)</option>
                      <option value="Optimization">Optimization (تحسين مسار التحويل)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D2D2A]">حالة المرحلة (Phase Status)</label>
                    <select
                      value={phaseStatus}
                      onChange={(e) => setPhaseStatus(e.target.value as AdPhaseStatus)}
                      className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                    >
                      <option value="In Progress">قيد التنفيذ (In Progress)</option>
                      <option value="Not Started">لم تبدأ بعد (Not Started)</option>
                      <option value="Completed">مكتملة (Completed)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D2D2A]">
                      الميزانية التقديرية الإجمالية (ج.م)
                    </label>
                    <input
                      type="number"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(e.target.value)}
                      placeholder="مثال: 20000"
                      className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                    />
                  </div>
                </div>
              </div>

              {/* Strategy Text & Audience */}
              <div className="bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>الاستراتيجية العامة ورؤية التنفيذ (Overall Strategy)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D2D2A]">
                    شرح استراتيجية الإعلانات وخطة العمل لهذه الفترة
                  </label>
                  <textarea
                    rows={3}
                    value={overallStrategy}
                    onChange={(e) => setOverallStrategy(e.target.value)}
                    placeholder="مثال: التركيز على اختبار 3 أنواع كرياتيفز (UGC - مقارنة - أنبوكسينج) للوصول لأفضل زاوية بيع مع استخدام حملة CBO مفتوحة وإعادة استهداف للمتفاعلين..."
                    className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl p-3.5 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D2D2A]">
                    الجمهور المستهدف ونقاط التموضع (Target Audience & Positioning)
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="مثال: المهتمين بالتسوق الإلكتروني، سن 20-35 سنة في المدن الرئيسية، التركيز على الثقة والضمان"
                    className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              {/* Strategic Goals Dynamic List */}
              <div className="bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>أهداف وتركيزات الاستراتيجية (Strategic Goals)</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#8E8E85]">
                    {strategicGoals.length} أهداف مسجلة
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGoalInput}
                    onChange={(e) => setNewGoalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGoal();
                      }
                    }}
                    placeholder="أضف هدف استراتيجي محدد (مثال: الوصول لتكلفة طلب CPA أقل من 50 ج.م)..."
                    className="flex-1 bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة هدف</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {strategicGoals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F9F8F6] border border-[#E5E5E0]"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-[#2D2D2A] flex-1">
                        <CheckCircle2 className="w-4 h-4 text-[#5A5A40] shrink-0" />
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => handleUpdateGoal(idx, e.target.value)}
                          className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#5A5A40] rounded px-1 flex-1 font-bold text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(idx)}
                        className="p-1 text-[#8E8E85] hover:text-rose-600 transition cursor-pointer"
                        title="حذف الهدف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step Navigation CTA */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('campaigns_and_ads')}
                  className="px-6 py-2.5 rounded-xl font-extrabold text-xs text-white bg-[#5A5A40] hover:bg-[#484833] transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>التالي: الانتقال لتفصيل الحملات والمجموعات والإعلانات</span>
                  <Megaphone className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CAMPAIGNS, UNLIMITED AD SETS & ADS ================= */}
          {activeTab === 'campaigns_and_ads' && (
            <div className="space-y-6">
              {/* Campaigns Multi-Selector Bar */}
              <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#5A5A40]" />
                    <span className="text-xs font-extrabold text-[#2D2D2A]">
                      الحملات الإعلانية داخل هذه الخطة ({campaigns.length} حملة):
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCampaign}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ إضافة حملة جديدة للخطة</span>
                  </button>
                </div>

                {/* Campaign Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {campaigns.map((camp, cIdx) => (
                    <div
                      key={camp.id}
                      onClick={() => setActiveCampaignId(camp.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer border transition shrink-0 ${
                        activeCampaignId === camp.id
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                          : 'bg-[#F9F8F6] text-[#2D2D2A] border-[#E5E5E0] hover:bg-[#E5E5E0]'
                      }`}
                    >
                      <span>حملة {cIdx + 1}: {camp.campaignName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">
                        {camp.adSets?.length || 0} مجموعات
                      </span>
                      {campaigns.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCampaign(camp.id);
                          }}
                          className="hover:text-rose-300 p-0.5"
                          title="حذف الحملة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Campaign Edit Form */}
              {activeCampaign && (
                <div className="bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-2xs space-y-5">
                  <div className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center justify-between border-b border-[#E5E5E0] pb-3">
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      <span>بيانات وتفاصيل الحملة: {activeCampaign.campaignName}</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#8E8E85]">
                      الميزانية: {activeCampaign.campaignBudget || 0} ج.م
                    </span>
                  </div>

                  {/* Campaign Core Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-6 space-y-1.5">
                      <label className="text-xs font-bold text-[#2D2D2A]">اسم الحملة الإعلانية</label>
                      <input
                        type="text"
                        value={activeCampaign.campaignName}
                        onChange={(e) =>
                          handleUpdateCampaign(activeCampaign.id, { campaignName: e.target.value })
                        }
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-[#2D2D2A]">المنصة (Platform)</label>
                      <select
                        value={activeCampaign.platform || 'Meta (Instagram & Facebook)'}
                        onChange={(e) =>
                          handleUpdateCampaign(activeCampaign.id, { platform: e.target.value })
                        }
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                      >
                        <option value="Meta (Instagram & Facebook)">Meta (Instagram & Facebook)</option>
                        <option value="TikTok Ads">TikTok Ads</option>
                        <option value="Google Ads">Google Ads</option>
                        <option value="Snapchat Ads">Snapchat Ads</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-[#2D2D2A]">الهدف (Objective)</label>
                      <input
                        type="text"
                        value={activeCampaign.objective}
                        onChange={(e) =>
                          handleUpdateCampaign(activeCampaign.id, { objective: e.target.value })
                        }
                        placeholder="مبيعات مباشرة / ليدز / رسائل..."
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-[#2D2D2A]">نوع الميزانية (Budget Type)</label>
                      <select
                        value={activeCampaign.campaignType || 'CBO'}
                        onChange={(e) =>
                          handleUpdateCampaign(activeCampaign.id, { campaignType: e.target.value })
                        }
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                      >
                        <option value="CBO">CBO (Campaign Budget Optimization) - ميزانية مركزية</option>
                        <option value="ABO">ABO (Ad Set Budget) - ميزانية موزعة لكل Ad Set</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-[#2D2D2A]">ميزانية الحملة (ج.م)</label>
                      <input
                        type="number"
                        value={activeCampaign.campaignBudget || ''}
                        onChange={(e) =>
                          handleUpdateCampaign(activeCampaign.id, { campaignBudget: Number(e.target.value) })
                        }
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-[#2D2D2A]">المؤشر الأساسي (Primary KPI)</label>
                      <input
                        type="text"
                        value={activeCampaign.primaryKpi || 'ROAS & CPA'}
                        onChange={(e) =>
                          handleUpdateCampaign(activeCampaign.id, { primaryKpi: e.target.value })
                        }
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-[#2D2D2A]">الهدف المطلوب (Target KPI)</label>
                      <input
                        type="text"
                        value={activeCampaign.targetKpi || ''}
                        onChange={(e) =>
                          handleUpdateCampaign(activeCampaign.id, { targetKpi: e.target.value })
                        }
                        placeholder="مثال: ROAS >= 4.0 | CPA <= 60 EGP"
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="sm:col-span-12 space-y-1.5">
                      <label className="text-xs font-bold text-[#2D2D2A]">فرضية الاختبار (Testing Hypothesis)</label>
                      <input
                        type="text"
                        value={activeCampaign.testingHypothesis || ''}
                        onChange={(e) =>
                          handleUpdateCampaign(activeCampaign.id, { testingHypothesis: e.target.value })
                        }
                        placeholder="ما الفرضية أو المتغير الذي نختبره في هذه الحملة؟"
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>

                  {/* ================= UNLIMITED AD SETS SECTION ================= */}
                  <div className="pt-5 border-t border-[#E5E5E0] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#5A5A40]" />
                        <span className="text-xs font-black text-[#2D2D2A]">
                          Ad Sets (مجموعات الإعلانات) — عدد غير محدود ({activeCampaign.adSets?.length || 0} Ad Sets):
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddAdSet(activeCampaign.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-xs self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ إضافة مجموعة إعلانات (Ad Set)</span>
                      </button>
                    </div>

                    {/* Ad Sets List */}
                    {(activeCampaign.adSets || []).length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#F9F8F6] border border-dashed border-[#E5E5E0] text-center space-y-3">
                        <p className="text-xs font-bold text-[#8E8E85]">
                          لا توجد مجموعات إعلانية في هذه الحملة حتى الآن. يمكنك إضافة عدد غير محدود من المجموعات.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAddAdSet(activeCampaign.id)}
                          className="px-4 py-2 bg-white border border-[#E5E5E0] rounded-xl text-xs font-extrabold text-[#5A5A40] hover:bg-[#F5F5F0] transition"
                        >
                          + إضافة أول مجموعة إعلانات (Ad Set) الآن
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {(activeCampaign.adSets || []).map((adSet, sIdx) => (
                          <div
                            key={adSet.id}
                            className="bg-[#F9F8F6] border-2 border-[#E5E5E0] rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs"
                          >
                            {/* AdSet Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E0]">
                              <div className="flex items-center gap-2.5 flex-1">
                                <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-[#5A5A40] text-white shrink-0">
                                  Ad Set #{sIdx + 1}
                                </span>
                                <div className="flex-1 space-y-1">
                                  <label className="text-[10px] font-bold text-[#8E8E85] block">Ad Set Name (اسم مجموعة الإعلانات):</label>
                                  <input
                                    type="text"
                                    value={adSet.name}
                                    onChange={(e) =>
                                      handleUpdateAdSet(activeCampaign.id, adSet.id, { name: e.target.value })
                                    }
                                    placeholder="اسم مجموعة الإعلانات"
                                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-extrabold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateAdSet(activeCampaign.id, adSet)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#E5E5E0] text-[#5A5A40] border border-[#E5E5E0] rounded-xl text-[11px] font-bold transition cursor-pointer"
                                  title="تكرار المجموعة الإعلانية"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">تكرار</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleAddAd(activeCampaign.id, adSet.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-[11px] font-extrabold transition cursor-pointer shadow-2xs"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ إضافة إعلان (Ad)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdSet(activeCampaign.id, adSet.id)}
                                  className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition cursor-pointer"
                                  title="حذف المجموعة الإعلانية"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* AdSet Exact 10 Specified Fields Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                              {/* 1. Objective / Role */}
                              <div className="sm:col-span-4 space-y-1">
                                <label className="text-[10px] font-bold text-[#8E8E85]">
                                  Objective / Role (الهدف / الدور داخل الحملة):
                                </label>
                                <input
                                  type="text"
                                  value={adSet.objectiveOrRole || ''}
                                  onChange={(e) =>
                                    handleUpdateAdSet(activeCampaign.id, adSet.id, {
                                      objectiveOrRole: e.target.value
                                    })
                                  }
                                  placeholder="مثال: Broad Scale / Retargeting / Interest"
                                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                                />
                              </div>

                              {/* 2. Budget Type */}
                              <div className="sm:col-span-4 space-y-1">
                                <label className="text-[10px] font-bold text-[#8E8E85]">
                                  Budget Type (نوع الميزانية):
                                </label>
                                <select
                                  value={adSet.budgetType || 'Campaign Controlled'}
                                  onChange={(e) =>
                                    handleUpdateAdSet(activeCampaign.id, adSet.id, {
                                      budgetType: e.target.value
                                    })
                                  }
                                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                                >
                                  <option value="Campaign Controlled">Campaign Controlled (تحكم الحملة)</option>
                                  <option value="Ad Set Controlled">Ad Set Controlled (تحكم المجموعة)</option>
                                </select>
                              </div>

                              {/* 3. Budget */}
                              <div className="sm:col-span-4 space-y-1">
                                <label className="text-[10px] font-bold text-[#8E8E85]">
                                  Budget (الميزانية ج.م):
                                </label>
                                <input
                                  type="number"
                                  value={adSet.budget || ''}
                                  onChange={(e) =>
                                    handleUpdateAdSet(activeCampaign.id, adSet.id, {
                                      budget: e.target.value
                                    })
                                  }
                                  placeholder="ميزانية Ad Set (في حالة Ad Set Controlled)"
                                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                                />
                              </div>

                              {/* 4. Audience / Targeting */}
                              <div className="sm:col-span-6 space-y-1">
                                <label className="text-[10px] font-bold text-[#8E8E85]">
                                  Audience / Targeting (الجمهور / الاستهداف):
                                </label>
                                <input
                                  type="text"
                                  value={adSet.audienceTargeting || ''}
                                  onChange={(e) =>
                                    handleUpdateAdSet(activeCampaign.id, adSet.id, {
                                      audienceTargeting: e.target.value
                                    })
                                  }
                                  placeholder="مثال: استهداف عام مفتوح (Broad) أو اهتمامات أزياء وموضة"
                                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                                />
                              </div>

                              {/* 5. Location */}
                              <div className="sm:col-span-6 space-y-1">
                                <label className="text-[10px] font-bold text-[#8E8E85]">
                                  Location (الموقع الجغرافي):
                                </label>
                                <input
                                  type="text"
                                  value={adSet.location || ''}
                                  onChange={(e) =>
                                    handleUpdateAdSet(activeCampaign.id, adSet.id, {
                                      location: e.target.value
                                    })
                                  }
                                  placeholder="مثال: مصر (القاهرة، الجيزة، الإسكندرية)"
                                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                                />
                              </div>

                              {/* 6. Age */}
                              <div className="sm:col-span-4 space-y-1">
                                <label className="text-[10px] font-bold text-[#8E8E85]">
                                  Age (العمر):
                                </label>
                                <input
                                  type="text"
                                  value={adSet.age || ''}
                                  onChange={(e) =>
                                    handleUpdateAdSet(activeCampaign.id, adSet.id, {
                                      age: e.target.value
                                    })
                                  }
                                  placeholder="مثال: 18 - 45 سنة"
                                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                                />
                              </div>

                              {/* 7. Gender */}
                              <div className="sm:col-span-4 space-y-1">
                                <label className="text-[10px] font-bold text-[#8E8E85]">
                                  Gender (النوع):
                                </label>
                                <select
                                  value={adSet.gender || 'الكل'}
                                  onChange={(e) =>
                                    handleUpdateAdSet(activeCampaign.id, adSet.id, {
                                      gender: e.target.value
                                    })
                                  }
                                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                                >
                                  <option value="الكل">الكل (رجال ونساء)</option>
                                  <option value="رجال">رجال فقط</option>
                                  <option value="نساء">نساء فقط</option>
                                </select>
                              </div>

                              {/* 8. Placements */}
                              <div className="sm:col-span-4 space-y-1">
                                <label className="text-[10px] font-bold text-[#8E8E85]">
                                  Placements (أماكن ظهور الإعلان):
                                </label>
                                <input
                                  type="text"
                                  value={adSet.placements || 'Advantage+ Placements'}
                                  onChange={(e) =>
                                    handleUpdateAdSet(activeCampaign.id, adSet.id, {
                                      placements: e.target.value
                                    })
                                  }
                                  placeholder="مثال: Advantage+ Placements / Feeds & Reels"
                                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                                />
                              </div>

                              {/* 9. Ad Set Notes */}
                              <div className="sm:col-span-12 space-y-1">
                                <label className="text-[10px] font-bold text-[#8E8E85]">
                                  Ad Set Notes (ملاحظات مجموعة الإعلانات — شرح الاستراتيجية وسبب اختيار هذا الاستهداف):
                                </label>
                                <textarea
                                  rows={2}
                                  value={adSet.notes || ''}
                                  onChange={(e) =>
                                    handleUpdateAdSet(activeCampaign.id, adSet.id, {
                                      notes: e.target.value
                                    })
                                  }
                                  placeholder="اكتب هنا استراتيجية هذه المجموعة ولماذا تم اختيار هذا الاستهداف والمواضع..."
                                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2.5 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] leading-relaxed"
                                />
                              </div>
                            </div>

                            {/* ================= UNLIMITED ADS SECTION INSIDE AD SET ================= */}
                            <div className="pt-4 border-t border-[#E5E5E0] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-[#5A5A40] flex items-center gap-1.5">
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Ads (الإعلانات والكرياتيفز) داخل هذه المجموعة ({adSet.ads?.length || 0} إعلانات):</span>
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleAddAd(activeCampaign.id, adSet.id)}
                                  className="text-[11px] font-extrabold text-[#5A5A40] hover:underline flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>إضافة إعلان جديد</span>
                                </button>
                              </div>

                              {(adSet.ads || []).length === 0 ? (
                                <div className="p-4 bg-white rounded-xl border border-[#E5E5E0] text-center text-xs text-[#8E8E85] space-y-1">
                                  <p>لا توجد إعلانات في هذه المجموعة حتى الآن.</p>
                                  <button
                                    type="button"
                                    onClick={() => handleAddAd(activeCampaign.id, adSet.id)}
                                    className="font-bold text-[#5A5A40] hover:underline"
                                  >
                                    + أضف أول إعلان (Ad)
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-3.5">
                                  {(adSet.ads || []).map((ad, adIdx) => (
                                    <div
                                      key={ad.id}
                                      className="bg-white border border-[#E5E5E0] rounded-2xl p-4 space-y-3.5 shadow-2xs"
                                    >
                                      {/* Ad Top Bar */}
                                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5E5E0]">
                                        <div className="flex items-center gap-2 flex-1">
                                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#5A5A40]/10 text-[#5A5A40] shrink-0">
                                            Ad #{adIdx + 1}
                                          </span>
                                          <input
                                            type="text"
                                            value={ad.name}
                                            onChange={(e) =>
                                              handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                name: e.target.value
                                              })
                                            }
                                            placeholder="Ad Name (اسم الإعلان)"
                                            className="font-black text-xs text-[#2D2D2A] bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#5A5A40] flex-1"
                                          />
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {/* Ad Status Selector */}
                                          <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-[#8E8E85]">Ad Status:</span>
                                            <select
                                              value={ad.status || 'Ready'}
                                              onChange={(e) =>
                                                handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                  status: e.target.value as AdItemStatus
                                                })
                                              }
                                              className={`text-[10px] font-black rounded-lg px-2 py-1 border cursor-pointer ${
                                                ad.status === 'Winner'
                                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                  : ad.status === 'Live'
                                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                                  : ad.status === 'Loser'
                                                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                                                  : 'bg-[#F9F8F6] text-[#2D2D2A] border-[#E5E5E0]'
                                              }`}
                                            >
                                              <option value="Planned">Planned (مخطط له)</option>
                                              <option value="Ready">Ready (جاهز)</option>
                                              <option value="Live">Live (يعمل حاليًا)</option>
                                              <option value="Paused">Paused (متوقف)</option>
                                              <option value="Completed">Completed (مكتمل)</option>
                                              <option value="Winner">Winner 🏆 (إعلان فائز)</option>
                                              <option value="Loser">Loser ❌ (إعلان خاسر)</option>
                                            </select>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleDuplicateAd(activeCampaign.id, adSet.id, ad)}
                                            className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] rounded-lg"
                                            title="تكرار الإعلان"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleDeleteAd(activeCampaign.id, adSet.id, ad.id)}
                                            className="p-1 text-rose-600 hover:text-rose-700 rounded-lg"
                                            title="حذف الإعلان"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Ad Exact Specified Fields Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                                        {/* Creative */}
                                        <div className="sm:col-span-8 space-y-1">
                                          <label className="text-[10px] font-bold text-[#8E8E85]">
                                            Creative (الكرياتيف / المحتوى الإعلاني — رابط / وصف / اسم الملف):
                                          </label>
                                          <input
                                            type="text"
                                            value={ad.creative || ''}
                                            onChange={(e) =>
                                              handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                creative: e.target.value
                                              })
                                            }
                                            placeholder="رابط الفيديو أو التصميم على درايف / مكتبة الإعلانات أو وصفه"
                                            className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                          />
                                        </div>

                                        {/* Creative Type */}
                                        <div className="sm:col-span-4 space-y-1">
                                          <label className="text-[10px] font-bold text-[#8E8E85]">
                                            Creative Type (نوع الكرياتيف):
                                          </label>
                                          <select
                                            value={ad.creativeType || 'UGC'}
                                            onChange={(e) =>
                                              handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                creativeType: e.target.value as AdCreativeType
                                              })
                                            }
                                            className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#2D2D2A] cursor-pointer"
                                          >
                                            <option value="UGC">UGC (محتوى عملاء / صانع محتوى)</option>
                                            <option value="Video">Video (فيديو احترافي)</option>
                                            <option value="Static">Static (تصميم ثابت)</option>
                                            <option value="Carousel">Carousel (سلايدات / صور متعددة)</option>
                                            <option value="Founder">Founder (فيديو المؤسس)</option>
                                            <option value="Unboxing">Unboxing (فتح الصندوق)</option>
                                            <option value="Problem-Solution">Problem-Solution (حل المشكلة)</option>
                                            <option value="Testimonial">Testimonial (آراء وتجارب)</option>
                                          </select>
                                        </div>

                                        {/* Angle */}
                                        <div className="sm:col-span-6 space-y-1">
                                          <label className="text-[10px] font-bold text-[#8E8E85]">
                                            Angle (الزاوية التسويقية):
                                          </label>
                                          <input
                                            type="text"
                                            value={ad.angle || ''}
                                            onChange={(e) =>
                                              handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                angle: e.target.value
                                              })
                                            }
                                            placeholder="مثال: Problem-Solution / Social Proof / Price-Quality / Fear of Missing Out"
                                            className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                          />
                                        </div>

                                        {/* Hook */}
                                        <div className="sm:col-span-6 space-y-1">
                                          <label className="text-[10px] font-bold text-[#8E8E85]">
                                            Hook (الهوك / أول نقطة تجذب الانتباه):
                                          </label>
                                          <input
                                            type="text"
                                            value={ad.hook || ''}
                                            onChange={(e) =>
                                              handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                hook: e.target.value
                                              })
                                            }
                                            placeholder="أول 3 ثواني / الجملة الافتتاحية البارزة..."
                                            className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                          />
                                        </div>

                                        {/* Primary Text */}
                                        <div className="sm:col-span-12 space-y-1">
                                          <label className="text-[10px] font-bold text-[#8E8E85]">
                                            Primary Text (النص الأساسي للإعلان):
                                          </label>
                                          <textarea
                                            rows={2}
                                            value={ad.primaryText || ''}
                                            onChange={(e) =>
                                              handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                primaryText: e.target.value
                                              })
                                            }
                                            placeholder="اكتب هنا النص الإعلاني (الكابشن) وتفاصيل العرض والطلب..."
                                            className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg p-2.5 text-xs font-medium leading-relaxed"
                                          />
                                        </div>

                                        {/* Headline */}
                                        <div className="sm:col-span-4 space-y-1">
                                          <label className="text-[10px] font-bold text-[#8E8E85]">
                                            Headline (العنوان):
                                          </label>
                                          <input
                                            type="text"
                                            value={ad.headline || ''}
                                            onChange={(e) =>
                                              handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                headline: e.target.value
                                              })
                                            }
                                            placeholder="العنوان البارز في أسفل الإعلان"
                                            className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                          />
                                        </div>

                                        {/* CTA */}
                                        <div className="sm:col-span-4 space-y-1">
                                          <label className="text-[10px] font-bold text-[#8E8E85]">
                                            CTA — Call To Action (زر / دعوة لاتخاذ إجراء):
                                          </label>
                                          <input
                                            type="text"
                                            value={ad.cta || 'Shop Now'}
                                            onChange={(e) =>
                                              handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                cta: e.target.value
                                              })
                                            }
                                            placeholder="Shop Now / Order Now / Learn More / WhatsApp"
                                            className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                          />
                                        </div>

                                        {/* Destination */}
                                        <div className="sm:col-span-4 space-y-1">
                                          <label className="text-[10px] font-bold text-[#8E8E85]">
                                            Destination (وجهة الإعلان):
                                          </label>
                                          <input
                                            type="text"
                                            value={ad.destination || 'Website'}
                                            onChange={(e) =>
                                              handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                destination: e.target.value
                                              })
                                            }
                                            placeholder="Website / Landing Page / WhatsApp / Instagram DM"
                                            className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                          />
                                        </div>

                                        {/* Ad Notes */}
                                        <div className="sm:col-span-12 space-y-1">
                                          <label className="text-[10px] font-bold text-[#8E8E85]">
                                            Ad Notes (ملاحظات الإعلان — مساحة كتابة لأي تفاصيل إضافية):
                                          </label>
                                          <input
                                            type="text"
                                            value={ad.notes || ''}
                                            onChange={(e) =>
                                              handleUpdateAd(activeCampaign.id, adSet.id, ad.id, {
                                                notes: e.target.value
                                              })
                                            }
                                            placeholder="ملاحظات حول هذا الإعلان، نتائج الاختبارات، أو تعديلات مطلوبة..."
                                            className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation CTA */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('strategy')}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#2D2D2A] bg-white border border-[#E5E5E0] hover:bg-[#F5F5F0] transition cursor-pointer"
                >
                  ← العودة لتحديد الاستراتيجية
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('results_learnings')}
                  className="px-6 py-2.5 rounded-xl font-extrabold text-xs text-white bg-[#5A5A40] hover:bg-[#484833] transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>التالي: تسجيل النتائج والتعلم والقرارات</span>
                  <TrendingUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: RESULTS, LEARNINGS, DECISION & NEXT STEPS ================= */}
          {activeTab === 'results_learnings' && (
            <div className="space-y-6">
              {/* 1. CLEAN CAMPAIGN SELECTOR BAR */}
              <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#5A5A40]" />
                    <span className="text-xs font-extrabold text-[#2D2D2A]">
                      تسجيل النتائج والتعلم والقرار للحملات ({campaigns.length} حملة):
                    </span>
                  </div>

                  {campaigns.length > 1 && (
                    <span className="text-[11px] text-[#8E8E85] font-medium">
                      اضغط على اسم الحملة لتسجيل أو استعراض نتائجها
                    </span>
                  )}
                </div>

                {/* Campaign Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {campaigns.map((camp, cIdx) => {
                    const isSelected = activeCampaignId === camp.id;
                    const hasResults =
                      camp.results?.actualSpend ||
                      camp.results?.purchasesOrLeads ||
                      camp.results?.roas ||
                      camp.learnings?.whatWorked;
                    const perfStatus = camp.results?.performanceStatus;

                    return (
                      <button
                        key={camp.id}
                        type="button"
                        onClick={() => setActiveCampaignId(camp.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer border transition shrink-0 ${
                          isSelected
                            ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                            : 'bg-[#F9F8F6] text-[#2D2D2A] border-[#E5E5E0] hover:bg-[#E5E5E0]'
                        }`}
                      >
                        <span>
                          حملة {cIdx + 1}: {camp.campaignName}
                        </span>

                        {perfStatus === 'Winner' ? (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-amber-300 text-amber-950 font-black'
                                : 'bg-amber-100 text-amber-900 font-bold'
                            }`}
                          >
                            Winner 🏆
                          </span>
                        ) : perfStatus === 'Loser' ? (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-rose-300 text-rose-950 font-black'
                                : 'bg-rose-100 text-rose-900 font-bold'
                            }`}
                          >
                            Loser ❌
                          </span>
                        ) : hasResults ? (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-emerald-300 text-emerald-950 font-black'
                                : 'bg-emerald-100 text-emerald-900 font-bold'
                            }`}
                          >
                            تم التسجيل ✓
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. ACTIVE CAMPAIGN CONTENT */}
              {activeCampaign && (
                <div className="space-y-5">
                  {/* Subtle Campaign Context Info */}
                  <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-[#2D2D2A]">
                        بيانات حملة: {activeCampaign.campaignName}
                      </span>
                      <span className="text-[#8E8E85]">•</span>
                      <span className="text-[#5A5A40] font-bold">
                        {activeCampaign.platform || 'Meta Ads'}
                      </span>
                      <span className="text-[#8E8E85]">•</span>
                      <span className="text-[#8E8E85]">الهدف: {activeCampaign.objective}</span>
                      {activeCampaign.primaryKpi && (
                        <>
                          <span className="text-[#8E8E85]">•</span>
                          <span className="text-[#8E8E85]">
                            المؤشر: {activeCampaign.primaryKpi}{' '}
                            {activeCampaign.targetKpi ? `(${activeCampaign.targetKpi})` : ''}
                          </span>
                        </>
                      )}
                    </div>

                    {activeCampaign.campaignBudget ? (
                      <span className="text-[11px] font-bold text-[#5A5A40]">
                        الميزانية المخططة: {Number(activeCampaign.campaignBudget).toLocaleString()} ج.م
                      </span>
                    ) : null}
                  </div>

                  {/* 1. ACTUAL RESULTS */}
                  <div className="bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E0] pb-3">
                      <div className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#5A5A40]" />
                        <span>Actual Results (النتائج الفعلية للحملة)</span>
                      </div>

                      {/* Performance Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2D2D2A]">
                          Performance Status (حالة الأداء):
                        </span>
                        <select
                          value={activeCampaign.results?.performanceStatus || 'Needs More Data'}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              performanceStatus: e.target.value
                            })
                          }
                          className={`text-xs font-bold rounded-xl px-3 py-1.5 border cursor-pointer ${
                            activeCampaign.results?.performanceStatus === 'Winner'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : activeCampaign.results?.performanceStatus === 'Loser'
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : 'bg-[#F9F8F6] text-[#2D2D2A] border-[#E5E5E0]'
                          }`}
                        >
                          <option value="Needs More Data">Needs More Data ⏳ (يحتاج بيانات أكثر)</option>
                          <option value="Winner">Winner 🏆 (فائز ومربح)</option>
                          <option value="Loser">Loser ❌ (خاسر وغير مجدٍ)</option>
                        </select>
                      </div>
                    </div>

                    {/* Numeric Metric Inputs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
                      {/* Actual Spend */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                        <label className="text-[10px] font-bold text-[#8E8E85]">
                          Actual Spend (الإنفاق):
                        </label>
                        <input
                          type="number"
                          value={activeCampaign.results?.actualSpend || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              actualSpend: e.target.value
                            })
                          }
                          placeholder="ج.م"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* Impressions */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                        <label className="text-[10px] font-bold text-[#8E8E85]">
                          Impressions (الظهور):
                        </label>
                        <input
                          type="number"
                          value={activeCampaign.results?.impressions || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              impressions: e.target.value
                            })
                          }
                          placeholder="المرات"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* Reach */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                        <label className="text-[10px] font-bold text-[#8E8E85]">
                          Reach (الوصول):
                        </label>
                        <input
                          type="number"
                          value={activeCampaign.results?.reach || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              reach: e.target.value
                            })
                          }
                          placeholder="الأشخاص"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* CTR */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                        <label className="text-[10px] font-bold text-[#8E8E85]">
                          CTR (النقر %):
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.results?.ctr || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              ctr: e.target.value
                            })
                          }
                          placeholder="مثال: 2.4%"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* CPC */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                        <label className="text-[10px] font-bold text-[#8E8E85]">
                          CPC (سعر النقرة):
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.results?.cpc || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              cpc: e.target.value
                            })
                          }
                          placeholder="ج.م"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* CPM */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                        <label className="text-[10px] font-bold text-[#8E8E85]">
                          CPM (ألف ظهور):
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.results?.cpm || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              cpm: e.target.value
                            })
                          }
                          placeholder="ج.م"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* ATC */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                        <label className="text-[10px] font-bold text-[#8E8E85]">
                          ATC (إضافة للسلة):
                        </label>
                        <input
                          type="number"
                          value={activeCampaign.results?.atc || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              atc: e.target.value
                            })
                          }
                          placeholder="العدد"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* Purchases / Leads */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                        <label className="text-[10px] font-bold text-[#8E8E85]">
                          Purchases (المبيعات):
                        </label>
                        <input
                          type="number"
                          value={activeCampaign.results?.purchasesOrLeads || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              purchasesOrLeads: e.target.value
                            })
                          }
                          placeholder="العدد"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* CPA / CAC */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                        <label className="text-[10px] font-bold text-[#8E8E85]">
                          CPA (تكلفة التحويل):
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.results?.cpaOrCac || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              cpaOrCac: e.target.value
                            })
                          }
                          placeholder="ج.م / طلب"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* CVR */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                        <label className="text-[10px] font-bold text-[#8E8E85]">
                          CVR (معدل التحويل %):
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.results?.cvr || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              cvr: e.target.value
                            })
                          }
                          placeholder="مثال: 3.8%"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* ROAS */}
                      <div className="space-y-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] sm:col-span-2">
                        <label className="text-[10px] font-bold text-[#5A5A40]">
                          ROAS (العائد على الإنفاق):
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.results?.roas || ''}
                          onChange={(e) =>
                            handleUpdateCampaignResults(activeCampaign.id, {
                              roas: e.target.value
                            })
                          }
                          placeholder="مثال: 4.5X"
                          className="w-full bg-white border border-[#E5E5E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. LEARNINGS */}
                  <div className="bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center gap-2 border-b border-[#E5E5E0] pb-3">
                      <Lightbulb className="w-4 h-4 text-[#5A5A40]" />
                      <span>Learnings (الاستنتاجات من نتائج هذه الحملة)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* What Worked */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2A] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>إيه اللي اشتغل؟ (What worked):</span>
                        </label>
                        <textarea
                          rows={2}
                          value={activeCampaign.learnings?.whatWorked || ''}
                          onChange={(e) =>
                            handleUpdateCampaignLearnings(activeCampaign.id, {
                              whatWorked: e.target.value
                            })
                          }
                          placeholder="سجل النقاط الإيجابية والعوامل التي ساعدت في تحقيق نتائج جيدة..."
                          className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl p-3 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* What Didn't Work */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2A] flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>إيه اللي ما اشتغلش؟ (What didn't work):</span>
                        </label>
                        <textarea
                          rows={2}
                          value={activeCampaign.learnings?.whatDidntWork || ''}
                          onChange={(e) =>
                            handleUpdateCampaignLearnings(activeCampaign.id, {
                              whatDidntWork: e.target.value
                            })
                          }
                          placeholder="سجل العناصر التي لم تحقق الأداء المتوقع وأسباب ذلك..."
                          className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl p-3 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* Best Creative */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2A]">
                          أي Creative (كرياتيف) كان أفضل؟ (Best Creative):
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.learnings?.bestCreative || ''}
                          onChange={(e) =>
                            handleUpdateCampaignLearnings(activeCampaign.id, {
                              bestCreative: e.target.value
                            })
                          }
                          placeholder="مثال: فيديو UGC رقم 2 الذي يوضح تجربة الفتح ومميزات المنتج"
                          className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* Best Angle */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2A]">
                          أي Angle (زاوية) كانت أفضل؟ (Best Angle):
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.learnings?.bestAngle || ''}
                          onChange={(e) =>
                            handleUpdateCampaignLearnings(activeCampaign.id, {
                              bestAngle: e.target.value
                            })
                          }
                          placeholder="مثال: زاوية حل المشكلة (Problem-Solution) + الضمان"
                          className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* Best Audience */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2A]">
                          أي Audience (جمهور) كان أفضل؟ (Best Audience):
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.learnings?.bestAudience || ''}
                          onChange={(e) =>
                            handleUpdateCampaignLearnings(activeCampaign.id, {
                              bestAudience: e.target.value
                            })
                          }
                          placeholder="مثال: الجمهور العام المفتوح (Broad) مع Advantage+ Placements"
                          className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* General Insights */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2A]">
                          ملاحظات أو Insights طلعت من الحملة:
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.learnings?.insightsNotes || ''}
                          onChange={(e) =>
                            handleUpdateCampaignLearnings(activeCampaign.id, {
                              insightsNotes: e.target.value
                            })
                          }
                          placeholder="أي استنتاجات عامة بخصوص سلوك العملاء أو الأسعار أو صفحة الهبوط..."
                          className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. DECISION & NEXT STEP */}
                  <div className="bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center gap-2 border-b border-[#E5E5E0] pb-3">
                      <Award className="w-4 h-4 text-[#5A5A40]" />
                      <span>Decision & Next Step (القرار والخطوة التالية)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {/* Decision Selector */}
                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2A]">
                          Decision (القرار بعد تحليل النتائج):
                        </label>
                        <select
                          value={activeCampaign.learnings?.decision || 'Scale'}
                          onChange={(e) =>
                            handleUpdateCampaignLearnings(activeCampaign.id, {
                              decision: e.target.value
                            })
                          }
                          className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        >
                          <option value="Scale">Scale 🚀 (توسيع وزيادة الميزانية)</option>
                          <option value="Keep">Keep 🟢 (استمرار وثبات الميزانية)</option>
                          <option value="Iterate">Iterate 🔄 (تطوير وعمل نسخ جديدة)</option>
                          <option value="Retest">Retest 🧪 (إعادة الاختبار بزوايا أخرى)</option>
                          <option value="Pause">Pause ⏸️ (إيقاف الحملة)</option>
                        </select>
                      </div>

                      {/* Next Step */}
                      <div className="sm:col-span-8 space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2A]">
                          Next Step (الخطوة القادمة):
                        </label>
                        <input
                          type="text"
                          value={activeCampaign.learnings?.nextStep || ''}
                          onChange={(e) =>
                            handleUpdateCampaignLearnings(activeCampaign.id, {
                              nextStep: e.target.value
                            })
                          }
                          placeholder="مثال: نقل الزوايا الفائزة لحملة التوسيع وإنتاج 3 كرياتيفز إضافية بنفس الهوك"
                          className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campaign Switcher Navigation Footer */}
                  {campaigns.length > 1 && (
                    <div className="p-3 bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                      <span className="text-[#8E8E85] font-medium">
                        الحملة الحالية: {activeCampaign.campaignName} ({campaigns.findIndex((c) => c.id === activeCampaign.id) + 1} من {campaigns.length})
                      </span>

                      <div className="flex items-center gap-2">
                        {(() => {
                          const currentIdx = campaigns.findIndex((c) => c.id === activeCampaign.id);
                          const prevCamp = currentIdx > 0 ? campaigns[currentIdx - 1] : null;
                          const nextCamp = currentIdx < campaigns.length - 1 ? campaigns[currentIdx + 1] : null;

                          return (
                            <>
                              {prevCamp && (
                                <button
                                  type="button"
                                  onClick={() => setActiveCampaignId(prevCamp.id)}
                                  className="px-3 py-1.5 bg-white border border-[#E5E5E0] hover:bg-[#E5E5E0] text-[#2D2D2A] rounded-lg text-xs font-bold transition cursor-pointer"
                                >
                                  ← {prevCamp.campaignName}
                                </button>
                              )}
                              {nextCamp && (
                                <button
                                  type="button"
                                  onClick={() => setActiveCampaignId(nextCamp.id)}
                                  className="px-3 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-lg text-xs font-bold transition cursor-pointer"
                                >
                                  {nextCamp.campaignName} →
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Return button */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('campaigns_and_ads')}
                      className="px-4 py-2 rounded-xl font-bold text-xs text-[#2D2D2A] bg-white border border-[#E5E5E0] hover:bg-[#F5F5F0] transition cursor-pointer"
                    >
                      ← العودة لتعديل الحملات والإعلانات
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODAL FOOTER ACTIONS */}
          <div className="pt-4 border-t border-[#E5E5E0] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] sm:text-xs font-bold text-[#8E8E85] text-center sm:text-right">
              {activeTab === 'strategy' && <span>القسم 1 من 3: الاستراتيجية وتحديد الفترة</span>}
              {activeTab === 'campaigns_and_ads' && <span>القسم 2 من 3: تفصيل الحملات والمجموعات والإعلانات</span>}
              {activeTab === 'results_learnings' && <span>القسم 3 من 3: تسجيل النتائج والتعلم والقرارات</span>}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-[#2D2D2A] bg-white border border-[#E5E5E0] hover:bg-[#F5F5F0] transition cursor-pointer flex items-center justify-center"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#5A5A40] hover:bg-[#484833] transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ الاستراتيجية والخطة</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
