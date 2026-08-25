import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { casesApi, type CaseFilters } from '../api/casesApi';
import { Card } from '../components/common/Card';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, type Column } from '../components/table/DataTable';
import {
  CASE_STATUS_LABELS,
  CASE_TYPE_LABELS,
  type Case,
  type CasePriority,
  type CaseStatus,
  type CaseType,
} from '../types/domain';
import { exportToCsv, exportToXlsx } from '../utils/exportUtils';

export function CasesList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CaseFilters>({});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    casesApi
      .list(filters)
      .then(setCases)
      .finally(() => setLoading(false));
  }, [filters]);

  const columns: Column<Case>[] = [
    { header: 'Nº do Caso', render: (c) => <span className="font-medium text-brand-600">{c.caseNumber}</span> },
    { header: 'Título', render: (c) => c.title },
    { header: 'Cliente', render: (c) => c.customerName ?? '—' },
    { header: 'País', render: (c) => c.country ?? '—' },
    { header: 'Tipo', render: (c) => CASE_TYPE_LABELS[c.type] },
    { header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { header: 'Prioridade', render: (c) => <PriorityBadge priority={c.priority} /> },
    { header: 'Responsável', render: (c) => c.ownerName ?? '—' },
  ];

  function exportRows() {
    return cases.map((c) => ({
      caseNumber: c.caseNumber,
      title: c.title,
      customer: c.customerName ?? '',
      country: c.country ?? '',
      type: CASE_TYPE_LABELS[c.type],
      status: CASE_STATUS_LABELS[c.status],
      priority: c.priority,
      owner: c.ownerName ?? '',
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Casos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCsv('casos', exportRows())}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => exportToXlsx('casos', exportRows(), 'Casos')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
          >
            Exportar Excel
          </button>
          <Link to="/cases/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            + Novo caso
          </Link>
        </div>
      </div>

      <Card className="flex flex-wrap gap-3">
        <input
          placeholder="Buscar por título, número, cliente, tag..."
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value || undefined }))}
          className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
        <select
          onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as CaseStatus }))}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="">Status (todos)</option>
          {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setFilters((f) => ({ ...f, type: (e.target.value || undefined) as CaseType }))}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="">Tipo (todos)</option>
          {Object.entries(CASE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setFilters((f) => ({ ...f, priority: (e.target.value || undefined) as CasePriority }))}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="">Prioridade (todas)</option>
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
      </Card>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <DataTable
          columns={columns}
          rows={cases}
          keyExtractor={(c) =navigate(
          onRowClick={(c) => (window.location.href = `/cases/${c.id}`)}
        />
      )}
    </div>
  );
}
