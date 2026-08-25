import { Router } from 'express';
import { suggestSolutions, summarizeCase } from '../services/aiService';

export const aiRouter = Router();

aiRouter.get('/suggest', (req, res) => {
  const q = String(req.query.q ?? '');
  res.json(suggestSolutions(q));
});

aiRouter.get('/summarize/:caseId', (req, res) => {
  res.json({ summary: summarizeCase(req.params.caseId) });
});
