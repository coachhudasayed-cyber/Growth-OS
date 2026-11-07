import React, { useMemo, useState } from 'react';
import {
  AlignLeft,
  BarChart2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  Eye,
  FileText,
  Hash,
  Layers,
  Loader2,
  Plus,
  Save,
  Trash2,
  Type,
  X
} from 'lucide-react';
import { useSupabaseSetting } from '../../lib/useSupabaseSetting';
import { formatLocalDate } from '../../lib/dateUtils';
import {
  DEFAULT_WEEKLY_REPORT_QUESTIONS,
  DEFAULT_WEEKLY_REPORT_SECTIONS,
  getWeeklyReportDisplaySections,
  getWeeklyReportSearchText
} from '../../lib/weeklyReportConfig';
import {
  UserRole,
  WeeklyReport,
  WeeklyReportCampaignEntry,
  WeeklyReportOrganicEntry,
  WeeklyReportQuestion,
  WeeklyReportQuestionAnswer,
  WeeklyReportSection
} from '../../types';
import { ReportFilterBar, DateFilterPreset, getDateRangeFromPreset } from '../ReportFilterBar';

interface WeeklyReportsTabProps {
  reports: WeeklyReport[];
  clientId: string;
  brandName?: string;
  userRole?: UserRole;
  onAddReport: (rep: Omit<WeeklyReport, 'id'>) => void;
  onUpdateReport?: (id: string, fields: Partial<WeeklyReport>) => void;
  onDeleteReport?: (id: string) => void;
}

type FieldType = 'number' | 'text' | 'textarea';

const cloneSections = (sections: WeeklyReportSection[]) => sections.map(section => ({ ...section }));
const cloneQuestions = (questions: WeeklyReportQuestion[]) => questions.map(question => ({ ...question }));

const isFilled = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value);
  return String(value ?? '').trim().length > 0;
};

const REPORT_URL_PATTERN = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
const REPORT_TRAILING_URL_PUNCTUATION = /[.,!?;:،؛)\]]+$/;

const renderLinkifiedText = (value: unknown): React.ReactNode => {
  const text = String(value ?? '');
  if (!text) return '';

  return text.split(REPORT_URL_PATTERN).map((part, index) => {
    if (!part || !/^(https?:\/\/|www\.)/i.test(part)) {
      return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
    }

    const trailing = part.match(REPORT_TRAILING_URL_PUNCTUATION)?.[0] || '';
    const urlText = trailing ? part.slice(0, -trailing.length) : part;
    const href = /^https?:\/\//i.test(urlText) ? urlText : `https://${urlText}`;

    return (
      <React.Fragment key={`link-${index}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline underline-offset-2 hover:text-blue-900 break-all"
          onClick={event => event.stopPropagation()}
        >
          {urlText}
        </a>
        {trailing}
      </React.Fragment>
    );
  });
};

const createCampaignEntry = (): WeeklyReportCampaignEntry => ({
  id: `campaign-${crypto.randomUUID()}`,
  answers: {}
});

const createOrganicEntry = (): WeeklyReportOrganicEntry => ({
  id: `organic-${crypto.randomUUID()}`,
  answers: {}
});

const FieldTypeButtons: React.FC<{
  value: FieldType;
  onChange: (value: FieldType) => void;
}> = ({ value, onChange }) => {
  const choices: Array<{ value: FieldType; label: string; icon: React.ReactNode }> = [
    { value: 'text', label: 'Text', icon: <Type className="w-3.5 h-3.5" /> },
    { value: 'textarea', label: 'Textarea', icon: <AlignLeft className="w-3.5 h-3.5" /> },
    { value: 'number', label: 'Number', icon: <Hash className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {choices.map(choice => (
        <button
          key={choice.value}
          type="button"
          onClick={() => onChange(choice.value)}
          className={`px-2 py-2 rounded-xl border text-[10px] font-extrabold flex items-center justify-center gap-1 transition cursor-pointer ${
            value === choice.value
              ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
              : 'bg-white text-[#5A5A40] border-[#E5E5E0] hover:border-[#5A5A40]/50'
          }`}
        >
          {choice.icon}
          {choice.label}
        </button>
      ))}
    </div>
  );
};

export const WeeklyReportsTab: React.FC<WeeklyReportsTabProps> = ({
  reports,
  clientId,
  brandName,
  userRole,
  onAddReport,
  onUpdateReport,
  onDeleteReport
}) => {
  const isClient = userRole === 'client';
  const todayStr = formatLocalDate();

  const [templateSections, setTemplateSections] = useSupabaseSetting<WeeklyReportSection[]>(
    'weekly_report_sections_simple_v6',
    null,
    DEFAULT_WEEKLY_REPORT_SECTIONS,
    !isClient
  );
  const [templateQuestions, setTemplateQuestions] = useSupabaseSetting<WeeklyReportQuestion[]>(
    'weekly_report_questions_simple_v6',
    null,
    DEFAULT_WEEKLY_REPORT_QUESTIONS,
    !isClient
  );

  const clientReports = useMemo(
    () => reports
      .filter(report => report.clientId === clientId)
      .sort((a, b) => (b.weekStartDate || '').localeCompare(a.weekStartDate || '')),
    [reports, clientId]
  );

  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [viewingReport, setViewingReport] = useState<WeeklyReport | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const [reportTitle, setReportTitle] = useState('');
  const [weekStartDate, setWeekStartDate] = useState(todayStr);
  const [weekEndDate, setWeekEndDate] = useState('');
  const [formSections, setFormSections] = useState<WeeklyReportSection[]>([]);
  const [formQuestions, setFormQuestions] = useState<WeeklyReportQuestion[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [campaignEntries, setCampaignEntries] = useState<WeeklyReportCampaignEntry[]>([]);
  const [organicEntries, setOrganicEntries] = useState<WeeklyReportOrganicEntry[]>([]);

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionLabel, setEditingQuestionLabel] = useState('');
  const [editingQuestionPlaceholder, setEditingQuestionPlaceholder] = useState('');
  const [editingQuestionType, setEditingQuestionType] = useState<FieldType>('textarea');

  const [addingQuestionSectionId, setAddingQuestionSectionId] = useState<string | null>(null);
  const [newQuestionLabel, setNewQuestionLabel] = useState('');
  const [newQuestionPlaceholder, setNewQuestionPlaceholder] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<FieldType>('textarea');

  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const syncSections = (next: WeeklyReportSection[]) => {
    setFormSections(next);
    if (!editingReport && !isClient) setTemplateSections(cloneSections(next));
  };

  const syncQuestions = (next: WeeklyReportQuestion[]) => {
    setFormQuestions(next);
    if (!editingReport && !isClient) setTemplateQuestions(cloneQuestions(next));
  };

  const resetEditorState = () => {
    setEditingSectionId(null);
    setEditingQuestionId(null);
    setAddingQuestionSectionId(null);
    setEditingSectionTitle('');
    setEditingQuestionLabel('');
    setEditingQuestionPlaceholder('');
    setNewQuestionLabel('');
    setNewQuestionPlaceholder('');
  };

  const isCampaignNextWeekQuestion = (question: WeeklyReportQuestion) =>
    String(question.sectionId) === 'campaigns' && (
      question.standardKey === 'nextWeekActions' ||
      question.label.trim().toLowerCase() === 'next week actions'
    );

  const mergeCurrentCoreSectionsIntoTemplate = (
    sections: WeeklyReportSection[],
    questions: WeeklyReportQuestion[]
  ) => {
    const currentSections = templateSections.length ? templateSections : DEFAULT_WEEKLY_REPORT_SECTIONS;
    const currentQuestions = templateQuestions.length ? templateQuestions : DEFAULT_WEEKLY_REPORT_QUESTIONS;
    const cleanedQuestions = questions.filter(question => !isCampaignNextWeekQuestion(question));

    const requiredSectionIds = ['weekly_summary', 'next_week'];
    let nextSections = cloneSections(sections).filter(
      (section, index, all) => all.findIndex(item => String(item.id) === String(section.id)) === index
    );

    requiredSectionIds.forEach(sectionId => {
      if (nextSections.some(section => String(section.id) === sectionId)) return;
      const source = currentSections.find(section => String(section.id) === sectionId);
      if (source) nextSections.push({ ...source });
    });

    const summaryIndex = nextSections.findIndex(section => String(section.id) === 'weekly_summary');
    const nextWeekIndex = nextSections.findIndex(section => String(section.id) === 'next_week');
    if (summaryIndex >= 0 && nextWeekIndex >= 0 && nextWeekIndex !== summaryIndex + 1) {
      const [nextWeekSection] = nextSections.splice(nextWeekIndex, 1);
      const updatedSummaryIndex = nextSections.findIndex(section => String(section.id) === 'weekly_summary');
      nextSections.splice(updatedSummaryIndex + 1, 0, nextWeekSection);
    }

    const existingQuestionIds = new Set(cleanedQuestions.map(question => question.id));
    const existingStandardKeys = new Set(
      cleanedQuestions.map(question => question.standardKey).filter(Boolean)
    );

    const requiredQuestions = currentQuestions.filter(question =>
      requiredSectionIds.includes(String(question.sectionId))
    );
    const missingRequiredQuestions = requiredQuestions.filter(question =>
      !existingQuestionIds.has(question.id) &&
      (!question.standardKey || !existingStandardKeys.has(question.standardKey))
    );

    return {
      sections: nextSections,
      questions: [...cleanedQuestions, ...cloneQuestions(missingRequiredQuestions)]
    };
  };

  const getEditTemplateForReport = (report: WeeklyReport) => {
    if (report.sectionsSnapshot?.length) {
      return mergeCurrentCoreSectionsIntoTemplate(
        cloneSections(report.sectionsSnapshot),
        cloneQuestions(report.customSectionsQuestions || [])
      );
    }

    const displaySections = getWeeklyReportDisplaySections(report);
    const sections: WeeklyReportSection[] = displaySections.map(section => ({
      id: section.id,
      title: section.title,
      kind: section.kind
    }));

    const questions = report.customSectionsQuestions?.length
      ? cloneQuestions(report.customSectionsQuestions)
      : (report.questionsList || []).map(answer => ({
          id: answer.id,
          sectionId: answer.sectionId || sections[0]?.id || 'overview',
          label: answer.question,
          type: answer.type || 'textarea',
          standardKey: answer.standardKey
        }));

    return mergeCurrentCoreSectionsIntoTemplate(sections, questions);
  };

  const handleOpenAdd = () => {
    const sections = cloneSections(templateSections.length ? templateSections : DEFAULT_WEEKLY_REPORT_SECTIONS);
    const questions = cloneQuestions(templateQuestions.length ? templateQuestions : DEFAULT_WEEKLY_REPORT_QUESTIONS);
    const initialValues: Record<string, string | number> = {};
    questions.forEach(question => {
      const kind = sections.find(section => section.id === question.sectionId)?.kind;
      if (!kind || kind === 'fields') {
        initialValues[question.id] = '';
      }
    });

    setEditingReport(null);
    setReportTitle('');
    setWeekStartDate(todayStr);
    setWeekEndDate('');
    setFormSections(sections);
    setFormQuestions(questions);
    setFormValues(initialValues);
    setCampaignEntries([]);
    setOrganicEntries([]);
    resetEditorState();
    setShowForm(true);
  };

  const handleOpenEdit = (report: WeeklyReport) => {
    const { sections, questions } = getEditTemplateForReport(report);
    const values: Record<string, string | number> = { ...(report.customAnswers || {}) };

    (report.questionsList || []).forEach(answer => {
      values[answer.id] = answer.answer;
      if (answer.standardKey) values[answer.standardKey] = answer.answer;
    });

    const legacyNextWeekQuestions = (report.customSectionsQuestions || []).filter(isCampaignNextWeekQuestion);
    const legacyNextWeekQuestionIds = new Set(legacyNextWeekQuestions.map(question => question.id));
    const migratedActions = (report.campaignEntries || [])
      .map((entry, index) => {
        const action = legacyNextWeekQuestions
          .map(question => entry.answers?.[question.id])
          .find(value => isFilled(value));
        if (!isFilled(action)) return '';
        const name = String(entry.answers?.campaign_name || `Campaign ${index + 1}`);
        return `${name}: ${String(action)}`;
      })
      .filter(Boolean)
      .join('\n');

    const nextWeekQuestion = questions.find(question => question.standardKey === 'nextWeekActions');
    const existingNextWeek = String(
      (nextWeekQuestion ? values[nextWeekQuestion.id] : '') ||
      values.nextWeekActions ||
      report.nextWeekActions ||
      ''
    ).trim();
    const mergedNextWeek = [existingNextWeek, migratedActions]
      .filter(Boolean)
      .filter((value, index, all) => all.indexOf(value) === index)
      .join('\n');

    if (nextWeekQuestion) {
      values[nextWeekQuestion.id] = mergedNextWeek;
      values.nextWeekActions = mergedNextWeek;
    }

    setEditingReport(report);
    setReportTitle(report.title || '');
    setWeekStartDate(report.weekStartDate || todayStr);
    setWeekEndDate(report.weekEndDate || '');
    setFormSections(sections.length ? sections : cloneSections(DEFAULT_WEEKLY_REPORT_SECTIONS));
    setFormQuestions(questions.length ? questions : cloneQuestions(DEFAULT_WEEKLY_REPORT_QUESTIONS));
    setFormValues(values);
    setCampaignEntries((report.campaignEntries || []).map(entry => ({
      ...entry,
      answers: Object.fromEntries(
        Object.entries(entry.answers || {}).filter(([key]) => !legacyNextWeekQuestionIds.has(key))
      )
    })));
    setOrganicEntries((report.organicEntries || []).map(entry => ({
      ...entry,
      answers: { ...(entry.answers || {}) }
    })));
    resetEditorState();
    setShowForm(true);
  };

  const updateFieldValue = (question: WeeklyReportQuestion, value: string | number) => {
    setFormValues(previous => {
      const next = { ...previous, [question.id]: value };
      if (question.standardKey) next[question.standardKey] = value;
      return next;
    });
  };

  const handleStartEditSection = (section: WeeklyReportSection) => {
    setEditingSectionId(String(section.id));
    setEditingSectionTitle(section.title);
  };

  const handleSaveSectionTitle = (sectionId: string) => {
    const title = editingSectionTitle.trim();
    if (!title) return;
    syncSections(formSections.map(section =>
      String(section.id) === sectionId ? { ...section, title } : section
    ));
    setEditingSectionId(null);
    setEditingSectionTitle('');
  };

  const handleDeleteSection = (section: WeeklyReportSection) => {
    if (!window.confirm(`حذف قسم "${section.title}" من نموذج Weekly Reports؟ التقارير المحفوظة القديمة لن تتأثر.`)) return;
    const sectionId = String(section.id);
    syncSections(formSections.filter(item => String(item.id) !== sectionId));
    syncQuestions(formQuestions.filter(question => String(question.sectionId) !== sectionId));
  };

  const handleStartAddQuestion = (section: WeeklyReportSection) => {
    setAddingQuestionSectionId(String(section.id));
    setNewQuestionLabel('');
    setNewQuestionPlaceholder('');
    setNewQuestionType(section.kind === 'campaigns' || section.kind === 'organic' ? 'text' : 'textarea');
  };

  const handleSaveNewQuestion = (sectionId: string) => {
    if (!newQuestionLabel.trim()) return;
    const question: WeeklyReportQuestion = {
      id: `weekly_q_${crypto.randomUUID()}`,
      sectionId,
      label: newQuestionLabel.trim(),
      placeholder: newQuestionPlaceholder.trim() || undefined,
      type: newQuestionType
    };
    syncQuestions([...formQuestions, question]);
    const sectionKind = formSections.find(section => String(section.id) === sectionId)?.kind;
    if (!sectionKind || sectionKind === 'fields') {
      setFormValues(previous => ({ ...previous, [question.id]: '' }));
    }
    setAddingQuestionSectionId(null);
    setNewQuestionLabel('');
    setNewQuestionPlaceholder('');
  };

  const handleStartEditQuestion = (question: WeeklyReportQuestion) => {
    setEditingQuestionId(question.id);
    setEditingQuestionLabel(question.label);
    setEditingQuestionPlaceholder(question.placeholder || '');
    setEditingQuestionType(question.type);
  };

  const handleSaveQuestion = (questionId: string) => {
    if (!editingQuestionLabel.trim()) return;
    syncQuestions(formQuestions.map(question =>
      question.id === questionId
        ? {
            ...question,
            label: editingQuestionLabel.trim(),
            placeholder: editingQuestionPlaceholder.trim() || undefined,
            type: editingQuestionType
          }
        : question
    ));
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (question: WeeklyReportQuestion) => {
    if (!window.confirm(`حذف الحقل "${question.label}" من نموذج Weekly Reports؟ التقارير المحفوظة القديمة لن تتأثر.`)) return;
    syncQuestions(formQuestions.filter(item => item.id !== question.id));
  };

  const updateCampaignAnswer = (entryId: string, questionId: string, value: string | number) => {
    setCampaignEntries(entries => entries.map(entry =>
      entry.id === entryId
        ? { ...entry, answers: { ...entry.answers, [questionId]: value } }
        : entry
    ));
  };

  const updateOrganicAnswer = (entryId: string, questionId: string, value: string | number) => {
    setOrganicEntries(entries => entries.map(entry =>
      entry.id === entryId
        ? { ...entry, answers: { ...entry.answers, [questionId]: value } }
        : entry
    ));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const answers: WeeklyReportQuestionAnswer[] = [];
    formSections.forEach(section => {
      if (section.kind === 'campaigns' || section.kind === 'organic') return;
      formQuestions
        .filter(question => String(question.sectionId) === String(section.id))
        .forEach(question => {
          const raw = formValues[question.id] ?? (question.standardKey ? formValues[question.standardKey] : '') ?? '';
          const answer = question.type === 'number'
            ? (raw === '' ? '' : Number(raw))
            : String(raw);
          answers.push({
            id: question.id,
            sectionId: question.sectionId,
            question: question.label,
            answer,
            type: question.type,
            standardKey: question.standardKey
          });
        });
    });

    const standardValue = (key: string) => {
      const question = formQuestions.find(item => item.standardKey === key);
      if (!question) return '';
      return formValues[question.id] ?? formValues[key] ?? '';
    };

    const reportData: Omit<WeeklyReport, 'id'> = {
      clientId,
      title: reportTitle.trim() || undefined,
      weekStartDate,
      weekEndDate: weekEndDate || undefined,
      clientViewed: editingReport?.clientViewed || false,
      campaignsRunThisWeek: String(standardValue('campaignsRunThisWeek') || '').trim() || undefined,
      totalSpent: standardValue('totalSpent') === '' ? undefined : Number(standardValue('totalSpent')),
      keyLearnings: String(standardValue('keyLearnings') || '').trim() || undefined,
      nextWeekActions: String(standardValue('nextWeekActions') || '').trim() || undefined,
      campaignEntries: campaignEntries.map(entry => ({
        ...entry,
        answers: { ...entry.answers }
      })),
      organicEntries: organicEntries.map(entry => ({
        ...entry,
        answers: { ...entry.answers }
      })),
      sectionsSnapshot: cloneSections(formSections),
      customSectionsQuestions: cloneQuestions(formQuestions),
      questionsList: answers,
      customAnswers: { ...formValues }
    };

    if (editingReport && onUpdateReport) {
      onUpdateReport(editingReport.id, reportData);
    } else {
      onAddReport(reportData);
    }

    setShowForm(false);
    setEditingReport(null);
  };

  const handleExportPDF = async (report: WeeklyReport) => {
    try {
      setExportingId(report.id);
      const { exportWeeklyReportToPDF } = await import('../../utils/pdfExporter');
      await exportWeeklyReportToPDF(report, brandName || '');
    } catch (error) {
      console.error('Error generating weekly report PDF:', error);
    } finally {
      setExportingId(null);
    }
  };

  const handleDatePresetChange = (preset: DateFilterPreset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      const range = getDateRangeFromPreset(preset);
      setStartDateFilter(range.startDate);
      setEndDateFilter(range.endDate);
    }
  };

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return clientReports.filter(report => {
      if (q && !getWeeklyReportSearchText(report).includes(q)) return false;
      if (startDateFilter && report.weekStartDate < startDateFilter) return false;
      if (endDateFilter && report.weekStartDate > endDateFilter) return false;
      return true;
    });
  }, [clientReports, searchQuery, startDateFilter, endDateFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setDatePreset('all');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const renderQuestionEditor = (question: WeeklyReportQuestion) => {
    const editing = editingQuestionId === question.id;
    if (!editing) return null;

    return (
      <div className="mt-2 p-3 bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl space-y-2">
        <input
          type="text"
          value={editingQuestionLabel}
          onChange={event => setEditingQuestionLabel(event.target.value)}
          className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#5A5A40]"
          placeholder="Field title"
        />
        <FieldTypeButtons value={editingQuestionType} onChange={setEditingQuestionType} />
        <input
          type="text"
          value={editingQuestionPlaceholder}
          onChange={event => setEditingQuestionPlaceholder(event.target.value)}
          className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#5A5A40]"
          placeholder="Placeholder (optional)"
        />
        <div className="flex gap-2">
          <button type="button" onClick={() => handleSaveQuestion(question.id)} className="px-3 py-1.5 bg-[#5A5A40] text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer">
            <Check className="w-3 h-3" /> حفظ
          </button>
          <button type="button" onClick={() => setEditingQuestionId(null)} className="px-3 py-1.5 bg-white border border-[#E5E5E0] rounded-lg text-[10px] font-bold cursor-pointer">
            إلغاء
          </button>
        </div>
      </div>
    );
  };

  const renderFieldInput = (question: WeeklyReportQuestion) => {
    const value = formValues[question.id] ?? '';
    const commonClass = 'w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2A] outline-none focus:border-[#5A5A40]';

    if (question.type === 'textarea') {
      return (
        <textarea
          rows={question.standardKey === 'keyLearnings' || question.standardKey === 'nextWeekActions' ? 6 : 4}
          value={String(value)}
          onChange={event => updateFieldValue(question, event.target.value)}
          placeholder={question.placeholder}
          className={`${commonClass} resize-y leading-relaxed`}
        />
      );
    }

    return (
      <input
        type={question.type === 'number' ? 'number' : 'text'}
        step={question.type === 'number' ? '0.01' : undefined}
        value={value}
        onChange={event => updateFieldValue(
          question,
          question.type === 'number'
            ? (event.target.value === '' ? '' : Number(event.target.value))
            : event.target.value
        )}
        placeholder={question.placeholder}
        className={commonClass}
      />
    );
  };

  const renderCampaignField = (
    entry: WeeklyReportCampaignEntry,
    question: WeeklyReportQuestion
  ) => {
    const value = entry.answers?.[question.id] ?? '';
    const commonClass = 'w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-[11px] text-[#2D2D2A] outline-none focus:border-[#5A5A40]';

    if (question.type === 'textarea') {
      return (
        <textarea
          rows={2}
          value={String(value)}
          onChange={event => updateCampaignAnswer(entry.id, question.id, event.target.value)}
          placeholder={question.placeholder}
          className={`${commonClass} resize-y`}
        />
      );
    }

    return (
      <input
        type={question.type === 'number' ? 'number' : 'text'}
        step={question.type === 'number' ? '0.01' : undefined}
        value={value}
        onChange={event => updateCampaignAnswer(
          entry.id,
          question.id,
          question.type === 'number'
            ? (event.target.value === '' ? '' : Number(event.target.value))
            : event.target.value
        )}
        placeholder={question.placeholder}
        className={commonClass}
      />
    );
  };

  const renderOrganicField = (
    entry: WeeklyReportOrganicEntry,
    question: WeeklyReportQuestion
  ) => {
    const value = entry.answers?.[question.id] ?? '';
    const commonClass = 'w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-[11px] text-[#2D2D2A] outline-none focus:border-[#5A5A40]';

    if (question.type === 'textarea') {
      return (
        <textarea
          rows={2}
          value={String(value)}
          onChange={event => updateOrganicAnswer(entry.id, question.id, event.target.value)}
          placeholder={question.placeholder}
          className={`${commonClass} resize-y`}
        />
      );
    }

    return (
      <input
        type={question.type === 'number' ? 'number' : 'text'}
        step={question.type === 'number' ? '0.01' : undefined}
        value={value}
        onChange={event => updateOrganicAnswer(
          entry.id,
          question.id,
          question.type === 'number'
            ? (event.target.value === '' ? '' : Number(event.target.value))
            : event.target.value
        )}
        placeholder={question.placeholder}
        className={commonClass}
      />
    );
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-[#2D2D2A] flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#5A5A40]" />
            <span>Weekly Reports</span>
          </h2>
          <p className="text-xs text-[#78786E] mt-1">
            تقرير أسبوعي مختصر لأداء الحملات المدفوعة والمحتوى العضوي مع ملخص عام للأسبوع.
          </p>
        </div>

        {!isClient && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            تقرير أسبوعي جديد
          </button>
        )}
      </div>

      <ReportFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="بحث في التقارير الأسبوعية..."
        datePreset={datePreset}
        onDatePresetChange={handleDatePresetChange}
        startDate={startDateFilter}
        onStartDateChange={setStartDateFilter}
        endDate={endDateFilter}
        onEndDateChange={setEndDateFilter}
        totalCount={clientReports.length}
        filteredCount={filteredReports.length}
        onClearFilters={clearFilters}
      />

      {filteredReports.length === 0 ? (
        <div className="bg-white border border-[#E5E5E0] rounded-3xl p-10 text-center text-[#78786E] text-xs">
          لا توجد تقارير أسبوعية مطابقة حاليا.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {filteredReports.map(report => {
            const sections = getWeeklyReportDisplaySections(report);
            const filledFields = sections.reduce(
              (sum, section) => sum + section.fields.length + section.campaignEntries.length + section.organicEntries.length,
              0
            );
            return (
              <div key={report.id} className="bg-white border border-[#E5E5E0] rounded-2xl p-4 shadow-2xs hover:border-[#5A5A40]/40 transition space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-[#2D2D2A] text-sm truncate">
                      {report.title || 'Weekly Report'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#78786E] mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{report.weekStartDate}{report.weekEndDate ? ` → ${report.weekEndDate}` : ''}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#5A5A40] bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2 py-1 shrink-0">
                    {filledFields} items
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E5E0]">
                  <button type="button" onClick={() => setViewingReport(report)} className="px-3 py-2 bg-[#5A5A40]/10 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition">
                    <Eye className="w-3.5 h-3.5" /> عرض
                  </button>
                  <button type="button" onClick={() => handleExportPDF(report)} disabled={exportingId === report.id} className="px-3 py-2 bg-white border border-[#E5E5E0] hover:bg-[#F9F8F6] text-[#2D2D2A] rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                    {exportingId === report.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    PDF
                  </button>
                  {!isClient && (
                    <>
                      <button type="button" onClick={() => handleOpenEdit(report)} className="px-3 py-2 bg-white border border-[#E5E5E0] hover:bg-[#F9F8F6] text-[#2D2D2A] rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" /> تعديل
                      </button>
                      <button type="button" onClick={() => setDeletingReportId(report.id)} className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> حذف
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 overflow-y-auto p-3 sm:p-5">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-5xl mx-auto my-2 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-20 bg-[#F9F8F6] border-b border-[#E5E5E0] p-4 sm:p-5 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#5A5A40] uppercase tracking-wide">
                  {editingReport ? 'Edit Weekly Report' : 'New Weekly Report'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#2D2D2A] mt-0.5">
                  {brandName || 'Brand'}
                </h3>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-[#E5E5E0] text-[#78786E] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
              <section className="space-y-3">
                <div>
                  <h4 className="font-extrabold text-[#2D2D2A] text-sm">Weekly Report</h4>
                  <p className="text-[11px] text-[#78786E]">Report info</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5A5A40] mb-1">Report Title (optional)</label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={event => setReportTitle(event.target.value)}
                      placeholder="مثال: Launch Week / Week 1"
                      className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#5A5A40]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5A5A40] mb-1">Week Start Date *</label>
                    <input
                      type="date"
                      value={weekStartDate}
                      onChange={event => setWeekStartDate(event.target.value)}
                      required
                      className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#5A5A40]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5A5A40] mb-1">Week End Date</label>
                    <input
                      type="date"
                      value={weekEndDate}
                      onChange={event => setWeekEndDate(event.target.value)}
                      className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#5A5A40]"
                    />
                  </div>
                </div>
              </section>

              {formSections.map(section => {
                const sectionId = String(section.id);
                const sectionQuestions = formQuestions.filter(question => String(question.sectionId) === sectionId);
                const editingSection = editingSectionId === sectionId;

                return (
                  <section key={sectionId} className="border-t border-[#E5E5E0] pt-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {editingSection ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingSectionTitle}
                              onChange={event => setEditingSectionTitle(event.target.value)}
                              className="flex-1 bg-white border border-[#5A5A40]/40 rounded-xl px-3 py-2 text-sm font-extrabold outline-none"
                            />
                            <button type="button" onClick={() => handleSaveSectionTitle(sectionId)} className="p-2 bg-[#5A5A40] text-white rounded-xl cursor-pointer">
                              <Check className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => setEditingSectionId(null)} className="p-2 bg-white border border-[#E5E5E0] rounded-xl cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-[#2D2D2A]">{renderLinkifiedText(section.title)}</h4>
                            {section.kind === 'campaigns' && (
                              <span className="text-[10px] font-extrabold text-[#5A5A40] bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2 py-0.5">
                                {campaignEntries.length} Campaigns
                              </span>
                            )}
                            {section.kind === 'organic' && (
                              <span className="text-[10px] font-extrabold text-[#5A5A40] bg-[#F9F8F6] border border-[#E5E5E0] rounded-lg px-2 py-0.5">
                                {organicEntries.length} Platforms
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!isClient && !editingSection && (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => handleStartEditSection(section)} title="تعديل عنوان القسم" className="p-1.5 text-[#78786E] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-lg cursor-pointer">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => handleDeleteSection(section)} title="حذف القسم" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {section.kind === 'campaigns' ? (
                      <div className="space-y-3">
                        <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold text-[#78786E]">Campaign fields</span>
                            {!isClient && (
                              <button type="button" onClick={() => handleStartAddQuestion(section)} className="text-[10px] font-extrabold text-[#5A5A40] flex items-center gap-1 cursor-pointer">
                                <Plus className="w-3 h-3" /> Add Field
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {sectionQuestions.map(question => (
                              <div key={question.id} className="inline-flex items-center gap-1 bg-white border border-[#E5E5E0] rounded-lg px-2 py-1">
                                <span className="text-[10px] font-bold text-[#2D2D2A]">{question.label}</span>
                                {!isClient && (
                                  <>
                                    <button type="button" onClick={() => handleStartEditQuestion(question)} className="text-[#78786E] hover:text-[#2D2D2A] cursor-pointer"><Edit2 className="w-3 h-3" /></button>
                                    <button type="button" onClick={() => handleDeleteQuestion(question)} className="text-rose-600 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          {sectionQuestions.map(question => (
                            <React.Fragment key={`editor-${question.id}`}>
                              {renderQuestionEditor(question)}
                            </React.Fragment>
                          ))}
                        </div>

                        {campaignEntries.map((entry, index) => (
                          <div key={entry.id} className="bg-white border border-[#E5E5E0] rounded-2xl p-3.5 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-extrabold text-[#5A5A40] flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" /> Campaign {index + 1}
                              </span>
                              {!isClient && (
                                <button type="button" onClick={() => setCampaignEntries(entries => entries.filter(item => item.id !== entry.id))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {sectionQuestions.map(question => (
                                <div key={question.id} className={question.type === 'textarea' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                                  <label className="block text-[10px] font-bold text-[#78786E] mb-1">{question.label}</label>
                                  {renderCampaignField(entry, question)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {!isClient && (
                          <button type="button" onClick={() => setCampaignEntries(entries => [...entries, createCampaignEntry()])} className="w-full py-2.5 border border-dashed border-[#5A5A40]/40 hover:border-[#5A5A40] bg-[#F9F8F6] text-[#5A5A40] rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> Add Campaign
                          </button>
                        )}
                      </div>
                    ) : section.kind === 'organic' ? (
                      <div className="space-y-3">
                        <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold text-[#78786E]">Platform fields</span>
                            {!isClient && (
                              <button type="button" onClick={() => handleStartAddQuestion(section)} className="text-[10px] font-extrabold text-[#5A5A40] flex items-center gap-1 cursor-pointer">
                                <Plus className="w-3 h-3" /> Add Field
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {sectionQuestions.map(question => (
                              <div key={question.id} className="inline-flex items-center gap-1 bg-white border border-[#E5E5E0] rounded-lg px-2 py-1">
                                <span className="text-[10px] font-bold text-[#2D2D2A]">{question.label}</span>
                                {!isClient && (
                                  <>
                                    <button type="button" onClick={() => handleStartEditQuestion(question)} className="text-[#78786E] hover:text-[#2D2D2A] cursor-pointer"><Edit2 className="w-3 h-3" /></button>
                                    <button type="button" onClick={() => handleDeleteQuestion(question)} className="text-rose-600 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          {sectionQuestions.map(question => (
                            <React.Fragment key={`editor-${question.id}`}>
                              {renderQuestionEditor(question)}
                            </React.Fragment>
                          ))}
                        </div>

                        {organicEntries.map((entry, index) => (
                          <div key={entry.id} className="bg-white border border-[#E5E5E0] rounded-2xl p-3.5 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-extrabold text-[#5A5A40] flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" /> Platform {index + 1}
                              </span>
                              {!isClient && (
                                <button type="button" onClick={() => setOrganicEntries(entries => entries.filter(item => item.id !== entry.id))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {sectionQuestions.map(question => (
                                <div key={question.id} className={question.type === 'textarea' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                                  <label className="block text-[10px] font-bold text-[#78786E] mb-1">{question.label}</label>
                                  {renderOrganicField(entry, question)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {!isClient && (
                          <button type="button" onClick={() => setOrganicEntries(entries => [...entries, createOrganicEntry()])} className="w-full py-2.5 border border-dashed border-[#5A5A40]/40 hover:border-[#5A5A40] bg-[#F9F8F6] text-[#5A5A40] rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> Add Platform
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sectionQuestions.map(question => (
                          <div key={question.id} className={question.type === 'textarea' ? 'sm:col-span-2' : ''}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <label className="text-[11px] font-extrabold text-[#2D2D2A]">{question.label}</label>
                              {!isClient && (
                                <div className="flex items-center gap-1">
                                  <button type="button" onClick={() => handleStartEditQuestion(question)} title="تعديل الحقل" className="p-1 text-[#78786E] hover:text-[#2D2D2A] rounded cursor-pointer"><Edit2 className="w-3 h-3" /></button>
                                  <button type="button" onClick={() => handleDeleteQuestion(question)} title="حذف الحقل" className="p-1 text-rose-600 rounded cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              )}
                            </div>
                            {renderQuestionEditor(question)}
                            {editingQuestionId !== question.id && renderFieldInput(question)}
                          </div>
                        ))}
                      </div>
                    )}

                    {addingQuestionSectionId === sectionId && (
                      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3 space-y-2">
                        <input
                          type="text"
                          value={newQuestionLabel}
                          onChange={event => setNewQuestionLabel(event.target.value)}
                          placeholder="New field title"
                          className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#5A5A40]"
                        />
                        <FieldTypeButtons value={newQuestionType} onChange={setNewQuestionType} />
                        <input
                          type="text"
                          value={newQuestionPlaceholder}
                          onChange={event => setNewQuestionPlaceholder(event.target.value)}
                          placeholder="Placeholder (optional)"
                          className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#5A5A40]"
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleSaveNewQuestion(sectionId)} className="px-3 py-1.5 bg-[#5A5A40] text-white rounded-lg text-[10px] font-extrabold cursor-pointer">Add Field</button>
                          <button type="button" onClick={() => setAddingQuestionSectionId(null)} className="px-3 py-1.5 bg-white border border-[#E5E5E0] rounded-lg text-[10px] font-bold cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    )}

                    {!isClient && section.kind !== 'campaigns' && section.kind !== 'organic' && addingQuestionSectionId !== sectionId && (
                      <button type="button" onClick={() => handleStartAddQuestion(section)} className="text-[10px] font-extrabold text-[#5A5A40] flex items-center gap-1 cursor-pointer">
                        <Plus className="w-3 h-3" /> Add Field
                      </button>
                    )}
                  </section>
                );
              })}

              <div className="pt-5 border-t border-[#E5E5E0] flex flex-col sm:flex-row gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-white border border-[#E5E5E0] text-[#2D2D2A] rounded-xl text-xs font-extrabold cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                  <Save className="w-4 h-4" />
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingReport && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 overflow-y-auto p-3 sm:p-5">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-4xl mx-auto my-2 shadow-2xl overflow-hidden">
            <div className="bg-[#F9F8F6] border-b border-[#E5E5E0] p-4 sm:p-5 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#5A5A40] uppercase">Weekly Report</span>
                <h3 className="text-lg font-black text-[#2D2D2A] mt-1">
                  {renderLinkifiedText(viewingReport.title || brandName || 'Weekly Report')}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-[#78786E] mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{viewingReport.weekStartDate}{viewingReport.weekEndDate ? ` → ${viewingReport.weekEndDate}` : ''}</span>
                </div>
              </div>
              <button type="button" onClick={() => setViewingReport(null)} className="p-2 rounded-xl hover:bg-[#E5E5E0] text-[#78786E] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              {getWeeklyReportDisplaySections(viewingReport).map(section => (
                <section key={section.id} className="border-t first:border-t-0 border-[#E5E5E0] first:pt-0 pt-4 space-y-3">
                  <h4 className="text-sm font-black text-[#2D2D2A]">{section.title}</h4>

                  {section.fields.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {section.fields.map(field => (
                        <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl p-3">
                            <span className="text-[10px] font-extrabold text-[#78786E] block mb-1">{renderLinkifiedText(field.question)}</span>
                            <p className="text-xs text-[#2D2D2A] font-medium leading-relaxed whitespace-pre-wrap break-words">
                              {field.type === 'number' && field.standardKey === 'totalSpent'
                                ? `${Number(field.answer).toLocaleString()} EGP`
                                : renderLinkifiedText(field.answer)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.campaignEntries.length > 0 && (
                    <div className="space-y-2.5">
                      {section.campaignEntries.map((entry, index) => (
                        <div key={entry.id} className="border border-[#E5E5E0] rounded-xl p-3">
                          <span className="text-[10px] font-extrabold text-[#5A5A40] block mb-2">Campaign {index + 1}</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {section.campaignFields
                              .filter(field => isFilled(entry.answers?.[field.id]))
                              .map(field => (
                                <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                                  <span className="text-[9px] font-bold text-[#8E8E85] block">{renderLinkifiedText(field.label)}</span>
                                  <p className="text-[11px] font-semibold text-[#2D2D2A] whitespace-pre-wrap break-words">
                                    {field.type === 'number'
                                      ? Number(entry.answers[field.id]).toLocaleString()
                                      : renderLinkifiedText(entry.answers[field.id])}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.organicEntries.length > 0 && (
                    <div className="space-y-2.5">
                      {section.organicEntries.map((entry, index) => (
                        <div key={entry.id} className="border border-[#E5E5E0] rounded-xl p-3">
                          <span className="text-[10px] font-extrabold text-[#5A5A40] block mb-2">Platform {index + 1}</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {section.organicFields
                              .filter(field => isFilled(entry.answers?.[field.id]))
                              .map(field => (
                                <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                                  <span className="text-[9px] font-bold text-[#8E8E85] block">{renderLinkifiedText(field.label)}</span>
                                  <p className="text-[11px] font-semibold text-[#2D2D2A] whitespace-pre-wrap break-words">
                                    {field.type === 'number'
                                      ? Number(entry.answers[field.id]).toLocaleString()
                                      : renderLinkifiedText(entry.answers[field.id])}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}

              {getWeeklyReportDisplaySections(viewingReport).length === 0 && (
                <div className="text-center py-10 text-xs text-[#78786E]">لا توجد بيانات مدخلة في هذا التقرير.</div>
              )}
            </div>

            <div className="bg-[#F9F8F6] border-t border-[#E5E5E0] p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex gap-2">
                <button type="button" onClick={() => handleExportPDF(viewingReport)} disabled={exportingId === viewingReport.id} className="px-4 py-2.5 bg-[#5A5A40] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  {exportingId === viewingReport.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PDF
                </button>
                {!isClient && onUpdateReport && (
                  <button
                    type="button"
                    onClick={() => onUpdateReport(viewingReport.id, { clientViewed: !viewingReport.clientViewed })}
                    className={`px-3 py-2.5 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer ${
                      viewingReport.clientViewed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-white border-[#E5E5E0] text-[#5A5A40]'
                    }`}
                  >
                    {viewingReport.clientViewed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {viewingReport.clientViewed ? 'Client Viewed' : 'Mark Viewed'}
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {!isClient && (
                  <button type="button" onClick={() => { const report = viewingReport; setViewingReport(null); handleOpenEdit(report); }} className="px-4 py-2.5 bg-white border border-[#E5E5E0] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
                <button type="button" onClick={() => setViewingReport(null)} className="px-4 py-2.5 bg-white border border-[#E5E5E0] rounded-xl text-xs font-extrabold cursor-pointer">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingReportId && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-[70] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <h3 className="font-extrabold text-[#2D2D2A]">حذف التقرير الأسبوعي؟</h3>
            </div>
            <p className="text-xs text-[#78786E]">سيتم حذف التقرير نفسه فقط. هذا الإجراء لا يغير تمبلت Weekly Reports.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingReportId(null)} className="px-4 py-2 bg-white border border-[#E5E5E0] rounded-xl text-xs font-bold cursor-pointer">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  if (deletingReportId && onDeleteReport) onDeleteReport(deletingReportId);
                  setDeletingReportId(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-extrabold cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
