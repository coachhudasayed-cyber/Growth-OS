import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  FileText,
  Lock,
  Trash2,
  Edit,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  KeyRound,
  Database,
  Eye,
  Copy,
  Check,
  User,
  Calendar,
  FolderOpen
} from 'lucide-react';
import { Client, ClientStatus, ClientRole, UserRole } from '../types';

interface ClientsPageProps {
  clients: Client[];
  onAddClient: (
    data: Omit<Client, 'id' | 'createdAt'> & { password?: string }
  ) => Promise<Client | undefined>;
  onUpdateClient?: (id: string, updatedFields: Partial<Client>) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
  onSelectClient: (clientId: string) => void;
  userRole?: UserRole;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onSelectClient,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyLink = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Form State
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [brandPageUrl, setBrandPageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [clientRole, setClientRole] = useState<ClientRole>('client');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingClient(null);
    setName('');
    setBrandName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setBrandPageUrl('');
    setWebsiteUrl('');
    setDriveFolderUrl('');
    setFormUrl('');
    setStatus('active');
    setClientRole('client');
    setShowAddModal(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setName(c.name || '');
    setBrandName(c.brandName || '');
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setPassword('');
    setBrandPageUrl(c.brandPageUrl || '');
    setWebsiteUrl(c.websiteUrl || '');
    setDriveFolderUrl(c.driveFolderUrl || '');
    setFormUrl(c.formAnswersUrl || c.formUrl || '');
    setStatus(c.status || 'active');
    setClientRole(c.clientRole || 'client');
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brandName || !email) return;

    setFormError('');
    setLoading(true);
    try {
      if (editingClient) {
        if (onUpdateClient) {
          await onUpdateClient(editingClient.id, {
            name,
            brandName,
            phone,
            email,
            brandPageUrl,
            websiteUrl,
            driveFolderUrl,
            formUrl,
            formAnswersUrl: formUrl,
            status,
            clientRole
          });
        }
      } else {
        await onAddClient({
          name,
          brandName,
          phone,
          email,
          password,
          brandPageUrl,
          websiteUrl,
          driveFolderUrl,
          formUrl,
          formAnswersUrl: formUrl,
          status,
          clientRole
        });
      }

      setShowAddModal(false);
      setEditingClient(null);
      // Reset Form
      setName('');
      setBrandName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setBrandPageUrl('');
      setWebsiteUrl('');
    setDriveFolderUrl('');
      setFormUrl('');
      setStatus('active');
      setClientRole('client');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'تعذر حفظ الحساب.');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-3.5 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9F8F6] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E5E5E0] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-[#E07A48]/10 text-[#E07A48] rounded-2xl border border-[#E07A48]/20 shadow-xs shrink-0">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#2D2D2A]">
              {userRole === 'employee' ? 'دليل العملاء والبراندات (Clients Directory)' : 'إدارة العملاء (Clients Management)'}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#8E8E85] mt-0.5 sm:mt-1 font-medium">
              {userRole === 'employee' ? 'قائمة العملاء والروابط المخصصة للموظف' : 'قائمة العملاء وإدارة الحسابات والبراندات'}
            </p>
          </div>
        </div>

        {userRole !== 'employee' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عميل جديد (Add Client)</span>
          </button>
        )}
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-[#F9F8F6] p-3 sm:p-4 rounded-2xl border border-[#E5E5E0]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8E8E85] absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم العميل أو البراند..."
            className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl pr-10 pl-4 py-2 text-xs text-[#2D2D2A] placeholder-[#8E8E85] outline-none transition"
          />
        </div>

        {userRole !== 'employee' && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#8E8E85] font-semibold shrink-0">الحالة:</span>
            {(['all', 'active', 'paused', 'finished'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#E07A48] text-white shadow-xs'
                    : 'bg-white text-[#8E8E85] hover:text-[#2D2D2A] border border-[#E5E5E0]'
                }`}
              >
                {st === 'all'
                  ? 'الكل'
                  : st === 'active'
                  ? 'نشط'
                  : st === 'paused'
                  ? 'مؤقت'
                  : 'منتهي'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CLIENTS GRID CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl text-[#8E8E85] text-xs">
            لا يوجد عملاء يطابقون خيارات البحث 🔍
          </div>
        ) : (
          filteredClients.map((client) => {
            if (userRole === 'employee') {
              return (
                <div
                  key={client.id}
                  className="bg-[#F9F8F6] border border-[#E5E5E0] hover:border-[#E07A48]/40 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Clickable to open client file */}
                    <div
                      onClick={() => onSelectClient(client.id)}
                      className="mb-4 space-y-2 cursor-pointer group/card"
                      title="اضغط لفتح ملف العميل والداشبورد"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-[#E07A48]/10 border border-[#E07A48]/20 text-[#E07A48] group-hover/card:bg-[#E07A48] group-hover/card:text-white transition-colors flex items-center justify-center font-bold text-base shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-[#2D2D2A] text-base sm:text-lg leading-snug group-hover/card:text-[#E07A48] transition break-words" title={client.brandName}>
                            {client.brandName}
                          </h3>
                          <p className="text-xs text-[#8E8E85] font-medium mt-0.5 truncate" title={client.name}>
                            العميل: {client.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Primary Action Button: Open Client File & Full Dashboard */}
                    <button
                      type="button"
                      onClick={() => onSelectClient(client.id)}
                      className="w-full mb-3 px-4 py-3 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:shadow-md active:scale-[0.99]"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>فتح ملف العميل (الداشبورد بالكامل)</span>
                      <span className="text-xs">&larr;</span>
                    </button>
                  </div>

                  {/* روابط البراند وملفاته */}
                  <div className="pt-3 border-t border-[#E5E5E0] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {client.brandPageUrl ? (
                      <a
                        href={client.brandPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-2.5 bg-[#E07A48]/10 hover:bg-[#E07A48] text-[#E07A48] hover:text-white border border-[#E07A48]/20 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">صفحة البراند</span>
                      </a>
                    ) : (
                      <div className="px-2.5 py-2.5 bg-[#F0EFEB] text-[#A0A096] rounded-xl text-[11px] text-center font-medium border border-[#E5E5E0] truncate">
                        صفحة البراند (غير متوفر)
                      </div>
                    )}

                    {client.websiteUrl ? (
                      <a
                        href={client.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-2.5 bg-stone-100 hover:bg-stone-800 text-stone-700 hover:text-white border border-stone-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">الموقع</span>
                      </a>
                    ) : (
                      <div className="px-2.5 py-2.5 bg-[#F0EFEB] text-[#A0A096] rounded-xl text-[11px] text-center font-medium border border-[#E5E5E0] truncate">
                        الموقع (غير متوفر)
                      </div>
                    )}

                    {client.driveFolderUrl && (
                      <a href={client.driveFolderUrl} target="_blank" rel="noreferrer" className="px-2.5 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-800 hover:text-white border border-blue-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs">
                        <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">ملفات البراند</span>
                      </a>
                    )}

                    {(client.formAnswersUrl || client.formUrl) ? (
                      <a
                        href={client.formAnswersUrl || client.formUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-2.5 bg-amber-500/10 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-500/25 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">رابط إجابات الفورم</span>
                      </a>
                    ) : (
                      <div className="px-2.5 py-2.5 bg-[#F0EFEB] text-[#A0A096] rounded-xl text-[11px] text-center font-medium border border-[#E5E5E0] truncate">
                        إجابات الفورم (غير متوفر)
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={client.id}
                className="bg-[#F9F8F6] border border-[#E5E5E0] hover:border-[#E07A48]/40 rounded-3xl p-5 shadow-xs transition-all group flex flex-col justify-between"
              >
              <div>
                <div className="mb-3 border-b border-[#E5E5E0] pb-3 space-y-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#E07A48]/10 border border-[#E07A48]/20 text-[#E07A48] flex items-center justify-center font-bold text-base shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-[#2D2D2A] text-base sm:text-lg leading-snug group-hover:text-[#E07A48] transition break-words" title={client.brandName}>
                        {client.brandName}
                      </h3>
                      <p className="text-xs text-[#8E8E85] font-medium mt-0.5 truncate" title={client.name}>
                        العميل: {client.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E07A48]/10 text-[#E07A48] border border-[#E07A48]/20 whitespace-nowrap">
                      {client.clientRole === 'admin'
                        ? 'أدمن'
                        : client.clientRole === 'employee'
                        ? 'موظف'
                        : 'عميل'}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                        client.status === 'active'
                          ? 'bg-amber-500/10 text-amber-800 border-amber-500/20'
                          : client.status === 'paused'
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                      }`}
                    >
                      {client.status === 'active'
                        ? 'نشط'
                        : client.status === 'paused'
                        ? 'مؤقت'
                        : 'منتهي'}
                    </span>
                  </div>
                </div>

                {/* Contact & Links Info */}
                <div className="space-y-2 text-xs text-[#2D2D2A] bg-white p-3 rounded-2xl border border-[#E5E5E0] mb-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-[#E07A48] shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span className="font-mono truncate">{client.phone}</span>
                    </div>
                  )}

                  {(client.brandPageUrl || client.websiteUrl || client.formUrl || client.driveFolderUrl) && (
                    <div className="pt-2 border-t border-[#E5E5E0] grid grid-cols-2 gap-2 text-[11px]">
                      {client.brandPageUrl && (
                        <a
                          href={client.brandPageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#E07A48] hover:underline truncate flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">صفحة البراند</span>
                        </a>
                      )}

                      {client.websiteUrl && (
                        <a
                          href={client.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-800 hover:underline truncate flex items-center gap-1 font-medium"
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          <span className="truncate">الموقع</span>
                        </a>
                      )}

                      {client.driveFolderUrl && (
                        <a href={client.driveFolderUrl} target="_blank" rel="noreferrer" className="text-blue-800 hover:underline truncate flex items-center gap-1 font-medium">
                          <FolderOpen className="w-3 h-3 shrink-0" />
                          <span className="truncate">ملفات البراند</span>
                        </a>
                      )}

                      {client.formUrl && (
                        <a
                          href={client.formUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-700 hover:underline truncate flex items-center gap-1 font-medium"
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate">رابط الفورم</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E5E5E0] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectClient(client.id)}
                  className="px-3.5 py-2 bg-[#E07A48] hover:bg-[#C8662B] text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink min-w-0"
                >
                  <span className="truncate">فتح صفحة البراند</span>
                  <span className="shrink-0">&larr;</span>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setViewingClient(client)}
                    className="p-2 text-[#8E8E85] hover:text-[#E07A48] rounded-xl hover:bg-[#E07A48]/10 transition cursor-pointer"
                    title="عرض بيانات العميل (عرض فقط)"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {userRole === 'admin' && <>
                  <button
                    onClick={() => handleOpenEdit(client)}
                    className="p-2 text-[#8E8E85] hover:text-[#E07A48] rounded-xl hover:bg-[#E07A48]/10 transition cursor-pointer"
                    title="تعديل بيانات العميل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت تأكد من حذف العميل "${client.brandName || client.name}"؟ سيتم حذف جميع الميزانيات والبيانات المرتبطة به.`)) {
                        onDeleteClient(client.id).catch(err => alert(err instanceof Error ? err.message : 'تعذر حذف الحساب.'));
                      }
                    }}
                    className="p-2 text-[#8E8E85] hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    title="حذف العميل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  </>}
                </div>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* ADD / EDIT CLIENT FORM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4">
              <div className="flex items-center gap-2 text-[#E07A48] font-bold text-base">
                {editingClient ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>{editingClient ? 'تعديل بيانات العميل / البراند' : 'إضافة عميل جديد'}</span>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingClient(null);
                }}
                className="text-[#8E8E85] hover:text-[#2D2D2A] text-xs font-bold"
              >
                إلغاء
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {formError && <div role="alert" className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{formError}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2D2D2A] mb-1">اسم العميل *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: عمر الخولي"
                    className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D2D2A] mb-1">اسم البراند *</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="مثال: تيكنو زون - TechnoZone"
                    className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2D2D2A] mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@brand.com"
                    className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none"
                    required
                  />
                </div>

                {!editingClient && <div>
                  <label className="block font-semibold text-[#2D2D2A] mb-1">كلمة السر للحساب *</label>
                  <input type="password" autoComplete="new-password" required minLength={8}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none" />
                </div>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#2D2D2A] mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+201012345678"
                    className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D2D2A] mb-1">المسمى / الصفة *</label>
                  <select
                    value={clientRole}
                    onChange={(e) => setClientRole(e.target.value as ClientRole)}
                    className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none cursor-pointer font-bold"
                  >
                    <option value="client">عميل (Client)</option>
                    <option value="employee">موظف (Employee)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2D2D2A] mb-1">حالة العميل</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ClientStatus)}
                    className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none cursor-pointer"
                  >
                    <option value="active">نشط (Active)</option>
                    <option value="paused">متوقف مؤقتاً (Paused)</option>
                    <option value="finished">منتهي (Finished)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D2A] mb-1">رابط صفحة البراند</label>
                <input
                  type="url"
                  value={brandPageUrl}
                  onChange={(e) => setBrandPageUrl(e.target.value)}
                  placeholder="https://facebook.com/brandname"
                  className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D2A] mb-1">رابط الموقع</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://brandwebsite.com"
                  className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D2A] mb-1">رابط مجلد ملفات البراند على Google Drive</label>
                <input type="url" value={driveFolderUrl} onChange={(e) => setDriveFolderUrl(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none" />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D2A] mb-1">رابط Zoho أو إجابات الفورم (اختياري)</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/... أو رابط الشيت"
                  className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-[#2D2D2A] outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold py-3 rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {loading
                    ? 'جاري الحفظ...'
                    : editingClient
                    ? 'حفظ التعديلات'
                    : 'حفظ العميل'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingClient(null);
                  }}
                  className="px-4 bg-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#d8d8d2] transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ONLY CLIENT DATA MODAL */}
      {viewingClient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#E07A48]/10 border border-[#E07A48]/20 text-[#E07A48] flex items-center justify-center font-bold text-base shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-[#2D2D2A] text-base sm:text-lg">
                      {viewingClient.brandName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#E07A48]/10 text-[#E07A48] border border-[#E07A48]/20">
                      عرض فقط 👁️
                    </span>
                  </div>
                  <p className="text-xs text-[#8E8E85] font-medium mt-0.5">
                    تفاصيل وبيانات العميل المسجلة بالنظام
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingClient(null)}
                className="text-[#8E8E85] hover:text-[#2D2D2A] px-2.5 py-1 rounded-xl hover:bg-[#E5E5E0] text-xs font-extrabold transition cursor-pointer"
              >
                ✕ إغلاق
              </button>
            </div>

            {/* Badges: Role and Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E5E0]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#8E8E85]" />
                <span className="font-semibold text-[#8E8E85] text-xs">نوع الحساب / المسمى:</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E07A48]/10 text-[#E07A48] border border-[#E07A48]/20">
                  {viewingClient.clientRole === 'admin'
                    ? 'أدمن (Admin)'
                    : viewingClient.clientRole === 'employee'
                    ? 'موظف (Employee)'
                    : 'عميل (Client)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#8E8E85] text-xs">حالة الحساب:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    viewingClient.status === 'active'
                      ? 'bg-amber-500/10 text-amber-800 border-amber-500/20'
                      : viewingClient.status === 'paused'
                      ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                  }`}
                >
                  {viewingClient.status === 'active'
                    ? 'نشط (Active)'
                    : viewingClient.status === 'paused'
                    ? 'متوقف مؤقتاً (Paused)'
                    : 'منتهي (Finished)'}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-3">
              <h3 className="font-extrabold text-[#2D2D2A] border-b border-[#E5E5E0] pb-2 flex items-center gap-2 text-xs">
                <Building2 className="w-4 h-4 text-[#E07A48]" />
                <span>البيانات الأساسية ومعلومات الاتصال</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                  <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">اسم العميل المسجل</span>
                  <span className="font-bold text-[#2D2D2A] text-sm">{viewingClient.name}</span>
                </div>

                <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                  <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">اسم البراند / الشركة</span>
                  <span className="font-bold text-[#E07A48] text-sm">{viewingClient.brandName}</span>
                </div>

                <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                  <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">البريد الإلكتروني</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#2D2D2A] truncate">{viewingClient.email}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(viewingClient.email, 'email')}
                      className="p-1 hover:bg-[#E5E5E0] rounded-md transition text-[#8E8E85]"
                      title="نسخ البريد"
                    >
                      {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-amber-800" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                  <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">رقم الهاتف</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#2D2D2A]">{viewingClient.phone || 'غير مسجل'}</span>
                    {viewingClient.phone && (
                      <button
                        type="button"
                        onClick={() => handleCopyLink(viewingClient.phone, 'phone')}
                        className="p-1 hover:bg-[#E5E5E0] rounded-md transition text-[#8E8E85]"
                        title="نسخ الهاتف"
                      >
                        {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-amber-800" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {viewingClient.createdAt && (
                  <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] col-span-1 sm:col-span-2">
                    <span className="text-[10px] text-[#8E8E85] font-bold block mb-1">تاريخ التسجيل بالنظام</span>
                    <span className="font-mono text-xs font-semibold text-[#2D2D2A]">
                      {viewingClient.createdAt.split('T')[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Links & External Forms */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-3">
              <h3 className="font-extrabold text-[#2D2D2A] border-b border-[#E5E5E0] pb-2 flex items-center gap-2 text-xs">
                <Globe className="w-4 h-4 text-[#E07A48]" />
                <span>الروابط المسجلة وصفحات البراند</span>
              </h3>

              <div className="space-y-2.5">
                {/* Brand Page URL */}
                <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#8E8E85] font-bold block">رابط صفحة البراند</span>
                    {viewingClient.brandPageUrl ? (
                      <a
                        href={viewingClient.brandPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-xs text-[#E07A48] hover:underline truncate block"
                      >
                        {viewingClient.brandPageUrl}
                      </a>
                    ) : (
                      <span className="text-xs text-[#8E8E85] italic">غير مسجل</span>
                    )}
                  </div>
                  {viewingClient.brandPageUrl && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(viewingClient.brandPageUrl, 'brandPageUrl')}
                        className="px-2.5 py-1 bg-white border border-[#E5E5E0] rounded-lg text-[10px] font-bold hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'brandPageUrl' ? <Check className="w-3 h-3 text-amber-800" /> : <Copy className="w-3 h-3" />}
                        <span>نسخ</span>
                      </button>
                      <a
                        href={viewingClient.brandPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-[#E07A48]/10 text-[#E07A48] border border-[#E07A48]/20 rounded-lg text-[10px] font-bold hover:bg-[#E07A48]/20 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>زيارة</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Website URL */}
                <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#8E8E85] font-bold block">رابط الموقع الإلكتروني</span>
                    {viewingClient.websiteUrl ? (
                      <a
                        href={viewingClient.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-xs text-amber-800 hover:underline truncate block"
                      >
                        {viewingClient.websiteUrl}
                      </a>
                    ) : (
                      <span className="text-xs text-[#8E8E85] italic">غير مسجل</span>
                    )}
                  </div>
                  {viewingClient.websiteUrl && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(viewingClient.websiteUrl, 'websiteUrl')}
                        className="px-2.5 py-1 bg-white border border-[#E5E5E0] rounded-lg text-[10px] font-bold hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'websiteUrl' ? <Check className="w-3 h-3 text-amber-800" /> : <Copy className="w-3 h-3" />}
                        <span>نسخ</span>
                      </button>
                      <a
                        href={viewingClient.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-amber-500/10 text-amber-800 border border-amber-500/20 rounded-lg text-[10px] font-bold hover:bg-amber-500/20 flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>زيارة</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Drive folder URL */}
                <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#8E8E85] font-bold block">مجلد ملفات البراند</span>
                    {viewingClient.driveFolderUrl ? <a href={viewingClient.driveFolderUrl} target="_blank" rel="noreferrer" className="font-medium text-xs text-blue-800 hover:underline truncate block">{viewingClient.driveFolderUrl}</a> : <span className="text-xs text-[#8E8E85] italic">غير مسجل</span>}
                  </div>
                  {viewingClient.driveFolderUrl && <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => handleCopyLink(viewingClient.driveFolderUrl!, 'driveFolderUrl')} className="px-2.5 py-1 bg-white border border-[#E5E5E0] rounded-lg text-[10px] font-bold hover:bg-gray-50 flex items-center gap-1 cursor-pointer">{copiedField === 'driveFolderUrl' ? <Check className="w-3 h-3 text-blue-800" /> : <Copy className="w-3 h-3" />}<span>نسخ</span></button>
                    <a href={viewingClient.driveFolderUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-bold hover:bg-blue-100 flex items-center gap-1"><FolderOpen className="w-3 h-3" /><span>فتح</span></a>
                  </div>}
                </div>

                {/* Form Answers URL */}
                <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#8E8E85] font-bold block">رابط إجابات الفورم</span>
                    {(viewingClient.formAnswersUrl || viewingClient.formUrl) ? (
                      <a
                        href={viewingClient.formAnswersUrl || viewingClient.formUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-xs text-amber-700 hover:underline truncate block"
                      >
                        {viewingClient.formAnswersUrl || viewingClient.formUrl}
                      </a>
                    ) : (
                      <span className="text-xs text-[#8E8E85] italic">غير مسجل</span>
                    )}
                  </div>
                  {(viewingClient.formAnswersUrl || viewingClient.formUrl) && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyLink((viewingClient.formAnswersUrl || viewingClient.formUrl)!, 'formAnswersUrl')}
                        className="px-2.5 py-1 bg-white border border-[#E5E5E0] rounded-lg text-[10px] font-bold hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'formAnswersUrl' ? <Check className="w-3 h-3 text-amber-800" /> : <Copy className="w-3 h-3" />}
                        <span>نسخ</span>
                      </button>
                      <a
                        href={viewingClient.formAnswersUrl || viewingClient.formUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-lg text-[10px] font-bold hover:bg-amber-500/20 flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>فتح</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#E5E5E0] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const targetClient = viewingClient;
                  setViewingClient(null);
                  handleOpenEdit(targetClient);
                }}
                className="px-4 py-2.5 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Edit className="w-4 h-4" />
                <span>الانتقال لتعديل البيانات</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingClient(null)}
                className="px-5 py-2.5 bg-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#d8d8d2] transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
