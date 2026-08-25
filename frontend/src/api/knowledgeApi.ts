import { localStore } from '../store/localStore';
import type { KnowledgeArticle } from '../types/domain';

export const knowledgeApi = {
  list: async (params: { q?: string; category?: string; tag?: string } = {}) => localStore.listKnowledgeArticles(params),
  get: async (id: string) => {
    const found = localStore.getKnowledgeArticle(id);
    if (!found) throw new Error('Artigo não encontrado.');
    return found;
  },
  create: async (data: Partial<KnowledgeArticle>) =>
    localStore.createKnowledgeArticle({ title: '', contentMarkdown: '', category: '', tags: [], ...data }),
  update: async (id: string, data: Partial<KnowledgeArticle>) => localStore.updateKnowledgeArticle(id, data),
};
