import React, { useEffect, useState } from 'react';
import { BriefcaseBusiness, Edit, Mail, Phone, Plus, Trash2, X } from 'lucide-react';
import { Client, Employee, EmployeeAssignment } from '../types';

interface EmployeeManagerProps {
  employees: Employee[];
  clients: Client[];
  isOpen: boolean;
  onClose: () => void;
  onAdd: (employee: Omit<Employee, 'id'> & { password: string }) => Promise<Employee>;
  onUpdate: (id: string, employee: Omit<Employee, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onOpenEdit: (employee: Employee) => void;
  editingEmployee: Employee | null;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees, clients, isOpen, onClose, onAdd, onUpdate, onDelete, onOpenEdit, editingEmployee
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setLoadedId(null);
      return;
    }
    const nextId = editingEmployee?.id || 'new';
    if (loadedId === nextId) return;
    setLoadedId(nextId);
    setName(editingEmployee?.name || '');
    setPhone(editingEmployee?.phone || '');
    setEmail(editingEmployee?.email || '');
    setPassword('');
    setAssignments(editingEmployee?.assignments || []);
    setError('');
  }, [isOpen, editingEmployee, loadedId]);

  const setBrand = (clientId: string, selected: boolean) => {
    setAssignments(current => selected
      ? [...current, { clientId, compensation: 0 }]
      : current.filter(item => item.clientId !== clientId));
  };

  const setCompensation = (clientId: string, amount: number) => {
    setAssignments(current => current.map(item =>
      item.clientId === clientId ? { ...item, compensation: amount } : item
    ));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assignments.length) {
      setError('اختاري براند واحد على الأقل للموظف.');
      return;
    }
    if (assignments.some(item => !Number.isFinite(item.compensation) || item.compensation < 0)) {
      setError('اكتبي أجرًا صحيحًا لكل براند.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const details = { name: name.trim(), phone: phone.trim(), email: email.trim(), assignments };
      if (editingEmployee) await onUpdate(editingEmployee.id, details);
      else await onAdd({ ...details, password });
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'تعذر حفظ الموظف.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="w-5 h-5 text-[#E07A48]" />
          <h2 className="text-lg font-extrabold text-[#2D2D2A]">الموظفون ({employees.length})</h2>
        </div>
        {employees.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E5E0] bg-[#F9F8F6] p-6 text-sm text-[#8E8E85]">
            لم يُضف موظفون بعد.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {employees.map(employee => (
              <div key={employee.id} className="rounded-3xl border border-[#E5E5E0] bg-[#F9F8F6] p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-[#2D2D2A]">{employee.name}</h3>
                    <p className="text-xs text-[#8E8E85]">موظف</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => onOpenEdit(employee)}
                      title="تعديل الموظف" aria-label="تعديل الموظف"
                      className="p-2 rounded-xl text-[#8E8E85] hover:text-[#E07A48] hover:bg-[#E07A48]/10">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => {
                      if (window.confirm('هل تريدين حذف حساب الموظف؟')) {
                        onDelete(employee.id).catch(err => alert(err instanceof Error ? err.message : 'تعذر حذف الموظف.'));
                      }
                    }} title="حذف الموظف" aria-label="حذف الموظف"
                      className="p-2 rounded-xl text-[#8E8E85] hover:text-rose-600 hover:bg-rose-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="flex items-center gap-2 text-xs break-all"><Mail className="w-4 h-4 shrink-0" />{employee.email}</p>
                <p className="flex items-center gap-2 text-xs"><Phone className="w-4 h-4 shrink-0" />{employee.phone || 'لا يوجد رقم'}</p>
                <div className="border-t border-[#E5E5E0] pt-3 space-y-2">
                  <p className="text-xs font-bold">البراندات المسندة</p>
                  {employee.assignments.length ? employee.assignments.map(assignment => (
                    <div key={assignment.clientId} className="flex justify-between gap-2 text-xs">
                      <span className="truncate">{clients.find(client => client.id === assignment.clientId)?.brandName || 'براند محذوف'}</span>
                      <span className="font-bold shrink-0">{assignment.compensation.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  )) : <p className="text-xs text-[#8E8E85]">لا توجد براندات مسندة.</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#E5E5E0] bg-[#F9F8F6] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4 mb-5">
              <h2 className="font-extrabold text-[#2D2D2A]">{editingEmployee ? 'تعديل الموظف' : 'إضافة موظف'}</h2>
              <button type="button" onClick={onClose} aria-label="إغلاق" className="p-2 rounded-xl hover:bg-[#E5E5E0]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="font-semibold">اسم الموظف *
                  <input required value={name} onChange={e => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] bg-white px-4 py-2.5 outline-none focus:border-[#E07A48]" />
                </label>
                <label className="font-semibold">رقم الهاتف *
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] bg-white px-4 py-2.5 outline-none focus:border-[#E07A48]" />
                </label>
                <label className="font-semibold">البريد الإلكتروني *
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] bg-white px-4 py-2.5 outline-none focus:border-[#E07A48]" />
                </label>
                {!editingEmployee && <label className="font-semibold">كلمة السر *
                  <input required type="password" minLength={8} autoComplete="new-password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] bg-white px-4 py-2.5 outline-none focus:border-[#E07A48]" />
                </label>}
              </div>
              <div className="space-y-2">
                <p className="font-bold text-[#2D2D2A]">البراندات المسؤول عنها والأجر لكل براند *</p>
                {clients.length === 0 && <p className="text-[#8E8E85]">أضيفي عميلًا وبراندًا أولًا.</p>}
                {clients.map(client => {
                  const assignment = assignments.find(item => item.clientId === client.id);
                  return (
                    <div key={client.id} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white p-3">
                      <label className="flex flex-1 items-center gap-2 font-semibold cursor-pointer">
                        <input type="checkbox" checked={!!assignment}
                          onChange={e => setBrand(client.id, e.target.checked)} />
                        <span>{client.brandName}</span>
                      </label>
                      {assignment && <label className="flex items-center gap-2">الأجر (ج.م)
                        <input type="number" min="0" step="0.01" required
                          value={assignment.compensation}
                          onChange={e => setCompensation(client.id, Number(e.target.value))}
                          className="w-32 rounded-xl border border-[#E5E5E0] px-3 py-2 outline-none focus:border-[#E07A48]" />
                      </label>}
                    </div>
                  );
                })}
              </div>
              <button type="submit" disabled={saving || clients.length === 0}
                className="w-full rounded-xl bg-[#E07A48] py-3 font-extrabold text-white hover:bg-[#C8662B] disabled:opacity-50 flex justify-center items-center gap-2">
                <Plus className="w-4 h-4" />{saving ? 'جاري الحفظ...' : editingEmployee ? 'حفظ التعديلات' : 'حفظ الموظف'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
