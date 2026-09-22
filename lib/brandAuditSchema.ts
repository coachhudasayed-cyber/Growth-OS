import { AuditCheckItem, BrandAudit, BuiltInBrandAuditSectionSetting, CustomBrandAuditSection } from '../types';

export interface BrandAuditSchema {
  builtInSectionSettings?: Record<string, BuiltInBrandAuditSectionSetting>;
  overviewFieldLabels?: Record<string, string>;
  sectionOrder?: string[];
  customSections?: Array<Pick<CustomBrandAuditSection, 'id' | 'title' | 'itemsTitle' | 'items'>>;
  checklists?: Record<string, AuditCheckItem[]>;
  unitEconomicsSections?: Record<string, AuditCheckItem[]>;
  competitorAnalysisTemplate?: Record<string, AuditCheckItem[]>;
}

const cloneChecklistStructure = (items: AuditCheckItem[] = []): AuditCheckItem[] =>
  items.map(item => ({
    id: item.id,
    label: item.label,
    status: '',
    notes: undefined
  }));

const cloneSectionStructure = (sections?: Record<string, AuditCheckItem[]>): Record<string, AuditCheckItem[]> | undefined => {
  if (!sections) return undefined;
  return Object.fromEntries(
    Object.entries(sections).map(([key, items]) => [key, cloneChecklistStructure(items || [])])
  );
};

const deriveUnitEconomicsSections = (audit: BrandAudit): Record<string, AuditCheckItem[]> | undefined => {
  if (audit.unitEconomics?.sectionChecklists) {
    return audit.unitEconomics.sectionChecklists;
  }
  const items = audit.unitEconomics?.checklist || [];
  if (items.length === 0) return undefined;
  const groups: Record<string, AuditCheckItem[]> = {};
  items.forEach(item => {
    const match = item.id.match(/^ue-([^-]+)-/);
    const key = match?.[1] || 'other';
    groups[key] = [...(groups[key] || []), item];
  });
  return groups;
};

const collectChecklistSchema = (
  value: unknown,
  path: string[] = [],
  result: Record<string, AuditCheckItem[]> = {}
): Record<string, AuditCheckItem[]> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;

  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    const nextPath = [...path, key];
    if (Array.isArray(child) && key.toLowerCase().includes('checklist')) {
      result[nextPath.join('.')] = cloneChecklistStructure(child as AuditCheckItem[]);
      return;
    }
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      collectChecklistSchema(child, nextPath, result);
    }
  });

  return result;
};

const getPath = (value: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined;
    return (current as Record<string, unknown>)[key];
  }, value);

const setPath = (value: Record<string, unknown>, path: string, nextValue: unknown) => {
  const parts = path.split('.');
  let cursor = value;
  parts.forEach((key, index) => {
    if (index === parts.length - 1) {
      cursor[key] = nextValue;
      return;
    }
    const existing = cursor[key];
    if (!existing || typeof existing !== 'object' || Array.isArray(existing)) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  });
};

const mergeChecklistAnswers = (
  schemaItems: AuditCheckItem[] = [],
  currentItems: AuditCheckItem[] = []
): AuditCheckItem[] => {
  const answers = new Map(currentItems.map(item => [item.id, item]));
  return schemaItems.map(item => {
    const current = answers.get(item.id);
    return {
      ...item,
      status: current?.status ?? '',
      notes: current?.notes
    };
  });
};


const getLegacyPersonaChecklistAnswers = (audit: BrandAudit, path: string): AuditCheckItem[] => {
  const persona = audit.customerPersona;
  if (!persona) return [];

  if (path === 'customerPersona.targetAudienceChecklist') {
    return [
      { id: 'persona-ta-age', label: 'الفئة العمرية', status: persona.targetAudienceDetails?.ageRange || '' },
      { id: 'persona-ta-gender', label: 'الجنس', status: persona.targetAudienceDetails?.gender || '' },
      { id: 'persona-ta-income', label: 'المستوى المادي', status: persona.targetAudienceDetails?.incomeLevel || '' },
      { id: 'persona-ta-interests', label: 'الاهتمامات', status: persona.targetAudienceDetails?.interests || '' },
      { id: 'persona-ta-lifestyle', label: 'أسلوب الحياة', status: persona.targetAudienceDetails?.lifestyle || '' },
      { id: 'persona-ta-location', label: 'مكان الإقامة', status: persona.targetAudienceDetails?.location || '' }
    ];
  }

  if (path === 'customerPersona.insightsChecklist') {
    return [
      { id: 'persona-insight-pain-points', label: 'Pain Points | المشاكل التي يعاني منها العميل ويحلها المنتج', status: persona.insights?.painPoints || '' },
      { id: 'persona-insight-motivation', label: 'Buying Motivation | لماذا قد يشتري هذا المنتج؟', status: persona.insights?.buyingMotivation || '' },
      { id: 'persona-insight-triggers', label: 'Buying Triggers | ما الذي يدفعه لاتخاذ قرار الشراء بسرعة؟', status: persona.insights?.buyingTriggers || '' },
      { id: 'persona-insight-objections', label: 'Objections | ما الاعتراضات أو المخاوف التي تمنعه من الشراء؟', status: persona.insights?.objections || '' }
    ];
  }

  if (path === 'customerPersona.positioningChecklist') {
    return [
      { id: 'persona-pos-core-value', label: 'القيمة الأساسية التي يقدمها البراند', status: persona.positioning?.coreValue || '' },
      { id: 'persona-pos-usp', label: 'الميزة التنافسية (USP)', status: persona.positioning?.usp || '' },
      { id: 'persona-pos-core-message', label: 'الرسالة الأساسية للبراند', status: persona.positioning?.coreMessage || '' },
      { id: 'persona-pos-first-impression', label: 'الانطباع الأول', status: persona.positioning?.firstImpression || '' },
      { id: 'persona-pos-market-tier', label: 'مكانة البراند في السوق (اقتصادي - متوسط - Premium)', status: persona.positioning?.marketTier || '' },
      { id: 'persona-pos-identity-clarity', label: 'مدى وضوح الهوية', status: persona.positioning?.identityClarity || '' },
      { id: 'persona-pos-growth-readiness', label: 'تقييم جاهزية البراند للنمو', status: persona.positioning?.growthReadiness || '' }
    ];
  }

  return [];
};

export const extractBrandAuditSchema = (audit: BrandAudit): BrandAuditSchema => ({
  builtInSectionSettings: audit.builtInSectionSettings
    ? JSON.parse(JSON.stringify(audit.builtInSectionSettings))
    : undefined,
  overviewFieldLabels: audit.overviewFieldLabels
    ? { ...audit.overviewFieldLabels }
    : undefined,
  sectionOrder: audit.sectionOrder ? [...audit.sectionOrder] : undefined,
  customSections: (audit.customSections || []).map(section => ({
    id: section.id,
    title: section.title,
    itemsTitle: section.itemsTitle,
    items: cloneChecklistStructure(section.items || [])
  })),
  checklists: collectChecklistSchema(audit),
  unitEconomicsSections: cloneSectionStructure(deriveUnitEconomicsSections(audit)),
  competitorAnalysisTemplate: cloneSectionStructure(audit.competitorAnalysisTemplate)
});

export const applyBrandAuditSchema = (
  schema: BrandAuditSchema | null | undefined,
  audit: BrandAudit
): BrandAudit => {
  if (!schema) return audit;

  const next = JSON.parse(JSON.stringify(audit)) as BrandAudit;

  next.builtInSectionSettings = schema.builtInSectionSettings
    ? JSON.parse(JSON.stringify(schema.builtInSectionSettings))
    : undefined;
  next.overviewFieldLabels = schema.overviewFieldLabels
    ? { ...schema.overviewFieldLabels }
    : undefined;
  next.sectionOrder = schema.sectionOrder ? [...schema.sectionOrder] : undefined;

  const existingCustomSections = new Map(
    (audit.customSections || []).map(section => [section.id, section])
  );
  next.customSections = (schema.customSections || []).map(section => {
    const current = existingCustomSections.get(section.id);
    return {
      id: section.id,
      title: section.title,
      itemsTitle: section.itemsTitle,
      auditDate: current?.auditDate || '',
      items: mergeChecklistAnswers(section.items || [], current?.items || [])
    };
  });

  if (schema.unitEconomicsSections) {
    const currentSections = audit.unitEconomics?.sectionChecklists || deriveUnitEconomicsSections(audit) || {};
    const mergedSections = Object.fromEntries(
      Object.entries(schema.unitEconomicsSections).map(([key, schemaItems]) => [
        key,
        mergeChecklistAnswers(schemaItems || [], currentSections[key] || [])
      ])
    );
    next.unitEconomics = {
      ...next.unitEconomics,
      sectionChecklists: mergedSections,
      checklist: Object.values(mergedSections).flat()
    };
  }

  if (schema.competitorAnalysisTemplate) {
    next.competitorAnalysisTemplate = cloneSectionStructure(schema.competitorAnalysisTemplate);
  }

  Object.entries(schema.checklists || {}).forEach(([path, schemaItems]) => {
    const currentItems = getPath(audit, path);
    const hasExplicitChecklist = Array.isArray(currentItems);
    const existingItems = hasExplicitChecklist ? currentItems as AuditCheckItem[] : [];
    const legacyPersonaItems = getLegacyPersonaChecklistAnswers(audit, path);
    setPath(
      next as unknown as Record<string, unknown>,
      path,
      mergeChecklistAnswers(
        schemaItems,
        hasExplicitChecklist ? existingItems : legacyPersonaItems
      )
    );
  });

  return next;
};

export const createBlankBrandAuditFromSchema = (
  clientId: string,
  schema: BrandAuditSchema | null | undefined
): BrandAudit => applyBrandAuditSchema(schema, {
  clientId,
  score: 0,
  auditDate: '',
  swot: {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  },
  socialLinks: {},
  notes: ''
});
