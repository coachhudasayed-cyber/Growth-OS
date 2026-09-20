import React, { useState } from 'react';
import {
  CalendarRange,
  PieChart,
  Layers,
  Sparkles,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  Plus,
  Edit2,
  Trash2,
  Download,
  Loader2,
  Eye,
  Clock,
  Target,
  Lightbulb,
  FileText,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { QuarterlyReport, UserRole } from '../../types';
import { QuarterlyReportModal } from './QuarterlyReportModal';
import { QuarterlyReportViewModal } from './QuarterlyReportViewModal';
import { ReportFilterBar, DatePreset, getDateRangeFromPreset } from '../ReportFilterBar';

interface QuarterlyReportsSubTabProps {
  quarterlyReports?: QuarterlyReport[];
  clientId: string;
  brandName?: string;
  userRole?: UserRole;
  onAddQuarterlyReport?: (rep: Omit<QuarterlyReport, 'id' | 'createdAt'>) => void;
  onUpdateQuarterlyReport?: (id: string, fields: Partial<QuarterlyReport>) => void;
  onDeleteQuarterlyReport?: (id: string) => void;
}

export const QuarterlyReportsSubTab: React.FC<QuarterlyReportsSubTabProps> = ({
  quarterlyReports = [],
  clientId,
  brandName,
  userRole,
  onAddQuarterlyReport,
  onUpdateQuarterlyReport,
  onDeleteQuarterlyReport
}) => {
  const clientQuarterlyReps = quarterlyReports
    .filter((r) => r.clientId === clientId)
    .sort((a, b) => (b.quarter || '').localeCompare(a.quarter || ''));

  // Modals state
  const [showQuarterlyModal, setShowQuarterlyModal] = useState(false);
  const [editingQuarterlyReport, setEditingQuarterlyReport] = useState<QuarterlyReport | null>(null);
  const [viewingQuarterlyReport, setViewingQuarterlyReport] = useState<QuarterlyReport | null>(null);
  const [deletingQuarterlyId, setDeletingQuarterlyId] = useState<string | null>(null);
  const [exportingQuarterlyId, setExportingQuarterlyId] = useState<string | null>(null);

  // Search & Date filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Filter by year if multiple
  const years = Array.from(new Set(clientQuarterlyReps.map((r) => r.year || new Date().getFullYear()))).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  const filteredReports = clientQuarterlyReps.filter((r) => {
    if (selectedYear !== 'all' && (r.year || new Date().getFullYear()) !== selectedYear) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      const matchQuarter = (r.quarter || '').toLowerCase().includes(q);
      const matchYear = String(r.year || '').includes(q);
      const matchM1 = (r.month1Name || '').toLowerCase().includes(q);
      const matchM2 = (r.month2Name || '').toLowerCase().includes(q);
      const matchM3 = (r.month3Name || '').toLowerCase().includes(q);
      const matchGoal = (r.mainGoal || '').toLowerCase().includes(q);
      const matchSummary = (r.quarterlyGrowthSummary || '').toLowerCase().includes(q);
      const matchWin = (r.biggestWin || '').toLowerCase().includes(q);
      if (!matchTitle && !matchQuarter && !matchYear && !matchM1 && !matchM2 && !matchM3 && !matchGoal && !matchSummary && !matchWin) {
        return false;
      }
    }

    if (startDateFilter) {
      const repDate = r.endDate || r.startDate || (r.year ? `${r.year}-12-31` : '');
      if (repDate && repDate < startDateFilter) return false;
    }
    if (endDateFilter) {
      const repDate = r.startDate || (r.year ? `${r.year}-01-01` : '');
      if (repDate && repDate > endDateFilter) return false;
    }

    return true;
  });

  const handleExportPDF = async (rep: QuarterlyReport) => {
    setExportingQuarterlyId(rep.id);
    try {
      const { exportQuarterlyReportToPDF } = await import('../../utils/pdfExporter');
      await exportQuarterlyReportToPDF(rep, brandName);
    } catch (err) {
      console.error('PDF Export error:', err);
    } finally {
      setExportingQuarterlyId(null);
    }
  };

  const handleFormSubmit = (data: Omit<QuarterlyReport, 'id' | 'createdAt'>) => {
    if (editingQuarterlyReport && onUpdateQuarterlyReport) {
      onUpdateQuarterlyReport(editingQuarterlyReport.id, data);
    } else if (onAddQuarterlyReport) {
      onAddQuarterlyReport(data);
    }
    setShowQuarterlyModal(false);
    setEditingQuarterlyReport(null);
  };

  const confirmDelete = () => {
    if (deletingQuarterlyId && onDeleteQuarterlyReport) {
      onDeleteQuarterlyReport(deletingQuarterlyId);
      setDeletingQuarterlyId(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Top Header Card */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white border border-[#E5E5E0] rounded-xl text-[#5A5A40] shadow-2xs">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#2D2D2A]">
                التقارير الربع سنوية (Quarterly Growth Reviews)
              </h3>
              <span className="px-2 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] font-extrabold rounded-full">
                {clientQuarterlyReps.length} تقارير
              </span>
            </div>
            <p className="text-xs text-[#8E8E85] mt-0.5">
              توثيق الأداء الفصلي والربع سنوي، مقارنة الـ QoQ، وتحليل خطط الـ 90 يوماً
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {userRole !== 'client' && onAddQuarterlyReport && (
            <button
              type="button"
              onClick={() => {
                setEditingQuarterlyReport(null);
                setShowQuarterlyModal(true);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تقرير ربع سنوي جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Year Filter Tabs if multiple years exist */}
      {years.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              selectedYear === 'all'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'bg-white border border-[#E5E5E0] text-[#8E8E85] hover:text-[#2D2D2A]'
            }`}
          >
            جميع السنوات ({clientQuarterlyReps.length})
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                selectedYear === y
                  ? 'bg-[#5A5A40] text-white shadow-2xs'
                  : 'bg-white border border-[#E5E5E0] text-[#8E8E85] hover:text-[#2D2D2A]'
              }`}
            >
              سنة {y}
            </button>
          ))}
        </div>
      )}

      {/* Quarterly Reports List */}
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
        placeholder="ابحث باسم التقرير، الربع، الأهداف، أو استراتيجية الـ 90 يوماً..."
        totalCount={clientQuarterlyReps.length}
        filteredCount={filteredReports.length}
      />

      {filteredReports.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#E5E5E0] rounded-3xl p-10 sm:p-14 text-center space-y-3">
          <div className="w-14 h-14 bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl flex items-center justify-center mx-auto text-[#5A5A40] shadow-xs">
            <Layers className="w-7 h-7" />
          </div>
          <h4 className="text-base font-extrabold text-[#2D2D2A]">
            {clientQuarterlyReps.length === 0
              ? 'لا توجد تقارير ربع سنوية مسجلة بعد'
              : 'لا توجد تقارير ربع سنوية تطابق معايير البحث والفلترة'}
          </h4>
          <p className="text-xs text-[#8E8E85] max-w-md mx-auto leading-relaxed">
            {clientQuarterlyReps.length === 0
              ? 'يمكنك إنشاء التقرير الربع سنوي الاستراتيجي لمتابعة نمو البراند وتطور خطط الـ 90 يوماً والنتائج المالية.'
              : 'جرب تغيير مصطلح البحث أو اختيار فترة زمنية مختلفة في الفلتر أعلاه.'}
          </p>
          {userRole !== 'client' && onAddQuarterlyReport && clientQuarterlyReps.length === 0 && (
            <button
              type="button"
              onClick={() => {
                setEditingQuarterlyReport(null);
                setShowQuarterlyModal(true);
              }}
              className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-2xl text-xs font-extrabold transition inline-flex items-center gap-2 cursor-pointer shadow-xs mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل أول تقرير ربع سنوي</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((qRep) => {
            return (
              <div
                key={qRep.id}
                className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-4 sm:p-5 hover:border-[#5A5A40]/40 transition space-y-3.5 sm:space-y-4 shadow-xs"
              >
                {/* Header Row: Quarter Title + Months + Dates + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E0]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-white border border-[#E5E5E0] rounded-2xl text-[#5A5A40] shadow-2xs shrink-0">
                      <CalendarRange className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-[#2D2D2A]">
                          {qRep.title || qRep.quarter}
                        </h4>
                        <span className="px-2 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                          {qRep.month1Name && qRep.month3Name ? `${qRep.month1Name} - ${qRep.month3Name}` : 'Quarterly Report'}
                        </span>
                        {qRep.year && (
                          <span className="text-xs font-bold text-[#8E8E85]">
                            ({qRep.year})
                          </span>
                        )}
                      </div>
                      {(qRep.startDate || qRep.endDate) && (
                        <p className="text-xs text-[#8E8E85] mt-0.5 font-bold">
                          الفترة: {qRep.startDate || ''} {qRep.endDate ? `إلى ${qRep.endDate}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar - Icons only */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#E5E5E0] pt-2.5 sm:pt-0">
                    {/* View Report */}
                    <button
                      type="button"
                      onClick={() => setViewingQuarterlyReport(qRep)}
                      title="عرض التقرير"
                      aria-label="عرض التقرير"
                      className="p-2 sm:p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* PDF Export */}
                    <button
                      type="button"
                      onClick={() => handleExportPDF(qRep)}
                      disabled={exportingQuarterlyId === qRep.id}
                      title="تحميل التقرير PDF"
                      aria-label="تحميل التقرير PDF"
                      className="p-2 sm:p-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      {exportingQuarterlyId === qRep.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Download className="w-4 h-4 text-white" />
                      )}
                    </button>

                    {/* Edit */}
                    {userRole !== 'client' && onUpdateQuarterlyReport && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuarterlyReport(qRep);
                          setShowQuarterlyModal(true);
                        }}
                        title="تعديل التقرير"
                        aria-label="تعديل التقرير"
                        className="p-2 sm:p-1.5 bg-white hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5E0] rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        <Edit2 className="w-4 h-4 text-[#5A5A40]" />
                      </button>
                    )}

                    {/* Delete */}
                    {userRole !== 'client' && onDeleteQuarterlyReport && (
                      <button
                        type="button"
                        onClick={() => setDeletingQuarterlyId(qRep.id)}
                        title="حذف التقرير"
                        aria-label="حذف التقرير"
                        className="p-2 sm:p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Highlights Strip */}
                {(qRep.mainGoal || qRep.topPerformingCampaigns || qRep.biggestWin || qRep.quarterlyGrowthSummary) && (
                  <div className="space-y-2 pt-1">
                    {(qRep.mainGoal || qRep.topPerformingCampaigns || qRep.biggestWin) && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        {qRep.mainGoal && (
                          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl px-3 py-2 text-amber-950 font-bold flex items-center gap-2">
                            <Target className="w-4 h-4 text-amber-700 shrink-0" />
                            <span className="truncate">الهدف: {qRep.mainGoal}</span>
                          </div>
                        )}
                        {qRep.topPerformingCampaigns && (
                          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-3 py-2 text-emerald-950 font-bold flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span className="truncate">أفضل الحملات: {qRep.topPerformingCampaigns}</span>
                          </div>
                        )}
                        {qRep.biggestWin && (
                          <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl px-3 py-2 text-purple-950 font-bold flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-purple-700 shrink-0" />
                            <span className="truncate">أكبر نجاح: {qRep.biggestWin}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {qRep.quarterlyGrowthSummary && (
                      <div className="bg-purple-50/50 border border-purple-200/70 rounded-xl p-2.5 text-xs text-purple-950 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-extrabold text-purple-900 block text-[11px] mb-0.5">
                            ملخص النمو الفصلي (Quarterly Growth Summary):
                          </span>
                          <p className="line-clamp-2 text-purple-950 text-[11px] leading-relaxed font-medium">
                            {qRep.quarterlyGrowthSummary}
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

      {/* Quarterly Modal (Add / Edit) */}
      {showQuarterlyModal && (
        <QuarterlyReportModal
          isOpen={showQuarterlyModal}
          onClose={() => {
            setShowQuarterlyModal(false);
            setEditingQuarterlyReport(null);
          }}
          onSubmit={handleFormSubmit}
          editingReport={editingQuarterlyReport}
          brandName={brandName}
          clientId={clientId}
        />
      )}

      {/* Quarterly View Modal */}
      {viewingQuarterlyReport && (
        <QuarterlyReportViewModal
          isOpen={!!viewingQuarterlyReport}
          onClose={() => setViewingQuarterlyReport(null)}
          report={viewingQuarterlyReport}
          brandName={brandName}
        />
      )}

      {/* Delete Confirmation Modal for Quarterly Report */}
      {deletingQuarterlyId && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#2D2D2A]">تأكيد حذف التقرير الربع سنوي</h3>
                <p className="text-xs text-[#8E8E85]">هل أنت متأكد من رغبتك في حذف هذا التقرير؟</p>
              </div>
            </div>

            <p className="text-xs text-[#78786E] bg-rose-50 border border-rose-200 p-3 rounded-xl leading-relaxed font-medium">
              سيتم حذف التقرير الربع سنوي وبياناته نهائياً من السيستم.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQuarterlyId(null)}
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
    </div>
  );
};
