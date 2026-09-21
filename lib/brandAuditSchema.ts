import { AuditCheckItem, BrandAudit, BuiltInBrandAuditSectionSetting, CustomBrandAuditSection } from '../types';

export interface BrandAuditSchema {
  builtInSectionSettings?: Record<string, BuiltInBrandAuditSectionSetting>;
  overviewFieldLabels?: Record<string, string>;
  sectionOrder?: string[];
  customSections?: Array<Pick<CustomBrandAuditSection, 'id' | 'title' | 'itemsTitle' | 'items'>>;
  checklists?: Record<string, AuditCheckItem[]>;
}

const cloneChecklistStructure = (items: AuditCheckItem[] = []): AuditCheckItem[] =>
  items.map(item => ({
    id: item.id,
    label: item.label,
    status: '',
    notes: undefined
  }));

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
  checklists: collectChecklistSchema(audit)
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

  Object.entries(schema.checklists || {}).forEach(([path, schemaItems]) => {
    const currentItems = getPath(audit, path);
    setPath(
      next as unknown as Record<string, unknown>,
      path,
      mergeChecklistAnswers(
        schemaItems,
        Array.isArray(currentItems) ? currentItems as AuditCheckItem[] : []
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
