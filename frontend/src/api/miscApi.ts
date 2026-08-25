import { localStore } from '../store/localStore';
import type { Case, KnowledgeArticle, ProcessDoc } from '../types/domain';

export interface GlobalSearchResult {
  cases: Case[];
  knowledgeArticles: KnowledgeArticle[];
  processes: ProcessDoc[];
}

export const searchApi = {
  search: async (q: string): Promise<GlobalSearchResult> => localStore.globalSearch(q),
};

export const tagsApi = {
  list: async () => localStore.listTags(),
};

export interface ReportFilters {
  client?: string;
  country?: string;
  owner?: string;
  type?: string;
  from?: string;
  to?: string;
}

export const reportsApi = {
  casesReport: async (filters: ReportFilters) => localStore.buildCasesReport(filters),
};

export interface AiSuggestionResponse {
  summary: string;
  similarCasesCount: number;
  similarCaseNumbers: string[];
  relatedDocuments: string[];
  averageResolutionDays: number | null;
  teamsInvolved: string[];
}

export const aiApi = {
  suggest: async (q: string): Promise<AiSuggestionResponse> => localStore.suggestSolutions(q),
};
