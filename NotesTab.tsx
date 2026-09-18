import React, { useState } from 'react';
import { StickyNote, Pin, Plus, Trash2, Edit2, User, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { NoteItem, UserRole } from '../../types';

interface NotesTabProps {
  notes: NoteItem[];
  clientId: string;
  currentUserRole: UserRole;
  currentUserName: string;
  onAddNote: (note: Omit<NoteItem, 'id'>) => void;
  onUpdateNote?: (id: string, fields: Partial<NoteItem>) => void;
  onToggleNotePin: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  clientId,
  currentUserRole,
  currentUserName,
  onAddNote,
  onUpdateNote,
  onToggleNotePin,
  onDeleteNote
}) => {
  const clientNotes = notes.filter((n) => n.clientId === clientId);

  const [showModal, setShowModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<'قيد المتابعة' | 'تم التنفيذ'>('قيد المتابعة');
  const [filterStatus, setFilterStatus] = useState<'all' | 'admin' | 'client' | 'pending' | 'completed'>('all');

  const handleOpenAddModal = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setStatus('قيد المتابعة');
    setShowModal(true);
  };

  const handleOpenEditModal = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsPinned(note.isPinned);
    setStatus(note.status || 'قيد المتابعة');
    setShowModal(true);
  };

  const handleToggleNoteStatus = (note: NoteItem) => {
    if (!onUpdateNote) return;
    const nextStatus: 'قيد المتابعة' | 'تم التنفيذ' =
      note.status === 'تم التنفيذ' ? 'قيد المتابعة' : 'تم التنفيذ';
    onUpdateNote(note.id, { status: nextStatus });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingNoteId && onUpdateNote) {
      onUpdateNote(editingNoteId, {
        title,
        content,
        isPinned,
        status
      });
    } else {
      let formattedAuthor = currentUserName.trim();
      if (currentUserRole === 'admin') {
        if (!formattedAuthor.includes('أدمن') && !formattedAuthor.includes('Admin') && !formattedAuthor.includes('إدارة')) {
          formattedAuthor = `${formattedAuthor} (الأدمن)`;
        }
      } else {
        if (!formattedAuthor.includes('عميل') && !formattedAuthor.includes('Client')) {
          formattedAuthor = `${formattedAuthor} (العميل)`;
        }
      }

      onAddNote({
        clientId,
        title,
        content,
        author: formattedAuthor,
        authorRole: currentUserRole,
        isPinned,
        status,
        date: new Date().toISOString().split('T')[0]
      });
    }

    setShowModal(false);
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setStatus('قيد المتابعة');
  };

  // Filter notes
  const filteredNotes = clientNotes.filter((note) => {
    if (filterStatus === 'admin') return note.authorRole === 'admin';
    if (filterStatus === 'client') return note.authorRole === 'client';
    if (filterStatus === 'pending') return note.status !== 'تم التنفيذ';
    if (filterStatus === 'completed') return note.status === 'تم التنفيذ';
    return true;
  });

  // Sort pinned notes first
  const sortedNotes = [...filteredNotes].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#2D2D2A] flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-[#5A5A40]" />
            Notes & Communication (ملاحظات ومفكرة البراند)
          </h2>
          <p className="text-xs text-[#8E8E85] mt-1">
            مساحة تواصل مشتركة بين العميل وفريق إدارة البراند لتبادل الملاحظات ومتابعة التنفيذ
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ملاحظة جديدة</span>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
            filterStatus === 'all'
              ? 'bg-[#5A5A40] text-white shadow-2xs'
              : 'bg-[#F9F8F6] text-[#78786E] hover:bg-[#E5E5E0] border border-[#E5E5E0]'
          }`}
        >
          جميع الملاحظات ({clientNotes.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('admin')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            filterStatus === 'admin'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ملاحظات الأدمن ({clientNotes.filter((n) => n.authorRole === 'admin').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('client')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            filterStatus === 'client'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>ملاحظات العميل ({clientNotes.filter((n) => n.authorRole === 'client').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            filterStatus === 'pending'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>قيد المتابعة ({clientNotes.filter((n) => n.status !== 'تم التنفيذ').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            filterStatus === 'completed'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>تم التنفيذ ({clientNotes.filter((n) => n.status === 'تم التنفيذ').length})</span>
        </button>
      </div>

      {/* NOTES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNotes.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl text-[#8E8E85] text-xs">
            لا توجد ملاحظات مطابقة للتصفية حالياً 📝
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`p-5 rounded-3xl border transition relative flex flex-col justify-between shadow-xs ${
                note.isPinned
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : note.status === 'تم التنفيذ'
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-[#F9F8F6] border-[#E5E5E0] hover:border-[#5A5A40]/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-[#E5E5E0] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-2xs shrink-0 ${
                        note.authorRole === 'admin'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {note.authorRole === 'admin' ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span className="text-[10px] font-extrabold">الأدمن</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="text-[10px] font-extrabold">العميل</span>
                        </>
                      )}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-[#2D2D2A] text-sm leading-tight">{note.title}</h3>
                      <span className="text-[10px] text-[#8E8E85] block mt-0.5">
                        بواسطة: <strong className="text-[#2D2D2A]">{note.author}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleNotePin(note.id)}
                    className={`p-1.5 rounded-xl transition cursor-pointer ${
                      note.isPinned
                        ? 'text-[#5A5A40] bg-[#5A5A40]/20'
                        : 'text-[#8E8E85] hover:text-[#5A5A40]'
                    }`}
                    title={note.isPinned ? 'إلغاء التثبيت' : 'تثبيت الملاحظة'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#2D2D2A] leading-relaxed bg-white p-3 rounded-2xl border border-[#E5E5E0] mb-4 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5E5E0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8E8E85]">
                <div className="flex items-center gap-2">
                  <span className="font-mono">{note.date}</span>

                  <button
                    type="button"
                    onClick={() => handleToggleNoteStatus(note)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${
                      note.status === 'تم التنفيذ'
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                    }`}
                    title="اضغط لتغيير حالة الملاحظة"
                  >
                    {note.status === 'تم التنفيذ' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>تم التنفيذ ✓</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>قيد المتابعة</span>
                      </>
                    )}
                  </button>
                </div>

                {(currentUserRole === 'admin' || note.authorRole === 'client') && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(note)}
                      className="p-1 text-[#8E8E85] hover:text-[#5A5A40] transition cursor-pointer"
                      title="تعديل الملاحظة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 text-[#8E8E85] hover:text-rose-600 transition cursor-pointer"
                      title="حذف الملاحظة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL (ADD / EDIT) */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 shrink-0">
              <h3 className="font-bold text-[#2D2D2A] text-sm sm:text-base">
                {editingNoteId ? 'تعديل الملاحظة' : 'إضافة ملاحظة جديدة'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#8E8E85] hover:text-[#2D2D2A] text-xs cursor-pointer p-1"
              >
                إلغاء
              </button>
            </div>

            <form id="notesForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs pr-1 pl-1 my-1">
              {/* Account Creator Identity Banner */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  currentUserRole === 'admin'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {currentUserRole === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-emerald-700 shrink-0" />
                  )}
                  <div>
                    <span className="font-medium">سيتم تسجيل الملاحظة باسم: </span>
                    <strong className="font-extrabold">{currentUserName}</strong>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                    currentUserRole === 'admin'
                      ? 'bg-amber-200/80 border-amber-300 text-amber-950'
                      : 'bg-emerald-200/80 border-emerald-300 text-emerald-950'
                  }`}
                >
                  {currentUserRole === 'admin' ? 'حساب أدمن 🛡️' : 'حساب عميل 👤'}
                </span>
              </div>

              <div>
                <label className="block text-[#2D2D2A] font-semibold mb-1">عنوان الملاحظة *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان موضوع الملاحظة..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2D2D2A] font-semibold mb-1">نص الملاحظة *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="تفاصيل التنبيه أو التوجيه..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-3 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2D2D2A] font-semibold mb-1">حالة الملاحظة</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('قيد المتابعة')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      status === 'قيد المتابعة'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                        : 'bg-white border-[#E5E5E0] text-[#78786E] hover:bg-[#F5F5F0]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>قيد المتابعة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('تم التنفيذ')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      status === 'تم التنفيذ'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs'
                        : 'bg-white border-[#E5E5E0] text-[#78786E] hover:bg-[#F5F5F0]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم التنفيذ ✓</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#E5E5E0]">
                <input
                  type="checkbox"
                  id="pinNote"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5A5A40] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="pinNote" className="text-[#2D2D2A] font-semibold cursor-pointer">
                  تثبيت الملاحظة في الأعلى 📌
                </label>
              </div>
            </form>

            <div className="pt-3 border-t border-[#E5E5E0] flex gap-3 shrink-0">
              <button
                type="submit"
                form="notesForm"
                className="flex-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                {editingNoteId ? 'حفظ التعديلات' : 'حفظ الملاحظة'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs cursor-pointer hover:bg-[#F5F5F0]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
