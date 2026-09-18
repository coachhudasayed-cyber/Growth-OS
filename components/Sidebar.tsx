import React, { useState } from 'react';
import { LayoutDashboard, Wallet, Users, LogOut, Building2, ShieldCheck, Menu, X } from 'lucide-react';
import { UserProfile } from '../types';

export type AdminPage = 'dashboard' | 'accounts' | 'clients';

interface SidebarProps {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenSupabaseConfig: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  currentUser,
  onLogout,
  onOpenSupabaseConfig
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isEmployee = currentUser.role === 'employee';

  // Navigation items: Dashboard & Clients for employees; Dashboard, Accounts, and Clients for admin
  const allNavItems = [
    {
      id: 'dashboard' as AdminPage,
      label: 'Dashboard',
      sublabel: 'لوحة التحكم',
      icon: LayoutDashboard
    },
    {
      id: 'accounts' as AdminPage,
      label: 'Accounts',
      sublabel: 'الحسابات والدخل',
      icon: Wallet
    },
    {
      id: 'clients' as AdminPage,
      label: 'Clients',
      sublabel: 'إدارة العملاء',
      icon: Users
    }
  ];

  const navItems = isEmployee
    ? allNavItems.filter((item) => item.id === 'dashboard' || item.id === 'clients')
    : allNavItems;

  const handleSelectNav = (page: AdminPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const SidebarContent = (
    <div className="flex flex-col justify-between h-full">
      {/* Top Header */}
      <div>
        <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E07A48] rounded-xl shadow-xs text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-[#2D2D2A] text-base tracking-tight leading-none">
                Growth OS
              </h1>
              <span className="text-[10px] text-[#E07A48] font-semibold tracking-wider uppercase block mt-1">
                manage and grow your clients
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 text-[#78786E] hover:text-[#2D2D2A] rounded-xl hover:bg-[#EFEFEA]"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectNav(item.id)}
                className={`w-full text-right flex items-center justify-between px-3.5 py-3 rounded-xl font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#E07A48] text-white shadow-xs font-bold'
                    : 'text-[#78786E] hover:text-[#2D2D2A] hover:bg-[#EFEFEA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-[#78786E] group-hover:text-[#E07A48]'
                    }`}
                  />
                  <div>
                    <div className="text-sm leading-none">{item.label}</div>
                    <div className="text-[10px] opacity-75 mt-1">{item.sublabel}</div>
                  </div>
                </div>

                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Info & Actions */}
      <div className="p-4 border-t border-[#E5E5E0] space-y-3 bg-[#F5F5F0]/60">
        {/* Current User Card */}
        <div className="p-3 bg-white border border-[#E5E5E0] rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
              currentUser.role === 'employee'
                ? 'bg-blue-50 border border-blue-200 text-blue-700'
                : 'bg-[#FFF0E6] border border-[#F7C6A5] text-[#E07A48]'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-[#2D2D2A] truncate">
                {currentUser.name}
              </div>
              <div className={`text-[10px] font-semibold ${
                currentUser.role === 'employee' ? 'text-blue-700' : 'text-[#E07A48]'
              }`}>
                {currentUser.role === 'admin'
                  ? 'مدير النظام (Admin)'
                  : currentUser.role === 'employee'
                  ? 'موظف الفريق (Employee)'
                  : 'حساب عميل (Client)'}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-[#78786E] hover:text-[#D14D35] hover:bg-[#F9EBE6] rounded-xl transition cursor-pointer shrink-0"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TOP BAR (Visible on mobile only) */}
      <div className="md:hidden bg-[#F9F8F6] border-b border-[#E5E5E0] px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-[#2D2D2A] bg-white border border-[#E5E5E0] rounded-xl hover:bg-[#EFEFEA] transition cursor-pointer shadow-xs"
            title="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#E07A48] rounded-lg text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-[#2D2D2A] text-sm">Growth OS</span>
          </div>
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-[#F9F8F6] border-l border-[#E5E5E0] flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
        {SidebarContent}
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#2D2D2A]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-72 max-w-[85vw] bg-[#F9F8F6] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

