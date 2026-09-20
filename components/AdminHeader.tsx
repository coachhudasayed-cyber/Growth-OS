import React, { useState } from 'react';
import { Bell, AlertTriangle, Calendar, Search } from 'lucide-react';
import { BudgetAlarm, UserRole } from '../types';
import { getBudgetDaysRemaining, isBudgetRechargeUrgent } from '../lib/budgetLogic';
import { formatLocalDate } from '../lib/dateUtils';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  budgetAlarms: BudgetAlarm[];
  onSelectClientAlarm?: (clientId: string) => void;
  userRole?: UserRole;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  budgetAlarms,
  onSelectClientAlarm,
  userRole
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const todayStr = formatLocalDate();

  // Filter urgent budget alarms (ending today or already expired)
  const urgentAlarms = budgetAlarms.filter((alarm) => isBudgetRechargeUrgent(alarm, 2, todayStr));

  const currentDateFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-[#F9F8F6]/90 backdrop-blur-md border-b border-[#E5E5E0] px-3.5 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-base sm:text-xl font-extrabold text-[#2D2D2A] tracking-tight">{title}</h1>
        {subtitle && <p className="text-[11px] sm:text-xs text-[#78786E] mt-0.5 line-clamp-1 sm:line-clamp-none">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#E07A48] bg-white px-3.5 py-2 rounded-xl border border-[#E5E5E0] shadow-xs">
          <Calendar className="w-4 h-4 text-[#E07A48]" />
          <span>{currentDateFormatted}</span>
        </div>

        {/* Budget Alarms Bell Notification Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className={`p-2 sm:p-2.5 rounded-xl border transition relative cursor-pointer ${
              urgentAlarms.length > 0
                ? 'bg-[#F9EBE6] border-[#EACEC3] text-[#D14D35] animate-pulse'
                : 'bg-white border-[#E5E5E0] text-[#78786E] hover:text-[#2D2D2A] shadow-xs'
            }`}
            title="تنبيهات الميزانيات"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {urgentAlarms.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D14D35] text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white">
                {urgentAlarms.length}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showAlertsDropdown && (
            <div className="absolute left-0 right-0 sm:right-auto mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white border border-[#E5E5E0] rounded-2xl shadow-xl p-3.5 sm:p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2 mb-3">
                <div className="flex items-center gap-2 text-[#D14D35] font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>تنبيهات ميزانيات الإعلانات ({urgentAlarms.length})</span>
                </div>
                <button
                  onClick={() => setShowAlertsDropdown(false)}
                  className="text-xs text-[#78786E] hover:text-[#2D2D2A]"
                >
                  إغلاق
                </button>
              </div>

              {urgentAlarms.length === 0 ? (
                <div className="text-center py-6 text-[#78786E] text-xs">
                  لا توجد تنبيهات ميزانيات منتهية أو تشرف على الانتهاء اليوم 👍
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {urgentAlarms.map((alarm) => {
                    const daysLeft = getBudgetDaysRemaining(alarm.endDate, todayStr);
                    const alertLabel = alarm.status === 'needs_recharge'
                      ? 'تحتاج شحن'
                      : daysLeft < 0
                      ? 'منتهية'
                      : daysLeft === 0
                      ? 'تنتهي اليوم'
                      : daysLeft === 1
                      ? 'تنتهي غدًا'
                      : `متبقي ${daysLeft} يوم`;
                    return (
                      <div
                        key={alarm.id}
                        onClick={() => {
                          if (onSelectClientAlarm) {
                            onSelectClientAlarm(alarm.clientId);
                            setShowAlertsDropdown(false);
                          }
                        }}
                        className="p-3 bg-[#F9F8F6] hover:bg-[#F5F5F0] border border-[#EACEC3] rounded-xl transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-[#2D2D2A] mb-1">
                          <div>
                            <span>{alarm.brandName}</span>
                            {alarm.campaignName && (
                              <span className="text-[10px] text-[#8E8E85] font-normal block">
                                {alarm.campaignName} ({alarm.platform || 'Ads'})
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              daysLeft >= 0
                                ? 'bg-[#FEF6E6] text-[#A36813] border border-[#FAD9A5]'
                                : 'bg-[#F9EBE6] text-[#7D2D1C] border border-[#EACEC3]'
                            }`}
                          >
                            {alertLabel}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#2D2D2A] mt-1">
                          الميزانية: <strong className="text-[#E07A48]">{alarm.amount.toLocaleString()} EGP / SAR</strong> &bull; تنتهي بتاريخ: {alarm.endDate}
                        </p>

                        <p className="text-[10px] text-[#D14D35] font-semibold mt-1">
                          🚨 ميزانية إعلانات {alarm.brandName} {daysLeft < 0 ? 'انتهت وتحتاج للشحن.' : `موعد شحنها ${alertLabel}.`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
