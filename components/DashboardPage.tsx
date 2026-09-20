import React, { useState } from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Flame,
  TrendingUp,
  Clock,
  Filter,
  Megaphone
} from 'lucide-react';
import { getBudgetDaysRemaining, isBudgetRechargeUrgent } from '../lib/budgetLogic';
import { formatLocalDate } from '../lib/dateUtils';
import {
  Client,
  TodoTask,
  BudgetAlarm
} from '../types';

interface DashboardPageProps {
  clients: Client[];
  todos: TodoTask[];
  budgetAlarms: BudgetAlarm[];
  onAddTodo: (title: string, priority: 'high' | 'medium' | 'low', dueDate?: string) => void;
  onToggleTodo: (id: string) => void;
  onEditTodo: (id: string, title: string, priority: 'high' | 'medium' | 'low', dueDate?: string) => void;
  onDeleteTodo: (id: string) => void;
  onAddBudgetAlarm?: (
    clientId: string,
    amount: number,
    startDate: string,
    expectedDays: number,
    platform?: string,
    notes?: string
  ) => void;
  onDeleteBudgetAlarm?: (id: string) => void;
  onSelectClient: (clientId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  clients,
  todos,
  budgetAlarms,
  onAddTodo,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
  onSelectClient
}) => {
  // 1. Date Filter State for Client Stats
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom' | 'all'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // 2. To Do List Modal & Form State
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  // Filtering Active Clients based on selected date filter
  const today = new Date();

  const isDateInFilter = (dateStr: string) => {
    if (dateRange === 'all') return true;
    if (!dateStr) return true;

    const date = new Date(dateStr);
    const dateNum = date.getTime();

    if (dateRange === 'custom') {
      if (customStartDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        if (dateNum < start.getTime()) return false;
      }
      if (customEndDate) {
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        if (dateNum > end.getTime()) return false;
      }
      return true;
    }

    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (dateRange === 'today') return diffDays <= 1;
    if (dateRange === 'week') return diffDays <= 7;
    if (dateRange === 'month') return diffDays <= 30;
    if (dateRange === 'year') return diffDays <= 365;
    return true;
  };

  const filteredClients = clients.filter((c) => isDateInFilter(c.createdAt));
  const activeClientsInPeriod = filteredClients.filter((c) => c.status === 'active');

  // Today Date String for Budget Alarm checking
  const todayStr = formatLocalDate(today);

  // Urgent Budget Alarms (Ending today or expired)
  const budgetAlerts = budgetAlarms.filter((alarm) => isBudgetRechargeUrgent(alarm, 2, todayStr));

  const handleAddTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    if (editingTodoId) {
      onEditTodo(editingTodoId, newTodoTitle, newTodoPriority, newTodoDueDate);
      setEditingTodoId(null);
    } else {
      onAddTodo(newTodoTitle, newTodoPriority, newTodoDueDate);
    }

    setNewTodoTitle('');
    setNewTodoDueDate('');
    setNewTodoPriority('medium');
  };

  const handleStartEditTodo = (todo: TodoTask) => {
    setEditingTodoId(todo.id);
    setNewTodoTitle(todo.title);
    setNewTodoPriority(todo.priority);
    setNewTodoDueDate(todo.dueDate || '');
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
      {/* 🚨 PROMINENT BUDGET ALARM ALERT BANNERS */}
      {budgetAlerts.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
          {budgetAlerts.map((alarm) => {
            const daysLeft = getBudgetDaysRemaining(alarm.endDate, todayStr);
            const isToday = daysLeft === 0;
            const isExpired = daysLeft < 0;
            const alertLabel = alarm.status === 'needs_recharge'
              ? 'تحتاج شحن'
              : isExpired
              ? 'منتهية الشحن!'
              : isToday
              ? 'تنتهي اليوم!'
              : daysLeft === 1
              ? 'تنتهي غدًا!'
              : `متبقي ${daysLeft} يوم`;
            return (
              <div
                key={alarm.id}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                  isToday
                    ? 'bg-[#FEF6E6] border-[#FAD9A5] text-[#A36813]'
                    : 'bg-[#F9EBE6] border-[#EACEC3] text-[#7D2D1C]'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`p-2.5 sm:p-3 rounded-xl shrink-0 mt-0.5 sm:mt-0 ${
                    !isExpired ? 'bg-[#FAD9A5] text-[#A36813]' : 'bg-[#EACEC3] text-[#7D2D1C]'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-[#2D2D2A]">
                        تنبيه ميزانية إعلانات: {alarm.brandName}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          !isExpired
                            ? 'bg-white text-[#A36813] border-[#FAD9A5]'
                            : 'bg-white text-[#7D2D1C] border-[#EACEC3]'
                        }`}
                      >
                        {alertLabel}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold mt-1 text-[#2D2D2A] leading-relaxed">
                      🚨 ميزانية إعلانات <strong className="underline underline-offset-4">{alarm.brandName}</strong> {alarm.campaignName ? `(${alarm.campaignName})` : ''} {isExpired ? 'انتهت وتحتاج للشحن.' : `موعد شحنها ${alertLabel}.`} (الميزانية: {alarm.amount.toLocaleString()} EGP &bull; المنصة: {alarm.platform || 'General'})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectClient(alarm.clientId)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#D14D35] hover:bg-[#B83E28] text-white font-bold rounded-xl text-xs transition shrink-0 cursor-pointer shadow-xs text-center"
                >
                  فتح صفحة البراند والشحن &larr;
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 1: CLIENT STATISTICS & DATE FILTER */}
      <section className="bg-white border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5E5E0] pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#E07A48] text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>نظرة عامة على الأداء</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2D2D2A]">إحصائيات العملاء والنمو</h2>
          </div>

          {/* Date Filter Controls */}
          <div className="flex flex-col gap-2.5 bg-[#F9F8F6] p-2 sm:p-2.5 rounded-2xl border border-[#E5E5E0] w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs text-[#78786E] px-1 font-medium flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                الفترة:
              </span>
              {[
                { id: 'today', label: 'اليوم' },
                { id: 'week', label: 'هذا الأسبوع' },
                { id: 'month', label: 'هذا الشهر' },
                { id: 'year', label: 'هذا العام' },
                { id: 'custom', label: 'فترة مخصصة 📅' },
                { id: 'all', label: 'جميع الأوقات' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateRange(f.id as any)}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                    dateRange === f.id
                      ? 'bg-[#E07A48] text-white shadow-xs'
                      : 'text-[#78786E] hover:text-[#2D2D2A] hover:bg-[#EFEFEA]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range Picker */}
            {dateRange === 'custom' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-[#E5E5E0] animate-in fade-in">
                <div className="flex items-center gap-1.5 bg-white border border-[#E5E5E0] px-3 py-1.5 rounded-xl text-xs flex-1">
                  <span className="text-[#78786E] text-[11px] shrink-0">من:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-transparent text-[#2D2D2A] font-bold outline-none w-full"
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-[#E5E5E0] px-3 py-1.5 rounded-xl text-xs flex-1">
                  <span className="text-[#78786E] text-[11px] shrink-0">إلى:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-transparent text-[#2D2D2A] font-bold outline-none w-full"
                  />
                </div>
                {(customStartDate || customEndDate) && (
                  <button
                    onClick={() => {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="text-[11px] text-[#E07A48] hover:underline font-bold px-2 text-center"
                  >
                    مسح التاريخ
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-[#FFF0E6] text-[#E07A48] rounded-xl border border-[#F7C6A5] shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#2D2D2A]">{clients.length}</div>
              <div className="text-xs text-[#78786E] font-semibold mt-0.5">إجمالي العملاء الحاليين</div>
            </div>
          </div>

          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-[#FFF0E6] text-[#E07A48] rounded-xl border border-[#F7C6A5] shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#E07A48]">{activeClientsInPeriod.length}</div>
              <div className="text-xs text-[#78786E] font-semibold mt-0.5">
                العملاء النشطين (الفترة المختارة)
              </div>
            </div>
          </div>

          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-[#FEF6E6] text-[#A36813] rounded-xl border border-[#FAD9A5] shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#A36813]">
                {clients.filter((c) => c.status === 'paused').length}
              </div>
              <div className="text-xs text-[#78786E] font-semibold mt-0.5">عملاء متوقفين مؤقتاً</div>
            </div>
          </div>

          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-[#F9EBE6] text-[#7D2D1C] rounded-xl border border-[#EACEC3] shrink-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#7D2D1C]">{budgetAlerts.length}</div>
              <div className="text-xs text-[#78786E] font-semibold mt-0.5">تنبيهات ميزانية نشطة</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 & 3: TO DO LIST & BUDGET ALARM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 2: TO DO LIST */}
        <section className="bg-white border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#FFF0E6] text-[#E07A48] rounded-xl border border-[#F7C6A5]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#2D2D2A]">To Do List (قائمة المهام)</h2>
                  <p className="text-xs text-[#78786E]">إدارة المهام والتنبيهات اليومية للأدمن</p>
                </div>
              </div>
            </div>

            {/* Add/Edit Todo Form */}
            <form onSubmit={handleAddTodoSubmit} className="space-y-3 mb-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder={editingTodoId ? 'تعديل المهمة...' : 'إضافة مهمة جديدة...'}
                  className="flex-1 min-w-0 bg-[#F9F8F6] border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-[#2D2D2A] placeholder-[#8E8E85] outline-none transition"
                />
                <button
                  type="submit"
                  className="px-3.5 sm:px-4 py-2.5 bg-[#E07A48] hover:bg-[#C8662B] text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  {editingTodoId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingTodoId ? 'حفظ' : 'إضافة'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 bg-[#F9F8F6] border border-[#E5E5E0] px-3 py-1.5 rounded-xl text-xs max-w-full">
                  <span className="text-[#78786E] shrink-0">الأولوية:</span>
                  <select
                    value={newTodoPriority}
                    onChange={(e) => setNewTodoPriority(e.target.value as any)}
                    className="bg-transparent text-[#2D2D2A] font-bold outline-none cursor-pointer min-w-0"
                  >
                    <option value="high" className="bg-white text-[#7D2D1C]">عالية 🔥</option>
                    <option value="medium" className="bg-white text-[#A36813]">متوسطة ⚡</option>
                    <option value="low" className="bg-white text-[#78786E]">عادية 📌</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-[#F9F8F6] border border-[#E5E5E0] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs max-w-full overflow-hidden min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-[#78786E] shrink-0" />
                  <input
                    type="date"
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                    className="bg-transparent text-[#2D2D2A] outline-none cursor-pointer max-w-[130px] sm:max-w-none text-xs border-0 p-0 text-ellipsis"
                  />
                </div>
              </div>
            </form>

            {/* Todo Items List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pl-1">
              {todos.length === 0 ? (
                <div className="text-center py-8 text-[#78786E] text-xs">
                  لا توجد مهام حالياً. أضف أول مهمة أعلاه 🚀
                </div>
              ) : (
                todos.map((task) => (
                  <div
                    key={task.id}
                    className={`p-2.5 sm:p-3 bg-[#F9F8F6] border rounded-2xl flex items-center justify-between gap-2 sm:gap-3 transition ${
                      task.completed
                        ? 'border-[#E5E5E0] opacity-60'
                        : 'border-[#E5E5E0] hover:border-[#D5D5CC]'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0 flex-1">
                      <button
                        onClick={() => onToggleTodo(task.id)}
                        className={`p-1 rounded-lg transition cursor-pointer shrink-0 ${
                          task.completed
                            ? 'text-[#E07A48] bg-[#FFF0E6]'
                            : 'text-[#78786E] hover:text-[#E07A48]'
                        }`}
                      >
                        {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </button>

                      <div className="truncate min-w-0 flex-1">
                        <div
                          className={`text-xs font-semibold truncate ${
                            task.completed ? 'line-through text-[#78786E]' : 'text-[#2D2D2A]'
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.dueDate && (
                          <div className="text-[10px] text-[#78786E] mt-0.5 flex items-center gap-1 truncate">
                            <Calendar className="w-3 h-3 text-[#78786E] shrink-0" />
                            <span className="truncate">الموعد: {task.dueDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          task.priority === 'high'
                            ? 'bg-[#F9EBE6] text-[#7D2D1C] border border-[#EACEC3]'
                            : task.priority === 'medium'
                            ? 'bg-[#FEF6E6] text-[#A36813] border border-[#FAD9A5]'
                            : 'bg-[#F0F0EA] text-[#78786E]'
                        }`}
                      >
                        {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'عادية'}
                      </span>

                      <button
                        onClick={() => handleStartEditTodo(task)}
                        className="p-1 text-[#78786E] hover:text-[#E07A48] rounded-lg hover:bg-white transition shrink-0"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteTodo(task.id)}
                        className="p-1 text-[#78786E] hover:text-[#D14D35] rounded-lg hover:bg-[#F9EBE6] transition shrink-0"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3: BUDGET ALARM */}
        <section className="bg-white border border-[#E5E5E0] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#FEF6E6] text-[#A36813] rounded-xl border border-[#FAD9A5]">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#2D2D2A]">Budget Alarm (تنبيه الميزانيات)</h2>
                  <p className="text-xs text-[#78786E]">متابعة حساب ميزانيات الإعلانات وتنبيه الشحن التلقائي</p>
                </div>
              </div>
            </div>

            {/* Budget Alarms List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pl-1">
              {budgetAlarms.length === 0 ? (
                <div className="text-center py-10 text-[#78786E] text-xs">
                  لا توجد تنبيهات ميزانيات مسجلة حالياً 🎯
                </div>
              ) : (
                budgetAlarms.map((alarm) => {
                  const isExpired = alarm.endDate < todayStr;
                  const isToday = alarm.endDate === todayStr;
                  const isPaused = alarm.status === 'paused';
                  const isCompleted = alarm.status === 'completed';
                  const needsRecharge = alarm.status === 'needs_recharge';

                  return (
                    <div
                      key={alarm.id}
                      onClick={() => onSelectClient(alarm.clientId)}
                      className={`p-4 bg-[#F9F8F6] border rounded-2xl transition relative overflow-hidden cursor-pointer hover:border-[#E07A48] hover:shadow-sm ${
                        isToday
                          ? 'border-[#FAD9A5] bg-[#FEF6E6]/60'
                          : isExpired
                          ? 'border-[#EACEC3] bg-[#F9EBE6]/60'
                          : 'border-[#E5E5E0] hover:border-[#D5D5CC]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-xs font-bold text-[#2D2D2A] block">
                            {alarm.brandName}
                          </span>
                          <span className="text-[10px] text-[#78786E]">
                            المنصة: <span className="text-[#E07A48] font-semibold">{alarm.platform || 'General'}</span>
                          </span>
                        </div>

                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                            isToday
                              ? 'bg-[#FEF6E6] text-[#A36813] border-[#FAD9A5] animate-pulse'
                              : isExpired
                              ? 'bg-[#F9EBE6] text-[#7D2D1C] border-[#EACEC3]'
                              : 'bg-[#FFF0E6] text-[#E07A48] border-[#F7C6A5]'
                          }`}
                        >
                          {isPaused
                            ? 'متوقفة مؤقتًا ⏸️'
                            : isCompleted
                            ? 'مكتملة ✅'
                            : needsRecharge
                            ? 'تحتاج شحن ⚠️'
                            : isToday
                            ? 'تنتهي اليوم 🔥'
                            : isExpired
                            ? 'منتهية ❌'
                            : 'نشطة ✅'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-[#E5E5E0] my-2 text-center text-xs">
                        <div>
                          <div className="text-[10px] text-[#78786E]">الميزانية</div>
                          <div className="font-extrabold text-[#E07A48] mt-0.5">
                            {alarm.amount.toLocaleString()} EGP
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#78786E]">البداية</div>
                          <div className="font-bold text-[#2D2D2A] mt-0.5">{alarm.startDate}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#78786E]">تاريخ الانتهاء</div>
                          <div className="font-bold text-[#A36813] mt-0.5">{alarm.endDate}</div>
                        </div>
                      </div>

                      {/* Alert Message Box */}
                      {isToday && !isPaused && !isCompleted && (
                        <div className="p-2 bg-[#FEF6E6] border border-[#FAD9A5] rounded-xl text-[11px] font-bold text-[#A36813] flex items-center gap-2 mt-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-[#A36813]" />
                          <span>"ميزانية إعلانات {alarm.brandName} ستنتهي اليوم ويجب شحنها."</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E5E5E0] text-[10px] text-[#78786E]">
                        <span>المدة: {alarm.expectedDays} أيام</span>
                        <span className="text-[#E07A48] font-bold hover:underline">
                          فتح صفحة البراند &larr;
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
