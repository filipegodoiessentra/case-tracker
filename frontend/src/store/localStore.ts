// "Banco de dados" do app: tudo roda no navegador.
// Estado em memória, inicializado a partir de src/data/mockData.ts e persistido
// em localStorage a cada alteração — não depende de nenhum servidor/backend.
import * as seed from '../data/mockData';
import type {
  Attachment,
  Case,
  CaseFolderLink,
  CaseRelation,
  EmailLink,
  ExportDocument,
  KnowledgeArticle,
  LessonLearned,
  LinkedFile,
  ProcessDoc,
  TimelineEntry,
} from '../types/domain';

const STORAGE_KEY = 'case-tracker:data:v1';

interface StoreState {
  cases: Case[];
  timeline: TimelineEntry[];
  attachments: Attachment[];
  emailLinks: EmailLink[];
  lessonsLearned: LessonLearned[];
  caseRelations: CaseRelation[];
  knowledgeArticles: KnowledgeArticle[];
  processes: ProcessDoc[];
  linkedFiles: LinkedFile[];
  caseFolderLinks: CaseFolderLink[];
  exportDocuments: ExportDocument[];
}

function seedState(): StoreState {
  return {
    cases: seed.cases.map((c) => ({ ...c, tags: [...c.tags] })),
    timeline: [...seed.timeline],
    attachments: [...seed.attachments],
    emailLinks: [...seed.emailLinks],
    lessonsLearned: [...seed.lessonsLearned],
    caseRelations: [...seed.caseRelations],
    knowledgeArticles: seed.knowledgeArticles.map((a) => ({ ...a, tags: [...a.tags] })),
    processes: [...seed.processes],
    linkedFiles: [],
    caseFolderLinks: [],
    exportDocuments: [],
  };
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seedState(), ...(JSON.parse(raw) as StoreState) };
  } catch {
    // localStorage indisponível ou dados corrompidos — cai para os dados demo.
  }
  return seedState();
}

let state = loadState();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Armazenamento cheio (ex.: anexos grandes) — a sessão continua funcionando em memória.
  }
}

function nextCaseNumber() {
  const max = state.cases.reduce((acc, c) => {
    const n = Number(c.caseNumber.replace('CASE-', ''));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 10000);
  return `CASE-${max + 1}`;
}

export const localStore = {
  // ---- Backup / reset ----
  exportSnapshot: () => JSON.stringify(state, null, 2),
  importSnapshot: (json: string) => {
    state = JSON.parse(json) as StoreState;
    persist();
  },
  resetToDemoData: () => {
    state = seedState();
    persist();
  },

  // ---- Cases ----
  listCases: (
    filters: { status?: string; type?: string; priority?: string; country?: string; owner?: string; q?: string } = {},
  ) => {
    let results = state.cases;
    if (filters.status) results = results.filter((c) => c.status === filters.status);
    if (filters.type) results = results.filter((c) => c.type === filters.type);
    if (filters.priority) results = results.filter((c) => c.priority === filters.priority);
    if (filters.country) results = results.filter((c) => c.country === filters.country);
    if (filters.owner) results = results.filter((c) => c.ownerName === filters.owner);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q) ||
          (c.customerName ?? '').toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return [...results];
  },
  getCase: (id: string) => state.cases.find((c) => c.id === id) ?? null,
  createCase: (data: Partial<Case>) => {
    const now = new Date().toISOString();
    const created: Case = {
      id: crypto.randomUUID(),
      caseNumber: nextCaseNumber(),
      title: data.title ?? 'Novo caso',
      type: data.type ?? 'OTHER',
      status: data.status ?? 'NEW',
      priority: data.priority ?? 'MEDIUM',
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now,
      ...data,
    } as Case;
    state.cases.unshift(created);
    state.timeline.unshift({ id: crypto.randomUUID(), caseId: created.id, note: 'Caso criado.', statusChange: created.status, createdAt: now });
    persist();
    return created;
  },
  updateCase: (id: string, data: Partial<Case>) => {
    const idx = state.cases.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const before = state.cases[idx];
    const updated = { ...before, ...data, updatedAt: new Date().toISOString() };
    state.cases[idx] = updated;
    if (data.status && data.status !== before.status) {
      state.timeline.unshift({
        id: crypto.randomUUID(),
        caseId: id,
        note: `Status alterado de ${before.status} para ${data.status}.`,
        statusChange: data.status,
        createdAt: new Date().toISOString(),
      });
    }
    persist();
    return updated;
  },
  deleteCase: (id: string) => {
    const idx = state.cases.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    state.cases.splice(idx, 1);
    persist();
    return true;
  },

  // ---- Timeline ----
  listTimeline: (caseId: string) => state.timeline.filter((t) => t.caseId === caseId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  addTimelineEntry: (caseId: string, note: string) => {
    const created: TimelineEntry = { id: crypto.randomUUID(), caseId, note, createdAt: new Date().toISOString() };
    state.timeline.unshift(created);
    persist();
    return created;
  },

  // ---- Attachments ----
  listAttachments: (caseId: string) => state.attachments.filter((a) => a.caseId === caseId),
  addAttachment: (caseId: string, fileName: string, fileType: string, dataUrl: string) => {
    const created: Attachment = { id: crypto.randomUUID(), caseId, fileName, fileType, url: dataUrl, createdAt: new Date().toISOString() };
    state.attachments.unshift(created);
    persist();
    return created;
  },

  // ---- Email links ----
  listEmailLinks: (caseId: string) => state.emailLinks.filter((e) => e.caseId === caseId),

  // ---- Related cases ----
  listRelatedCases: (caseId: string) => {
    const relatedIds = state.caseRelations
      .filter((r) => r.caseId === caseId || r.relatedCaseId === caseId)
      .map((r) => (r.caseId === caseId ? r.relatedCaseId : r.caseId));
    return state.cases.filter((c) => relatedIds.includes(c.id));
  },
  addCaseRelation: (relation: CaseRelation) => {
    state.caseRelations.push(relation);
    persist();
    return relation;
  },

  // ---- Lessons learned ----
  getLessonLearned: (caseId: string) => state.lessonsLearned.find((l) => l.caseId === caseId) ?? null,
  saveLessonLearned: (caseId: string, data: Omit<LessonLearned, 'id' | 'caseId'>) => {
    const idx = state.lessonsLearned.findIndex((l) => l.caseId === caseId);
    if (idx === -1) {
      const created: LessonLearned = { ...data, id: crypto.randomUUID(), caseId };
      state.lessonsLearned.unshift(created);
      persist();
      return created;
    }
    state.lessonsLearned[idx] = { ...state.lessonsLearned[idx], ...data };
    persist();
    return state.lessonsLearned[idx];
  },

  // ---- Knowledge base ----
  listKnowledgeArticles: (filters: { q?: string; category?: string; tag?: string } = {}) => {
    let results = state.knowledgeArticles;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      results = results.filter((a) => a.title.toLowerCase().includes(q) || a.contentMarkdown.toLowerCase().includes(q));
    }
    if (filters.category) results = results.filter((a) => a.category === filters.category);
    if (filters.tag) results = results.filter((a) => a.tags.includes(filters.tag!));
    return [...results];
  },
  getKnowledgeArticle: (id: string) => state.knowledgeArticles.find((a) => a.id === id) ?? null,
  createKnowledgeArticle: (data: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const created: KnowledgeArticle = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    state.knowledgeArticles.unshift(created);
    persist();
    return created;
  },
  updateKnowledgeArticle: (id: string, data: Partial<KnowledgeArticle>) => {
    const idx = state.knowledgeArticles.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    state.knowledgeArticles[idx] = { ...state.knowledgeArticles[idx], ...data, updatedAt: new Date().toISOString() };
    persist();
    return state.knowledgeArticles[idx];
  },

  // ---- Processes ----
  listProcesses: (filters: { q?: string; category?: string } = {}) => {
    let results = state.processes;
    if (filters.category) results = results.filter((p) => p.category === filters.category);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      results = results.filter((p) => p.title.toLowerCase().includes(q) || p.objective.toLowerCase().includes(q));
    }
    return [...results];
  },
  getProcess: (id: string) => state.processes.find((p) => p.id === id) ?? null,

  // ---- Tags ----
  listTags: () => {
    const tagSet = new Set<string>();
    state.cases.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    state.knowledgeArticles.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  },

  // ---- Global search ----
  globalSearch: (q: string) => {
    const query = q.toLowerCase();
    return {
      cases: state.cases.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.caseNumber.toLowerCase().includes(query) ||
          (c.customerName ?? '').toLowerCase().includes(query) ||
          c.tags.some((t) => t.toLowerCase().includes(query)),
      ),
      knowledgeArticles: state.knowledgeArticles.filter(
        (a) => a.title.toLowerCase().includes(query) || a.contentMarkdown.toLowerCase().includes(query),
      ),
      processes: state.processes.filter((p) => p.title.toLowerCase().includes(query) || p.objective.toLowerCase().includes(query)),
    };
  },

  // ---- Dashboard ----
  getDashboardData: () => {
    const nowTs = Date.now();
    const byStatus: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    const byClient: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let overdue = 0;

    state.cases.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
      if (c.country) byCountry[c.country] = (byCountry[c.country] ?? 0) + 1;
      if (c.customerName) byClient[c.customerName] = (byClient[c.customerName] ?? 0) + 1;
      byType[c.type] = (byType[c.type] ?? 0) + 1;
      if (c.dueDate && new Date(c.dueDate).getTime() < nowTs && c.status !== 'RESOLVED' && c.status !== 'CLOSED') overdue += 1;
    });

    const openCases = state.cases.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
    const recentUpdates = [...state.cases]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 8)
      .map((c) => ({ id: c.id, caseNumber: c.caseNumber, title: c.title, status: c.status, updatedAt: c.updatedAt }));

    return { totalCases: state.cases.length, openCases, overdue, byStatus, byCountry, byClient, byType, recentUpdates };
  },

  // ---- Reports ----
  buildCasesReport: (filters: { client?: string; country?: string; owner?: string; type?: string; from?: string; to?: string }) => {
    const filtered = state.cases.filter((c) => {
      if (filters.client && c.customerName !== filters.client) return false;
      if (filters.country && c.country !== filters.country) return false;
      if (filters.owner && c.ownerName !== filters.owner) return false;
      if (filters.type && c.type !== filters.type) return false;
      if (filters.from && c.createdAt < filters.from) return false;
      if (filters.to && c.createdAt > filters.to) return false;
      return true;
    });
    return {
      generatedAt: new Date().toISOString(),
      totalCases: filtered.length,
      filters,
      rows: filtered.map((c) => ({
        caseNumber: c.caseNumber,
        title: c.title,
        customer: c.customerName ?? '',
        country: c.country ?? '',
        type: c.type,
        status: c.status,
        priority: c.priority,
        owner: c.ownerName ?? '',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    };
  },

  // ---- Assistente de IA (heurística local sobre os dados) ----
  suggestSolutions: (query: string) => {
    const q = query.toLowerCase();
    const matches = state.cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        (c.country ?? '').toLowerCase().includes(q) ||
        (c.comments ?? '').toLowerCase().includes(q),
    );
    const resolved = matches.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED');
    const avgDays =
      resolved.length > 0
        ? Math.round(
            resolved.reduce((sum, c) => sum + (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / 86400000, 0) /
              resolved.length,
          )
        : null;

    const documentsUsed = new Set<string>();
    const teams = new Set<string>();
    matches.forEach((c) => {
      const lesson = state.lessonsLearned.find((l) => l.caseId === c.id);
      lesson?.documentsUsed.forEach((d) => documentsUsed.add(d));
      lesson?.teamsInvolved.forEach((t) => teams.add(t));
    });

    return {
      summary:
        matches.length > 0
          ? `Encontrados ${matches.length} caso(s) semelhantes a "${query}". Tempo médio de resolução: ${avgDays ?? 'N/A'} dia(s).`
          : `Nenhum caso semelhante encontrado para "${query}" na base atual.`,
      similarCasesCount: matches.length,
      similarCaseNumbers: matches.map((c) => c.caseNumber),
      relatedDocuments: Array.from(documentsUsed),
      averageResolutionDays: avgDays,
      teamsInvolved: Array.from(teams),
    };
  },

  // ---- Pasta de exportação vinculada ao caso ----
  getCaseFolderLink: (caseId: string) => state.caseFolderLinks.find((f) => f.caseId === caseId) ?? null,
  setCaseFolderLink: (caseId: string, folderPath: string[]) => {
    const idx = state.caseFolderLinks.findIndex((f) => f.caseId === caseId);
    const link: CaseFolderLink = { caseId, folderPath, linkedAt: new Date().toISOString() };
    if (idx === -1) state.caseFolderLinks.push(link);
    else state.caseFolderLinks[idx] = link;
    persist();
    return link;
  },
  clearCaseFolderLink: (caseId: string) => {
    state.caseFolderLinks = state.caseFolderLinks.filter((f) => f.caseId !== caseId);
    state.linkedFiles = state.linkedFiles.filter((f) => f.caseId !== caseId);
    persist();
  },

  // ---- Arquivos vinculados (referência, sem cópia) ----
  listLinkedFiles: (caseId: string) => state.linkedFiles.filter((f) => f.caseId === caseId),
  addLinkedFile: (caseId: string, fileName: string, relativePath: string) => {
    const created: LinkedFile = { id: crypto.randomUUID(), caseId, fileName, relativePath, addedAt: new Date().toISOString() };
    state.linkedFiles.unshift(created);
    state.timeline.unshift({
      id: crypto.randomUUID(),
      caseId,
      note: `Arquivo vinculado ao histórico: ${relativePath || fileName}`,
      createdAt: created.addedAt,
    });
    persist();
    return created;
  },
  removeLinkedFile: (id: string) => {
    state.linkedFiles = state.linkedFiles.filter((f) => f.id !== id);
    persist();
  },

  // ---- Documentos de exportação (Proforma → Commercial Invoice + Packing List) ----
  listExportDocuments: (caseId: string) =>
    state.exportDocuments.filter((d) => d.caseId === caseId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  getExportDocument: (id: string) => state.exportDocuments.find((d) => d.id === id) ?? null,
  createExportDocument: (caseId: string, data: Omit<ExportDocument, 'id' | 'caseId' | 'stage' | 'createdAt' | 'updatedAt' | 'convertedAt'>) => {
    const now = new Date().toISOString();
    const created: ExportDocument = { ...data, id: crypto.randomUUID(), caseId, stage: 'PROFORMA', createdAt: now, updatedAt: now };
    state.exportDocuments.unshift(created);
    state.timeline.unshift({
      id: crypto.randomUUID(),
      caseId,
      note: `Proforma Invoice ${created.invoiceNumber} gerada.`,
      createdAt: now,
    });
    persist();
    return created;
  },
  updateExportDocument: (id: string, data: Partial<ExportDocument>) => {
    const idx = state.exportDocuments.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    state.exportDocuments[idx] = { ...state.exportDocuments[idx], ...data, updatedAt: new Date().toISOString() };
    persist();
    return state.exportDocuments[idx];
  },
  convertToCommercialInvoice: (id: string) => {
    const idx = state.exportDocuments.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const updated = { ...state.exportDocuments[idx], stage: 'COMMERCIAL_INVOICE' as const, convertedAt: now, updatedAt: now };
    state.exportDocuments[idx] = updated;
    state.timeline.unshift({
      id: crypto.randomUUID(),
      caseId: updated.caseId,
      note: `Proforma ${updated.invoiceNumber} convertida em Commercial Invoice + Packing List.`,
      createdAt: now,
    });
    persist();
    return updated;
  },
  deleteExportDocument: (id: string) => {
    state.exportDocuments = state.exportDocuments.filter((d) => d.id !== id);
    persist();
  },
};
