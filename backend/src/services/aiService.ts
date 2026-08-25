// Assistente de IA — hoje é uma heurística sobre os dados mock (busca por
// palavras-chave em título/tags/comentários) para demonstrar a experiência.
// Pronto para ser substituído por uma chamada real a um modelo de linguagem
// (ex.: Azure OpenAI) recebendo o mesmo contrato de entrada/saída.
import { db } from '../store/db';

export interface AiSuggestion {
  summary: string;
  similarCasesCount: number;
  similarCaseNumbers: string[];
  relatedDocuments: string[];
  averageResolutionDays: number | null;
  teamsInvolved: string[];
}

export function suggestSolutions(query: string): AiSuggestion {
  const q = query.toLowerCase();
  const cases = db.listCases();
  const matches = cases.filter(
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
          resolved.reduce((sum, c) => {
            const created = new Date(c.createdAt).getTime();
            const updated = new Date(c.updatedAt).getTime();
            return sum + (updated - created) / (1000 * 60 * 60 * 24);
          }, 0) / resolved.length,
        )
      : null;

  const documentsUsed = new Set<string>();
  const teams = new Set<string>();
  matches.forEach((c) => {
    const lesson = db.getLessonLearned(c.id);
    lesson?.documentsUsed.forEach((d) => documentsUsed.add(d));
    lesson?.teamsInvolved.forEach((t) => teams.add(t));
  });

  return {
    summary:
      matches.length > 0
        ? `Encontrados ${matches.length} caso(s) semelhantes a "${query}". Tempo médio de resolução: ${
            avgDays ?? 'N/A'
          } dia(s).`
        : `Nenhum caso semelhante encontrado para "${query}" na base atual.`,
    similarCasesCount: matches.length,
    similarCaseNumbers: matches.map((c) => c.caseNumber),
    relatedDocuments: Array.from(documentsUsed),
    averageResolutionDays: avgDays,
    teamsInvolved: Array.from(teams),
  };
}

export function summarizeCase(caseId: string): string {
  const c = db.getCase(caseId);
  if (!c) return 'Caso não encontrado.';
  const tl = db.listTimeline(caseId);
  return `Caso ${c.caseNumber} (${c.status}) — ${c.title}. ${tl.length} evento(s) no histórico. Última atualização: ${c.updatedAt}.`;
}
