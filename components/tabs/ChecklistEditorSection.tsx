import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { AuditCheckItem } from '../../types';

interface ChecklistEditorSectionProps {
  title: string;
  items: AuditCheckItem[];
  defaultItems?: AuditCheckItem[];
  onUpdate: (updatedItems: AuditCheckItem[]) => void;
  placeholderAnswer?: string;
  columns?: 1 | 2;
  fallbackToDefaultItemsWhenEmpty?: boolean;
}

export const ChecklistEditorSection: React.FC<ChecklistEditorSectionProps> = ({
  title,
  items,
  defaultItems = [],
  onUpdate,
  placeholderAnswer = 'اكتب الإجابة التفصيلية...',
  columns = 2,
  fallbackToDefaultItemsWhenEmpty = true
}) => {
  const currentList = fallbackToDefaultItemsWhenEmpty && items.length === 0 ? defaultItems : items;

  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [itemToDelete, setItemToDelete] = useState<AuditCheckItem | null>(null);

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = currentList.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    onUpdate(updated);
  };

  const handleStartEdit = (item: AuditCheckItem) => {
    setEditingId(item.id);
    setEditingLabel(item.label);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingLabel.trim()) return;
    const updated = currentList.map((item) =>
      item.id === id ? { ...item, label: editingLabel.trim() } : item
    );
    onUpdate(updated);
    setEditingId(null);
    setEditingLabel('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingLabel('');
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const updated = currentList.filter((item) => item.id !== itemToDelete.id);
    onUpdate(updated);
    setItemToDelete(null);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const newItem: AuditCheckItem = {
      id: `check-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: newQuestion.trim(),
      status: newAnswer.trim()
    };
    onUpdate([...currentList, newItem]);
    setNewQuestion('');
    setNewAnswer('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
        <h5 className="font-extrabold text-xs text-[#2D2D2A]">
          {title} ({currentList.length})
        </h5>
        <div className="flex items-center gap-1.5">
          {defaultItems && defaultItems.length > 0 && (
            <button
              type="button"
              onClick={() => onUpdate(JSON.parse(JSON.stringify(defaultItems)))}
              title="استعادة الأسئلة الافتراضية"
              className="p-1.5 bg-white border border-[#E5E5E0] text-[#78786E] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {!isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="px-2.5 py-1 bg-[#5A5A40] text-white hover:bg-[#4a4a34] font-bold rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة سؤال جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Form to Add New Question */}
      {isAdding && (
        <form
          onSubmit={handleAddItem}
          className="p-3.5 bg-white rounded-2xl border-2 border-dashed border-[#5A5A40]/40 space-y-2.5 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-1 border-b border-[#E5E5E0]">
            <span className="font-extrabold text-xs text-[#5A5A40]">➕ إضافة سؤال جديد للقسم</span>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewQuestion('');
                setNewAnswer('');
              }}
              className="text-[#8E8E85] hover:text-[#2D2D2A] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="font-bold text-[11px] text-[#2D2D2A] block mb-1">
                نص السؤال / البند <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="مثال: هل الموقع يدعم الدفع بالتقسيط؟"
                className="w-full p-2.5 text-xs rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] font-bold focus:bg-white focus:outline-none focus:border-[#5A5A40]"
                autoFocus
              />
            </div>
            <div>
              <label className="font-bold text-[11px] text-[#2D2D2A] block mb-1">
                الإجابة / التقييم المبدئي (اختياري)
              </label>
              <input
                type="text"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="مثال: نعم يدعم تابي وتمارا..."
                className="w-full p-2.5 text-xs rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] text-[#2D2D2A] focus:bg-white focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewQuestion('');
                setNewAnswer('');
              }}
              className="px-3 py-1.5 bg-[#F9F8F6] border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#E5E5E0] cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#5A5A40] text-white hover:bg-[#4a4a34] font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>إضافة السؤال</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid of Checklist items */}
      <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : ''} gap-3`}>
        {currentList.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-3 bg-[#F9F8F6] rounded-2xl border border-[#E5E5E0] space-y-2 hover:border-[#5A5A40]/30 transition group relative"
          >
            <div className="flex items-start justify-between gap-2">
              {editingId === item.id ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    className="w-full p-1.5 text-xs font-bold rounded-lg border border-[#5A5A40] bg-white text-[#2D2D2A]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(item.id)}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer"
                    title="حفظ تعديل السؤال"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1 text-[#8E8E85] hover:bg-[#E5E5E0] rounded-md cursor-pointer"
                    title="إلغاء"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="font-bold text-xs text-[#2D2D2A] flex-1 leading-snug">
                  {item.label}
                </label>
              )}

              {/* Action Buttons for Question */}
              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                {editingId !== item.id && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="p-1 text-[#8E8E85] hover:text-[#5A5A40] hover:bg-[#E5E5E0] rounded-lg transition cursor-pointer"
                    title="تعديل نص السؤال"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setItemToDelete(item)}
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="حذف هذا السؤال"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={item.status || ''}
              onChange={(e) => handleStatusChange(item.id, e.target.value)}
              placeholder={placeholderAnswer}
              className="w-full p-2.5 text-xs rounded-xl border border-[#E5E5E0] bg-white text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>
        ))}
      </div>

      {/* Confirmation Modal Before Delete */}
      {itemToDelete && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-rose-100 space-y-4 animate-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center gap-3 text-rose-600 border-b border-rose-50 pb-3">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#2D2D2A]">تأكيد حذف السؤال / البند</h4>
                <p className="text-[11px] text-[#8E8E85]">هل أنت متأكد من رغبتك في حذف هذا البند؟</p>
              </div>
            </div>

            <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
              <span className="font-bold text-xs text-[#2D2D2A] block leading-relaxed">
                "{itemToDelete.label}"
              </span>
              {itemToDelete.status && (
                <span className="text-[11px] text-[#8E8E85] block mt-1">
                  الإجابة الحالية: {itemToDelete.status}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 bg-[#F9F8F6] hover:bg-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>نعم، حذف السؤال</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
