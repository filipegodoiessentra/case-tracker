// Geração de relatórios — hoje retorna dados agregados em JSON prontos para
// serem exportados no frontend (SheetJS/CSV). Estrutura preparada para, no
// futuro, gerar arquivos Excel/PDF diretamente no backend.
import { db } from '../store/db';
import type { Case } from '../types/domain';

export interface ReportFilters {
  client?: string;
  country?: string;
  owner?: string;
  type?: string;
  from?: string;
  to?: string;
}

function applyFilters(cases: Case[], filters: ReportFilters) {
  return cases.filter((c) => {
    if (filters.client && c.customerName !== filters.client) return false;
    if (filters.country && c.country !== filters.country) return false;
    if (filters.owner && c.ownerName !== filters.owner) return false;
    if (filters.type && c.type !== filters.type) return false;
    if (filters.from && c.createdAt < filters.from) return false;
    if (filters.to && c.createdAt > filters.to) return false;
    return true;
  });
}

export function buildCasesReport(filters: ReportFilters) {
  const filtered = applyFilters(db.listCases(), filters);
  return {
    generatedAt: new Date().toISOString(),
    totalCases: filtered.length,
    filters,
    rows: filtered.map((c) => ({
      caseNumber: c.caseNumber,
      title: c.title,
      customer: c.customerName ?? '',
      country: c.country ?? '',
      type: c.type,
      status: c.status,
      priority: c.priority,
      owner: c.ownerName ?? '',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  };
}
