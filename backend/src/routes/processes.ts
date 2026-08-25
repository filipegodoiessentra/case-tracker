import { Router } from 'express';
import { db } from '../store/db';
import { ApiError } from '../middleware/errorHandler';

export const processesRouter = Router();

processesRouter.get('/', (req, res) => {
  const { category, q } = req.query;
  let results = db.listProcesses();
  if (category) results = results.filter((p) => p.category === category);
  if (q) {
    const query = String(q).toLowerCase();
    results = results.filter((p) => p.title.toLowerCase().includes(query) || p.objective.toLowerCase().includes(query));
  }
  res.json(results);
});

processesRouter.get('/:id', (req, res) => {
  const found = db.getProcess(req.params.id);
  if (!found) throw new ApiError(404, 'Processo não encontrado.');
  res.json(found);
});

processesRouter.post('/', (req, res) => {
  res.status(201).json(db.createProcess(req.body));
});

processesRouter.put('/:id', (req, res) => {
  const updated = db.updateProcess(req.params.id, req.body);
  if (!updated) throw new ApiError(404, 'Processo não encontrado.');
  res.json(updated);
});
