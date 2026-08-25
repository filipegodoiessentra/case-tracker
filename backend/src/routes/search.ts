// Busca global — pesquisa unificada em Casos, Base de Conhecimento e Processos.
import { Router } from 'express';
import { db } from '../store/db';

export const searchRouter = Router();

searchRouter.get('/', (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase();
  if (!q) return res.json({ cases: [], knowledgeArticles: [], processes: [] });

  const cases = db
    .listCases()
    .filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        (c.customerName ?? '').toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );

  const knowledgeArticles = db
    .listKnowledgeArticles()
    .filter((a) => a.title.toLowerCase().includes(q) || a.contentMarkdown.toLowerCase().includes(q));

  const processes = db
    .listProcesses()
    .filter((p) => p.title.toLowerCase().includes(q) || p.objective.toLowerCase().includes(q));

  res.json({ cases, knowledgeArticles, processes });
});
