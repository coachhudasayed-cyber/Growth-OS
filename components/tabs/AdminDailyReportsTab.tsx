import React, { useState } from 'react';
import {
  UserCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Calendar,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  X,
  Edit2,
  AlertCircle,
  TrendingUp,
  Paperclip,
  Check,
  Download
} from 'lucide-react';
import { AdminDailyReport, BudgetAlarm, UserRole, AttachedReportFile } from '../../types';
import { formatLocalDate } from '../../lib/dateUtils';

interface AdminDailyReportsTabProps {
  reports: AdminDailyReport[];
  clientId: string;
  userRole: UserRole;
  budgetAlarms?: BudgetAlarm[];
  onAddReport: (rep: Omit<AdminDailyReport, 'id'>) => void;
  onUpdateReport?: (id: string, fields: Partial<AdminDailyReport>) => void;
  onDeleteReport?: (id: string) => void;
}

export const AdminDailyReportsTab: React.FC<AdminDailyReportsTabProps> = ({
  reports,
  clientId,
  userRole,
  budgetAlarms = [],
  onAddReport,
  onUpdateReport,
  onDeleteReport
}) => {
  // Security Guard Check
  if (userRole !== 'admin' && userRole !== 'employee') {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-8 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-lg font-extrabold text-rose-900">
          غير مصرح لك بالوصول إلى هذه الصفحة (Internal Team & Admin Only)
        </h2>
        <p className="text-xs text-rose-700">
          هذه الصفحة مخصصة لفريق العمل والأدمن لتسجيل تقارير الفحص اليومي وتعديلات الحملات.
        </p>
      </div>
    );
  }

  const clientAdminReps = reports.filter((r) => r.clientId === clientId);

  // Registered campaigns from Ads Budget for this client
  const clientBudgetCampaigns = budgetAlarms
    .filter((b) => b.clientId === clientId)
    .map((b) => b.campaignName || `${b.platform || 'حملة'} - ${b.brandName}`)
    .filter(Boolean);

  // Deduplicate campaign names
  const availableCampaignOptions = Array.from(new Set(clientBudgetCampaigns));

  const todayStr = formatLocalDate();

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState<AdminDailyReport | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);

  // Form Fields
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [customCampaignInput, setCustomCampaignInput] = useState('');
  const [date, setDate] = useState(todayStr);
  const [quickEvaluation, setQuickEvaluation] = useState<'🟢 ممتاز' | '🟡 طبيعي' | '🟠 محتاج متابعة' | '🔴 سيئ'>('🟢 ممتاز');
  const [mainNotes, setMainNotes] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedReportFile[]>([]);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingReport(null);
    // Pre-select first campaign or all if available
    setSelectedCampaigns(availableCampaignOptions.length > 0 ? [availableCampaignOptions[0]] : []);
    setCustomCampaignInput('');
    setDate(formatLocalDate()); // Default to today but editable
    setQuickEvaluation('🟢 ممتاز');
    setMainNotes('');
    setAttachedFiles([]);
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (rep: AdminDailyReport) => {
    setEditingReport(rep);
    setSelectedCampaigns(rep.campaigns || []);
    setCustomCampaignInput('');
    setDate(rep.date || todayStr);
    setQuickEvaluation((rep.quickEvaluation as any) || '🟢 ممتاز');
    setMainNotes(rep.mainNotes || rep.mediaBuyerNotes || '');
    setAttachedFiles(rep.attachedFiles || []);
    setShowModal(true);
  };

  // Toggle Campaign Selection
  const handleToggleCampaign = (camp: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(camp) ? prev.filter((c) => c !== camp) : [...prev, camp]
    );
  };

  // Handle Excel File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newFile: AttachedReportFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type || 'excel',
          dataUrl
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  // Remove File Attachment
  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final campaign list
    let finalCampaigns = [...selectedCampaigns];
    if (customCampaignInput.trim()) {
      finalCampaigns.push(customCampaignInput.trim());
    }
    if (finalCampaigns.length === 0) {
      finalCampaigns = ['حملة عامة'];
    }

    if (editingReport && onUpdateReport) {
      onUpdateReport(editingReport.id, {
        campaigns: finalCampaigns,
        date,
        quickEvaluation,
        mainNotes: mainNotes.trim(),
        mediaBuyerNotes: mainNotes.trim(),
        attachedFiles
      });
    } else {
      onAddReport({
        clientId,
        date,
        campaigns: finalCampaigns,
        quickEvaluation,
        mainNotes: mainNotes.trim(),
        mediaBuyerNotes: mainNotes.trim(),
        tasksDone: '',
        optimizationsPerformed: '',
        attachedFiles
      });
    }

    setShowModal(false);
  };

  // Delete Report Confirmation
  const confirmDelete = () => {
    if (deletingReportId && onDeleteReport) {
      onDeleteReport(deletingReportId);
      setDeletingReportId(null);
    }
  };

  // Get Evaluation Badge Style
  const getEvaluationStyle = (evalStr?: string) => {
    if (!evalStr) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (evalStr.includes('ممتاز')) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    if (evalStr.includes('طبيعي')) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (evalStr.includes('متابعة')) return 'bg-orange-100 text-orange-900 border-orange-300';
    if (evalStr.includes('سيئ')) return 'bg-rose-100 text-rose-900 border-rose-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-[#E07A48]/15 text-[#C8662B] border border-[#E07A48]/30 rounded-full text-[10px] font-extrabold">
              خاص بفريق العمل والأدمن (Team & Admin)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#2D2D2A] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#E07A48]" />
            <span>Admin Daily Reports (التقارير اليومية للفريق والأدمن)</span>
          </h2>
          <p className="text-xs text-[#8E8E85] mt-1">
            تسجيل تقارير الحملات، ملحقات ملفات الاكسل، التقييم السريع، والملاحظات اليومية.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold rounded-2xl text-xs transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تقرير فني جديد</span>
        </button>
      </div>

      {/* REPORTS LIST */}
      <div className="space-y-4">
        {clientAdminReps.length === 0 ? (
          <div className="text-center py-12 bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl text-[#8E8E85] text-xs">
            لا توجد تقارير فنية يومية مسجلة لهذا البراند بعد. اضغط زر "إضافة تقرير فني جديد" أعلاه 📊
          </div>
        ) : (
          clientAdminReps.map((rep) => {
            const evalStyle = getEvaluationStyle(rep.quickEvaluation);
            return (
              <div
                key={rep.id}
                className="bg-[#F9F8F6] border border-[#E5E5E0] hover:border-[#5A5A40]/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E0] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-[#5A5A40] bg-[#5A5A40]/10 border border-[#5A5A40]/20 px-3 py-1 rounded-full font-bold">
                      📅 {rep.date}
                    </span>

                    {/* Quick Evaluation Badge */}
                    {rep.quickEvaluation && (
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${evalStyle}`}>
                        التقييم: {rep.quickEvaluation}
                      </span>
                    )}
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(rep)}
                      title="تعديل التقرير"
                      className="p-2 bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] border border-[#E5E5E0] rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 text-[#8E8E85]" />
                    </button>
                    {onDeleteReport && (
                      <button
                        onClick={() => setDeletingReportId(rep.id)}
                        title="حذف التقرير"
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition inline-flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Selected Campaigns Badges */}
                {rep.campaigns && rep.campaigns.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#8E8E85] block">الحملات المشمولة في التقرير:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {rep.campaigns.map((camp, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-extrabold text-xs rounded-xl shadow-2xs inline-flex items-center gap-1.5"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-[#5A5A40]" />
                          <span>{camp}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Notes & Observations */}
                {(rep.mainNotes || rep.mediaBuyerNotes) && (
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-1">
                    <span className="font-bold text-[#2D2D2A] text-xs flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#E07A48]" />
                      <span>أهم الملاحظات والتعديلات والمشاكل اليومية:</span>
                    </span>
                    <p className="text-xs text-[#2D2D2A] leading-relaxed whitespace-pre-line pt-1">
                      {rep.mainNotes || rep.mediaBuyerNotes}
                    </p>
                  </div>
                )}

                {/* Legacy Tasks & Optimizations if exist */}
                {(rep.tasksDone || rep.optimizationsPerformed) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {rep.tasksDone && (
                      <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="font-bold text-[#5A5A40] block">المهام المنجزة:</span>
                        <p className="text-[#2D2D2A]">{rep.tasksDone}</p>
                      </div>
                    )}
                    {rep.optimizationsPerformed && (
                      <div className="bg-white p-3 rounded-2xl border border-[#E5E5E0] space-y-1">
                        <span className="font-bold text-[#5A5A40] block">تحسينات الحملات:</span>
                        <p className="text-[#2D2D2A]">{rep.optimizationsPerformed}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Attached Excel Files */}
                {rep.attachedFiles && rep.attachedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[#8E8E85] flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>الملفات المرفقة (نتائج اكسل):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rep.attachedFiles.map((file) => (
                        <a
                          key={file.id}
                          href={file.dataUrl || '#'}
                          download={file.name}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                          <span className="truncate max-w-[200px]">{file.name}</span>
                          {file.size && <span className="text-[10px] text-emerald-700 opacity-80">({file.size})</span>}
                          <Download className="w-3.5 h-3.5 text-emerald-700 mr-1" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 shrink-0">
              <h3 className="font-extrabold text-[#2D2D2A] text-sm sm:text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#E07A48]" />
                <span>{editingReport ? 'تعديل التقرير الفني' : 'إضافة تقرير فني جديد'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] rounded-xl hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="adminReportForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4 text-xs pr-1 pl-1 my-1">
              {/* 1. الحملة (Campaign Dropdown/Multi-select) */}
              <div className="space-y-2">
                <label className="block text-[#2D2D2A] font-extrabold text-xs">
                  1️⃣ اختر الحملة (من الحملات المسجلة في Ads Budget تلقائياً) *
                </label>

                {availableCampaignOptions.length > 0 ? (
                  <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-2">
                    <p className="text-[11px] text-[#8E8E85] font-semibold">
                      تحديد متعدد للحملات النشطة:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {availableCampaignOptions.map((campOption) => {
                        const isChecked = selectedCampaigns.includes(campOption);
                        return (
                          <label
                            key={campOption}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                              isChecked
                                ? 'bg-[#5A5A40]/10 border-[#5A5A40] text-[#2D2D2A] font-extrabold'
                                : 'bg-[#F9F8F6] border-[#E5E5E0] text-[#8E8E85] hover:border-[#5A5A40]/40'
                            }`}
                            onClick={() => handleToggleCampaign(campOption)}
                          >
                            <span className="text-xs truncate">{campOption}</span>
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isChecked ? 'bg-[#5A5A40] border-[#5A5A40] text-white' : 'border-[#E5E5E0]'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                    لم يتم تسجيل حملات سابقة في Ads Budget لهذا البراند. يمكنك كتابة اسم الحملة مباشرة أدناه:
                  </div>
                )}

                {/* Optional Custom Campaign input */}
                <div>
                  <input
                    type="text"
                    value={customCampaignInput}
                    onChange={(e) => setCustomCampaignInput(e.target.value)}
                    placeholder="أو اكتب اسم حملة إضافية يدويًا..."
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              {/* 2. التاريخ (Date - Manual selection) */}
              <div>
                <label className="block text-[#2D2D2A] font-extrabold text-xs mb-1">
                  2️⃣ التاريخ (متسجل يدوياً) *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                  required
                />
              </div>

              {/* 3. File upload (Excel file for campaign results) */}
              <div className="space-y-2">
                <label className="block text-[#2D2D2A] font-extrabold text-xs">
                  3️⃣ رفع نتائج الحملات (ملفات Excel)
                </label>

                <div className="border-2 border-dashed border-[#5A5A40]/30 hover:border-[#5A5A40] bg-white p-4 rounded-2xl text-center transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="w-7 h-7 text-[#5A5A40] mx-auto mb-1" />
                  <p className="font-extrabold text-xs text-[#2D2D2A]">
                    اضغط لرفع ملف اكسل (.xlsx, .xls) أو اسحب الملفات هنا
                  </p>
                  <p className="text-[10px] text-[#8E8E85] mt-0.5">
                    يمكنك رفع أكثر من ملف ونتاجها ستُحفظ مع التقرير
                  </p>
                </div>

                {/* List of Uploaded Files */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[#2D2D2A] block">
                      الملفات المرفقة ({attachedFiles.length}):
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {attachedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-2.5 bg-white border border-emerald-200 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span className="font-bold text-[#2D2D2A] truncate">{file.name}</span>
                            {file.size && <span className="text-[10px] text-[#8E8E85]">({file.size})</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer shrink-0"
                            title="حذف الملف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. تقييم سريع (Quick Evaluation Dropdown) */}
              <div>
                <label className="block text-[#2D2D2A] font-extrabold text-xs mb-1">
                  4️⃣ تقييم سريع للحملة
                </label>
                <select
                  value={quickEvaluation}
                  onChange={(e) => setQuickEvaluation(e.target.value as any)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] font-bold outline-none cursor-pointer focus:border-[#5A5A40]"
                >
                  <option value="🟢 ممتاز">🟢 ممتاز</option>
                  <option value="🟡 طبيعي">🟡 طبيعي</option>
                  <option value="🟠 محتاج متابعة">🟠 محتاج متابعة</option>
                  <option value="🔴 سيئ">🔴 سيئ</option>
                </select>
              </div>

              {/* 5. أهم ملاحظة او تعديلات او مشاكل النهاردة */}
              <div>
                <label className="block text-[#2D2D2A] font-extrabold text-xs mb-1">
                  5️⃣ أهم ملاحظة او تعديلات او مشاكل النهاردة *
                </label>
                <textarea
                  value={mainNotes}
                  onChange={(e) => setMainNotes(e.target.value)}
                  rows={3}
                  placeholder="اكتب أهم الملاحظات، التعديلات المنفذة اليوم على الإعلانات، أو المشاكل التقنية التي واجهتك..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-3 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                  required
                />
              </div>
            </form>

            <div className="pt-3 border-t border-[#E5E5E0] flex gap-3 shrink-0">
              <button
                type="submit"
                form="adminReportForm"
                className="flex-1 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingReport ? 'حفظ التعديلات' : 'حفظ التقرير الفني'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#F5F5F0] cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingReportId && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2D2D2A] text-base">تأكيد الحذف</h3>
              <p className="text-xs text-[#8E8E85] mt-1">
                هل أنت تأكد من رغبتك في حذف هذا التقرير الفني بشكل نهائي؟
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                نعم، تأكيد الحذف
              </button>
              <button
                onClick={() => setDeletingReportId(null)}
                className="px-4 bg-[#F9F8F6] hover:bg-[#E5E5E0] border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs transition cursor-pointer"
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
