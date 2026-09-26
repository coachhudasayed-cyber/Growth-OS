import { useSupabaseSetting } from '../../lib/useSupabaseSetting';
import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Film,
  Image as ImageIcon,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  Check,
  Tag,
  Target,
  Share2,
  Download,
  FileDown,
  CheckSquare,
  Square,
  Filter,
  Loader2,
  Eye,
  ListFilter,
} from 'lucide-react';
import { ContentPlanItem, ContentFormat, ContentStatus, UserRole } from '../../types';
import { CONTENT_LIBRARY, ContentLibraryCategory, ContentLibraryIdea } from '../../data/contentLibraryData';

interface ContentPlanTabProps {
  contentPlans: ContentPlanItem[];
  clientId: string;
  brandName?: string;
  userRole: UserRole;
  onAddContentItem: (item: Omit<ContentPlanItem, 'id'>) => void;
  onUpdateContentItem: (id: string, fields: Partial<ContentPlanItem>) => void;
  onDeleteContentItem: (id: string) => void;
}

const AVAILABLE_PLATFORMS = [
  { id: 'facebook', name: 'فيسبوك', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'instagram', name: 'انستجرام', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'tiktok', name: 'تيك توك', color: 'bg-slate-900 text-white border-slate-700' },
];

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ContentPlanTab: React.FC<ContentPlanTabProps> = ({
  contentPlans,
  clientId,
  brandName,
  userRole,
  onAddContentItem,
  onUpdateContentItem,
  onDeleteContentItem
}) => {
  // Main view tab: 'calendar' or 'library'
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'library'>('calendar');

  // Client specific items
  const clientItems = useMemo(
    () => contentPlans.filter((c) => c.clientId === clientId),
    [contentPlans, clientId]
  );

  // PDF Export States (Calendar Collection & Library)
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportDateMap, setSelectedExportDateMap] = useState<Record<string, boolean>>({});
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [isExportingCalendarPdf, setIsExportingCalendarPdf] = useState(false);
  const [isExportingLibraryPdf, setIsExportingLibraryPdf] = useState(false);

  // Dates with items scheduled for Export Collection Modal
  const datesWithContent = useMemo(() => {
    const map: Record<string, ContentPlanItem[]> = {};
    clientItems.forEach((item) => {
      if (item.publishDate) {
        if (!map[item.publishDate]) map[item.publishDate] = [];
        map[item.publishDate].push(item);
      }
    });

    const sortedDates = Object.keys(map).sort((a, b) => a.localeCompare(b));
    return sortedDates.map((dateStr) => ({
      dateStr,
      items: map[dateStr],
    }));
  }, [clientItems]);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [dayDetailsDate, setDayDetailsDate] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentPlanItem | null>(null);
  const [previewItem, setPreviewItem] = useState<ContentPlanItem | null>(null);

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'facebook']);
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<string>('');
  const [goalText, setGoalText] = useState<string>('');
  const [selectedIdeaName, setSelectedIdeaName] = useState<string>('');
  const [ideaDescriptionText, setIdeaDescriptionText] = useState<string>('');
  const [format, setFormat] = useState<ContentFormat>('reel');
  const [isExecuted, setIsExecuted] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  // Library State & Category Management with Supabase persistence
  const [libraryCategories, setLibraryCategories] = useSupabaseSetting<ContentLibraryCategory[]>(
    'content_library_categories_v2', null, CONTENT_LIBRARY, userRole !== 'client'
  );

  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [selectedLibraryCatId, setSelectedLibraryCatId] = useState<number | 'all'>('all');

  // Category Modal State (For Add & Edit)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ContentLibraryCategory | null>(null);
  const [catTitle, setCatTitle] = useState('');
  const [catGoal, setCatGoal] = useState('');
  const [catIdeas, setCatIdeas] = useState<{ id?: string | number; name: string; description: string }[]>([
    { name: '', description: '' },
  ]);
  const [catFormError, setCatFormError] = useState('');

  // Delete Confirmation State
  const [deletingCategory, setDeletingCategory] = useState<{ id: number; title: string } | null>(null);

  // Open Add Modal
  const handleOpenAddCategoryModal = () => {
    if (userRole === 'client') return;
    setEditingCategory(null);
    setCatTitle('');
    setCatGoal('');
    setCatIdeas([{ name: '', description: '' }]);
    setCatFormError('');
    setShowCategoryModal(true);
  };

  // Open Edit Modal
  const handleOpenEditCategoryModal = (cat: ContentLibraryCategory) => {
    if (userRole === 'client') return;
    setEditingCategory(cat);
    setCatTitle(cat.title);
    setCatGoal(cat.goal);
    setCatIdeas(
      cat.ideas.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
      }))
    );
    setCatFormError('');
    setShowCategoryModal(true);
  };

  // Idea fields management inside modal
  const handleAddNewIdeaField = () => {
    setCatIdeas((prev) => [...prev, { name: '', description: '' }]);
  };

  const handleRemoveIdeaField = (index: number) => {
    setCatIdeas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIdeaFieldChange = (index: number, field: 'name' | 'description', value: string) => {
    setCatIdeas((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Save Add / Edit Category
  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCatFormError('');

    if (!catTitle.trim() || !catGoal.trim()) {
      setCatFormError('يرجى كتابة عنوان التصنيف والهدف التسويقي الأساسي');
      return;
    }

    const validIdeas = catIdeas
      .filter((i) => i.name.trim() !== '' && i.description.trim() !== '')
      .map((i, idx) => ({
        id: i.id || `idea_${Date.now()}_${idx}`,
        name: i.name.trim(),
        description: i.description.trim(),
      }));

    if (validIdeas.length === 0) {
      setCatFormError('يرجى إدخال فكرة واحدة على الأقل تحتوي على اسم ووصف كاملين');
      return;
    }

    if (editingCategory) {
      // Edit mode
      const updatedCategory: ContentLibraryCategory = {
        id: editingCategory.id,
        title: catTitle.trim(),
        goal: catGoal.trim(),
        ideas: validIdeas,
      };

      setLibraryCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? updatedCategory : c))
      );
    } else {
      // Add mode
      const newCategory: ContentLibraryCategory = {
        id: Date.now(),
        title: catTitle.trim(),
        goal: catGoal.trim(),
        ideas: validIdeas,
      };

      setLibraryCategories((prev) => [newCategory, ...prev]);
    }

    setShowCategoryModal(false);
  };

  // Delete Category execution
  const handleConfirmDeleteCategory = () => {
    if (!deletingCategory) return;
    const targetId = deletingCategory.id;
    setLibraryCategories((prev) => prev.filter((c) => c.id !== targetId));
    if (selectedLibraryCatId === targetId) {
      setSelectedLibraryCatId('all');
    }
    setDeletingCategory(null);
  };

  // Handle month navigation
  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar Days calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const formatDate = (y: number, m: number, d: number) => {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    };

    const todayStr = getTodayDateString();

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDate = new Date(year, month - 1, 1);
    const pYear = prevMonthDate.getFullYear();
    const pMonth = prevMonthDate.getMonth();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const dateString = formatDate(pYear, pMonth, pDay);
      days.push({
        dateString,
        dayNumber: pDay,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = formatDate(year, month, d);

      days.push({
        dateString,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
      });
    }

    // Next month padding to complete grid of 35 or 42
    const nextMonthDate = new Date(year, month + 1, 1);
    const nYear = nextMonthDate.getFullYear();
    const nMonth = nextMonthDate.getMonth();

    const totalCells = days.length > 35 ? 42 : 35;
    const remainingCells = totalCells - days.length;
    for (let n = 1; n <= remainingCells; n++) {
      const dateString = formatDate(nYear, nMonth, n);
      days.push({
        dateString,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentDate]);

  // Open modal for a specific day date string
  const handleOpenModalForDate = (dateStr: string, existingItem?: ContentPlanItem) => {
    if (userRole === 'client') {
      if (existingItem) {
        setPreviewItem(existingItem);
      }
      return;
    }

    setSelectedDate(dateStr);

    if (existingItem) {
      setEditingItem(existingItem);
      setTitle(existingItem.title || '');
      setFormat(existingItem.format || 'reel');
      setSelectedPlatforms(existingItem.platforms || ['instagram', 'facebook']);
      setSelectedCategoryTitle(existingItem.category || '');
      setGoalText(existingItem.goal || '');
      setSelectedIdeaName(existingItem.idea || '');
      setIdeaDescriptionText(existingItem.ideaDescription || '');
      setIsExecuted(existingItem.isExecuted ?? existingItem.status === 'published');
      setNotes(existingItem.notes || '');
      setDetails(existingItem.details || '');
    } else {
      setEditingItem(null);
      setTitle('');
      setFormat('reel');
      setSelectedPlatforms(['instagram', 'facebook']);
      const defaultCat = libraryCategories[0];
      if (defaultCat) {
        setSelectedCategoryTitle(defaultCat.title);
        setGoalText(defaultCat.goal);
        const defaultIdea = defaultCat.ideas[0];
        if (defaultIdea) {
          setSelectedIdeaName(defaultIdea.name);
          setIdeaDescriptionText(defaultIdea.description);
        } else {
          setSelectedIdeaName('');
          setIdeaDescriptionText('');
        }
      } else {
        setSelectedCategoryTitle('');
        setGoalText('');
        setSelectedIdeaName('');
        setIdeaDescriptionText('');
      }
      setIsExecuted(false);
      setNotes('');
      setDetails('');
    }

    setShowModal(true);
  };

  // Open Modal Pre-filled from Library Idea
  const handleScheduleFromLibrary = (category: ContentLibraryCategory, idea: ContentLibraryIdea) => {
    if (userRole === 'client') return;
    setEditingItem(null);
    setSelectedDate(getTodayDateString());
    setTitle(`${idea.name}`);
    setSelectedCategoryTitle(category.title);
    setGoalText(category.goal);
    setSelectedIdeaName(idea.name);
    setIdeaDescriptionText(idea.description);
    setSelectedPlatforms(['instagram', 'facebook']);
    setFormat('reel');
    setIsExecuted(false);
    setNotes('');
    setDetails('');
    setActiveSubTab('calendar');
    setShowModal(true);
  };

  // Category change inside Modal
  const handleCategoryChange = (catTitle: string) => {
    setSelectedCategoryTitle(catTitle);
    const catObj = libraryCategories.find((c) => c.title === catTitle);
    if (catObj) {
      setGoalText(catObj.goal);
      if (catObj.ideas.length > 0) {
        setSelectedIdeaName(catObj.ideas[0].name);
        setIdeaDescriptionText(catObj.ideas[0].description);
        if (!title || title.trim() === '') {
          setTitle(catObj.ideas[0].name);
        }
      } else {
        setSelectedIdeaName('');
        setIdeaDescriptionText('');
      }
    }
  };

  // Idea change inside Modal
  const handleIdeaChange = (ideaName: string) => {
    setSelectedIdeaName(ideaName);
    const catObj = libraryCategories.find((c) => c.title === selectedCategoryTitle);
    if (catObj) {
      const ideaObj = catObj.ideas.find((i) => i.name === ideaName);
      if (ideaObj) {
        setIdeaDescriptionText(ideaObj.description);
        if (!title || title.trim() === '') {
          setTitle(ideaObj.name);
        }
      }
    }
  };

  // Platform toggle
  const togglePlatform = (pId: string) => {
    if (selectedPlatforms.includes(pId)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== pId));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, pId]);
    }
  };

  // Submit Modal Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalTitle = title.trim() || selectedIdeaName || 'محتوى جديد';
    const finalStatus: ContentStatus = isExecuted ? 'published' : 'draft';

    const payload = {
      clientId,
      title: finalTitle,
      format,
      status: finalStatus,
      publishDate: selectedDate,
      details,
      platforms: selectedPlatforms,
      category: selectedCategoryTitle,
      goal: goalText,
      idea: selectedIdeaName,
      ideaDescription: ideaDescriptionText,
      isExecuted,
      notes,
    };

    if (editingItem) {
      onUpdateContentItem(editingItem.id, payload);
    } else {
      onAddContentItem(payload);
    }

    setShowModal(false);
  };

  // Filtered Library Categories
  const filteredLibrary = useMemo(() => {
    return libraryCategories.filter((cat) => {
      if (selectedLibraryCatId !== 'all' && cat.id !== Number(selectedLibraryCatId)) {
        return false;
      }

      if (!librarySearch.trim()) return true;

      const q = librarySearch.toLowerCase().trim();
      const matchTitle = cat.title.toLowerCase().includes(q);
      const matchGoal = cat.goal.toLowerCase().includes(q);
      const matchIdeas = cat.ideas.some(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );

      return matchTitle || matchGoal || matchIdeas;
    });
  }, [libraryCategories, librarySearch, selectedLibraryCatId]);

  // Handlers for Export Calendar Collection Modal
  const handleOpenExportCalendarModal = () => {
    const initialMap: Record<string, boolean> = {};
    datesWithContent.forEach((d) => {
      initialMap[d.dateStr] = true;
    });
    setSelectedExportDateMap(initialMap);
    setExportStartDate('');
    setExportEndDate('');
    setShowExportModal(true);
  };

  const handleFilterDatesByRange = (start: string, end: string) => {
    const next: Record<string, boolean> = {};
    datesWithContent.forEach((d) => {
      const isAfterStart = !start || d.dateStr >= start;
      const isBeforeEnd = !end || d.dateStr <= end;
      if (isAfterStart && isBeforeEnd) {
        next[d.dateStr] = true;
      }
    });
    setSelectedExportDateMap(next);
  };

  const handleSelectAllExportDates = () => {
    const next: Record<string, boolean> = {};
    datesWithContent.forEach((d) => {
      next[d.dateStr] = true;
    });
    setSelectedExportDateMap(next);
  };

  const handleDeselectAllExportDates = () => {
    setSelectedExportDateMap({});
  };

  const toggleExportDate = (dateStr: string) => {
    setSelectedExportDateMap((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  const handleDownloadCalendarCollectionPdf = async () => {
    const selectedGroups = datesWithContent.filter((d) => selectedExportDateMap[d.dateStr]);
    if (selectedGroups.length === 0) {
      alert('يرجى تحديد يوم واحد على الأقل يحتوي على محتوى لتصديره.');
      return;
    }

    try {
      setIsExportingCalendarPdf(true);
      const { exportSelectedCalendarDaysToPDF } = await import('../../utils/pdfExporter');
      await exportSelectedCalendarDaysToPDF(
        selectedGroups,
        brandName || 'العميل',
        'جدول ومحتوى الأيام المحددة (Content Calendar PDF)'
      );
      setShowExportModal(false);
    } catch (error) {
      console.error('Failed to export calendar PDF:', error);
      alert('حدث خطأ أثناء تصدير ملف PDF، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExportingCalendarPdf(false);
    }
  };

  const handleExportLibraryPdf = async () => {
    try {
      setIsExportingLibraryPdf(true);
      const { exportContentLibraryToPDF } = await import('../../utils/pdfExporter');
      await exportContentLibraryToPDF(filteredLibrary, brandName || 'العميل');
    } catch (error) {
      console.error('Failed to export library PDF:', error);
      alert('حدث خطأ أثناء تصدير مكتبة المحتوى إلى PDF.');
    } finally {
      setIsExportingLibraryPdf(false);
    }
  };

  // Format Badge Helper
  const getFormatBadge = (fmt: ContentFormat) => {
    switch (fmt) {
      case 'reel':
        return (
          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-700 border border-purple-200 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0">
            <Film className="w-3 h-3 text-purple-600" /> فيديو Reel
          </span>
        );
      case 'design':
        return (
          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0">
            <ImageIcon className="w-3 h-3 text-blue-600" /> تصميم Carousel
          </span>
        );
      case 'story':
        return (
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-amber-600" /> ستوري Story
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0">
            <FileText className="w-3 h-3 text-emerald-600" /> منشور Post
          </span>
        );
    }
  };

  const monthNamesArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const formatArabicDateString = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dateObj = new Date(y, m, d);
        const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const dayName = dayNames[dateObj.getDay()];
        const monthName = monthNamesArabic[m] || '';
        return `${dayName}، ${d} ${monthName} ${y}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const dayDetailsItems = useMemo(() => {
    if (!dayDetailsDate) return [];
    return clientItems.filter((item) => item.publishDate === dayDetailsDate);
  }, [clientItems, dayDetailsDate]);

  return (
    <div className="space-y-6">
      {/* TOP HEADER & SUB-TAB TOGGLE */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-xl font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#5A5A40] shrink-0" />
              <span>استراتيجية ومكتبة المحتوى</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-[#78786E] mt-1 leading-relaxed">
              جدولة المنشورات مع كونتنت كاليندر تفاعلية واختيار الأفكار الجاهزة من مكتبة المحتوى المتكاملة
            </p>
          </div>

          {activeSubTab === 'calendar' && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleOpenExportCalendarModal}
                className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition flex items-center justify-center cursor-pointer shadow-xs shrink-0"
                title="تصدير كولكشن محتوى أيام إلى PDF"
                aria-label="تصدير كولكشن محتوى أيام إلى PDF"
              >
                <FileDown className="w-4 h-4" />
              </button>

              {userRole !== 'client' && (
                <button
                  type="button"
                  onClick={() => handleOpenModalForDate(getTodayDateString())}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>إضافة محتوى جديد</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* SUB-TABS SELECTOR */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center border-t border-[#E5E5E0] pt-3.5">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-3 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeSubTab === 'calendar'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'bg-white border border-[#E5E5E0] text-[#78786E] hover:bg-[#E5E5E0]/40'
            }`}
          >
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">جدول المحتوى ({clientItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('library')}
            className={`px-3 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeSubTab === 'library'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'bg-white border border-[#E5E5E0] text-[#78786E] hover:bg-[#E5E5E0]/40'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="truncate">مكتبة الأفكار ({libraryCategories.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CONTENT CALENDAR */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-4 sm:space-y-5">
          {/* Calendar Control Header */}
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-row items-center justify-between gap-2.5 shadow-xs">
            <div className="flex items-center gap-2 sm:gap-3">
              <h3 className="text-sm sm:text-base font-black text-[#2D2D2A] flex items-center gap-1.5 sm:gap-2">
                <span>{monthNamesArabic[currentDate.getMonth()]}</span>
                <span className="font-mono text-[#5A5A40]">{currentDate.getFullYear()}</span>
              </h3>
              <button
                onClick={resetToToday}
                className="px-2 py-1 bg-white border border-[#E5E5E0] text-[#5A5A40] hover:bg-[#E5E5E0] font-bold rounded-lg text-[10px] sm:text-[11px] transition cursor-pointer"
              >
                اليوم
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                type="button"
                onClick={handleOpenExportCalendarModal}
                className="p-1.5 sm:p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition flex items-center justify-center cursor-pointer shadow-xs"
                title="تصدير كولكشن محتوى أيام إلى PDF"
                aria-label="تصدير كولكشن محتوى أيام إلى PDF"
              >
                <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={prevMonth}
                  className="p-1.5 sm:p-2 bg-white border border-[#E5E5E0] rounded-xl hover:bg-[#E5E5E0] text-[#2D2D2A] transition cursor-pointer"
                  title="الشهر السابق"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 sm:p-2 bg-white border border-[#E5E5E0] rounded-xl hover:bg-[#E5E5E0] text-[#2D2D2A] transition cursor-pointer"
                  title="الشهر التالي"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE-ONLY COMPACT CALENDAR GRID (sm:hidden) */}
          <div className="block sm:hidden bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-2.5 shadow-xs">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-1.5 text-center text-[10px] font-black text-[#5A5A40]">
              <div className="py-1 bg-white rounded-lg border border-[#E5E5E0]/60">أحد</div>
              <div className="py-1 bg-white rounded-lg border border-[#E5E5E0]/60">إثن</div>
              <div className="py-1 bg-white rounded-lg border border-[#E5E5E0]/60">ثلا</div>
              <div className="py-1 bg-white rounded-lg border border-[#E5E5E0]/60">أرب</div>
              <div className="py-1 bg-white rounded-lg border border-[#E5E5E0]/60">خمي</div>
              <div className="py-1 bg-white rounded-lg border border-[#E5E5E0]/60">جمعة</div>
              <div className="py-1 bg-white rounded-lg border border-[#E5E5E0]/60">سبت</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayItems = clientItems.filter((item) => item.publishDate === day.dateString);
                const hasItems = dayItems.length > 0;

                return (
                  <button
                    key={day.dateString}
                    type="button"
                    onClick={() => setDayDetailsDate(day.dateString)}
                    className={`aspect-square min-h-[48px] p-1 rounded-xl border transition flex flex-col items-center justify-between relative cursor-pointer active:scale-95 ${
                      !day.isCurrentMonth
                        ? 'bg-[#F2F1ED]/35 border-transparent opacity-35'
                        : day.isToday
                        ? 'bg-amber-500/10 border-amber-400 text-[#2D2D2A]'
                        : hasItems
                        ? 'bg-white border-[#5A5A40]/40 text-[#2D2D2A] shadow-2xs'
                        : 'bg-white border-[#E5E5E0] text-[#2D2D2A] hover:border-[#5A5A40]'
                    }`}
                  >
                    <span
                      className={`text-[11px] font-mono font-black ${
                        day.isToday ? 'text-amber-700' : 'text-[#2D2D2A]'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    <div className="flex items-center gap-0.5 mt-auto">
                      {hasItems && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#5A5A40] text-white">
                          {dayItems.length}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-center text-[#78786E] mt-2 font-medium">
              💡 اضغط على أي يوم لعرض تفاصيل المحتوى المسجل فيه
            </p>
          </div>

          {/* DESKTOP CALENDAR GRID (hidden sm:block) */}
          <div className="hidden sm:block bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 shadow-xs overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-black text-[#5A5A40]">
              <div className="py-2 bg-white rounded-xl border border-[#E5E5E0]/60">الأحد</div>
              <div className="py-2 bg-white rounded-xl border border-[#E5E5E0]/60">الاثنين</div>
              <div className="py-2 bg-white rounded-xl border border-[#E5E5E0]/60">الثلاثاء</div>
              <div className="py-2 bg-white rounded-xl border border-[#E5E5E0]/60">الأربعاء</div>
              <div className="py-2 bg-white rounded-xl border border-[#E5E5E0]/60">الخميس</div>
              <div className="py-2 bg-white rounded-xl border border-[#E5E5E0]/60">الجمعة</div>
              <div className="py-2 bg-white rounded-xl border border-[#E5E5E0]/60">السبت</div>
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const dayItems = clientItems.filter((item) => item.publishDate === day.dateString);

                return (
                  <div
                    key={day.dateString}
                    onClick={() => setDayDetailsDate(day.dateString)}
                    className={`min-h-[120px] p-2 rounded-2xl border transition flex flex-col justify-between group cursor-pointer ${
                      !day.isCurrentMonth
                        ? 'bg-[#F2F1ED]/50 border-transparent opacity-40 hover:opacity-80'
                        : day.isToday
                        ? 'bg-amber-500/5 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-white border-[#E5E5E0] hover:border-[#5A5A40] hover:shadow-xs'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          day.isToday
                            ? 'bg-amber-500 text-white font-extrabold'
                            : 'text-[#2D2D2A]'
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      {dayItems.length > 0 && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#5A5A40] text-white">
                          {dayItems.length}
                        </span>
                      )}
                    </div>

                    {/* Day Scheduled Items List */}
                    <div className="space-y-1 my-1 flex-1 overflow-y-auto max-h-[75px] scrollbar-none">
                      {dayItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDayDetailsDate(day.dateString);
                          }}
                          className={`p-1.5 rounded-xl border text-[11px] transition flex flex-col gap-0.5 hover:scale-[1.02] cursor-pointer ${
                            item.isExecuted || item.status === 'published'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : 'bg-[#F9F8F6] border-[#E5E5E0] text-[#2D2D2A]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold truncate max-w-[90px]" title={item.title}>
                              {item.title}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const current = item.isExecuted || item.status === 'published';
                                onUpdateContentItem(item.id, {
                                  isExecuted: !current,
                                  status: !current ? 'published' : 'draft',
                                });
                              }}
                              className="p-0.5 hover:bg-black/10 rounded transition cursor-pointer shrink-0"
                              title={
                                item.isExecuted || item.status === 'published'
                                  ? 'تم التنفيذ (اضغط للتغيير إلى قيد الإعداد)'
                                  : 'قيد الإعداد (اضغط للتغيير إلى تم التنفيذ)'
                              }
                            >
                              {item.isExecuted || item.status === 'published' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              )}
                            </button>
                          </div>

                          {item.idea && (
                            <span className="text-[9px] text-[#78786E] truncate">
                              {item.idea}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add plus prompt on hover - compact badge (Admin only) */}
                    {userRole !== 'client' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pt-0.5 border-t border-[#E5E5E0]/40 mt-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModalForDate(day.dateString);
                          }}
                          className="px-1.5 py-0.5 rounded bg-[#5A5A40]/10 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white font-extrabold text-[10px] flex items-center justify-center gap-0.5 transition cursor-pointer w-full truncate"
                        >
                          <Plus className="w-2.5 h-2.5 shrink-0" />
                          <span>إضافة محتوى</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick List view below Calendar */}
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5A5A40]" />
              قائمة المحتوى المجدول في الكاليندر ({clientItems.length})
            </h3>

            {clientItems.length === 0 ? (
              <div className="text-center py-8 bg-white border border-[#E5E5E0] rounded-2xl text-[#78786E] text-xs">
                لا توجد منشورات مجدولة بعد. اضغط على أي يوم في التقويم أو زر "إضافة محتوى جديد" لجدولة أفكارك! 🎬
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {clientItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#E5E5E0] rounded-2xl p-4 space-y-3 shadow-2xs hover:border-[#5A5A40] transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getFormatBadge(item.format)}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const current = item.isExecuted || item.status === 'published';
                              onUpdateContentItem(item.id, {
                                isExecuted: !current,
                                status: !current ? 'published' : 'draft',
                              });
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95 ${
                              item.isExecuted || item.status === 'published'
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 shadow-2xs'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 shadow-2xs'
                            }`}
                            title="اضغط للتغيير بين قيد الإعداد وتم التنفيذ"
                          >
                            {item.isExecuted || item.status === 'published' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span>تم التنفيذ</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span>قيد الإعداد</span>
                              </>
                            )}
                          </button>
                        </div>
                        <h4 className="font-extrabold text-sm text-[#2D2D2A] leading-snug">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        {userRole === 'client' ? (
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 text-[#5A5A40] hover:text-[#2D2D2A] bg-[#F9F8F6] hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-lg transition cursor-pointer"
                            title="معاينة تفاصيل المحتوى"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenModalForDate(item.publishDate, item)}
                              className="p-1.5 text-[#78786E] hover:text-[#2D2D2A] bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg transition cursor-pointer"
                              title="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteContentItem(item.id)}
                              className="p-1.5 text-[#78786E] hover:text-rose-600 bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg transition cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {item.category && (
                      <div className="text-xs bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] space-y-1">
                        <div className="font-bold text-[#5A5A40] text-[11px] flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {item.category}
                        </div>
                        {item.idea && (
                          <div className="font-semibold text-[#2D2D2A] text-xs">
                            الفكرة: {item.idea}
                          </div>
                        )}
                        {item.goal && (
                          <p className="text-[11px] text-[#78786E] leading-relaxed">
                            الهدف: {item.goal}
                          </p>
                        )}
                      </div>
                    )}

                    {item.platforms && item.platforms.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-[#78786E] font-bold">المنصات:</span>
                        {item.platforms.map((pId) => {
                          const pObj = AVAILABLE_PLATFORMS.find((p) => p.id === pId);
                          return (
                            <span
                              key={pId}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                pObj?.color || 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              {pObj?.name || pId}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {item.notes && (
                      <div className="text-xs text-[#2D2D2A] bg-amber-500/5 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed whitespace-pre-line">
                        <span className="font-bold text-amber-900 block mb-0.5">ملاحظات ولينكات:</span>
                        {item.notes}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E5E5E0] flex items-center justify-between text-[11px] text-[#78786E]">
                      <span className="font-mono font-bold">التاريخ: {item.publishDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CONTENT LIBRARY */}
      {activeSubTab === 'library' && (
        <div className="space-y-6">
          {/* Library Header & Filters */}
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#78786E] absolute right-3.5 top-3" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="ابحث عن أفكار، استراتيجيات، مواضيع، أو اهداف تسويقية..."
                  className="w-full bg-white border border-[#E5E5E0] focus:border-[#5A5A40] rounded-xl pr-10 pl-4 py-2.5 text-xs text-[#2D2D2A] outline-none shadow-2xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                {/* Category Filter Dropdown */}
                <select
                  value={selectedLibraryCatId}
                  onChange={(e) =>
                    setSelectedLibraryCatId(
                      e.target.value === 'all' ? 'all' : Number(e.target.value)
                    )
                  }
                  className="bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] outline-none cursor-pointer shrink-0 shadow-2xs w-full sm:w-auto"
                >
                  <option value="all">كل التصنيفات ({libraryCategories.length} تصنيف)</option>
                  {libraryCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>

                {/* Add New Category Button (Admin only) */}
                {userRole !== 'client' && (
                  <button
                    type="button"
                    onClick={handleOpenAddCategoryModal}
                    className="px-4 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة نوع محتوى جديد</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Render Library Categories */}
          <div className="space-y-6">
            {filteredLibrary.length === 0 ? (
              <div className="text-center py-12 bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl text-[#78786E] text-xs space-y-2">
                <p>لم يتم العثور على أفكار تطابق بحثك أو الفلتر المختار 🔍</p>
                <p className="text-[11px]">جرب البحث بكلمة مختلفة أو اختر "كل التصنيفات"</p>
              </div>
            ) : (
              filteredLibrary.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xs"
                >
                  {/* Category Title & Goal */}
                  <div className="border-b border-[#E5E5E0] pb-4 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="text-base sm:text-lg font-black text-[#2D2D2A] tracking-tight">
                        {cat.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-800 border border-amber-300/60 rounded-full text-[11px] font-extrabold">
                          {cat.ideas.length} أفكار
                        </span>
                        {userRole !== 'client' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditCategoryModal(cat)}
                              className="p-1.5 text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white bg-white border border-[#E5E5E0] hover:border-[#5A5A40] rounded-xl transition cursor-pointer flex items-center justify-center shadow-2xs"
                              title="تعديل هذا التصنيف وأفكاره"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCategory({ id: cat.id, title: cat.title })}
                              className="p-1.5 text-[#78786E] hover:text-rose-600 bg-white border border-[#E5E5E0] hover:border-rose-300 rounded-xl transition cursor-pointer shadow-2xs"
                              title="حذف هذا التصنيف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E5E0] p-3 rounded-2xl flex items-start gap-2 text-xs">
                      <Target className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-[#2D2D2A]">الهدف: </span>
                        <span className="text-[#78786E] leading-relaxed">{cat.goal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ideas Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {cat.ideas.map((idea) => (
                      <div
                        key={idea.id}
                        className="bg-white border border-[#E5E5E0] rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-[#5A5A40] transition shadow-2xs group"
                      >
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-xs sm:text-sm text-[#2D2D2A] flex items-center justify-between">
                            <span>{idea.name}</span>
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-60 group-hover:opacity-100 transition" />
                          </h4>
                          <p className="text-xs text-[#78786E] leading-relaxed bg-[#F9F8F6] p-3 rounded-xl border border-[#E5E5E0]/60">
                            {idea.description}
                          </p>
                        </div>

                        {userRole !== 'client' && (
                          <button
                            onClick={() => handleScheduleFromLibrary(cat, idea)}
                            className="w-full py-2 px-3 bg-[#5A5A40]/10 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white border border-[#5A5A40]/20 font-extrabold rounded-xl text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>جدولة هذه الفكرة في الكاليندر</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DAILY CONTENT CREATION & EDIT MODAL (Admin only) */}
      {showModal && userRole !== 'client' && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E5E5E0] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between bg-[#F9F8F6] rounded-t-3xl shrink-0">
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-5 h-5 text-[#5A5A40]" />
                <div>
                  <h3 className="font-black text-[#2D2D2A] text-sm sm:text-base">
                    {editingItem ? 'تعديل محتوى مجدول' : 'إضافة محتوى جديد في الكاليندر'}
                  </h3>
                  <p className="text-[11px] text-[#78786E] font-mono">
                    تاريخ النشر: {selectedDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#78786E] hover:text-[#2D2D2A] rounded-xl hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              {/* Date & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2D2D2A] font-extrabold mb-1">اليوم بتاريخه *</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-[#2D2D2A] font-mono font-bold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#2D2D2A] font-extrabold mb-1">نوع المحتوى (Format)</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ContentFormat)}
                    className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-[#2D2D2A] font-bold outline-none cursor-pointer"
                  >
                    <option value="reel">فيديو Reel</option>
                    <option value="design">تصميم Carousel</option>
                    <option value="post">منشور Post</option>
                    <option value="story">ستوري Story</option>
                  </select>
                </div>
              </div>

              {/* Title / Main Hook */}
              <div>
                <label className="block text-[#2D2D2A] font-extrabold mb-1">عنوان أو اسم المحتوى</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: ريل عرض الخصم الخاص، بوست آراء العملاء..."
                  className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-[#2D2D2A] outline-none"
                />
              </div>

              {/* Platform Selector */}
              <div>
                <label className="block text-[#2D2D2A] font-extrabold mb-1.5">
                  المنصة (اختر المنصات المراد النشر عليها)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_PLATFORMS.map((plat) => {
                    const isSelected = selectedPlatforms.includes(plat.id);
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => togglePlatform(plat.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-2xs'
                            : 'bg-[#F9F8F6] border-[#E5E5E0] text-[#78786E] hover:bg-[#E5E5E0]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{plat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Library Selector (Category -> Idea) */}
              <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3">
                <div className="font-extrabold text-[#2D2D2A] text-xs flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#5A5A40]" />
                  <span>نوع المحتوى والهدف والفكرة (من مكتبة المحتوى)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-[#78786E] font-bold mb-1 text-[11px]">التصنيف (نوع المحتوى)</label>
                    <select
                      value={selectedCategoryTitle}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-[#2D2D2A] font-bold outline-none cursor-pointer"
                    >
                      <option value="">-- اختر التصنيف --</option>
                      {libraryCategories.map((cat) => (
                        <option key={cat.id} value={cat.title}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Idea Dropdown */}
                  <div>
                    <label className="block text-[#78786E] font-bold mb-1 text-[11px]">الفكرة المختارة</label>
                    <select
                      value={selectedIdeaName}
                      onChange={(e) => handleIdeaChange(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-[#2D2D2A] font-bold outline-none cursor-pointer"
                    >
                      <option value="">-- اختر الفكرة --</option>
                      {libraryCategories.find((c) => c.title === selectedCategoryTitle)?.ideas.map((idea) => (
                        <option key={idea.id} value={idea.name}>
                          {idea.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Auto-filled Goal */}
                {goalText && (
                  <div className="bg-white p-3 rounded-xl border border-[#E5E5E0] space-y-0.5">
                    <span className="font-extrabold text-[#5A5A40] block">الهدف من المحتوى:</span>
                    <p className="text-[#2D2D2A] text-[11px] leading-relaxed">{goalText}</p>
                  </div>
                )}

                {/* This is the scheduled post's own editable copy, never the library source. */}
                <div className="bg-white p-3 rounded-xl border border-[#E5E5E0] space-y-1.5">
                  <label htmlFor="scheduled-idea-description" className="font-extrabold text-[#2D2D2A] block">
                    وصف وتنفيذ الفكرة (قابل للتعديل للمحتوى المجدول):
                  </label>
                  <textarea
                    id="scheduled-idea-description"
                    value={ideaDescriptionText}
                    onChange={(e) => setIdeaDescriptionText(e.target.value)}
                    rows={5}
                    placeholder="اكتبي وصف وتنفيذ الفكرة المناسب للبراند والمنتج..."
                    className="w-full resize-y min-h-28 rounded-xl border border-[#E5E5E0] bg-[#F9F8F6] p-3 text-[#2D2D2A] text-xs leading-relaxed outline-none focus:border-[#5A5A40]"
                  />
                  <p className="text-[10px] text-[#78786E]">
                    التعديل هنا يتحفظ في المحتوى المجدول فقط، ومش بيغير وصف الفكرة الأصلي في المكتبة.
                  </p>
                </div>
              </div>

              {/* Status (Execution State) */}
              <div>
                <label className="block text-[#2D2D2A] font-extrabold mb-1.5">الحالة (تم التنفيذ أم لا)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsExecuted(false)}
                    className={`py-2.5 px-3 rounded-xl font-extrabold border text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                      !isExecuted
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                        : 'bg-[#F9F8F6] border-[#E5E5E0] text-[#78786E]'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>لم يتم التنفيذ / قيد الإعداد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExecuted(true)}
                    className={`py-2.5 px-3 rounded-xl font-extrabold border text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                      isExecuted
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs'
                        : 'bg-[#F9F8F6] border-[#E5E5E0] text-[#78786E]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>تم التنفيذ ✅</span>
                  </button>
                </div>
              </div>

              {/* Notes & Reference Links */}
              <div>
                <label className="block text-[#2D2D2A] font-extrabold mb-1">
                  ملاحظات ولينكات ريفرانس (حسب نوع المنتج)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="أرفق أي ملاحظات أو روابط ريفرانس أو تعليمات خاصة بالنشر..."
                  className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl p-3 text-[#2D2D2A] outline-none leading-relaxed"
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-3 border-t border-[#E5E5E0] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'حفظ التعديلات' : 'حفظ المحتوى في الكاليندر'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT READ-ONLY PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E5E5E0] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between bg-[#F9F8F6] rounded-t-3xl shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#2D2D2A] text-sm sm:text-base">
                    معاينة تفاصيل المحتوى
                  </h3>
                  <p className="text-[11px] text-[#78786E] font-mono">
                    تاريخ النشر: {previewItem.publishDate || 'غير محدد'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-[#78786E] hover:text-[#2D2D2A] rounded-xl hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
              {/* Title & Format */}
              <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[#78786E] text-[11px]">عنوان المحتوى:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#5A5A40] text-white">
                    {previewItem.format === 'reel'
                      ? 'فيديو Reel'
                      : previewItem.format === 'design'
                      ? 'تصميم Carousel'
                      : previewItem.format === 'post'
                      ? 'منشور Post'
                      : 'ستوري Story'}
                  </span>
                </div>
                <h4 className="text-base font-black text-[#2D2D2A] leading-snug">
                  {previewItem.title}
                </h4>
              </div>

              {/* Platforms */}
              {previewItem.platforms && previewItem.platforms.length > 0 && (
                <div>
                  <span className="font-extrabold text-[#78786E] text-[11px] block mb-1.5">المنصات:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewItem.platforms.map((platId) => (
                      <span
                        key={platId}
                        className="px-3 py-1 bg-[#F9F8F6] border border-[#E5E5E0] text-[#2D2D2A] rounded-xl text-[11px] font-bold"
                      >
                        {platId === 'instagram' ? 'إنستغرام' : platId === 'facebook' ? 'فيسبوك' : platId === 'tiktok' ? 'تيك توك' : platId === 'snapchat' ? 'سناب شات' : platId === 'x' ? 'منصة X' : platId === 'linkedin' ? 'لينكد إن' : platId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Category, Goal & Idea */}
              {(previewItem.category || previewItem.goal || previewItem.idea) && (
                <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3">
                  {previewItem.category && (
                    <div>
                      <span className="font-extrabold text-[#78786E] text-[11px] block mb-0.5">نوع وتصنيف المحتوى:</span>
                      <p className="font-extrabold text-[#2D2D2A] text-xs">{previewItem.category}</p>
                    </div>
                  )}

                  {previewItem.goal && (
                    <div className="bg-white p-3 rounded-xl border border-[#E5E5E0] space-y-0.5">
                      <span className="font-extrabold text-[#5A5A40] text-[11px] block">الهدف التسويقي:</span>
                      <p className="text-[#2D2D2A] text-[11px] leading-relaxed">{previewItem.goal}</p>
                    </div>
                  )}

                  {previewItem.idea && (
                    <div className="bg-white p-3 rounded-xl border border-[#E5E5E0] space-y-1">
                      <div className="flex items-center gap-1 font-extrabold text-[#2D2D2A] text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>الفكرة: {previewItem.idea}</span>
                      </div>
                      {previewItem.ideaDescription && (
                        <p className="text-[#78786E] text-[11px] leading-relaxed whitespace-pre-wrap pt-1 border-t border-[#E5E5E0]/60">
                          {previewItem.ideaDescription}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {previewItem.notes && (
                <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-1">
                  <span className="font-extrabold text-[#78786E] text-[11px] block">ملاحظات وروابط ريفرانس:</span>
                  <p className="text-[#2D2D2A] text-xs leading-relaxed whitespace-pre-wrap">{previewItem.notes}</p>
                </div>
              )}

              {/* Interactive Status Toggle For Client */}
              <div className="pt-2">
                <span className="font-extrabold text-[#2D2D2A] text-xs block mb-1.5">حالة التنفيذ (يمكنك تغيير الحالة):</span>
                <button
                  type="button"
                  onClick={() => {
                    const current = previewItem.isExecuted || previewItem.status === 'published';
                    const newExecuted = !current;
                    const newStatus: ContentStatus = newExecuted ? 'published' : 'draft';
                    onUpdateContentItem(previewItem.id, {
                      isExecuted: newExecuted,
                      status: newStatus,
                    });
                    setPreviewItem({
                      ...previewItem,
                      isExecuted: newExecuted,
                      status: newStatus,
                    });
                  }}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs border transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    previewItem.isExecuted || previewItem.status === 'published'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {previewItem.isExecuted || previewItem.status === 'published' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>تم التنفيذ ✅ (اضغط للتغيير إلى قيد الإعداد)</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>قيد الإعداد ⏳ (اضغط للتغيير إلى تم التنفيذ)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E5E5E0] flex items-center justify-end bg-[#F9F8F6] rounded-b-3xl shrink-0">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2 bg-[#5A5A40] text-white font-bold rounded-xl text-xs hover:bg-[#4a4a34] transition cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAY CONTENT DETAILS MODAL (Pop-up when clicking on a calendar day) */}
      {dayDetailsDate && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E5E5E0] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between bg-[#F9F8F6] rounded-t-3xl shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#2D2D2A] text-sm sm:text-base">
                    محتوى يوم {formatArabicDateString(dayDetailsDate)}
                  </h3>
                  <p className="text-[11px] text-[#78786E] font-mono">
                    {dayDetailsItems.length === 0
                      ? 'لا يوجد محتوى مسجل لهذا اليوم'
                      : `${dayDetailsItems.length} منشورات مسجلة في هذا اليوم`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDayDetailsDate(null)}
                className="p-1.5 text-[#78786E] hover:text-[#2D2D2A] rounded-xl hover:bg-[#E5E5E0] transition cursor-pointer"
                title="إغلاق"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              {dayDetailsItems.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-3 bg-[#F9F8F6] rounded-2xl border border-[#E5E5E0]">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E5E0] flex items-center justify-center mx-auto text-xl shadow-2xs">
                    📅
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-[#2D2D2A]">
                      لا يوجد محتوى مجدول لهذا اليوم
                    </h4>
                    <p className="text-[11px] text-[#78786E] max-w-sm mx-auto">
                      لم يتم تسجيل أي منشورات أو أفكار بتاريخ ({dayDetailsDate}).
                    </p>
                  </div>
                  {userRole !== 'client' && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetDate = dayDetailsDate;
                        setDayDetailsDate(null);
                        handleOpenModalForDate(targetDate);
                      }}
                      className="px-4 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>جدولة محتوى لهذا اليوم الآن</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {dayDetailsItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-[#E5E5E0] rounded-2xl p-4 space-y-3 shadow-2xs hover:border-[#5A5A40]/50 transition"
                    >
                      {/* Top bar: Format, Status toggle, and Actions */}
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getFormatBadge(item.format)}
                          <button
                            type="button"
                            onClick={() => {
                              const current = item.isExecuted || item.status === 'published';
                              onUpdateContentItem(item.id, {
                                isExecuted: !current,
                                status: !current ? 'published' : 'draft',
                              });
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95 ${
                              item.isExecuted || item.status === 'published'
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 shadow-2xs'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 shadow-2xs'
                            }`}
                            title="اضغط للتغيير بين قيد الإعداد وتم التنفيذ"
                          >
                            {item.isExecuted || item.status === 'published' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span>تم التنفيذ ✅</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span>قيد الإعداد ⏳</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {userRole === 'client' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setDayDetailsDate(null);
                                setPreviewItem(item);
                              }}
                              className="p-1.5 text-[#5A5A40] hover:text-[#2D2D2A] bg-[#F9F8F6] hover:bg-[#E5E5E0] border border-[#E5E5E0] rounded-lg transition cursor-pointer"
                              title="معاينة تفاصيل كاملة"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const targetDate = dayDetailsDate;
                                  setDayDetailsDate(null);
                                  handleOpenModalForDate(targetDate, item);
                                }}
                                className="p-1.5 text-[#78786E] hover:text-[#2D2D2A] bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg transition cursor-pointer"
                                title="تعديل المحتوى"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteContentItem(item.id);
                                }}
                                className="p-1.5 text-[#78786E] hover:text-rose-600 bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg transition cursor-pointer"
                                title="حذف المحتوى"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Content Title */}
                      <h4 className="font-black text-sm text-[#2D2D2A] leading-snug">
                        {item.title}
                      </h4>

                      {/* Platforms */}
                      {item.platforms && item.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.platforms.map((platId) => (
                            <span
                              key={platId}
                              className="px-2 py-0.5 bg-[#F9F8F6] border border-[#E5E5E0] text-[#2D2D2A] rounded-lg text-[10px] font-bold"
                            >
                              {platId === 'instagram'
                                ? 'إنستغرام'
                                : platId === 'facebook'
                                ? 'فيسبوك'
                                : platId === 'tiktok'
                                ? 'تيك توك'
                                : platId === 'snapchat'
                                ? 'سناب شات'
                                : platId === 'x'
                                ? 'منصة X'
                                : platId === 'linkedin'
                                ? 'لينكد إن'
                                : platId}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Category & Goal */}
                      {(item.category || item.goal) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#E5E5E0]/60">
                          {item.category && (
                            <div>
                              <span className="font-bold text-[#78786E] block text-[10px]">نوع المحتوى:</span>
                              <span className="font-extrabold text-[#2D2D2A]">{item.category}</span>
                            </div>
                          )}
                          {item.goal && (
                            <div>
                              <span className="font-bold text-[#78786E] block text-[10px]">الهدف التسويقي:</span>
                              <span className="font-extrabold text-[#5A5A40]">{item.goal}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Idea / Description */}
                      {(item.idea || item.ideaDescription) && (
                        <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#E5E5E0] space-y-1">
                          {item.idea && (
                            <div className="flex items-center gap-1.5 font-black text-xs text-[#2D2D2A]">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>الفكرة: {item.idea}</span>
                            </div>
                          )}
                          {item.ideaDescription && (
                            <p className="text-[11px] text-[#78786E] leading-relaxed whitespace-pre-wrap pr-5">
                              {item.ideaDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <div className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0] text-[11px] text-[#5A5A40] space-y-0.5">
                          <span className="font-bold block text-[10px] text-[#78786E]">ملاحظات وروابط ريفرانس:</span>
                          <p className="whitespace-pre-wrap">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E5E5E0] flex items-center justify-between bg-[#F9F8F6] rounded-b-3xl shrink-0">
              <button
                type="button"
                onClick={() => setDayDetailsDate(null)}
                className="px-4 py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                إغلاق
              </button>

              {userRole !== 'client' && (
                <button
                  type="button"
                  onClick={() => {
                    const targetDate = dayDetailsDate;
                    setDayDetailsDate(null);
                    handleOpenModalForDate(targetDate);
                  }}
                  className="px-4 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة محتوى آخر لهذا اليوم</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CATEGORY MODAL (Admin only) */}
      {showCategoryModal && userRole !== 'client' && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E5E5E0] overflow-hidden my-auto">
            <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between bg-[#F9F8F6] rounded-t-3xl shrink-0">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#5A5A40]" />
                <div>
                  <h3 className="font-black text-[#2D2D2A] text-sm sm:text-base">
                    {editingCategory ? 'تعديل نوع المحتوى وأفكاره' : 'إضافة نوع محتوى جديد في المكتبة'}
                  </h3>
                  <p className="text-[11px] text-[#78786E]">
                    {editingCategory
                      ? 'تعديل عنوان التصنيف، الهدف التسويقي، وإعادة صياغة أو إضافة أفكار جديدة'
                      : 'إدخال عنوان التصنيف، الهدف التسويقي والأفكار المرتبطة به'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 text-[#78786E] hover:text-[#2D2D2A] rounded-xl hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategorySubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              {catFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{catFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-[#2D2D2A] font-extrabold mb-1">نوع / عنوان المحتوى *</label>
                <input
                  type="text"
                  required
                  value={catTitle}
                  onChange={(e) => setCatTitle(e.target.value)}
                  placeholder="مثال: محتوى تجارب المستخدمين، محتوى المقارنات والمراجعات..."
                  className="w-full bg-[#F9F8F6] border border-[#E5E5E0] focus:border-[#5A5A40] rounded-xl px-3.5 py-2.5 text-[#2D2D2A] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[#2D2D2A] font-extrabold mb-1">الهدف التسويقي من هذا النوع *</label>
                <textarea
                  required
                  rows={2}
                  value={catGoal}
                  onChange={(e) => setCatGoal(e.target.value)}
                  placeholder="مثال: تعزيز الثقة والولاء وتحفيز الشراء المباشر عبر إبراز آراء وتقييمات العملاء..."
                  className="w-full bg-[#F9F8F6] border border-[#E5E5E0] focus:border-[#5A5A40] rounded-xl p-3 text-[#2D2D2A] outline-none leading-relaxed"
                />
              </div>

              {/* Ideas list section */}
              <div className="space-y-3 pt-2 border-t border-[#E5E5E0]">
                <div className="flex items-center justify-between">
                  <label className="text-[#2D2D2A] font-extrabold text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>الأفكار التابعة لهذا التصنيف ({catIdeas.length})</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddNewIdeaField}
                    className="px-3 py-1.5 bg-[#5A5A40]/10 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white font-extrabold rounded-xl text-[11px] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة فكرة جديدة</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {catIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-[#F9F8F6] border border-[#E5E5E0] p-3.5 rounded-2xl space-y-2 relative">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-[11px] text-[#5A5A40]">الفكرة #{idx + 1}</span>
                        {catIdeas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIdeaField(idx)}
                            className="p-1 text-[#78786E] hover:text-rose-600 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px]"
                            title="حذف هذه الفكرة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>إزالة الفكرة</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#78786E] font-bold mb-0.5">عنوان الفكرة *</label>
                        <input
                          type="text"
                          required
                          value={idea.name}
                          onChange={(e) => handleIdeaFieldChange(idx, 'name', e.target.value)}
                          placeholder="اسم/عنوان الفكرة..."
                          className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-[#2D2D2A] font-bold outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#78786E] font-bold mb-0.5">وصف وآلية تنفيذ الفكرة *</label>
                        <textarea
                          required
                          rows={2}
                          value={idea.description}
                          onChange={(e) => handleIdeaFieldChange(idx, 'description', e.target.value)}
                          placeholder="تفاصيل الفكرة وكيفية تصويرها أو تطبيقها..."
                          className="w-full bg-white border border-[#E5E5E0] rounded-xl p-2.5 text-[#2D2D2A] text-[11px] outline-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E0] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2.5 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف للمكتبة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CATEGORY CONFIRMATION MODAL (Admin only) */}
      {deletingCategory && userRole !== 'client' && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5E0] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-[#2D2D2A] text-base">تأكيد حذف تصنيف محتوى</h3>
                <p className="text-[11px] text-[#78786E]">حذف نصوص الأفكار والتصنيف بشكل دائم</p>
              </div>
            </div>

            <p className="text-xs text-[#2D2D2A] leading-relaxed bg-[#F9F8F6] p-3.5 rounded-2xl border border-[#E5E5E0]">
              هل أنت تأكد من حذف تصنيف <strong className="text-rose-700">"{deletingCategory.title}"</strong>؟ هذا الإجراء سيقوم بإزالة التصنيف وكافة الأفكار التابعة له من مكتبتك.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2.5 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT CALENDAR COLLECTION TO PDF MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-[#E5E5E0] space-y-5 my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#E5E5E0] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl shrink-0">
                  <FileDown className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-black text-[#2D2D2A] text-base sm:text-lg">
                    تصدير كولكشن محتوى أيام إلى PDF
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#78786E] mt-0.5">
                    اختر الأيام التي ترغب بتجميع محتواها وتصديرها بترتيب التواريخ مع كافة التفاصيل
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Controls & Date Range Filter */}
            <div className="bg-[#F9F8F6] border border-[#E5E5E0] p-3.5 rounded-2xl space-y-3 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-[#2D2D2A] flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-[#5A5A40]" />
                  <span>تحديد أيام التصدير:</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllExportDates}
                    className="px-3 py-1.5 bg-white border border-[#E5E5E0] hover:bg-emerald-50 hover:border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>تحديد الكل ({datesWithContent.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeselectAllExportDates}
                    className="px-3 py-1.5 bg-white border border-[#E5E5E0] hover:bg-rose-50 hover:border-rose-300 text-rose-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Square className="w-3.5 h-3.5 text-rose-700" />
                    <span>إلغاء التحديد</span>
                  </button>
                </div>
              </div>

              {/* Date Range Selector Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-[#E5E5E0] items-center">
                <div className="sm:col-span-2 flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-[#E5E5E0] rounded-xl">
                  <span className="text-[11px] font-bold text-[#78786E] shrink-0">من تاريخ:</span>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExportStartDate(val);
                      handleFilterDatesByRange(val, exportEndDate);
                    }}
                    className="w-full text-xs font-mono font-bold text-[#2D2D2A] outline-none bg-transparent cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-[#E5E5E0] rounded-xl">
                  <span className="text-[11px] font-bold text-[#78786E] shrink-0">إلى تاريخ:</span>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExportEndDate(val);
                      handleFilterDatesByRange(exportStartDate, val);
                    }}
                    className="w-full text-xs font-mono font-bold text-[#2D2D2A] outline-none bg-transparent cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleFilterDatesByRange(exportStartDate, exportEndDate)}
                  className="sm:col-span-1 px-3 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>تطبيق النطاق</span>
                </button>
              </div>
            </div>

            {/* Days list with checkboxes */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none max-h-[320px]">
              {datesWithContent.length === 0 ? (
                <div className="text-center py-10 bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl text-[#78786E] text-xs">
                  لا يوجد محتوى مسجل في أي تاريخ حتى الآن لتصديره.
                </div>
              ) : (
                datesWithContent.map((group) => {
                  const isChecked = !!selectedExportDateMap[group.dateStr];
                  return (
                    <label
                      key={group.dateStr}
                      onClick={() => toggleExportDate(group.dateStr)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-500/5 border-emerald-400/80 shadow-2xs'
                          : 'bg-white border-[#E5E5E0] hover:bg-[#F9F8F6]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-extrabold text-xs text-[#2D2D2A]">
                            📅 {group.dateStr}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#5A5A40] text-white">
                            {group.items.length} محتوى
                          </span>
                        </div>

                        <div className="text-[11px] text-[#78786E] truncate">
                          {group.items.map((it) => it.title).join(' • ')}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#E5E5E0] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs font-bold text-[#2D2D2A]">
                المحدد: <span className="text-emerald-700 font-extrabold">{Object.values(selectedExportDateMap).filter(Boolean).length}</span> من أصل <span className="font-extrabold">{datesWithContent.length}</span> أيام
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#E5E5E0] transition cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCalendarCollectionPdf}
                  disabled={isExportingCalendarPdf || Object.values(selectedExportDateMap).filter(Boolean).length === 0}
                  className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center disabled:opacity-50"
                  title="تنزيل ملف PDF"
                >
                  {isExportingCalendarPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
