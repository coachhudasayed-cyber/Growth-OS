import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Download,
  ShieldAlert,
  Search,
  Calendar,
  Layers,
  Sparkles,
  Target,
  FileText,
  DollarSign,
  Award,
  TrendingUp,
  CheckCircle2,
  Filter
} from 'lucide-react';
import {
  AdsPlanItem,
  ClientAdsStageStrategy,
  UserRole,
  AdStageType
} from '../../types';
import { StrategyAndAdsPlanModal } from './ads/StrategyAndAdsPlanModal';
import { StrategyAndAdsPlanViewModal } from './ads/StrategyAndAdsPlanViewModal';

interface AdsPlanTabProps {
  adsPlans: AdsPlanItem[];
  clientAdsStrategy?: ClientAdsStageStrategy;
  clientId: string;
  brandName?: string;
  userRole: UserRole;
  onAddAdsPlanItem: (item: Omit<AdsPlanItem, 'id'>) => void;
  onUpdateAdsPlanItem: (id: string, fields: Partial<AdsPlanItem>) => void;
  onDeleteAdsPlanItem: (id: string) => void;
  onUpdateClientAdsStrategy?: (clientId: string, strategy: Partial<ClientAdsStageStrategy>) => void;
}

export const AdsPlanTab: React.FC<AdsPlanTabProps> = ({
  adsPlans,
  clientAdsStrategy,
  clientId,
  brandName,
  userRole,
  onAddAdsPlanItem,
  onUpdateAdsPlanItem,
  onDeleteAdsPlanItem,
  onUpdateClientAdsStrategy
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdsPlanItem | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<AdsPlanItem | null>(null);

  // Delete Confirmation State
  const [planToDelete, setPlanToDelete] = useState<AdsPlanItem | null>(null);

  // Security Guard Check
  if (userRole !== 'admin') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-lg font-extrabold text-rose-900">
          غير مصرح لك بالوصول إلى هذه الصفحة (Admin Only)
        </h2>
        <p className="text-xs text-rose-700">
          هذه الصفحة مخصصة فقط لمدير النظام لإدارة وتسجيل استراتيجيات وخطط الإعلانات للبراند.
        </p>
      </div>
    );
  }

  // Filter plans for current client
  const clientPlans = adsPlans.filter((a) => a.clientId === clientId);

  // Open Create New Modal (Always a fresh new entry)
  const handleOpenCreateNew = () => {
    setEditingPlan(null);
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (plan: AdsPlanItem) => {
    setEditingPlan(plan);
    setIsAddEditModalOpen(true);
  };

  // Open View Details Modal
  const handleOpenView = (plan: AdsPlanItem) => {
    setViewingPlan(plan);
    setIsViewModalOpen(true);
  };

  // Handle Save (Add or Update)
  const handleSavePlan = (planData: Partial<AdsPlanItem>) => {
    if (editingPlan) {
      onUpdateAdsPlanItem(editingPlan.id, planData);
      // Sync strategy stage if provided
      if (onUpdateClientAdsStrategy && planData.strategy?.stage) {
        onUpdateClientAdsStrategy(clientId, {
          currentStage: planData.strategy.stage,
          phaseStatus: planData.strategy.phaseStatus || 'In Progress',
          overallStrategy: planData.strategy.overallStrategy || ''
        });
      }
    } else {
      const newItemData: Omit<AdsPlanItem, 'id'> = {
        clientId,
        title: planData.title || `استراتيجية وخطة إعلانات جديدة`,
        strategy: planData.strategy,
        campaigns: planData.campaigns || [],
        startDate: planData.startDate,
        endDate: planData.endDate,
        campaignStage: planData.campaignStage || planData.strategy?.stage || 'Testing',
        campaignName: planData.campaignName || planData.title,
        platform: planData.platform || 'Meta Ads',
        objective: planData.objective || 'مبيعات مباشرة',
        campaignType: planData.campaignType || 'CBO',
        campaignBudget: planData.campaignBudget || planData.strategy?.totalBudget || 0,
        primaryKpi: planData.primaryKpi || 'ROAS & CPA',
        targetKpi: planData.targetKpi,
        testingHypothesis: planData.testingHypothesis,
        campaignStrategyNotes: planData.campaignStrategyNotes,
        status: planData.status || 'active',
        adSets: planData.adSets || [],
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddAdsPlanItem(newItemData);

      if (onUpdateClientAdsStrategy && planData.strategy?.stage) {
        onUpdateClientAdsStrategy(clientId, {
          currentStage: planData.strategy.stage,
          phaseStatus: planData.strategy.phaseStatus || 'In Progress',
          overallStrategy: planData.strategy.overallStrategy || ''
        });
      }
    }
  };

  // Handle Direct Download / Export
  const handleDownloadPlan = (plan: AdsPlanItem) => {
    const startDate = plan.strategy?.startDate || plan.startDate || 'plan';
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Ads_Plan_${plan.id}_${startDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle Delete with Confirmation
  const handleDeletePlan = (plan: AdsPlanItem) => {
    setPlanToDelete(plan);
  };

  const handleConfirmDelete = () => {
    if (planToDelete) {
      onDeleteAdsPlanItem(planToDelete.id);
      setPlanToDelete(null);
    }
  };

  // Filtered Records
  const filteredPlans = clientPlans.filter((plan) => {
    const title = plan.title || plan.campaignName || '';
    const stage = plan.strategy?.stage || plan.campaignStage || '';
    const strategyText = plan.strategy?.overallStrategy || plan.campaignStrategyNotes || '';

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      strategyText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = filterStage === 'all' || stage === filterStage;

    const status =
      plan.strategy?.phaseStatus ||
      (plan.status === 'completed' ? 'Completed' : 'In Progress');
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && status === 'Completed') ||
      (filterStatus === 'active' && status !== 'Completed');

    return matchesSearch && matchesStage && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & UNIFIED ACTION BUTTON */}
      <div className="bg-white border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-[#2D2D2A]">
                    استراتيجيات وخطط الإعلانات
                  </h1>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20">
                    {clientPlans.length} تسجيلات
                  </span>
                </div>
                <p className="text-xs text-[#8E8E85]">
                  {brandName ? `سجلات وخطط البراند: ${brandName}` : 'تسجيلات استراتيجيات وخطط الإعلانات المحددة بالتواريخ والحملات والكرياتيفز'}
                </p>
              </div>
            </div>
          </div>

          {/* UNIFIED ACTION BUTTON */}
          <button
            onClick={handleOpenCreateNew}
            className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة استراتيجية وخطة إعلانات</span>
          </button>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="mt-5 pt-4 border-t border-[#E5E5E0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8E8E85] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في التسجيلات والاستراتيجيات..."
              className="w-full min-h-[42px] bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:gap-2.5 sm:w-auto">
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="min-h-[42px] bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
            >
              <option value="all">كل المراحل</option>
              <option value="Launch">Launch</option>
              <option value="Testing">Testing</option>
              <option value="Validation">Validation</option>
              <option value="Scaling">Scaling</option>
              <option value="Retargeting">Retargeting</option>
              <option value="Creative Refresh">Creative Refresh</option>
              <option value="Optimization">Optimization</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="min-h-[42px] bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
            >
              <option value="all">كل الحالات</option>
              <option value="active">قيد التنفيذ (Active)</option>
              <option value="completed">مكتملة (Completed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. RECORDS LIST VIEW (TABLE / ROWS ONLY) */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white border border-[#E5E5E0] rounded-3xl p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-[#F9F8F6] border border-[#E5E5E0] flex items-center justify-center mx-auto text-[#8E8E85]">
            <Layers className="w-8 h-8 text-[#5A5A40]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#2D2D2A]">
              لا توجد تسجيلات لخطط واستراتيجيات الإعلانات حتى الآن
            </h3>
            <p className="text-xs text-[#8E8E85] max-w-md mx-auto">
              يمكنك إضافة أول استراتيجية وخطة إعلانية وتحديد تواريخها وإدراج الحملات والكرياتيفز من خلال الزر أعلاه.
            </p>
          </div>
          <button
            onClick={handleOpenCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة استراتيجية وخطة إعلانات جديدة</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E0] rounded-3xl shadow-2xs overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3.5 bg-[#F9F8F6] border-b border-[#E5E5E0] text-[11px] font-extrabold text-[#8E8E85] uppercase tracking-wider">
            <div className="col-span-4">تسجيل الخطة والاستراتيجية / الفترة</div>
            <div className="col-span-2 text-center">المرحلة والحالة</div>
            <div className="col-span-2 text-center">المحتوى والحملات</div>
            <div className="col-span-2 text-center">الميزانية التقديرية</div>
            <div className="col-span-2 text-center">العمليات (الإجراءات)</div>
          </div>

          {/* Records Rows */}
          <div className="divide-y divide-[#E5E5E0]">
            {filteredPlans.map((plan) => {
              const strategy = plan.strategy || {};
              const startDate = strategy.startDate || plan.startDate || 'غير محدد';
              const endDate = strategy.endDate || plan.endDate || 'غير محدد';
              const stage = strategy.stage || plan.campaignStage || 'Testing';
              const phaseStatus =
                strategy.phaseStatus ||
                (plan.status === 'completed' ? 'Completed' : 'In Progress');
              const totalBudget =
                strategy.totalBudget || plan.campaignBudget || 0;

              // Calculate counts
              const campaignsList =
                plan.campaigns && plan.campaigns.length > 0
                  ? plan.campaigns
                  : plan.campaignName
                  ? [plan]
                  : [];
              const campaignsCount = campaignsList.length;
              const adSetsCount = campaignsList.reduce(
                (sum, c) => sum + (c.adSets?.length || 0),
                0
              );
              const adsCount = campaignsList.reduce(
                (sum, c) =>
                  sum +
                  (c.adSets?.reduce((adSum, s) => adSum + (s.ads?.length || 0), 0) || 0),
                0
              );

              const recordTitle =
                plan.title ||
                plan.campaignName ||
                `خطة واستراتيجية: ${startDate} إلى ${endDate}`;

              return (
                <div key={plan.id} className="hover:bg-[#FDFCFB] transition">
                  {/* MOBILE DEDICATED CARD VIEW (< md) */}
                  <div className="md:hidden p-4 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center shrink-0">
                          <Target className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4
                            onClick={() => handleOpenView(plan)}
                            className="text-xs font-black text-[#2D2D2A] hover:text-[#5A5A40] cursor-pointer truncate"
                            title={recordTitle}
                          >
                            {recordTitle}
                          </h4>
                          <div className="text-[10px] font-bold text-[#8E8E85] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-[#5A5A40] shrink-0" />
                            <span>
                              {startDate} ← {endDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20">
                          {stage}
                        </span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                            phaseStatus === 'Completed'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {phaseStatus === 'Completed' ? 'مكتملة' : 'قيد التنفيذ'}
                        </span>
                      </div>
                    </div>

                    {/* Compact Metrics Row on Mobile */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                      <div>
                        <span className="text-[10px] text-[#8E8E85] font-bold block mb-0.5">الميزانية التقديرية</span>
                        <span className="text-xs font-black text-emerald-700">
                          {Number(totalBudget).toLocaleString()}{' '}
                          <span className="text-[9px] font-normal text-[#8E8E85]">ج.م</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8E8E85] font-bold block mb-0.5">الحملات والمجموعات</span>
                        <span className="text-xs font-black text-[#2D2D2A] flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#5A5A40] shrink-0" />
                          <span>{campaignsCount} حملات</span>
                          <span className="text-[10px] text-[#8E8E85] font-medium">({adsCount} إعلان)</span>
                        </span>
                      </div>
                    </div>

                    {/* Mobile Action Buttons Bar */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <button
                        onClick={() => handleOpenView(plan)}
                        className="col-span-2 min-h-[40px] py-2 px-3 text-[#5A5A40] bg-[#5A5A40]/10 hover:bg-[#5A5A40] hover:text-white rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span>عرض الخطة</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(plan)}
                        className="min-h-[40px] py-2 px-2 text-[#2D2D2A] bg-[#F5F5F0] hover:bg-[#E5E5E0] rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5 shrink-0" />
                        <span>تعديل</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownloadPlan(plan)}
                          className="flex-1 min-h-[40px] p-2 text-[#5A5A40] bg-[#F5F5F0] hover:bg-[#E5E5E0] rounded-xl transition cursor-pointer flex items-center justify-center"
                          title="تحميل JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan)}
                          className="flex-1 min-h-[40px] p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition cursor-pointer flex items-center justify-center"
                          title="مسح"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP TABLE ROW VIEW (md:) */}
                  <div className="hidden md:grid md:grid-cols-12 md:items-center gap-4 px-6 py-4">
                    {/* Column 1: Title & Dates */}
                    <div className="md:col-span-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center shrink-0">
                          <Target className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <h4
                            onClick={() => handleOpenView(plan)}
                            className="text-xs sm:text-sm font-extrabold text-[#2D2D2A] hover:text-[#5A5A40] cursor-pointer truncate"
                            title={recordTitle}
                          >
                            {recordTitle}
                          </h4>
                          <div className="text-[11px] font-bold text-[#8E8E85] flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3 text-[#5A5A40]" />
                            <span>
                              {startDate} ← {endDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Stage & Status */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center gap-1.5">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20">
                        {stage}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          phaseStatus === 'Completed'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {phaseStatus}
                      </span>
                    </div>

                    {/* Column 3: Campaigns & Ads Count */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center text-xs font-bold text-[#2D2D2A] gap-0.5">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Layers className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>{campaignsCount} حملات</span>
                      </div>
                      <div className="text-[10px] text-[#8E8E85]">
                        {adSetsCount} Ad Sets • {adsCount} Ads
                      </div>
                    </div>

                    {/* Column 4: Total Budget */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center">
                      <span className="text-xs sm:text-sm font-black text-emerald-700">
                        {Number(totalBudget).toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-[#8E8E85]">ج.م</span>
                      </span>
                    </div>

                    {/* Column 5: Action Buttons */}
                    <div className="md:col-span-2 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenView(plan)}
                        className="p-2 text-[#5A5A40] bg-[#5A5A40]/10 hover:bg-[#5A5A40] hover:text-white rounded-xl transition cursor-pointer"
                        title="عرض التفاصيل الكاملة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(plan)}
                        className="p-2 text-[#2D2D2A] bg-[#F5F5F0] hover:bg-[#E5E5E0] rounded-xl transition cursor-pointer"
                        title="تعديل الاستراتيجية والخطة"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDownloadPlan(plan)}
                        className="p-2 text-[#2D2D2A] bg-[#F5F5F0] hover:bg-[#E5E5E0] rounded-xl transition cursor-pointer"
                        title="تحميل وتصدير الخطة"
                      >
                        <Download className="w-4 h-4 text-[#5A5A40]" />
                      </button>

                      <button
                        onClick={() => handleDeletePlan(plan)}
                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition cursor-pointer"
                        title="مسح التسجيل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CREATE & EDIT UNIFIED MODAL */}
      <StrategyAndAdsPlanModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        clientId={clientId}
        brandName={brandName}
        initialData={editingPlan}
        onSave={handleSavePlan}
      />

      {/* 4. VIEW & PRINT FULL DETAILS MODAL */}
      <StrategyAndAdsPlanViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        plan={viewingPlan}
        brandName={brandName}
        onEdit={(plan) => {
          setIsViewModalOpen(false);
          handleOpenEdit(plan);
        }}
        onDelete={(plan) => {
          setIsViewModalOpen(false);
          setPlanToDelete(plan);
        }}
      />

      {/* 5. DELETE CONFIRMATION MODAL */}
      {planToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#2D2D2A]">تأكيد مسح الخطة والاستراتيجية</h3>
                <p className="text-xs text-[#8E8E85]">هل أنت متأكد من حذف هذا السجل نهائياً؟ لا يمكن التراجع بعد الحذف.</p>
              </div>
            </div>

            <div className="bg-[#F9F8F6] border border-[#E5E5E0] p-3 rounded-2xl text-xs space-y-1">
              <div className="font-extrabold text-[#2D2D2A]">
                {planToDelete.title || planToDelete.campaignName || 'خطة إعلانات'}
              </div>
              <div className="text-[11px] text-[#8E8E85]">
                الفترة: {planToDelete.strategy?.startDate || planToDelete.startDate || '-'} ← {planToDelete.strategy?.endDate || planToDelete.endDate || '-'}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                نعم، تأكيد الحذف
              </button>
              <button
                onClick={() => setPlanToDelete(null)}
                className="px-5 bg-[#F9F8F6] hover:bg-[#E5E5E0] border border-[#E5E5E0] text-[#2D2D2A] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

