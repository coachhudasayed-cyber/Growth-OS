import React from 'react';
import { Calendar, RotateCcw, CalendarDays, Filter } from 'lucide-react';

export interface MonthOption {
  value: string; // YYYY-MM
  label: string; // e.g. "سبتمبر 2026"
}

interface FinancialPeriodFilterProps {
  filterMode: 'all' | 'month' | 'custom';
  setFilterMode: (mode: 'all' | 'month' | 'custom') => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;
  availableMonths: MonthOption[];
  onReset: () => void;
}

export const FinancialPeriodFilter: React.FC<FinancialPeriodFilterProps> = ({
  filterMode,
  setFilterMode,
  selectedMonth,
  setSelectedMonth,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  availableMonths,
  onReset
}) => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  return (
    <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3 sm:px-4 sm:py-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
      {/* Quick Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap pb-1 sm:pb-0 shrink-0">
        <span className="text-xs font-bold text-[#8E8E85] flex items-center gap-1.5 me-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-[#5A5A40]" />
          <span>الفترة:</span>
        </span>

        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            filterMode === 'all'
              ? 'bg-[#5A5A40] text-white shadow-2xs'
              : 'bg-white text-[#5A5A40] border border-[#E5E5E0] hover:bg-neutral-100'
          }`}
        >
          كل الفترات
        </button>

        <button
          onClick={() => {
            setFilterMode('month');
            setSelectedMonth(currentMonthStr);
          }}
          className={`px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            filterMode === 'month' && selectedMonth === currentMonthStr
              ? 'bg-[#5A5A40] text-white shadow-2xs'
              : 'bg-white text-[#5A5A40] border border-[#E5E5E0] hover:bg-neutral-100'
          }`}
        >
          هذا الشهر
        </button>

        <button
          onClick={() => {
            const d = new Date();
            d.setMonth(d.getMonth() - 1);
            const prevMonthStr = d.toISOString().slice(0, 7);
            setFilterMode('month');
            setSelectedMonth(prevMonthStr);
          }}
          className={`px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            filterMode === 'month' && selectedMonth !== currentMonthStr
              ? 'bg-[#5A5A40] text-white shadow-2xs'
              : 'bg-white text-[#5A5A40] border border-[#E5E5E0] hover:bg-neutral-100'
          }`}
        >
          الشهر السابق
        </button>

        <button
          onClick={() => setFilterMode('custom')}
          className={`px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            filterMode === 'custom'
              ? 'bg-[#5A5A40] text-white shadow-2xs'
              : 'bg-white text-[#5A5A40] border border-[#E5E5E0] hover:bg-neutral-100'
          }`}
        >
          مخصص
        </button>

        {(filterMode !== 'all' || customStartDate || customEndDate) && (
          <button
            onClick={onReset}
            title="إعادة ضبط الفلترة"
            className="p-1.5 sm:p-1 text-[#8E8E85] hover:text-rose-600 rounded-lg transition cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dynamic Selector (Month / Custom Dates) */}
      {filterMode === 'month' && (
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E5E5E0]">
          <span className="text-xs text-[#8E8E85] font-bold sm:hidden flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5 text-[#5A5A40]" />
            اختر الشهر:
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <CalendarDays className="w-3.5 h-3.5 text-[#5A5A40] hidden sm:inline-block" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-[#E5E5E0] rounded-xl px-2.5 py-1.5 sm:py-1 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] cursor-pointer w-full sm:w-auto"
            >
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filterMode === 'custom' && (
        <div className="pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E5E5E0] w-full sm:w-auto">
          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 text-xs text-[#5A5A40] w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-white border border-[#E5E5E0] rounded-xl px-2 py-1">
              <span className="text-[10px] text-[#8E8E85] shrink-0">من:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full text-xs text-[#2D2D2A] font-bold focus:outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-[#E5E5E0] rounded-xl px-2 py-1">
              <span className="text-[10px] text-[#8E8E85] shrink-0">إلى:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full text-xs text-[#2D2D2A] font-bold focus:outline-none bg-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
