import React, { useState } from 'react';
import { LogIn, Key, Sparkles, Building2, UserCheck, ShieldAlert, Briefcase } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../lib/initialData';
import { isSupabaseConfigured } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (email: string, role?: UserRole) => void;
  availableUsers?: UserProfile[];
  onOpenSupabaseConfig: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, availableUsers, onOpenSupabaseConfig }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [error, setError] = useState('');

  const displayUsers = (availableUsers && availableUsers.length > 0) ? availableUsers : DEMO_USERS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }
    setError('');
    onLogin(email, selectedRole);
  };

  const handleDemoLogin = (user: UserProfile) => {
    onLogin(user.email, user.role);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col justify-center items-center p-4 relative overflow-hidden text-[#2D2D2A]">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E07A48]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Logo & Title */}
      <div className="text-center mb-8 z-10">
        <div className="inline-flex items-center justify-center p-3.5 bg-[#E07A48] rounded-2xl shadow-md mb-4">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D2D2A] tracking-tight">
          Growth OS
        </h1>
        <p className="text-[#78786E] mt-2 text-sm sm:text-base font-medium">
          نظام متكامل لإدارة تسويق و نمو البراندات
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white border border-[#E5E5E0] rounded-3xl p-6 sm:p-8 shadow-xl z-10">
        <div className="border-b border-[#E5E5E0] pb-4 mb-6">
          <h2 className="text-xl font-bold text-[#2D2D2A] flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[#E07A48]" />
            تسجيل الدخول
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#F9EBE6] border border-[#EACEC3] rounded-xl text-[#7D2D1C] text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#D14D35]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Role Switcher for custom emails */}
          <div>
            <label className="block text-xs font-semibold text-[#78786E] mb-2">
              نوع الحساب
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#F9F8F6] p-1 rounded-xl border border-[#E5E5E0]">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-[#E07A48] text-white shadow-xs'
                    : 'text-[#78786E] hover:text-[#2D2D2A]'
                }`}
              >
                أدمن (Admin)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('employee')}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'employee'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-[#78786E] hover:text-[#2D2D2A]'
                }`}
              >
                موظف (Employee)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('client')}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'client'
                    ? 'bg-[#E07A48] text-white shadow-xs'
                    : 'text-[#78786E] hover:text-[#2D2D2A]'
                }`}
              >
                عميل (Client)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#78786E] mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@brandcontrol.com"
              className="w-full bg-[#F9F8F6] border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2A] placeholder-[#8E8E85] outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#78786E] mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#F9F8F6] border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2A] placeholder-[#8E8E85] outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#E07A48] hover:bg-[#C8662B] text-white font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            دخول النظام
          </button>
        </form>

        {/* Demo & Registered Accounts Section */}
        <div className="mt-8 border-t border-[#E5E5E0] pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#A36813]" />
            <span className="text-xs font-bold text-[#2D2D2A]">
              دخول سريع للحسابات (تجريبية ومسجلة):
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
            {displayUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleDemoLogin(user)}
                className="w-full text-right p-3 bg-[#F9F8F6] hover:bg-[#F5F5F0] border border-[#E5E5E0] rounded-xl transition flex items-center justify-between group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      user.role === 'admin'
                        ? 'bg-[#FEF6E6] text-[#A36813] border border-[#FAD9A5]'
                        : user.role === 'employee'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-[#FFF0E6] text-[#E07A48] border border-[#F7C6A5]'
                    }`}
                  >
                    {user.role === 'employee' ? (
                      <Briefcase className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#2D2D2A] group-hover:text-[#E07A48] transition truncate">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-[#78786E] truncate">{user.email}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold border shrink-0 mr-2 ${
                    user.role === 'admin'
                      ? 'bg-[#FEF6E6] text-[#A36813] border-[#FAD9A5]'
                      : user.role === 'employee'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-[#FFF0E6] text-[#E07A48] border-[#F7C6A5]'
                  }`}
                >
                  {user.role === 'admin'
                    ? 'أدمن (Admin)'
                    : user.role === 'employee'
                    ? 'موظف (Employee)'
                    : 'عميل (Client)'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-[#78786E] font-medium">
        Growth OS &copy; 2026 &bull; جميع الحقوق محفوظة
      </div>
    </div>
  );
};
