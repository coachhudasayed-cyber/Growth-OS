import React, { useState } from 'react';
import {
  Building2,
  ExternalLink,
  Globe,
  FileText,
  FolderOpen,
  ShieldCheck,
  User,
  LogOut,
  ArrowRight,
  ShieldAlert,
  BarChart2,
  Megaphone,
  Calendar,
  UserCheck,
  StickyNote,
  FileSpreadsheet,
  Award,
  Clock,
  CalendarRange,
  DollarSign
} from 'lucide-react';
import {
  Client,
  UserRole,
  AdminTab,
  ClientTab,
  BrandAudit,
  ContentPlanItem,
  AdsPlanItem,
  ClientAdsStageStrategy,
  BudgetAlarm,
  ClientDailyReport,
  WeeklyReport,
  MonthlyReport,
  QuarterlyReport,
  AdminDailyReport,
  NoteItem,
  DailyWorkLog,
  PaymentRecord,
  PaymentStatus,
  Agreement
} from '../types';

import { DailyWorkTrackingTab } from './tabs/DailyWorkTrackingTab';
import { BrandAuditTab } from './tabs/BrandAuditTab';
import { ContentPlanTab } from './tabs/ContentPlanTab';
import { AdsPlanTab } from './tabs/AdsPlanTab';
import { AdsBudgetTab } from './tabs/AdsBudgetTab';
import { ClientDailyReportsTab } from './tabs/ClientDailyReportsTab';
import { WeeklyReportsTab } from './tabs/WeeklyReportsTab';
import { MonthlyReportsTab } from './tabs/MonthlyReportsTab';
import { AdminDailyReportsTab } from './tabs/AdminDailyReportsTab';
import { NotesTab } from './tabs/NotesTab';

interface BrandPageViewProps {
  client: Client;
  userRole: UserRole;
  currentUserName: string;
  onBackToAdminDashboard?: () => void;
  onLogout: () => void;
  // App Data
  dailyWorkLogs: DailyWorkLog[];
  brandAudit?: BrandAudit;
  contentPlans: ContentPlanItem[];
  adsPlans: AdsPlanItem[];
  clientAdsStrategy?: ClientAdsStageStrategy;
  budgetAlarms: BudgetAlarm[];
  payments?: PaymentRecord[];
  agreements?: Agreement[];
  clientDailyReports: ClientDailyReport[];
  weeklyReports: WeeklyReport[];
  monthlyReports: MonthlyReport[];
  quarterlyReports?: QuarterlyReport[];
  adminDailyReports: AdminDailyReport[];
  notes: NoteItem[];
  // Handlers
  onAddDailyWorkLog: (log: Omit<DailyWorkLog, 'id' | 'createdAt'>) => void;
  onUpdateDailyWorkLog?: (id: string, updatedFields: Partial<DailyWorkLog>) => void;
  onDeleteDailyWorkLog: (id: string) => void;
  onUpdateBrandAudit: (clientId: string, audit: BrandAudit) => void;
  onAddContentItem: (item: Omit<ContentPlanItem, 'id'>) => void;
  onUpdateContentItem: (id: string, fields: Partial<ContentPlanItem>) => void;
  onDeleteContentItem: (id: string) => void;
  onAddAdsPlanItem: (item: Omit<AdsPlanItem, 'id'>) => void;
  onUpdateAdsPlanItem: (id: string, fields: Partial<AdsPlanItem>) => void;
  onDeleteAdsPlanItem: (id: string) => void;
  onUpdateClientAdsStrategy?: (clientId: string, strategy: Partial<ClientAdsStageStrategy>) => void;
  onAddBudgetAlarm: (
    clientId: string,
    amount: number,
    startDate: string,
    expectedDays: number,
    platform?: string,
    notes?: string,
    campaignName?: string,
    status?: 'active' | 'paused' | 'completed' | 'needs_recharge'
  ) => void;
  onUpdateBudgetAlarm?: (id: string, fields: Partial<BudgetAlarm>) => void;
  onRechargeBudgetAlarm?: (
    id: string,
    newAmount: number,
    newExpectedDays: number,
    newStartDate?: string,
    rechargeNotes?: string
  ) => void;
  onDeleteBudgetAlarm: (id: string) => void;
  onAddPayment?: (paymentData: Omit<PaymentRecord, 'id'>) => void;
  onUpdatePayment?: (id: string, paymentData: Partial<PaymentRecord>) => void;
  onUpdatePaymentStatus?: (id: string, status: PaymentStatus) => void;
  onDeletePayment?: (id: string) => void;
  onAddClientDailyReport: (rep: Omit<ClientDailyReport, 'id'>) => void;
  onUpdateClientDailyReport?: (id: string, fields: Partial<ClientDailyReport>) => void;
  onDeleteClientDailyReport?: (id: string) => void;
  onAddWeeklyReport: (rep: Omit<WeeklyReport, 'id'>) => void;
  onUpdateWeeklyReport?: (id: string, fields: Partial<WeeklyReport>) => void;
  onDeleteWeeklyReport?: (id: string) => void;
  onAddMonthlyReport: (rep: Omit<MonthlyReport, 'id'>) => void;
  onUpdateMonthlyReport?: (id: string, fields: Partial<MonthlyReport>) => void;
  onDeleteMonthlyReport?: (id: string) => void;
  onAddQuarterlyReport?: (rep: Omit<QuarterlyReport, 'id' | 'createdAt'>) => void;
  onUpdateQuarterlyReport?: (id: string, fields: Partial<QuarterlyReport>) => void;
  onDeleteQuarterlyReport?: (id: string) => void;
  onAddAdminDailyReport: (rep: Omit<AdminDailyReport, 'id'>) => void;
  onUpdateAdminDailyReport?: (id: string, fields: Partial<AdminDailyReport>) => void;
  onDeleteAdminDailyReport?: (id: string) => void;
  onAddNote: (note: Omit<NoteItem, 'id'>) => void;
  onUpdateNote?: (id: string, fields: Partial<NoteItem>) => void;
  onToggleNotePin: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export const BrandPageView: React.FC<BrandPageViewProps> = ({
  client,
  userRole,
  currentUserName,
  onBackToAdminDashboard,
  onLogout,
  dailyWorkLogs,
  brandAudit,
  contentPlans,
  adsPlans,
  clientAdsStrategy,
  budgetAlarms,
  payments = [],
  agreements = [],
  clientDailyReports,
  weeklyReports,
  monthlyReports,
  quarterlyReports = [],
  adminDailyReports,
  notes,
  onAddPayment,
  onUpdatePayment,
  onUpdatePaymentStatus,
  onDeletePayment,
  onAddDailyWorkLog,
  onUpdateDailyWorkLog,
  onDeleteDailyWorkLog,
  onUpdateBrandAudit,
  onAddContentItem,
  onUpdateContentItem,
  onDeleteContentItem,
  onAddAdsPlanItem,
  onUpdateAdsPlanItem,
  onDeleteAdsPlanItem,
  onUpdateClientAdsStrategy,
  onAddBudgetAlarm,
  onUpdateBudgetAlarm,
  onRechargeBudgetAlarm,
  onDeleteBudgetAlarm,
  onAddClientDailyReport,
  onUpdateClientDailyReport,
  onDeleteClientDailyReport,
  onAddWeeklyReport,
  onUpdateWeeklyReport,
  onDeleteWeeklyReport,
  onAddMonthlyReport,
  onUpdateMonthlyReport,
  onDeleteMonthlyReport,
  onAddQuarterlyReport,
  onUpdateQuarterlyReport,
  onDeleteQuarterlyReport,
  onAddAdminDailyReport,
  onUpdateAdminDailyReport,
  onDeleteAdminDailyReport,
  onAddNote,
  onUpdateNote,
  onToggleNotePin,
  onDeleteNote
}) => {
  const [activeTab, setActiveTab] = useState<string>('audit');

  // Role-Based Tabs Definition
  interface TabItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    adminOnly?: boolean;
  }

  const adminTabsList: TabItem[] = [
    { id: 'audit', label: 'Brand Audit', icon: Award },
    { id: 'content', label: 'Content Strategy', icon: Calendar },
    { id: 'ads_budget', label: 'Financial Tracking', icon: DollarSign },
    { id: 'client_daily', label: 'Client Daily Reports', icon: FileSpreadsheet },
    { id: 'weekly', label: 'Weekly Reports', icon: BarChart2 },
    { id: 'monthly_reports', label: 'Monthly & Quarterly Reports', icon: CalendarRange },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'ads_plan', label: 'Ads Plan', icon: Megaphone, adminOnly: true },
    { id: 'daily_work', label: 'Daily Work Tracker', icon: Clock, adminOnly: true },
    { id: 'admin_daily', label: 'Admin Daily Reports', icon: UserCheck, adminOnly: true }
  ];

  const clientTabsList: TabItem[] = [
    { id: 'audit', label: 'Brand Audit', icon: Award },
    { id: 'content', label: 'Content Strategy', icon: Calendar },
    { id: 'ads_budget', label: 'Financial Tracking', icon: DollarSign },
    { id: 'client_daily', label: 'Client Daily Reports', icon: FileSpreadsheet },
    { id: 'weekly', label: 'Weekly Reports', icon: BarChart2 },
    { id: 'monthly_reports', label: 'Monthly & Quarterly Reports', icon: CalendarRange },
    { id: 'notes', label: 'Notes', icon: StickyNote }
  ];

  // Employee sees client tabs plus Admin Daily Reports
  const employeeTabsList: TabItem[] = [
    { id: 'audit', label: 'Brand Audit', icon: Award },
    { id: 'content', label: 'Content Strategy', icon: Calendar },
    { id: 'ads_budget', label: 'Financial Tracking', icon: DollarSign },
    { id: 'client_daily', label: 'Client Daily Reports', icon: FileSpreadsheet },
    { id: 'weekly', label: 'Weekly Reports', icon: BarChart2 },
    { id: 'monthly_reports', label: 'Monthly & Quarterly Reports', icon: CalendarRange },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'admin_daily', label: 'Admin Daily Reports', icon: UserCheck }
  ];

  const availableTabs =
    userRole === 'admin'
      ? adminTabsList
      : userRole === 'employee'
      ? employeeTabsList
      : clientTabsList;

  // Strict Role Guard: Ensure non-admins cannot access admin-only tabs, and clients cannot access internal reports
  const isTabBlocked =
    (userRole !== 'admin' && (activeTab === 'ads_plan' || activeTab === 'daily_work')) ||
    (userRole === 'client' && activeTab === 'admin_daily');

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2D2D2A] flex flex-col">
      {/* BRAND TOP HEADER BAR */}
      <header className="bg-[#F9F8F6] border-b border-[#E5E5E0] px-3.5 sm:px-6 py-3.5 sm:py-5 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-[#F9F8F6]/90">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* If Admin or Employee, show Back Button */}
            {(userRole === 'admin' || userRole === 'employee') && onBackToAdminDashboard && (
              <button
                onClick={onBackToAdminDashboard}
                className="p-2 sm:p-2.5 bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] rounded-2xl border border-[#E5E5E0] transition flex items-center gap-1.5 sm:gap-2 text-xs font-bold cursor-pointer shrink-0 shadow-xs"
              >
                <ArrowRight className="w-4 h-4" />
                <span>{userRole === 'employee' ? 'العودة لقائمة العملاء' : 'العودة للوحة الأدمن'}</span>
              </button>
            )}

            <div className="p-2.5 sm:p-3 bg-[#5A5A40] rounded-2xl shadow-xs text-white shrink-0">
              <Building2 className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-2xl font-black text-[#2D2D2A] tracking-tight">
                  {client.brandName}
                </h1>
                <span
                  className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] font-extrabold border ${
                    client.status === 'active'
                      ? 'bg-amber-500/10 text-amber-800 border-amber-500/20'
                      : client.status === 'paused'
                      ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                  }`}
                >
                  {client.status === 'active'
                    ? 'نشط Active'
                    : client.status === 'paused'
                    ? 'مؤقت Paused'
                    : 'منتهي Finished'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8E8E85] mt-0.5 font-medium">
                العميل: <strong className="text-[#2D2D2A]">{client.name}</strong> &bull; البريد: {client.email}
              </p>
            </div>
          </div>

          {/* Quick External Links & User Logout */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl border border-[#E5E5E0] text-xs text-[#2D2D2A]">
              {client.brandPageUrl && (
                <a
                  href={client.brandPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:text-[#5A5A40] hover:bg-[#F5F5F0] rounded-lg transition"
                  title="صفحة البراند"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {client.websiteUrl && (
                <a
                  href={client.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:text-amber-800 hover:bg-[#F5F5F0] rounded-lg transition"
                  title="الموقع الإلكتروني"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {userRole !== 'client' && client.driveFolderUrl && (
                <a href={client.driveFolderUrl} target="_blank" rel="noreferrer" className="p-1.5 hover:text-blue-700 hover:bg-[#F5F5F0] rounded-lg transition" title="ملفات البراند على Google Drive" aria-label="فتح ملفات البراند">
                  <FolderOpen className="w-4 h-4" />
                </a>
              )}
              {(client.formAnswersUrl || client.formUrl) && (
                <a
                  href={client.formAnswersUrl || client.formUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:text-amber-700 hover:bg-[#F5F5F0] rounded-lg transition"
                  title="رابط إجابات الفورم"
                >
                  <FileText className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Current User Role Info */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 sm:py-2 rounded-2xl border border-[#E5E5E0] text-xs">
              <span
                className={`p-1 rounded-lg ${
                  userRole === 'admin'
                    ? 'text-amber-700'
                    : userRole === 'employee'
                    ? 'text-[#E07A48]'
                    : 'text-orange-700'
                }`}
              >
                {userRole === 'admin' || userRole === 'employee' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </span>
              <div className="text-right">
                <div className="font-bold text-[#2D2D2A] leading-tight text-[11px] sm:text-xs">{currentUserName}</div>
                <div className="text-[9px] sm:text-[10px] text-[#8E8E85]">
                  {userRole === 'admin'
                    ? 'الأدمن (Admin)'
                    : userRole === 'employee'
                    ? 'موظف الفريق (Employee)'
                    : 'حساب العميل (Client)'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 sm:p-2.5 text-[#8E8E85] hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#E5E5E0] rounded-2xl transition cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION BAR */}
        <div className="max-w-7xl mx-auto mt-3 sm:mt-5 pt-2.5 sm:pt-3 border-t border-[#E5E5E0] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max pb-1">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#5A5A40] text-white shadow-xs'
                      : 'bg-white text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] border border-[#E5E5E0]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{tab.label}</span>
                  {tab.adminOnly && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-800 px-1.5 py-0.5 rounded-md font-extrabold">
                      Admin
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* TABS CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6">
        {/* Strict Role Access Check */}
        {isTabBlocked ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-10 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
            <h2 className="text-xl font-extrabold text-rose-900">
              غير مصرح لك بالوصول إلى هذه الصفحة (Role Security)
            </h2>
            <p className="text-xs text-rose-700 max-w-md mx-auto">
              ليس لديك صلاحية الوصول إلى هذه الصفحة.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'daily_work' && userRole === 'admin' && (
              <DailyWorkTrackingTab
                logs={dailyWorkLogs}
                clientId={client.id}
                userRole={userRole}
                onAddLog={onAddDailyWorkLog}
                onUpdateLog={onUpdateDailyWorkLog}
                onDeleteLog={onDeleteDailyWorkLog}
              />
            )}

            {activeTab === 'audit' && (
              <BrandAuditTab
                audit={brandAudit}
                clientId={client.id}
                userRole={userRole}
                onUpdateAudit={onUpdateBrandAudit}
              />
            )}

            {activeTab === 'content' && (
              <ContentPlanTab
                contentPlans={contentPlans}
                clientId={client.id}
                brandName={client.brandName}
                userRole={userRole}
                onAddContentItem={onAddContentItem}
                onUpdateContentItem={onUpdateContentItem}
                onDeleteContentItem={onDeleteContentItem}
              />
            )}

            {activeTab === 'ads_plan' && userRole === 'admin' && (
              <AdsPlanTab
                adsPlans={adsPlans}
                clientAdsStrategy={clientAdsStrategy}
                clientId={client.id}
                brandName={client.brandName || client.name}
                userRole={userRole}
                onAddAdsPlanItem={onAddAdsPlanItem}
                onUpdateAdsPlanItem={onUpdateAdsPlanItem}
                onDeleteAdsPlanItem={onDeleteAdsPlanItem}
                onUpdateClientAdsStrategy={onUpdateClientAdsStrategy}
              />
            )}

            {activeTab === 'ads_budget' && (
              <AdsBudgetTab
                budgetAlarms={budgetAlarms}
                clientId={client.id}
                brandName={client.brandName}
                userRole={userRole}
                payments={payments}
                onAddBudgetAlarm={onAddBudgetAlarm}
                onUpdateBudgetAlarm={onUpdateBudgetAlarm}
                onRechargeBudgetAlarm={onRechargeBudgetAlarm}
                onDeleteBudgetAlarm={onDeleteBudgetAlarm}
                onAddPayment={onAddPayment}
                onUpdatePayment={onUpdatePayment}
                onUpdatePaymentStatus={onUpdatePaymentStatus}
                onDeletePayment={onDeletePayment}
              />
            )}

            {activeTab === 'client_daily' && (
              <ClientDailyReportsTab
                reports={clientDailyReports}
                clientId={client.id}
                userRole={userRole}
                onAddReport={onAddClientDailyReport}
                onUpdateReport={onUpdateClientDailyReport}
                onDeleteReport={onDeleteClientDailyReport}
              />
            )}

            {activeTab === 'weekly' && (
              <WeeklyReportsTab
                reports={weeklyReports}
                clientId={client.id}
                brandName={client.brandName || client.name}
                userRole={userRole}
                onAddReport={onAddWeeklyReport}
                onUpdateReport={onUpdateWeeklyReport}
                onDeleteReport={onDeleteWeeklyReport}
              />
            )}

            {activeTab === 'monthly_reports' && (
              <MonthlyReportsTab
                reports={monthlyReports}
                quarterlyReports={quarterlyReports}
                clientId={client.id}
                brandName={client.brandName || client.name}
                userRole={userRole}
                onAddReport={onAddMonthlyReport}
                onUpdateReport={onUpdateMonthlyReport}
                onDeleteReport={onDeleteMonthlyReport}
                onAddQuarterlyReport={onAddQuarterlyReport}
                onUpdateQuarterlyReport={onUpdateQuarterlyReport}
                onDeleteQuarterlyReport={onDeleteQuarterlyReport}
              />
            )}

            {activeTab === 'admin_daily' && (userRole === 'admin' || userRole === 'employee') && (
              <AdminDailyReportsTab
                reports={adminDailyReports}
                clientId={client.id}
                userRole={userRole}
                budgetAlarms={budgetAlarms}
                onAddReport={onAddAdminDailyReport}
                onUpdateReport={onUpdateAdminDailyReport}
                onDeleteReport={onDeleteAdminDailyReport}
              />
            )}

            {activeTab === 'notes' && (
              <NotesTab
                notes={notes}
                clientId={client.id}
                currentUserRole={userRole}
                currentUserName={currentUserName}
                onAddNote={onAddNote}
                onUpdateNote={onUpdateNote}
                onToggleNotePin={onToggleNotePin}
                onDeleteNote={onDeleteNote}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
