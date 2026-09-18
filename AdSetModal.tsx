import React, { useState } from 'react';
import { X, Layers, Users, MapPin, DollarSign, FileText } from 'lucide-react';
import { AdSetItem } from '../../../types';

interface AdSetModalProps {
  initialAdSet?: AdSetItem | null;
  campaignType?: 'CBO' | 'ABO';
  onClose: () => void;
  onSave: (adSetData: Partial<AdSetItem>) => void;
}

export const AdSetModal: React.FC<AdSetModalProps> = ({
  initialAdSet,
  campaignType = 'CBO',
  onClose,
  onSave
}) => {
  const isEditing = !!initialAdSet;

  const [name, setName] = useState(initialAdSet?.name || '');
  const [objectiveOrRole, setObjectiveOrRole] = useState(initialAdSet?.objectiveOrRole || 'Broad Scale & TOFU');
  const [budgetType, setBudgetType] = useState<'Campaign Controlled' | 'Ad Set Controlled'>(
    initialAdSet?.budgetType || (campaignType === 'ABO' ? 'Ad Set Controlled' : 'Campaign Controlled')
  );
  const [budget, setBudget] = useState<number | ''>(
    initialAdSet?.budget !== undefined ? initialAdSet.budget : ''
  );
  const [audienceTargeting, setAudienceTargeting] = useState(initialAdSet?.audienceTargeting || '');
  const [location, setLocation] = useState(initialAdSet?.location || 'مصر (جميع المحافظات)');
  const [age, setAge] = useState(initialAdSet?.age || '18 - 45 سنة');
  const [gender, setGender] = useState(initialAdSet?.gender || 'الكل');
  const [placements, setPlacements] = useState(initialAdSet?.placements || 'Advantage+ Placements (تلقائي لكافة المنصات)');
  const [notes, setNotes] = useState(initialAdSet?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      objectiveOrRole: objectiveOrRole.trim(),
      budgetType,
      budget: typeof budget === 'number' ? budget : 0,
      audienceTargeting: audienceTargeting.trim(),
      location: location.trim(),
      age: age.trim(),
      gender: gender.trim(),
      placements: placements.trim(),
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between gap-3 shrink-0 bg-[#F9F8F6] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5E5E0] flex items-center justify-center text-[#5A5A40] shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                  {isEditing ? 'تعديل المجموعة الإعلانية' : 'مجموعة إعلانية جديدة (Ad Set)'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#2D2D2A]">
                {isEditing ? name : 'إضافة مجموعة إعلانية جديدة'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#E5E5E0] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-8">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  اسم المجموعة الإعلانية (Ad Set Name) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: AdSet 01 - Broad Audience (No Interests)"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  دور المجموعة (Role / Funnel) *
                </label>
                <input
                  type="text"
                  value={objectiveOrRole}
                  onChange={(e) => setObjectiveOrRole(e.target.value)}
                  placeholder="مثال: TOFU Broad / Retargeting"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  نوع ميزانية المجموعة
                </label>
                <select
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value as any)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  <option value="Campaign Controlled">تتحكم فيها الحملة (CBO Level)</option>
                  <option value="Ad Set Controlled">ميزانية مخصصة للمجموعة (ABO Level)</option>
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  ميزانية المجموعة (إن وجدت)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
                    placeholder={budgetType === 'Campaign Controlled' ? 'تلقائي من الحملة' : 'مثال: 300'}
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8E85]">
                    ج.م
                  </span>
                </div>
              </div>

              <div className="md:col-span-12">
                <label className="block font-extrabold text-[#2D2D2A] mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#5A5A40]" />
                  الجمهور المستهدف والاهتمامات (Audience & Detailed Targeting) *
                </label>
                <textarea
                  required
                  value={audienceTargeting}
                  onChange={(e) => setAudienceTargeting(e.target.value)}
                  placeholder="حدد الجمهور بالتفصيل: هل هو Broad أم اهتمامات محددة (Interests) أم Custom Audience (زوار الموقع، مشتري سابقين) أم Lookalike (LAL 1%-2%)؟..."
                  rows={3}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-3 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] placeholder:text-[#8E8E85]"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                  الموقع الجغرافي (Location)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="مثال: مصر، السعودية (الرياض وجدة)، الإمارات..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  الفئة العمرية (Age)
                </label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="مثال: 20 - 45 سنة"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  الجنس (Gender)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  <option value="الكل">الكل (All)</option>
                  <option value="رجال">رجال (Men)</option>
                  <option value="نساء">نساء (Women)</option>
                </select>
              </div>

              <div className="md:col-span-12">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  مواضع الظهور (Placements)
                </label>
                <input
                  type="text"
                  value={placements}
                  onChange={(e) => setPlacements(e.target.value)}
                  placeholder="مثال: Advantage+ Placements أو Instagram Feed & Reels Only"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-12">
                <label className="block font-extrabold text-[#2D2D2A] mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#5A5A40]" />
                  ملاحظات إضافية للمجموعة
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات فنية أو تخص الاستبعاد (Exclusions)..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5E5E0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] text-[#2D2D2A] rounded-xl font-extrabold text-xs transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl font-extrabold text-xs transition cursor-pointer shadow-xs"
            >
              {isEditing ? 'حفظ التعديلات' : 'إضافة المجموعة للمجموعة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
