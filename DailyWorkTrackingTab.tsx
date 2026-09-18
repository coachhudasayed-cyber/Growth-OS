import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Calendar as CalendarIcon,
  ListFilter
} from 'lucide-react';
import { DailyWorkLog, UserRole } from '../../types';

interface DailyWorkTrackingTabProps {
  logs: DailyWorkLog[];
  clientId: string;
  userRole: UserRole;
  onAddLog: (log: Omit<DailyWorkLog, 'id' | 'createdAt'>) => void;
  onUpdateLog?: (id: string, updatedFields: Partial<DailyWorkLog>) => void;
  onDeleteLog: (id: string) => void;
}

const ARABIC_MONTHS = [
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

const ARABIC_WEEKDAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const ARABIC_WEEKDAYS_SHORT = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

export const DailyWorkTrackingTab: React.FC<DailyWorkTrackingTabProps> = ({
  logs,
  clientId,
  userRole,
  onAddLog,
  onUpdateLog,
  onDeleteLog
}) => {
  const clientLogs = logs.filter((l) => l.clientId === clientId);

  // Calendar State
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>(todayStr);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [deletingLog, setDeletingLog] = useState<DailyWorkLog | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [activityDetails, setActivityDetails] = useState('');

  // Map logs by date (YYYY-MM-DD) for quick lookup
  const logsByDate = clientLogs.reduce((acc: Record<string, DailyWorkLog>, log) => {
    acc[log.date] = log;
    return acc;
  }, {});

  const getArabicFormattedDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const dateObj = new Date(y, m - 1, d);
    const weekday = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][dateObj.getDay()];
    const monthName = ARABIC_MONTHS[m - 1] || '';
    return `${weekday}، ${d} ${monthName} ${y}`;
  };

  // Date Navigation Helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Calendar calculations
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const formatDateKey = (dayNumber: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(dayNumber).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  // Open modal for a specific day immediately upon clicking its box
  const handleDayClick = (dayNumber: number) => {
    const dateStr = formatDateKey(dayNumber);
    setSelectedDate(dateStr);
    setSelectedCalendarDay(dateStr);

    const existingLog = logsByDate[dateStr];
    if (existingLog) {
      setEditingLogId(existingLog.id);
      setTitle(existingLog.title || 'يوم عمل');
      setStatus(existingLog.status || 'active');
      setActivityDetails(existingLog.activityDetails || '');
    } else {
      setEditingLogId(null);
      setTitle('يوم عمل');
      setStatus('active');
      setActivityDetails('');
    }

    // Open registration popup immediately on all devices
    setShowModal(true);
  };

  const handleOpenDayModal = (dateStr?: string) => {
    const targetDate = dateStr || selectedCalendarDay || todayStr;
    setSelectedDate(targetDate);
    setSelectedCalendarDay(targetDate);

    const existingLog = logsByDate[targetDate];
    if (existingLog) {
      setEditingLogId(existingLog.id);
      setTitle(existingLog.title || 'يوم عمل');
      setStatus(existingLog.status || 'active');
      setActivityDetails(existingLog.activityDetails || '');
    } else {
      setEditingLogId(null);
      setTitle('يوم عمل');
      setStatus('active');
      setActivityDetails('');
    }
    setShowModal(true);
  };

  const handleOpenAddGeneric = () => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedCalendarDay(dateStr);
    setEditingLogId(null);
    setTitle('');
    setStatus('active');
    setActivityDetails('');
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    if (editingLogId && onUpdateLog) {
      onUpdateLog(editingLogId, {
        date: selectedDate,
        title: title || 'يوم عمل',
        status,
        activityDetails
      });
    } else {
      onAddLog({
        clientId,
        date: selectedDate,
        title: title || 'يوم عمل',
        status,
        activityDetails,
        daysCount: 1
      });
    }

    setShowModal(false);
    setEditingLogId(null);
    setTitle('');
    setActivityDetails('');
  };

  const handleDeleteCurrentModalLog = () => {
    if (editingLogId) {
      const targetLog = clientLogs.find((l) => l.id === editingLogId);
      if (targetLog) {
        setDeletingLog(targetLog);
      }
    }
  };

  const confirmExecuteDelete = () => {
    if (deletingLog) {
      onDeleteLog(deletingLog.id);
      if (editingLogId === deletingLog.id) {
        setShowModal(false);
        setEditingLogId(null);
      }
      setDeletingLog(null);
    }
  };

  // Monthly stats calculations
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const currentMonthLogs = clientLogs.filter((l) => l.date.startsWith(currentMonthPrefix));

  const activeDaysThisMonth = currentMonthLogs.filter((l) => l.status === 'active').length;
  const pausedDaysThisMonth = currentMonthLogs.filter((l) => l.status === 'paused').length;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER & TOP CONTROLS */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-[#2D2D2A] flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#E07A48]" />
            <span>متابعة أيام العمل اليومية (Daily Work Tracking)</span>
          </h2>
          <p className="text-xs text-[#78786E] mt-1">
            جدول وتقويم شهري لتسجيل أيام العمل الفعلي باللون الأخضر وأيام التوقف باللون الأحمر
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* View Switcher Toggle */}
          <div className="bg-white border border-[#E5E5E0] p-1 rounded-2xl grid grid-cols-2 sm:flex sm:items-center gap-1 shadow-2xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`py-2 sm:py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#E07A48] text-white shadow-xs'
                  : 'text-[#78786E] hover:text-[#2D2D2A]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>التقويم الشهري</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`py-2 sm:py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#E07A48] text-white shadow-xs'
                  : 'text-[#78786E] hover:text-[#2D2D2A]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>قائمة السجلات ({clientLogs.length})</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenDayModal(selectedCalendarDay || todayStr)}
            className="sm:hidden px-4 py-2.5 bg-[#E07A48] hover:bg-[#C8662B] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل يوم جديد</span>
          </button>
        </div>
      </div>

      {/* MONTHLY SUMMARY METRICS - MOBILE COMPACT STRIP (< sm) */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <div className="bg-white border border-[#C2E3C7] rounded-xl p-2.5 text-center shadow-2xs">
          <div className="text-[10px] font-bold text-[#2D5A27] truncate mb-0.5">🟢 أيام نشطة</div>
          <div className="text-lg font-black text-[#2D5A27]">{activeDaysThisMonth}</div>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-2.5 text-center shadow-2xs">
          <div className="text-[10px] font-bold text-rose-700 truncate mb-0.5">🔴 أيام توقف</div>
          <div className="text-lg font-black text-rose-700">{pausedDaysThisMonth}</div>
        </div>

        <div className="bg-white border border-[#E5E5E0] rounded-xl p-2.5 text-center shadow-2xs">
          <div className="text-[10px] font-bold text-[#78786E] truncate mb-0.5">⏱️ المسجل</div>
          <div className="text-lg font-black text-[#2D2D2A]">
            {currentMonthLogs.length}<span className="text-[10px] text-[#78786E] font-medium">/{daysInMonth}</span>
          </div>
        </div>
      </div>

      {/* MONTHLY SUMMARY METRICS - DESKTOP CARDS (sm:) */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:gap-3.5">
        <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#78786E] font-medium block mb-1">
              أيام عمل نشطة ({ARABIC_MONTHS[currentMonth]})
            </span>
            <div className="text-2xl font-black text-[#2D5A27] flex items-baseline gap-1.5">
              <span>{activeDaysThisMonth}</span>
              <span className="text-xs text-[#78786E] font-semibold">يوم</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#EBF6ED] border border-[#C2E3C7] flex items-center justify-center text-[#2D5A27]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#78786E] font-medium block mb-1">
              أيام لم يتم العمل فيها ({ARABIC_MONTHS[currentMonth]})
            </span>
            <div className="text-2xl font-black text-rose-700 flex items-baseline gap-1.5">
              <span>{pausedDaysThisMonth}</span>
              <span className="text-xs text-[#78786E] font-semibold">يوم</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#78786E] font-medium block mb-1">
              إجمالي أيام الشهر المسجلة
            </span>
            <div className="text-2xl font-black text-[#2D2D2A] flex items-baseline gap-1.5">
              <span>{currentMonthLogs.length}</span>
              <span className="text-xs text-[#78786E] font-semibold">من {daysInMonth} يوم</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F5F5F0] border border-[#E5E5E0] flex items-center justify-center text-[#5A5A40]">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xs space-y-3.5 sm:space-y-4">
          {/* MONTH NAVIGATION BAR */}
          <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E0] pb-3 sm:pb-4">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={handlePrevMonth}
                className="p-2 sm:p-2 bg-white hover:bg-[#F5F5F0] border border-[#E5E5E0] rounded-xl text-[#2D2D2A] transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="الشهر السابق"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <h3 className="text-sm sm:text-lg font-black text-[#2D2D2A] min-w-[110px] sm:min-w-[140px] text-center">
                {ARABIC_MONTHS[currentMonth]} {currentYear}
              </h3>

              <button
                onClick={handleNextMonth}
                className="p-2 sm:p-2 bg-white hover:bg-[#F5F5F0] border border-[#E5E5E0] rounded-xl text-[#2D2D2A] transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="الشهر التالي"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleJumpToToday}
                className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-[#F5F5F0] border border-[#E5E5E0] text-[#2D2D2A] font-extrabold text-[11px] sm:text-xs rounded-xl transition cursor-pointer"
              >
                اليوم
              </button>
              <button
                onClick={handleOpenAddGeneric}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل يوم</span>
              </button>
            </div>
          </div>

          {/* WEEKDAYS HEADER */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center font-black text-[10px] sm:text-xs text-[#5A5A50] bg-[#E5E5E0]/50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl">
            {ARABIC_WEEKDAYS.map((wd, idx) => (
              <div key={wd} className="py-0.5 sm:py-1 truncate">
                <span className="sm:hidden">{ARABIC_WEEKDAYS_SHORT[idx]}</span>
                <span className="hidden sm:inline">{wd}</span>
              </div>
            ))}
          </div>

          {/* CALENDAR DAYS GRID */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Blank padding cells before 1st of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div
                key={`blank-${idx}`}
                className="min-h-[48px] sm:min-h-[95px] bg-[#F5F5F0]/30 rounded-xl sm:rounded-2xl border border-transparent"
              ></div>
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateKey = formatDateKey(dayNum);
              const log = logsByDate[dateKey];

              const isToday =
                today.getFullYear() === currentYear &&
                today.getMonth() === currentMonth &&
                today.getDate() === dayNum;

              const isSelected = selectedCalendarDay === dateKey;

              return (
                <div
                  key={dateKey}
                  onClick={() => handleDayClick(dayNum)}
                  className={`min-h-[48px] sm:min-h-[100px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative select-none ${
                    isSelected
                      ? 'ring-2 ring-[#E07A48] ring-offset-1 z-10'
                      : ''
                  } ${
                    log
                      ? log.status === 'active'
                        ? 'bg-[#EBF6ED] border-[#C2E3C7] hover:border-[#2D5A27] text-[#2D5A27]'
                        : 'bg-rose-50 border-rose-200 hover:border-rose-400 text-rose-800'
                      : isToday
                      ? 'bg-white border-[#E07A48] shadow-xs'
                      : 'bg-white border-[#E5E5E0] hover:border-[#E07A48]/50 hover:bg-[#F9F8F6]'
                  }`}
                >
                  {/* Day Header Row */}
                  <div className="flex items-center justify-between sm:justify-between w-full">
                    <span
                      className={`text-[11px] sm:text-sm font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isToday
                          ? 'bg-[#E07A48] text-white shadow-2xs'
                          : 'text-[#2D2D2A]'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {log && (
                      <span
                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
                          log.status === 'active'
                            ? 'bg-emerald-500 ring-2 ring-emerald-200'
                            : 'bg-rose-500 ring-2 ring-rose-200'
                        }`}
                        title={log.status === 'active' ? 'تم العمل 🟢' : 'لم يتم العمل 🔴'}
                      ></span>
                    )}
                  </div>

                  {/* Desktop Day Content (hidden on mobile for compact layout) */}
                  {log ? (
                    <div className="hidden sm:block mt-1.5 space-y-1">
                      <div className="font-extrabold text-[11px] sm:text-xs leading-tight line-clamp-1">
                        {log.title || (log.status === 'active' ? 'يوم عمل' : 'توقف عمل')}
                      </div>
                      {log.activityDetails && (
                        <div className="text-[10px] opacity-80 line-clamp-2 leading-tight">
                          {log.activityDetails}
                        </div>
                      )}
                      <div className="text-[9px] font-bold mt-0.5 inline-block px-1.5 py-0.5 rounded-md bg-white/60">
                        {log.status === 'active' ? '🟢 شغال' : '🔴 متوقف'}
                      </div>
                    </div>
                  ) : (
                    /* Mobile subtle indicator text */
                    <div className="sm:hidden flex items-center justify-center">
                      {log && (
                        <span className="text-[9px] font-black">
                          {log.status === 'active' ? '🟢' : '🔴'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* MOBILE SELECTED DAY PREVIEW CARD (Visible on mobile < sm) */}
          <div className="sm:hidden pt-2 border-t border-[#E5E5E0]">
            {(() => {
              const activeLog = logsByDate[selectedCalendarDay];
              const isSelectedToday = selectedCalendarDay === todayStr;

              return (
                <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-2 border-b border-[#F0F0EC] pb-2">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-[#E07A48]" />
                      <span className="text-xs font-black text-[#2D2D2A]">
                        {getArabicFormattedDateString(selectedCalendarDay)}
                      </span>
                      {isSelectedToday && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#E07A48]/10 text-[#E07A48]">
                          اليوم
                        </span>
                      )}
                    </div>

                    {activeLog ? (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          activeLog.status === 'active'
                            ? 'bg-[#EBF6ED] text-[#2D5A27] border-[#C2E3C7]'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {activeLog.status === 'active' ? '🟢 تم العمل' : '🔴 توقف'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#8E8E85] bg-[#F5F5F0] px-2 py-0.5 rounded-full">
                        غير مسجل
                      </span>
                    )}
                  </div>

                  {activeLog ? (
                    <div className="space-y-1.5">
                      <div className="text-xs font-black text-[#2D2D2A]">
                        {activeLog.title || 'يوم عمل'}
                      </div>
                      {activeLog.activityDetails ? (
                        <p className="text-[11px] text-[#5A5A50] bg-[#F9F8F6] p-2 rounded-xl leading-relaxed border border-[#E5E5E0]">
                          {activeLog.activityDetails}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#8E8E85] italic">لا توجد تفاصيل إضافية مسجلة.</p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleOpenDayModal(selectedCalendarDay)}
                          className="flex-1 py-2 px-3 bg-[#E07A48] hover:bg-[#C8662B] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>تعديل هذا اليوم</span>
                        </button>

                        <button
                          onClick={() => setDeletingLog(activeLog)}
                          className="p-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl transition"
                          title="حذف اليوم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center py-1">
                      <p className="text-[11px] text-[#78786E]">
                        لم يتم تسجيل نشاط عمل لهذا التاريخ بعد.
                      </p>
                      <button
                        onClick={() => handleOpenDayModal(selectedCalendarDay)}
                        className="w-full py-2 px-3 bg-[#E07A48] hover:bg-[#C8662B] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ تسجيل حالة هذا اليوم (عمل أو توقف)</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* LIST VIEW OPTION */}
      {viewMode === 'list' && (
        <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <h3 className="font-extrabold text-sm sm:text-base text-[#2D2D2A] flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#E07A48]" />
              <span>جميع أيام العمل المسجلة ({clientLogs.length})</span>
            </h3>
          </div>

          {clientLogs.length === 0 ? (
            <div className="text-center py-10 bg-white border border-[#E5E5E0] rounded-2xl text-[#78786E] text-xs">
              لا توجد أية أيام عمل مسجلة حتى الآن. اضغط على أي يوم في التقويم لإضافة أول يوم ⏱️
            </div>
          ) : (
            <div className="space-y-3">
              {clientLogs
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((log) => (
                  <div
                    key={log.id}
                    className="bg-white border border-[#E5E5E0] rounded-2xl p-4 shadow-xs hover:border-[#E07A48]/40 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F0EC] pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                            log.status === 'active'
                              ? 'bg-[#EBF6ED] text-[#2D5A27] border-[#C2E3C7]'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              log.status === 'active' ? 'bg-[#2D5A27]' : 'bg-rose-600'
                            }`}
                          ></span>
                          <span>
                            {log.status === 'active' ? '🟢 تم العمل (نشط)' : '🔴 لم يتم العمل (متوقف)'}
                          </span>
                        </span>

                        <span className="text-xs text-[#78786E] font-semibold bg-[#F5F5F0] border border-[#E5E5E0] px-2.5 py-0.5 rounded-lg">
                          التاريخ: {log.date}
                        </span>

                        {log.title && (
                          <span className="text-xs font-extrabold text-[#2D2D2A]">
                            {log.title}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedDate(log.date);
                            setEditingLogId(log.id);
                            setTitle(log.title || 'يوم عمل');
                            setStatus(log.status || 'active');
                            setActivityDetails(log.activityDetails || '');
                            setShowModal(true);
                          }}
                          className="p-1.5 text-[#78786E] hover:text-[#E07A48] rounded-lg hover:bg-[#E07A48]/10 transition cursor-pointer"
                          title="تعديل اليوم"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingLog(log)}
                          className="p-1.5 text-[#78786E] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="حذف السجل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {log.activityDetails && (
                      <div className="text-xs text-[#2D2D2A] bg-[#F9F8F6] p-3 rounded-xl border border-[#E5E5E0]">
                        <span className="font-bold text-[#78786E] block mb-1">
                          التفاصيل / الملاحظات:
                        </span>
                        <p className="leading-relaxed font-medium">{log.activityDetails}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* RECORD / EDIT DAY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 shrink-0">
              <h3 className="font-extrabold text-[#2D2D2A] text-sm sm:text-base flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#E07A48]" />
                <span>
                  {editingLogId ? 'تعديل تسجيل يوم العمل' : 'تسجيل يوم عمل جديد'}
                </span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#78786E] hover:text-[#2D2D2A] text-xs font-bold p-1 cursor-pointer"
              >
                إلغاء
              </button>
            </div>

            <form id="workLogForm" onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs pr-1 pl-1 my-1">
              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">التاريخ المحدد *</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full min-h-[44px] bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none font-extrabold focus:border-[#E07A48]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">
                  اسم يوم العمل *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: يوم عمل اعتيادي / تشغيل حملة المبيعات..."
                  className="w-full min-h-[44px] bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none font-semibold focus:border-[#E07A48]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">حالة اليوم *</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`min-h-[44px] py-2 px-3 rounded-2xl border font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      status === 'active'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-[#E5E5E0] text-[#78786E] hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">🟢 تم العمل (نشط)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('paused')}
                    className={`min-h-[44px] py-2 px-3 rounded-2xl border font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      status === 'paused'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-white border-[#E5E5E0] text-[#78786E] hover:bg-rose-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">🔴 لم يتم العمل (متوقف)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">التفاصيل / الملاحظات</label>
                <textarea
                  value={activityDetails}
                  onChange={(e) => setActivityDetails(e.target.value)}
                  rows={3}
                  placeholder="اكتب هنا تفاصيل المهام التي تمت في هذا اليوم أو سبب الإيقاف..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-3 text-[#2D2D2A] outline-none focus:border-[#E07A48] text-xs leading-relaxed"
                />
              </div>
            </form>

            <div className="pt-3 border-t border-[#E5E5E0] flex gap-2.5 shrink-0">
              <button
                type="submit"
                form="workLogForm"
                className="flex-1 min-h-[44px] bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center"
              >
                {editingLogId ? 'حفظ التعديلات' : 'تسجيل اليوم'}
              </button>

              {editingLogId && (
                <button
                  type="button"
                  onClick={handleDeleteCurrentModalLog}
                  className="min-h-[44px] px-3.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs hover:bg-rose-100 transition cursor-pointer flex items-center justify-center"
                  title="حذف تسجيل اليوم"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="min-h-[44px] px-4 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#F5F5F0] flex items-center justify-center"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CONFIRM DELETE MODAL */}
      {deletingLog && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-[70] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#2D2D2A]">تأكيد حذف يوم العمل</h3>
                <p className="text-xs text-[#8E8E85]">هل أنت متأكد من رغبتك في حذف هذا التسجيل؟</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#2D2D2A]">
                <span>التاريخ: {deletingLog.date}</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white border border-rose-200">
                  {deletingLog.status === 'active' ? '🟢 نشط' : '🔴 متوقف'}
                </span>
              </div>
              {deletingLog.title && (
                <p className="text-xs text-rose-950 font-bold leading-relaxed pt-1">
                  "{deletingLog.title}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLog(null)}
                className="px-4 py-2 bg-white border border-[#E5E5E0] hover:bg-[#F5F5F0] text-[#2D2D2A] rounded-xl text-xs font-extrabold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmExecuteDelete}
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
