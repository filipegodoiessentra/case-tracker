// Camada de API do app — hoje delega para o localStore (dados em memória +
// localStorage), sem nenhuma chamada de rede. Mantém a mesma assinatura para
// as páginas não precisarem mudar caso um backend real seja reintroduzido.
import { localStore } from '../store/localStore';
import type { Attachment, Case, EmailLink, LessonLearned, TimelineEntry } from '../types/domain';

export interface CaseFilters {
  status?: string;
  type?: string;
  priority?: string;
  country?: string;
  owner?: string;
  q?: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024; // 2MB — limite prático do localStorage do navegador.

export const casesApi = {
  list: async (filters: CaseFilters = {}) => localStore.listCases(filters),
  get: async (id: string) => {
    const found = localStore.getCase(id);
    if (!found) throw new Error('Caso não encontrado.');
    return found;
  },
  create: async (data: Partial<Case>) => localStore.createCase(data),
  update: async (id: string, data: Partial<Case>) => localStore.updateCase(id, data),
  remove: async (id: string) => localStore.deleteCase(id),

  listTimeline: async (id: string): Promise<TimelineEntry[]> => localStore.listTimeline(id),
  addTimelineEntry: async (id: string, note: string) => localStore.addTimelineEntry(id, note),

  listAttachments: async (id: string): Promise<Attachment[]> => localStore.listAttachments(id),
  uploadAttachment: async (id: string, file: File) => {
    if (file.size > MAX_ATTACHMENT_SIZE) {
      throw new Error('Arquivo maior que 2MB — não é possível anexar em modo 100% local (sem backend).');
    }
    const dataUrl = await readFileAsDataUrl(file);
    return localStore.addAttachment(id, file.name, file.type, dataUrl);
  },

  listEmails: async (id: string): Promise<EmailLink[]> => localStore.listEmailLinks(id),

  listRelated: async (id: string): Promise<Case[]> => localStore.listRelatedCases(id),
  addRelated: async (id: string, relatedCaseId: string, note?: string) =>
    localStore.addCaseRelation({ caseId: id, relatedCaseId, note }),

  getLessonLearned: async (id: string) => localStore.getLessonLearned(id),
  saveLessonLearned: async (id: string, data: LessonLearned) => localStore.saveLessonLearned(id, data),
};
