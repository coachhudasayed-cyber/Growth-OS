import React from 'react';
import { Search, Calendar, X, Filter, RotateCcw } from 'lucide-react';

export type DateFilterPreset = 'all' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom';
export type DatePreset = DateFilterPreset;

export const getDateRangeFromPreset = (preset: DateFilterPreset): { startDate: string; endDate: string } => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  if (preset === '7days') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
  }
  if (preset === '30days') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
  }
  if (preset === 'thisMonth') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  }
  if (preset === 'lastMonth') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  }
  return { startDate: '', endDate: '' };
};

interface ReportFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  datePreset: DateFilterPreset;
  onDatePresetChange: (preset: DateFilterPreset) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'بحث بالاسم أو الكلمات...',
  datePreset,
  onDatePresetChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  totalCount,
  filteredCount,
  onClearFilters
}) => {
  const isFiltered =
    Boolean(searchQuery.trim()) ||
    datePreset !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="bg-white border border-[#E5E5E0] rounded-2xl p-3 sm:p-4 space-y-3 shadow-2xs">
      {/* Top row: Search input + Results counter + Reset button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8E8E85] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl pr-9 pl-8 py-2 text-xs font-bold text-[#2D2D2A] placeholder-[#8E8E85] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8E8E85] hover:text-[#2D2D2A] p-0.5 rounded-md transition cursor-pointer"
              title="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter and Clear Filters button */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <span className="text-[11px] font-bold text-[#8E8E85] bg-[#F9F8F6] px-2.5 py-1.5 rounded-xl border border-[#E5E5E0] whitespace-nowrap">
            {isFiltered ? (
              <span>
                عرض <strong className="text-[#5A5A40]">{filteredCount}</strong> من {totalCount}
              </span>
            ) : (
              <span>
                الإجمالي: <strong className="text-[#2D2D2A]">{totalCount}</strong>
              </span>
            )}
          </span>

          {isFiltered && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="إعادة ضبط الفلاتر"
            >
              <RotateCcw className="w-3 h-3" />
              <span>مسح الفلتر</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Filter Row: Presets + Date Inputs */}
      <div className="pt-2 border-t border-[#E5E5E0]/70 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Quick Presets */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0 flex-nowrap sm:flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#5A5A40] ml-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>الفترة:</span>
          </div>

          <button
            type="button"
            onClick={() => onDatePresetChange('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              datePreset === 'all'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'bg-[#F9F8F6] text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F0EFEA]'
            }`}
          >
            الكل
          </button>

          <button
            type="button"
            onClick={() => onDatePresetChange('7days')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              datePreset === '7days'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'bg-[#F9F8F6] text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F0EFEA]'
            }`}
          >
            آخر 7 أيام
          </button>

          <button
            type="button"
            onClick={() => onDatePresetChange('30days')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              datePreset === '30days'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'bg-[#F9F8F6] text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F0EFEA]'
            }`}
          >
            آخر 30 يوم
          </button>

          <button
            type="button"
            onClick={() => onDatePresetChange('thisMonth')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              datePreset === 'thisMonth'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'bg-[#F9F8F6] text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F0EFEA]'
            }`}
          >
            هذا الشهر
          </button>

          <button
            type="button"
            onClick={() => onDatePresetChange('lastMonth')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              datePreset === 'lastMonth'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'bg-[#F9F8F6] text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F0EFEA]'
            }`}
          >
            الشهر الماضي
          </button>

          <button
            type="button"
            onClick={() => onDatePresetChange('custom')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              datePreset === 'custom'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'bg-[#F9F8F6] text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F0EFEA]'
            }`}
          >
            فترة مخصصة
          </button>
        </div>

        {/* Date Pickers (Shown always or styled nicely) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-2 py-1 flex-1 sm:flex-initial">
            <span className="text-[10px] font-bold text-[#8E8E85]">من:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                onStartDateChange(e.target.value);
                if (datePreset !== 'custom') onDatePresetChange('custom');
              }}
              className="bg-transparent text-xs font-bold text-[#2D2D2A] focus:outline-none cursor-pointer w-full sm:w-auto"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-2 py-1 flex-1 sm:flex-initial">
            <span className="text-[10px] font-bold text-[#8E8E85]">إلى:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                onEndDateChange(e.target.value);
                if (datePreset !== 'custom') onDatePresetChange('custom');
              }}
              className="bg-transparent text-xs font-bold text-[#2D2D2A] focus:outline-none cursor-pointer w-full sm:w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
