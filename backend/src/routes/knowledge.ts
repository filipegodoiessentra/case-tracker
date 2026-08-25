import { Router } from 'express';
import { db } from '../store/db';
import { ApiError } from '../middleware/errorHandler';

export const knowledgeRouter = Router();

knowledgeRouter.get('/', (req, res) => {
  const { q, category, tag } = req.query;
  let results = db.listKnowledgeArticles();
  if (q) {
    const query = String(q).toLowerCase();
    results = results.filter(
      (a) => a.title.toLowerCase().includes(query) || a.contentMarkdown.toLowerCase().includes(query),
    );
  }
  if (category) results = results.filter((a) => a.category === category);
  if (tag) results = results.filter((a) => a.tags.includes(String(tag)));
  res.json(results);
});

knowledgeRouter.get('/:id', (req, res) => {
  const found = db.getKnowledgeArticle(req.params.id);
  if (!found) throw new ApiError(404, 'Artigo não encontrado.');
  res.json(found);
});

knowledgeRouter.post('/', (req, res) => {
  const created = db.createKnowledgeArticle({ ...req.body, authorName: req.user?.name });
  res.status(201).json(created);
});

knowledgeRouter.put('/:id', (req, res) => {
  const updated = db.updateKnowledgeArticle(req.params.id, req.body);
  if (!updated) throw new ApiError(404, 'Artigo não encontrado.');
  res.json(updated);
});
