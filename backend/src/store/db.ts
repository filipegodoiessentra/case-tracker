// Camada de acesso a dados. Hoje implementa um repositório em memória (mock),
// mas a interface é a mesma que seria usada com Prisma Client — trocar a
// implementação por chamadas ao Prisma é o único passo necessário para usar
// PostgreSQL real (ver DATA_SOURCE em .env).
import { randomUUID } from 'crypto';
import * as mock from '../data/mockData';
import type {
  Attachment,
  Case,
  CaseRelation,
  EmailLink,
  KnowledgeArticle,
  LessonLearned,
  ProcessDoc,
  TimelineEntry,
  User,
} from '../types/domain';

// Clona os dados mock para memória mutável (evita mutar o módulo importado).
const state = {
  users: [...mock.users] as User[],
  customers: [...mock.customers],
  cases: mock.cases.map((c) => ({ ...c, tags: [...c.tags] })) as Case[],
  timeline: [...mock.timeline] as TimelineEntry[],
  attachments: [...mock.attachments] as Attachment[],
  emailLinks: [...mock.emailLinks] as EmailLink[],
  lessonsLearned: [...mock.lessonsLearned] as LessonLearned[],
  caseRelations: [...mock.caseRelations] as CaseRelation[],
  knowledgeArticles: mock.knowledgeArticles.map((a) => ({ ...a, tags: [...a.tags] })) as KnowledgeArticle[],
  processes: [...mock.processes] as ProcessDoc[],
};

export const db = {
  // ---- Users / Customers ----
  listUsers: () => state.users,
  listCustomers: () => state.customers,

  // ---- Cases ----
  listCases: () => state.cases,
  getCase: (id: string) => state.cases.find((c) => c.id === id) ?? null,
  createCase: (data: Partial<Case>) => {
    const id = randomUUID();
    const now = new Date().toISOString();
    const seq = state.cases.length + 1;
    const newCase: Case = {
      id,
      caseNumber: `CASE-${String(10000 + seq).slice(1)}`,
      title: data.title ?? 'Novo caso',
      type: data.type ?? 'OTHER',
      status: data.status ?? 'NEW',
      priority: data.priority ?? 'MEDIUM',
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now,
      ...data,
    } as Case;
    state.cases.unshift(newCase);
    state.timeline.unshift({
      id: randomUUID(),
      caseId: id,
      note: 'Caso criado.',
      statusChange: newCase.status,
      createdAt: now,
    });
    return newCase;
  },
  updateCase: (id: string, data: Partial<Case>) => {
    const idx = state.cases.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const before = state.cases[idx];
    const updated = { ...before, ...data, updatedAt: new Date().toISOString() };
    state.cases[idx] = updated;
    if (data.status && data.status !== before.status) {
      state.timeline.unshift({
        id: randomUUID(),
        caseId: id,
        note: `Status alterado de ${before.status} para ${data.status}.`,
        statusChange: data.status,
        createdAt: new Date().toISOString(),
      });
    }
    return updated;
  },
  deleteCase: (id: string) => {
    const idx = state.cases.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    state.cases.splice(idx, 1);
    return true;
  },

  // ---- Timeline ----
  listTimeline: (caseId: string) =>
    state.timeline.filter((t) => t.caseId === caseId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  addTimelineEntry: (entry: Omit<TimelineEntry, 'id' | 'createdAt'>) => {
    const created: TimelineEntry = { ...entry, id: randomUUID(), createdAt: new Date().toISOString() };
    state.timeline.unshift(created);
    return created;
  },

  // ---- Attachments ----
  listAttachments: (caseId: string) => state.attachments.filter((a) => a.caseId === caseId),
  addAttachment: (attachment: Omit<Attachment, 'id' | 'createdAt'>) => {
    const created: Attachment = { ...attachment, id: randomUUID(), createdAt: new Date().toISOString() };
    state.attachments.unshift(created);
    return created;
  },

  // ---- Email links ----
  listEmailLinks: (caseId: string) => state.emailLinks.filter((e) => e.caseId === caseId),
  addEmailLink: (link: Omit<EmailLink, 'id'>) => {
    const created: EmailLink = { ...link, id: randomUUID() };
    state.emailLinks.unshift(created);
    return created;
  },

  // ---- Lessons learned ----
  getLessonLearned: (caseId: string) => state.lessonsLearned.find((l) => l.caseId === caseId) ?? null,
  upsertLessonLearned: (caseId: string, data: Omit<LessonLearned, 'id' | 'caseId'>) => {
    const idx = state.lessonsLearned.findIndex((l) => l.caseId === caseId);
    if (idx === -1) {
      const created: LessonLearned = { ...data, id: randomUUID(), caseId };
      state.lessonsLearned.unshift(created);
      return created;
    }
    state.lessonsLearned[idx] = { ...state.lessonsLearned[idx], ...data };
    return state.lessonsLearned[idx];
  },
  listLessonsLearned: () => state.lessonsLearned,

  // ---- Case relations ----
  listRelatedCases: (caseId: string) => {
    const relatedIds = state.caseRelations
      .filter((r) => r.caseId === caseId || r.relatedCaseId === caseId)
      .map((r) => (r.caseId === caseId ? r.relatedCaseId : r.caseId));
    return state.cases.filter((c) => relatedIds.includes(c.id));
  },
  addCaseRelation: (relation: CaseRelation) => {
    state.caseRelations.push(relation);
    return relation;
  },

  // ---- Knowledge base ----
  listKnowledgeArticles: () => state.knowledgeArticles,
  getKnowledgeArticle: (id: string) => state.knowledgeArticles.find((a) => a.id === id) ?? null,
  createKnowledgeArticle: (data: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const created: KnowledgeArticle = { ...data, id: randomUUID(), createdAt: now, updatedAt: now };
    state.knowledgeArticles.unshift(created);
    return created;
  },
  updateKnowledgeArticle: (id: string, data: Partial<KnowledgeArticle>) => {
    const idx = state.knowledgeArticles.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    state.knowledgeArticles[idx] = { ...state.knowledgeArticles[idx], ...data, updatedAt: new Date().toISOString() };
    return state.knowledgeArticles[idx];
  },

  // ---- Processes ----
  listProcesses: () => state.processes,
  getProcess: (id: string) => state.processes.find((p) => p.id === id) ?? null,
  createProcess: (data: Omit<ProcessDoc, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const created: ProcessDoc = { ...data, id: randomUUID(), createdAt: now, updatedAt: now };
    state.processes.unshift(created);
    return created;
  },
  updateProcess: (id: string, data: Partial<ProcessDoc>) => {
    const idx = state.processes.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    state.processes[idx] = { ...state.processes[idx], ...data, updatedAt: new Date().toISOString() };
    return state.processes[idx];
  },

  // ---- Tags ----
  listTags: () => {
    const tagSet = new Set<string>();
    state.cases.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    state.knowledgeArticles.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  },
};

export type Store = typeof db;
