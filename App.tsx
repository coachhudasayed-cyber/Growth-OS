import React, { useState } from 'react';
import { useAppData } from './lib/store';
import { LoginPage } from './components/LoginPage';
import { Sidebar, AdminPage } from './components/Sidebar';
import { AdminHeader } from './components/AdminHeader';
import { DashboardPage } from './components/DashboardPage';
import { AccountsPage } from './components/AccountsPage';
import { ClientsPage } from './components/ClientsPage';
import { BrandPageView } from './components/BrandPageView';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

export default function App() {
  const store = useAppData();

  const {
    currentUser,
    clients,
    todos,
    budgetAlarms,
    agreements,
    payments,
    dailyWorkLogs,
    brandAudits,
    contentPlans,
    adsPlans,
    clientAdsStrategies,
    clientDailyReports,
    weeklyReports,
    monthlyReports,
    quarterlyReports,
    adminDailyReports,
    notes,
    login,
    registerAdmin,
    logout,
    addClient,
    updateClient,
    deleteClient,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    addBudgetAlarm,
    updateBudgetAlarm,
    rechargeBudgetAlarm,
    deleteBudgetAlarm,
    addAgreement,
    deleteAgreement,
    addPayment,
    updatePaymentStatus,
    updatePayment,
    deletePayment,
    addDailyWorkLog,
    updateDailyWorkLog,
    deleteDailyWorkLog,
    updateBrandAudit,
    addContentItem,
    updateContentItem,
    deleteContentItem,
    addAdsPlanItem,
    updateAdsPlanItem,
    deleteAdsPlanItem,
    updateClientAdsStrategy,
    addClientDailyReport,
    updateClientDailyReport,
    deleteClientDailyReport,
    addWeeklyReport,
    updateWeeklyReport,
    deleteWeeklyReport,
    addMonthlyReport,
    updateMonthlyReport,
    deleteMonthlyReport,
    addQuarterlyReport,
    updateQuarterlyReport,
    deleteQuarterlyReport,
    addAdminDailyReport,
    updateAdminDailyReport,
    deleteAdminDailyReport,
    addNote,
    updateNote,
    toggleNotePin,
    deleteNote
  } = store;

  // Active Navigation State for Admin
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // If user is employee, allow dashboard and clients (prevent accounts)
  const currentActivePage: AdminPage =
    currentUser?.role === 'employee' && adminPage === 'accounts' ? 'dashboard' : adminPage;

  if (!store.ready) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">جارٍ تحميل النظام...</div>;
  }

  if (!currentUser) {
    return <LoginPage onLogin={login} onRegisterAdmin={registerAdmin} authError={store.authError} />;
  }

  // 2. CLIENT ROLE -> DIRECT BRAND PAGE VIEW ONLY (Bypasses Admin Layout completely)
  if (currentUser.role === 'client') {
    // Determine target client
    const targetClient =
      clients.find((c) => c.id === currentUser.clientId) ||
      clients.find((c) => c.email.toLowerCase() === currentUser.email.toLowerCase());

    if (!targetClient) {
      return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#2D2D2A] flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold">لا يوجد براند مرتبط بهذا الحساب حالياً</h2>
            <button
              onClick={logout}
              className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <BrandPageView
          client={targetClient}
          userRole="client"
          currentUserName={currentUser.name}
          onLogout={logout}
          dailyWorkLogs={dailyWorkLogs}
          brandAudit={brandAudits[targetClient.id]}
          contentPlans={contentPlans}
          adsPlans={adsPlans}
          clientAdsStrategy={clientAdsStrategies[targetClient.id]}
          budgetAlarms={budgetAlarms}
          payments={payments}
          agreements={agreements}
          clientDailyReports={clientDailyReports}
          weeklyReports={weeklyReports}
          monthlyReports={monthlyReports}
          quarterlyReports={quarterlyReports}
          adminDailyReports={adminDailyReports}
          notes={notes}
          onAddPayment={addPayment}
          onUpdatePayment={updatePayment}
          onUpdatePaymentStatus={updatePaymentStatus}
          onDeletePayment={deletePayment}
          onAddDailyWorkLog={addDailyWorkLog}
          onUpdateDailyWorkLog={updateDailyWorkLog}
          onDeleteDailyWorkLog={deleteDailyWorkLog}
          onUpdateBrandAudit={updateBrandAudit}
          onAddContentItem={addContentItem}
          onUpdateContentItem={updateContentItem}
          onDeleteContentItem={deleteContentItem}
          onAddAdsPlanItem={addAdsPlanItem}
          onUpdateAdsPlanItem={updateAdsPlanItem}
          onDeleteAdsPlanItem={deleteAdsPlanItem}
          onUpdateClientAdsStrategy={updateClientAdsStrategy}
          onAddBudgetAlarm={addBudgetAlarm}
          onUpdateBudgetAlarm={updateBudgetAlarm}
          onRechargeBudgetAlarm={rechargeBudgetAlarm}
          onDeleteBudgetAlarm={deleteBudgetAlarm}
          onAddClientDailyReport={addClientDailyReport}
          onUpdateClientDailyReport={updateClientDailyReport}
          onDeleteClientDailyReport={deleteClientDailyReport}
          onAddWeeklyReport={addWeeklyReport}
          onUpdateWeeklyReport={updateWeeklyReport}
          onDeleteWeeklyReport={deleteWeeklyReport}
          onAddMonthlyReport={addMonthlyReport}
          onUpdateMonthlyReport={updateMonthlyReport}
          onDeleteMonthlyReport={deleteMonthlyReport}
          onAddQuarterlyReport={addQuarterlyReport}
          onUpdateQuarterlyReport={updateQuarterlyReport}
          onDeleteQuarterlyReport={deleteQuarterlyReport}
          onAddAdminDailyReport={addAdminDailyReport}
          onUpdateAdminDailyReport={updateAdminDailyReport}
          onDeleteAdminDailyReport={deleteAdminDailyReport}
          onAddNote={addNote}
          onUpdateNote={updateNote}
          onToggleNotePin={toggleNotePin}
          onDeleteNote={deleteNote}
        />
        {showSupabaseModal && (
          <SupabaseConfigModal
            onClose={() => setShowSupabaseModal(false)}
          />
        )}
      </>
    );
  }

  // 3. ADMIN ROLE -> ADMIN LAYOUT
  // If Admin selected a specific client to inspect
  if (selectedClientId) {
    const activeClient = clients.find((c) => c.id === selectedClientId);
    if (activeClient) {
      return (
        <>
          <BrandPageView
            client={activeClient}
            userRole={currentUser.role}
            currentUserName={currentUser.name}
            onBackToAdminDashboard={() => setSelectedClientId(null)}
            onLogout={logout}
            dailyWorkLogs={dailyWorkLogs}
            brandAudit={brandAudits[activeClient.id]}
            contentPlans={contentPlans}
            adsPlans={adsPlans}
            clientAdsStrategy={clientAdsStrategies[activeClient.id]}
            budgetAlarms={budgetAlarms}
            payments={payments}
            agreements={agreements}
            clientDailyReports={clientDailyReports}
            weeklyReports={weeklyReports}
            monthlyReports={monthlyReports}
            quarterlyReports={quarterlyReports}
            adminDailyReports={adminDailyReports}
            notes={notes}
            onAddPayment={addPayment}
            onUpdatePayment={updatePayment}
            onUpdatePaymentStatus={updatePaymentStatus}
            onDeletePayment={deletePayment}
            onAddDailyWorkLog={addDailyWorkLog}
            onUpdateDailyWorkLog={updateDailyWorkLog}
            onDeleteDailyWorkLog={deleteDailyWorkLog}
            onUpdateBrandAudit={updateBrandAudit}
            onAddContentItem={addContentItem}
            onUpdateContentItem={updateContentItem}
            onDeleteContentItem={deleteContentItem}
            onAddAdsPlanItem={addAdsPlanItem}
            onUpdateAdsPlanItem={updateAdsPlanItem}
            onDeleteAdsPlanItem={deleteAdsPlanItem}
            onUpdateClientAdsStrategy={updateClientAdsStrategy}
            onAddBudgetAlarm={addBudgetAlarm}
            onUpdateBudgetAlarm={updateBudgetAlarm}
            onRechargeBudgetAlarm={rechargeBudgetAlarm}
            onDeleteBudgetAlarm={deleteBudgetAlarm}
            onAddClientDailyReport={addClientDailyReport}
            onUpdateClientDailyReport={updateClientDailyReport}
            onDeleteClientDailyReport={deleteClientDailyReport}
            onAddWeeklyReport={addWeeklyReport}
            onUpdateWeeklyReport={updateWeeklyReport}
            onDeleteWeeklyReport={deleteWeeklyReport}
            onAddMonthlyReport={addMonthlyReport}
            onUpdateMonthlyReport={updateMonthlyReport}
            onDeleteMonthlyReport={deleteMonthlyReport}
            onAddQuarterlyReport={addQuarterlyReport}
            onUpdateQuarterlyReport={updateQuarterlyReport}
            onDeleteQuarterlyReport={deleteQuarterlyReport}
            onAddAdminDailyReport={addAdminDailyReport}
            onUpdateAdminDailyReport={updateAdminDailyReport}
            onDeleteAdminDailyReport={deleteAdminDailyReport}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onToggleNotePin={toggleNotePin}
            onDeleteNote={deleteNote}
          />
          {showSupabaseModal && (
            <SupabaseConfigModal
              onClose={() => setShowSupabaseModal(false)}
              />
          )}
        </>
      );
    }
  }

  // Header Title mapping
  const headerTitles: Record<AdminPage, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'لوحة التحكم الرئيسية (Dashboard)',
      subtitle: 'نظرة عامة على أداء العملاء، قائمة المهام اليومية، وتنبيهات ميزانيات الإعلانات'
    },
    accounts: {
      title: 'الحسابات والدخل المالي (Accounts)',
      subtitle: 'تتبع الدخل المالي، الاتفاقيات، و الحسابات'
    },
    clients: {
      title: 'إدارة العملاء والبراندات (Clients)',
      subtitle: 'دليل جميع العملاء، إضافة عملاء جديدين، وإدارة بيانات الحسابات والبراندات'
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2D2D2A] flex flex-col md:flex-row font-['Cairo',sans-serif]">
      {/* Sidebar (Dashboard & Clients for Employee; Dashboard, Accounts, and Clients for Admin) */}
      <Sidebar
        activePage={currentActivePage}
        onNavigate={(page) => {
          if (currentUser.role === 'employee' && page === 'accounts') {
            return;
          }
          setAdminPage(page);
          setSelectedClientId(null);
        }}
        currentUser={currentUser}
        onLogout={logout}
        onOpenSupabaseConfig={() => setShowSupabaseModal(true)}
      />

      {/* Main Admin / Employee Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={headerTitles[currentActivePage].title}
          subtitle={
            currentUser.role === 'employee' && currentActivePage === 'clients'
              ? 'دليل العملاء والروابط المخصصة لفريق العمل'
              : headerTitles[currentActivePage].subtitle
          }
          budgetAlarms={budgetAlarms}
          userRole={currentUser.role}
          onSelectClientAlarm={(cId) => setSelectedClientId(cId)}
        />

        <main className="flex-1 overflow-y-auto">
          {currentActivePage === 'dashboard' && (
            <DashboardPage
              clients={clients}
              todos={todos}
              budgetAlarms={budgetAlarms}
              onAddTodo={addTodo}
              onToggleTodo={toggleTodo}
              onEditTodo={editTodo}
              onDeleteTodo={deleteTodo}
              onAddBudgetAlarm={addBudgetAlarm}
              onDeleteBudgetAlarm={deleteBudgetAlarm}
              onSelectClient={(cId) => setSelectedClientId(cId)}
            />
          )}

          {currentActivePage === 'accounts' && currentUser.role !== 'employee' && (
            <AccountsPage
              clients={clients}
              agreements={agreements}
              payments={payments}
              onAddAgreement={addAgreement}
              onDeleteAgreement={deleteAgreement}
              onAddPayment={addPayment}
              onUpdatePaymentStatus={updatePaymentStatus}
              onUpdatePayment={updatePayment}
              onDeletePayment={deletePayment}
            />
          )}

          {currentActivePage === 'clients' && (
            <ClientsPage
              clients={clients}
              onAddClient={addClient}
              onUpdateClient={updateClient}
              onDeleteClient={deleteClient}
              onSelectClient={(cId) => setSelectedClientId(cId)}
              userRole={currentUser.role}
            />
          )}
        </main>
      </div>

      {showSupabaseModal && (
        <SupabaseConfigModal
          onClose={() => setShowSupabaseModal(false)}
        />
      )}
    </div>
  );
}
