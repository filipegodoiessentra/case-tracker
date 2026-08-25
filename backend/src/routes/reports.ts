import { Router } from 'express';
import { buildCasesReport } from '../services/reportService';

export const reportsRouter = Router();

reportsRouter.get('/cases', (req, res) => {
  const { client, country, owner, type, from, to } = req.query;
  const report = buildCasesReport({
    client: client ? String(client) : undefined,
    country: country ? String(country) : undefined,
    owner: owner ? String(owner) : undefined,
    type: type ? String(type) : undefined,
    from: from ? String(from) : undefined,
    to: to ? String(to) : undefined,
  });
  res.json(report);
});
