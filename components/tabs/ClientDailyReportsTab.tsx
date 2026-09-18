import { useSupabaseSetting } from '../../lib/useSupabaseSetting';
import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Calendar,
  DollarSign,
  ShoppingBag,
  Eye,
  X,
  XCircle,
  HelpCircle,
  AlertCircle,
  Box,
  Truck,
  Tag,
  CheckCircle2,
  Edit2,
  Trash2,
  Clock,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Type,
  AlignLeft,
  Hash,
  Sparkles,
  FileText
} from 'lucide-react';
import {
  ClientDailyReport,
  DailyReportQuestion,
  ClientDailyReportQuestionAnswer,
  UserRole
} from '../../types';
import { ReportFilterBar, DatePreset, getDateRangeFromPreset } from '../ReportFilterBar';

interface ClientDailyReportsTabProps {
  reports: ClientDailyReport[];
  clientId: string;
  userRole?: UserRole;
  onAddReport: (rep: Omit<ClientDailyReport, 'id'>) => void;
  onUpdateReport?: (id: string, fields: Partial<ClientDailyReport>) => void;
  onDeleteReport?: (id: string) => void;
}

// Default 10 Standard Questions
export const DEFAULT_DAILY_REPORT_QUESTIONS: DailyReportQuestion[] = [
  {
    id: 'q-orders',
    label: '1. عدد أوردرات النهاردة و كام أوردر لكل منتج؟ و من انهي منصة؟',
    placeholder: 'مثال: 15 أوردر (10 سماعة بلوتوث، 5 كفر حماية)...',
    type: 'textarea',
    required: true,
    standardKey: 'ordersCount'
  },
  {
    id: 'q-sales',
    label: '2. إجمالي قيمة المبيعات (جنيه)',
    placeholder: 'مثال: 18400',
    type: 'number',
    required: true,
    standardKey: 'salesAmount'
  },
  {
    id: 'q-cancelled',
    label: '3. عدد الأوردرات الملغية:',
    placeholder: 'مثال: 2',
    type: 'number',
    required: false,
    standardKey: 'cancelledOrdersCount'
  },
  {
    id: 'q-cancel-reason',
    label: '4. سبب الإلغاء الأكثر تكرارًا:',
    placeholder: 'مثال: تأخير ميعاد التسليم، ارتفاع مصاريف الشحن...',
    type: 'text',
    required: false,
    standardKey: 'cancellationReason'
  },
  {
    id: 'q-common-questions',
    label: '5. أكتر سؤال اتكرر النهارده او طلبات معينة من العملاء:',
    placeholder: 'السؤال عن مدة الضمان، المعاينة عند الاستلام...',
    type: 'textarea',
    required: false,
    standardKey: 'commonQuestions'
  },
  {
    id: 'q-objections',
    label: '6. أكتر اعتراضات من العملاء:',
    placeholder: 'اعتراض على السعر، عدم دعم الدفع الإلكتروني...',
    type: 'textarea',
    required: false,
    standardKey: 'customerObjections'
  },
  {
    id: 'q-inventory',
    label: '7. هل فيه مشكلة في المخزون او فيه منتج معين قرب يخلص؟',
    placeholder: 'تحديد المنتجات التي أوشكت على النفاد والمخزون...',
    type: 'textarea',
    required: false,
    standardKey: 'inventoryIssues'
  },
  {
    id: 'q-shipping',
    label: '8. هل فيه مشكلة في الشحن أو التشغيل او اي حاجة واجهتكوا النهاردة؟',
    placeholder: 'ملاحظات حول شركات الشحن، التأخير، مشاكل تقنية...',
    type: 'textarea',
    required: false,
    standardKey: 'shippingOperationalIssues'
  },
  {
    id: 'q-updates',
    label: '9. هل فيه اي تعديلات في المنتجات او الاسعار او العروض تمت جديدة؟',
    placeholder: 'إضافة منتج جديد، تحديث قائمة الأسعار، خصومات جديدة...',
    type: 'textarea',
    required: false,
    standardKey: 'updatesOrOffers'
  },
  {
    id: 'q-returns',
    label: '10. عدد المرتجعات اليوم؟ و نوعها و سبب الإسترجاع؟:',
    placeholder: 'مثال: 2 مرتجع (1 مقاس غير مناسب، 1 استبدال لون)... أو: لا توجد مرتجعات اليوم',
    type: 'textarea',
    required: false,
    standardKey: 'returnsCountAndType'
  },
  {
    id: 'q-notes',
    label: '11. ملاحظات اليوم:',
    placeholder: 'اكتب أي ملاحظات أو تفاصيل إضافية عن أداء اليوم...',
    type: 'textarea',
    required: false,
    standardKey: 'notes'
  }
];

export const ClientDailyReportsTab: React.FC<ClientDailyReportsTabProps> = ({
  reports,
  clientId,
  userRole,
  onAddReport,
  onUpdateReport,
  onDeleteReport
}) => {
  const clientReps = reports
    .filter((r) => r.clientId === clientId)
    .sort((a, b) => b.date.localeCompare(a.date));

  // --- Questions Template Management ---
  const storageKey = `client_daily_report_questions_${clientId}`;

  const [questions, setQuestions] = useSupabaseSetting<DailyReportQuestion[]>(
    storageKey, clientId, DEFAULT_DAILY_REPORT_QUESTIONS, userRole !== 'client'
  );

  const saveQuestions = (newQuestions: DailyReportQuestion[]) => setQuestions(newQuestions);

  React.useEffect(() => {
    const notes = DEFAULT_DAILY_REPORT_QUESTIONS.find(question => question.id === 'q-notes');
    if (notes && !questions.some(question =>
      question.id === 'q-notes' || question.standardKey === 'notes' || question.label?.includes('ملاحظات اليوم')
    )) {
      setQuestions(current => [...current, notes]);
    }
  }, [questions]);

  // Reset questions to default
  const handleResetQuestionsToDefault = () => {
    saveQuestions(DEFAULT_DAILY_REPORT_QUESTIONS);
    setConfirmAction(null);
  };

  // --- Modal States ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ClientDailyReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<ClientDailyReport | null>(null);

  // Question editing / adding modal
  const [editingQuestion, setEditingQuestion] = useState<DailyReportQuestion | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [questionFormData, setQuestionFormData] = useState<Partial<DailyReportQuestion>>({
    label: '',
    placeholder: '',
    type: 'textarea',
    required: false
  });

  // Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deleteReport' | 'deleteQuestion' | 'resetQuestions';
    id?: string;
    title: string;
    description?: string;
  } | null>(null);

  // Form Fields State (Dynamic Answers Map + Date)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [answersMap, setAnswersMap] = useState<Record<string, string | number>>({});

  // Search & Date Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const filteredReports = clientReps.filter((rep) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchDate = (rep.date || '').toLowerCase().includes(q);
      const matchOrders = (rep.ordersCount || '').toLowerCase().includes(q);
      const matchNotes = (rep.notes || '').toLowerCase().includes(q);
      const matchReason = (rep.cancellationReason || '').toLowerCase().includes(q);
      const matchQuestions = (rep.commonQuestions || '').toLowerCase().includes(q);
      const matchObjections = (rep.customerObjections || '').toLowerCase().includes(q);
      const matchShipping = (rep.shippingOperationalIssues || '').toLowerCase().includes(q);
      const matchReturns = (rep.returnsCountAndType || '').toLowerCase().includes(q);
      const matchUpdates = (rep.updatesOrOffers || '').toLowerCase().includes(q);
      const matchInventory = (rep.inventoryIssues || '').toLowerCase().includes(q);

      let matchCustom = false;
      if (rep.questionsList && Array.isArray(rep.questionsList)) {
        matchCustom = rep.questionsList.some((item) =>
          String(item.answer || '').toLowerCase().includes(q)
        );
      }

      if (
        !matchDate &&
        !matchOrders &&
        !matchNotes &&
        !matchReason &&
        !matchQuestions &&
        !matchObjections &&
        !matchShipping &&
        !matchReturns &&
        !matchUpdates &&
        !matchInventory &&
        !matchCustom
      ) {
        return false;
      }
    }

    if (startDateFilter && rep.date < startDateFilter) return false;
    if (endDateFilter && rep.date > endDateFilter) return false;

    return true;
  });

  // Helper to get initial answer from existing report or default
  const getInitialAnswerForQuestion = (q: DailyReportQuestion, rep?: ClientDailyReport | null) => {
    if (!rep) {
      return q.type === 'number' ? '' : '';
    }
    // Check questionsList first
    if (rep.questionsList && rep.questionsList.length > 0) {
      const found = rep.questionsList.find(
        (item) => item.id === q.id || (q.standardKey && item.standardKey === q.standardKey)
      );
      if (found !== undefined && found.answer !== undefined) {
        return found.answer;
      }
    }
    // Check standardKey mapping
    if (q.standardKey && (rep as any)[q.standardKey] !== undefined) {
      return (rep as any)[q.standardKey];
    }
    // Check custom answers
    if (rep.customAnswers && rep.customAnswers[q.id] !== undefined) {
      return rep.customAnswers[q.id];
    }
    return '';
  };

  const handleOpenAdd = () => {
    setEditingReport(null);
    setDate(new Date().toISOString().split('T')[0]);
    const initialMap: Record<string, string | number> = {};
    questions.forEach((q) => {
      initialMap[q.id] = '';
    });
    setAnswersMap(initialMap);
    setShowAddModal(true);
  };

  const handleOpenEdit = (rep: ClientDailyReport) => {
    setEditingReport(rep);
    setDate(rep.date || new Date().toISOString().split('T')[0]);

    // Populate answers for each current question
    const currentMap: Record<string, string | number> = {};
    questions.forEach((q) => {
      currentMap[q.id] = getInitialAnswerForQuestion(q, rep);
    });

    // Also include any extra questions that were saved in the report
    if (rep.questionsList) {
      rep.questionsList.forEach((item) => {
        if (!currentMap[item.id]) {
          currentMap[item.id] = item.answer;
        }
      });
    }

    setAnswersMap(currentMap);
    setShowAddModal(true);
  };

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleToggleReviewed = (rep: ClientDailyReport) => {
    if (onUpdateReport) {
      onUpdateReport(rep.id, { reviewed: !rep.reviewed });
      if (selectedReport && selectedReport.id === rep.id) {
        setSelectedReport({ ...selectedReport, reviewed: !rep.reviewed });
      }
    }
  };

  // --- Question CRUD Handlers ---
  const handleOpenAddQuestion = () => {
    if (userRole === 'client') return;
    setIsNewQuestion(true);
    setEditingQuestion({
      id: `q-custom-${Date.now()}`,
      label: '',
      placeholder: '',
      type: 'textarea',
      required: false
    });
    setQuestionFormData({
      label: '',
      placeholder: '',
      type: 'textarea',
      required: false
    });
  };

  const handleOpenEditQuestion = (q: DailyReportQuestion) => {
    if (userRole === 'client') return;
    setIsNewQuestion(false);
    setEditingQuestion(q);
    setQuestionFormData({
      label: q.label,
      placeholder: q.placeholder || '',
      type: q.type || 'textarea',
      required: !!q.required
    });
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'client') return;
    if (!questionFormData.label?.trim() || !editingQuestion) return;

    const updatedQuestion: DailyReportQuestion = {
      ...editingQuestion,
      label: questionFormData.label.trim(),
      placeholder: questionFormData.placeholder?.trim() || '',
      type: (questionFormData.type as any) || 'textarea',
      required: !!questionFormData.required
    };

    if (isNewQuestion) {
      saveQuestions([...questions, updatedQuestion]);
      // Also initialize answer
      setAnswersMap((prev) => ({
        ...prev,
        [updatedQuestion.id]: ''
      }));
    } else {
      saveQuestions(questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)));
    }

    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (userRole === 'client') return;
    const qToDelete = questions.find((q) => q.id === questionId);
    if (!qToDelete) return;
    setConfirmAction({
      type: 'deleteQuestion',
      id: questionId,
      title: `حذف سؤال: "${qToDelete.label}"`,
      description: 'سيتم إزالة هذا السؤال من نموذج التقرير اليومي للعميل.'
    });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (userRole === 'client') return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    saveQuestions(newQuestions);
  };

  // --- Confirm Delete Executor ---
  const executeConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'deleteReport' && confirmAction.id) {
      if (onDeleteReport) {
        onDeleteReport(confirmAction.id);
      }
      if (selectedReport && selectedReport.id === confirmAction.id) {
        setSelectedReport(null);
      }
    } else if (confirmAction.type === 'deleteQuestion' && confirmAction.id) {
      saveQuestions(questions.filter((q) => q.id !== confirmAction.id));
    } else if (confirmAction.type === 'resetQuestions') {
      handleResetQuestionsToDefault();
    }

    setConfirmAction(null);
  };

  // --- Submit Report ---
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build the questionsList array
    const questionsList: ClientDailyReportQuestionAnswer[] = questions.map((q) => {
      const val = answersMap[q.id];
      return {
        id: q.id,
        question: q.label,
        answer: val !== undefined && val !== '' ? val : q.type === 'number' ? 0 : 'لا يوجد ملاحظات',
        type: q.type,
        standardKey: q.standardKey
      };
    });

    // Helper to find standard value
    const getVal = (key: string, fallback: any = '') => {
      const item = questionsList.find((q) => q.standardKey === key);
      return item ? item.answer : fallback;
    };

    const reportData: Omit<ClientDailyReport, 'id'> = {
      clientId,
      date,
      ordersCount: getVal('ordersCount', '0 أوردر'),
      salesAmount: Number(getVal('salesAmount', 0)) || 0,
      cancelledOrdersCount: Number(getVal('cancelledOrdersCount', 0)) || 0,
      cancellationReason: String(getVal('cancellationReason', 'لا يوجد إلغاءات مسجلة')),
      commonQuestions: String(getVal('commonQuestions', 'لا يوجد استفسارات خاصة')),
      customerObjections: String(getVal('customerObjections', 'لا يوجد اعتراضات مسجلة')),
      inventoryIssues: String(getVal('inventoryIssues', 'المخزون متوفر ومستقر')),
      shippingOperationalIssues: String(getVal('shippingOperationalIssues', 'لا يوجد مشاكل شحن أو تشغيل')),
      updatesOrOffers: String(getVal('updatesOrOffers', 'لا يوجد عروض أو تعديلات جديدة')),
      returnsCountAndType: String(getVal('returnsCountAndType', 'لا توجد مرتجعات مسجلة')),
      notes: String(getVal('notes', answersMap['q-notes'] || '')),
      customAnswers: answersMap,
      questionsList
    };

    if (editingReport && onUpdateReport) {
      onUpdateReport(editingReport.id, reportData);
      if (selectedReport && selectedReport.id === editingReport.id) {
        setSelectedReport({ ...editingReport, ...reportData });
      }
    } else {
      onAddReport(reportData);
    }

    setShowAddModal(false);
    setEditingReport(null);
    setAnswersMap({});
  };

  // Helper icon for questions
  const getQuestionIcon = (q: DailyReportQuestion, _idx: number) => {
    if (q.standardKey === 'ordersCount') return <ShoppingBag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />;
    if (q.standardKey === 'salesAmount') return <DollarSign className="w-3.5 h-3.5 text-amber-700 shrink-0" />;
    if (q.standardKey === 'cancelledOrdersCount' || q.standardKey === 'cancellationReason')
      return <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
    if (q.standardKey === 'commonQuestions') return <HelpCircle className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />;
    if (q.standardKey === 'customerObjections') return <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />;
    if (q.standardKey === 'inventoryIssues') return <Box className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />;
    if (q.standardKey === 'shippingOperationalIssues') return <Truck className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />;
    if (q.standardKey === 'updatesOrOffers') return <Tag className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />;
    if (q.standardKey === 'returnsCountAndType') return <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
    if (q.standardKey === 'notes' || q.id === 'q-notes') return <FileText className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />;

    // Custom question icon based on type
    if (q.type === 'number') return <Hash className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    if (q.type === 'text') return <Type className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
    return <AlignLeft className="w-3.5 h-3.5 text-teal-600 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-[#2D2D2A] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#5A5A40]" />
            <span>Client Daily Reports (تقارير العميل اليومية)</span>
          </h2>
          <p className="text-xs text-[#8E8E85] mt-1">
            استقبال وتوثيق ومراجعة تقارير المبيعات والتشغيل اليومية للعميل
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تقرير يومي جديد</span>
        </button>
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
        placeholder="ابحث بتاريخ التقرير، الأوردرات، الملاحظات، أو استفسارات العملاء..."
        totalCount={clientReps.length}
        filteredCount={filteredReports.length}
      />

      {/* REPORTS LIST */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
          <h3 className="font-extrabold text-sm sm:text-base text-[#2D2D2A] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#5A5A40]" />
            <span>سجل تقارير أداء العميل اليومية ({filteredReports.length})</span>
          </h3>
        </div>

        {clientReps.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#E5E5E0] rounded-2xl text-[#8E8E85] text-xs space-y-2">
            <p>لا توجد تقارير يومية مسجلة حتى الآن. اضغط أعلاه لتعبئة أول تقرير يومي 📊</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-10 bg-white border border-[#E5E5E0] rounded-2xl text-[#8E8E85] text-xs space-y-1">
            <p className="font-bold text-[#2D2D2A]">لا توجد تقارير يومية تطابق معايير البحث والفلترة المحددة</p>
            <p>جرب تعديل كلمة البحث أو تغيير الفترة الزمنية في الفلتر أعلاه.</p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW - RESPONSIVE CARDS */}
            <div className="block md:hidden space-y-3">
              {filteredReports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white border border-[#E5E5E0] rounded-2xl p-3.5 space-y-3 shadow-xs hover:border-[#5A5A40]/40 transition"
                >
                  {/* Top Bar: Date + Review Toggle */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E0] pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg text-[#5A5A40]">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#2D2D2A]">
                        {rep.date}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleReviewed(rep)}
                      className={`px-2.5 py-1 rounded-xl font-extrabold text-[11px] border transition inline-flex items-center gap-1 cursor-pointer shadow-2xs ${
                        rep.reviewed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                      title="اضغط للتغيير (هل تمت مراجعة التقرير أم لا)"
                    >
                      {rep.reviewed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>تمت المراجعة 🟢</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>قيد المراجعة ⏳</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                      <span className="text-[10px] text-[#8E8E85] font-bold block mb-0.5">
                        الأوردرات اليومية
                      </span>
                      <p className="font-bold text-emerald-800 line-clamp-2">
                        {rep.ordersCount || '0 أوردر'}
                      </p>
                    </div>

                    <div className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                      <span className="text-[10px] text-[#8E8E85] font-bold block mb-0.5">
                        إجمالي المبيعات
                      </span>
                      <p className="font-black text-amber-800">
                        {rep.salesAmount ? Number(rep.salesAmount).toLocaleString() : 0} جنيه
                      </p>
                    </div>
                  </div>

                  {/* Cancelled / Notes Snippet if present */}
                  {(rep.cancelledOrdersCount || rep.notes) && (
                    <div className="space-y-1.5 text-xs">
                      {!!rep.cancelledOrdersCount && (
                        <div className="flex items-center gap-1.5 text-rose-700 font-bold bg-rose-50/70 border border-rose-200 px-2.5 py-1 rounded-lg">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{rep.cancelledOrdersCount} أوردر ملغي</span>
                          {rep.cancellationReason && (
                            <span className="text-[10px] text-[#8E8E85] font-normal truncate">
                              ({rep.cancellationReason})
                            </span>
                          )}
                        </div>
                      )}

                      {rep.notes && (
                        <div className="bg-[#F9F8F6] border border-[#E5E5E0] px-2.5 py-1.5 rounded-lg text-[11px] text-[#5A5A40]">
                          <span className="font-bold block mb-0.5">ملاحظات اليوم:</span>
                          <p className="line-clamp-2 text-[#2D2D2A]">{rep.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons - Icons only */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#E5E5E0]">
                    <button
                      onClick={() => setSelectedReport(rep)}
                      title="عرض التقرير الكامل"
                      aria-label="عرض التقرير الكامل"
                      className="p-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold text-xs rounded-xl transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(rep)}
                      title="تعديل التقرير"
                      aria-label="تعديل التقرير"
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs rounded-xl transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="w-4 h-4 text-amber-700" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: 'deleteReport',
                          id: rep.id,
                          title: `تقرير يوم: ${rep.date}`,
                          description: 'سيتم حذف سجل التقرير اليومي هذا بشكل دائم.'
                        })
                      }
                      title="حذف التقرير"
                      aria-label="حذف التقرير"
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold text-xs rounded-xl transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW - FULL TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#E5E5E0]/50 text-[#5A5A40] font-black border-b border-[#E5E5E0]">
                    <th className="p-3.5 rounded-r-xl">تاريخ التقرير</th>
                    <th className="p-3.5">1. أوردرات اليوم والمنتجات</th>
                    <th className="p-3.5">2. إجمالي المبيعات</th>
                    <th className="p-3.5">3. الأوردرات الملغية</th>
                    <th className="p-3.5 text-center rounded-l-xl">إجراءات والتفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E0]/70">
                  {filteredReports.map((rep) => (
                    <tr
                      key={rep.id}
                      className="bg-white hover:bg-[#F5F5F0] transition font-medium text-[#2D2D2A]"
                    >
                      {/* Date */}
                      <td className="p-3.5 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
                          <span className="font-mono text-xs bg-[#F5F5F0] border border-[#E5E5E0] px-2.5 py-1 rounded-lg">
                            {rep.date}
                          </span>
                        </div>
                      </td>

                      {/* Orders Count & Products Text */}
                      <td className="p-3.5 font-bold text-emerald-800 max-w-[240px] truncate">
                        {rep.ordersCount || '0 أوردر'}
                      </td>

                      {/* Sales Amount */}
                      <td className="p-3.5 font-black text-amber-800">
                        {rep.salesAmount ? Number(rep.salesAmount).toLocaleString() : 0} جنيه
                      </td>

                      {/* Cancelled Orders */}
                      <td className="p-3.5 font-bold text-rose-700">
                        {rep.cancelledOrdersCount ? `${rep.cancelledOrdersCount} ملغي` : '0'}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {/* Toggle Reviewed Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleReviewed(rep)}
                            className={`px-2.5 py-1.5 rounded-xl font-extrabold text-xs border transition inline-flex items-center gap-1 cursor-pointer shadow-2xs ${
                              rep.reviewed
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            }`}
                            title="اضغط للتغيير (هل تمت مراجعة التقرير أم لا)"
                          >
                            {rep.reviewed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>تمت المراجعة 🟢</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>لم تتم المراجعة ⏳</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setSelectedReport(rep)}
                            title="عرض التقرير الكامل"
                            aria-label="عرض التقرير الكامل"
                            className="p-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold text-xs rounded-xl transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(rep)}
                            title="تعديل التقرير"
                            aria-label="تعديل التقرير"
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs rounded-xl transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Edit2 className="w-4 h-4 text-amber-700" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: 'deleteReport',
                                id: rep.id,
                                title: `تقرير يوم: ${rep.date}`,
                                description: 'سيتم حذف سجل التقرير اليومي هذا بشكل دائم.'
                              })
                            }
                            title="حذف التقرير"
                            aria-label="حذف التقرير"
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold text-xs rounded-xl transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ADD / EDIT REPORT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-[#2D2D2A] text-sm sm:text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A5A40]" />
                  <span>
                    {editingReport
                      ? 'تعديل التقرير اليومي'
                      : `نموذج التقرير اليومي للعميل (${questions.length} أسئلة)`}
                  </span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#8E8E85] mt-0.5">
                  {userRole === 'client'
                    ? 'يرجى تعبئة بيانات وبنود التقرير اليومي بدقة'
                    : 'يمكنك تعديل نص أي سؤال، حذفه، أو إضافة أسئلة مخصصة مباشرة من الأيقونات بجوار كل سؤال'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingReport(null);
                }}
                className="p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] rounded-xl hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content (Scrollable Body) */}
            <form
              id="addReportForm"
              onSubmit={handleFormSubmit}
              className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs pl-1 pr-1 my-1"
            >
              {/* Date */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] shadow-2xs">
                <label className="block text-[#2D2D2A] font-bold mb-1 text-xs">
                  📅 تاريخ التقرير اليومي *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                  required
                />
              </div>

              {/* Dynamic Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="font-extrabold text-[#5A5A40] text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>أسئلة وبنود التقرير ({questions.length})</span>
                  </span>

                  {userRole !== 'client' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmAction({
                            type: 'resetQuestions',
                            title: 'إعادة ضبط الأسئلة الافتراضية',
                            description:
                              'هل أنت متأكد من رغبتك في استعادة قائمة الأسئلة الافتراضية (11 سؤالاً)؟'
                          })
                        }
                        className="p-1.5 bg-white border border-[#E5E5E0] text-[#78786E] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="استعادة الأسئلة الافتراضية للنموذج"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenAddQuestion}
                        className="text-[11px] bg-white border border-[#E5E5E0] px-2.5 py-1 rounded-xl font-bold text-[#5A5A40] hover:bg-[#E5E5E0] transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة سؤال جديد</span>
                      </button>
                    </div>
                  )}
                </div>

                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] shadow-2xs hover:border-[#5A5A40]/40 transition space-y-2 group"
                  >
                    {/* Question Header with Edit / Delete / Move actions */}
                    <div className="flex items-start justify-between gap-2">
                      <label className="block text-[#2D2D2A] font-bold text-[11px] sm:text-xs flex items-center gap-1.5 flex-1 leading-relaxed">
                        {getQuestionIcon(q, idx)}
                        <span>{q.label}</span>
                        {q.required && <span className="text-rose-500 font-bold">*</span>}
                      </label>

                      {/* Question Actions (Move, Edit, Delete) - Only for Admin/Team */}
                      {userRole !== 'client' && (
                        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveQuestion(idx, 'up')}
                            title="تحريك لأعلى"
                            className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] disabled:opacity-20 rounded-lg hover:bg-[#F5F5F0] transition cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === questions.length - 1}
                            onClick={() => handleMoveQuestion(idx, 'down')}
                            title="تحريك لأسفل"
                            className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] disabled:opacity-20 rounded-lg hover:bg-[#F5F5F0] transition cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditQuestion(q)}
                            title="تعديل نص ونوع هذا السؤال"
                            className="p-1 text-[#5A5A40] hover:bg-[#F5F5F0] rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            title="حذف هذا السؤال من النموذج"
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Question Input Based on Type */}
                    {q.type === 'textarea' ? (
                      <textarea
                        rows={2}
                        value={answersMap[q.id] !== undefined ? String(answersMap[q.id]) : ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || 'اكتب الإجابة هنا...'}
                        required={q.required}
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl p-2.5 text-[#2D2D2A] font-medium outline-none focus:border-[#5A5A40]"
                      />
                    ) : q.type === 'number' ? (
                      <input
                        type="number"
                        value={answersMap[q.id] !== undefined ? answersMap[q.id] : ''}
                        onChange={(e) =>
                          handleAnswerChange(
                            q.id,
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        placeholder={q.placeholder || '0'}
                        required={q.required}
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={answersMap[q.id] !== undefined ? String(answersMap[q.id]) : ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || 'اكتب الإجابة هنا...'}
                        required={q.required}
                        className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-[#2D2D2A] font-medium outline-none focus:border-[#5A5A40]"
                      />
                    )}
                  </div>
                ))}

                {/* Add New Question Prompt Banner - Hidden for Client */}
                {userRole !== 'client' && (
                  <button
                    type="button"
                    onClick={handleOpenAddQuestion}
                    className="w-full py-3 bg-white hover:bg-[#F5F5F0] border-2 border-dashed border-[#E5E5E0] hover:border-[#5A5A40] rounded-2xl text-xs font-bold text-[#5A5A40] transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة سؤال / بند إضافي جديد لنموذج التقرير</span>
                  </button>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="pt-3 border-t border-[#E5E5E0] flex gap-3 shrink-0">
              <button
                type="submit"
                form="addReportForm"
                className="flex-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingReport ? 'حفظ التعديلات' : 'حفظ التقرير اليومي'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingReport(null);
                }}
                className="px-4 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#F5F5F0] transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW REPORT POPUP MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-xl max-h-[88vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="border-b border-[#E5E5E0] pb-3 shrink-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-[#5A5A40] bg-[#5A5A40]/10 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block">
                    Full Daily Report Details
                  </span>
                  <h3 className="font-extrabold text-[#2D2D2A] text-sm sm:text-base leading-snug">
                    بيانات التقرير اليومي الكاملة
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedReport(null)}
                  title="إغلاق"
                  className="p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] rounded-xl hover:bg-[#E5E5E0] transition cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-row for Date and Reviewed Status */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-[#5A5A40] font-mono text-xs bg-white border border-[#E5E5E0] px-2.5 py-1 rounded-xl font-bold whitespace-nowrap shadow-2xs">
                  📅 {selectedReport.date}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleReviewed(selectedReport)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap ${
                    selectedReport.reviewed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  }`}
                  title="اضغط للتغيير (هل تمت مراجعة التقرير أم لا)"
                >
                  {selectedReport.reviewed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>تمت المراجعة 🟢</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>لم تتم المراجعة ⏳</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs pl-1 pr-1 my-1">
              {/* Quick Numbers Bar */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white border border-[#E5E5E0] rounded-2xl p-2.5 text-center shadow-2xs">
                  <div className="text-[9px] text-[#8E8E85] font-bold mb-0.5 flex items-center justify-center gap-1">
                    <DollarSign className="w-3 h-3 text-amber-700" />
                    <span>إجمالي المبيعات</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-amber-800">
                    {selectedReport.salesAmount
                      ? Number(selectedReport.salesAmount).toLocaleString()
                      : 0}{' '}
                    جنيه
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5E0] rounded-2xl p-2.5 text-center shadow-2xs">
                  <div className="text-[9px] text-[#8E8E85] font-bold mb-0.5 flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>الأوردرات الملغية</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-rose-700">
                    {selectedReport.cancelledOrdersCount || 0} ملغي
                  </div>
                </div>
              </div>

              {/* Detailed Questions & Answers List */}
              <div className="space-y-2.5 text-xs">
                {selectedReport.questionsList && selectedReport.questionsList.length > 0 ? (
                  selectedReport.questionsList.map((qa, index) => (
                    <div
                      key={qa.id || index}
                      className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs"
                    >
                      <div className="font-extrabold text-[#5A5A40] flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
                        <span>{qa.question}</span>
                      </div>
                      <p className="text-[#2D2D2A] font-bold pr-3.5 leading-relaxed text-xs">
                        {qa.answer !== undefined && qa.answer !== ''
                          ? String(qa.answer)
                          : 'لا يوجد رد مسجل'}
                      </p>
                    </div>
                  ))
                ) : (
                  // Fallback for older reports without questionsList
                  <>
                    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                      <div className="font-extrabold text-emerald-800 flex items-center gap-1.5 text-[11px]">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                        <span>1. عدد أوردرات النهاردة و كام أوردر لكل منتج؟</span>
                      </div>
                      <p className="text-[#2D2D2A] font-bold pr-4 leading-relaxed text-xs">
                        {selectedReport.ordersCount || 'لم يتم التسجيل'}
                      </p>
                    </div>

                    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                      <div className="font-extrabold text-amber-800 flex items-center gap-1.5 text-[11px]">
                        <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                        <span>2. إجمالي قيمة المبيعات:</span>
                      </div>
                      <p className="text-[#2D2D2A] font-extrabold pr-4 text-sm">
                        {selectedReport.salesAmount
                          ? Number(selectedReport.salesAmount).toLocaleString()
                          : 0}{' '}
                        جنيه
                      </p>
                    </div>

                    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                      <div className="font-extrabold text-rose-700 flex items-center gap-1.5 text-[11px]">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>3. عدد الأوردرات الملغية:</span>
                      </div>
                      <p className="text-[#2D2D2A] font-bold pr-4">
                        {selectedReport.cancelledOrdersCount || 0} أوردر ملغي
                      </p>
                    </div>

                    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                      <div className="font-extrabold text-rose-700 flex items-center gap-1.5 text-[11px]">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>4. سبب الإلغاء الأكثر تكرارًا:</span>
                      </div>
                      <p className="text-[#2D2D2A] font-medium pr-4 leading-relaxed">
                        {selectedReport.cancellationReason || 'لا يوجد إلغاءات مسجلة'}
                      </p>
                    </div>

                    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                      <div className="font-extrabold text-[#5A5A40] flex items-center gap-1.5 text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>5. أكتر سؤال اتكرر النهارده او طلبات معينة من العملاء:</span>
                      </div>
                      <p className="text-[#2D2D2A] font-medium pr-4 leading-relaxed">
                        {selectedReport.commonQuestions || 'لا توجد استفسارات متكررة خاصة.'}
                      </p>
                    </div>

                    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                      <div className="font-extrabold text-amber-800 flex items-center gap-1.5 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>6. أكتر اعتراضات من العملاء:</span>
                      </div>
                      <p className="text-[#2D2D2A] font-medium pr-4 leading-relaxed">
                        {selectedReport.customerObjections || 'لا توجد اعتراضات بارزة.'}
                      </p>
                    </div>

                    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                      <div className="font-extrabold text-[#5A5A40] flex items-center gap-1.5 text-[11px]">
                        <Box className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>7. هل فيه مشكلة في المخزون او فيه منتج معين قرب يخلص؟</span>
                      </div>
                      <p className="text-[#2D2D2A] font-medium pr-4 leading-relaxed">
                        {selectedReport.inventoryIssues || 'المخزون مستقر ولا توجد أي مشاكل.'}
                      </p>
                    </div>

                    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                      <div className="font-extrabold text-[#5A5A40] flex items-center gap-1.5 text-[11px]">
                        <Truck className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>8. هل فيه مشكلة في الشحن أو التشغيل او اي حاجة واجهتكوا النهاردة؟</span>
                      </div>
                      <p className="text-[#2D2D2A] font-medium pr-4 leading-relaxed">
                        {selectedReport.shippingOperationalIssues || 'لا توجد معوقات شحن.'}
                      </p>
                    </div>

                    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                      <div className="font-extrabold text-[#5A5A40] flex items-center gap-1.5 text-[11px]">
                        <Tag className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>9. هل فيه اي تعديلات في المنتجات او الاسعار او العروض تمت جديدة؟</span>
                      </div>
                      <p className="text-[#2D2D2A] font-medium pr-4 leading-relaxed">
                        {selectedReport.updatesOrOffers || 'لا توجد تعديلات جديدة.'}
                      </p>
                    </div>

                    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                      <div className="font-extrabold text-rose-700 flex items-center gap-1.5 text-[11px]">
                        <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                        <span>10. عدد المرتجعات اليوم؟ و نوعها:</span>
                      </div>
                      <p className="text-[#2D2D2A] font-medium pr-4 leading-relaxed">
                        {selectedReport.returnsCountAndType || 'لا توجد مرتجعات مسجلة.'}
                      </p>
                    </div>

                    {selectedReport.notes && (
                      <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 space-y-1 shadow-2xs">
                        <div className="font-extrabold text-[#5A5A40] flex items-center gap-1.5 text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-[#5A5A40]" />
                          <span>11. ملاحظات اليوم:</span>
                        </div>
                        <p className="text-[#2D2D2A] font-medium pr-4 leading-relaxed whitespace-pre-line">
                          {selectedReport.notes}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-3 border-t border-[#E5E5E0] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const repToEdit = selectedReport;
                    setSelectedReport(null);
                    handleOpenEdit(repToEdit);
                  }}
                  title="تعديل هذا التقرير"
                  className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-xl text-xs transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  <Edit2 className="w-4 h-4 text-amber-700" />
                </button>
                <button
                  onClick={() => {
                    const repToDelete = selectedReport;
                    setSelectedReport(null);
                    setConfirmAction({
                      type: 'deleteReport',
                      id: repToDelete.id,
                      title: `تقرير يوم: ${repToDelete.date}`,
                      description: 'سيتم حذف سجل التقرير اليومي هذا بشكل دائم.'
                    });
                  }}
                  title="حذف التقرير"
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition inline-flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </button>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION ADD / EDIT MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-[#2D2D2A]/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <h3 className="font-extrabold text-[#2D2D2A] text-sm sm:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                <span>{isNewQuestion ? 'إضافة سؤال جديد للنموذج' : 'تعديل بيانات السؤال'}</span>
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] rounded-xl hover:bg-[#F5F5F0] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">نص السؤال أو البند *</label>
                <input
                  type="text"
                  value={questionFormData.label || ''}
                  onChange={(e) =>
                    setQuestionFormData({ ...questionFormData, label: e.target.value })
                  }
                  placeholder="مثال: ما هي أبرز المنتجات التي بيعت اليوم؟"
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] font-bold text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">
                  نص توضيحي للمستخدم (Placeholder)
                </label>
                <input
                  type="text"
                  value={questionFormData.placeholder || ''}
                  onChange={(e) =>
                    setQuestionFormData({ ...questionFormData, placeholder: e.target.value })
                  }
                  placeholder="مثال: يرجى كتابة اسم المنتج وعدد القطع..."
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2D2D2A] font-bold mb-1">نوع حقل الإدخال</label>
                  <select
                    value={questionFormData.type || 'textarea'}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        type: e.target.value as any
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] font-bold outline-none focus:border-[#5A5A40]"
                  >
                    <option value="textarea">نص طويل (متعدد الأسطر)</option>
                    <option value="text">نص قصير (سطر واحد)</option>
                    <option value="number">أرقام فقط (Number)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#2D2D2A] font-bold mb-1">حالة الإلزام</label>
                  <div className="pt-2 flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!questionFormData.required}
                        onChange={(e) =>
                          setQuestionFormData({
                            ...questionFormData,
                            required: e.target.checked
                          })
                        }
                        className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40]"
                      />
                      <span className="font-bold text-[#2D2D2A]">حقل إجباري</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E5E5E0]">
                <button
                  type="submit"
                  className="flex-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  {isNewQuestion ? 'إضافة السؤال للنموذج' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 bg-[#F9F8F6] border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-[70] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2D2D2A] text-base">{confirmAction.title}</h3>
              <p className="text-xs text-[#8E8E85] mt-1">
                {confirmAction.description ||
                  'هل أنت متأكد من تنفيذ هذا الإجراء؟ لا يمكن التراجع عنه.'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={executeConfirmAction}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                تأكيد الإجراء
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
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
