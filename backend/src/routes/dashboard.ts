import { Router } from 'express';
import { db } from '../store/db';

export const dashboardRouter = Router();

dashboardRouter.get('/', (_req, res) => {
  const cases = db.listCases();
  const now = Date.now();

  const byStatus: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  const byClient: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let overdue = 0;

  cases.forEach((c) => {
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
    if (c.country) byCountry[c.country] = (byCountry[c.country] ?? 0) + 1;
    if (c.customerName) byClient[c.customerName] = (byClient[c.customerName] ?? 0) + 1;
    byType[c.type] = (byType[c.type] ?? 0) + 1;
    if (c.dueDate && new Date(c.dueDate).getTime() < now && c.status !== 'RESOLVED' && c.status !== 'CLOSED') {
      overdue += 1;
    }
  });

  const openCases = cases.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const recentUpdates = [...cases]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)
    .map((c) => ({ id: c.id, caseNumber: c.caseNumber, title: c.title, status: c.status, updatedAt: c.updatedAt }));

  res.json({
    totalCases: cases.length,
    openCases,
    overdue,
    byStatus,
    byCountry,
    byClient,
    byType,
    recentUpdates,
  });
});
