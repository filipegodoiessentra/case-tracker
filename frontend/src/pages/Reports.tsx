import { useState } from 'react';
import { reportsApi, type ReportFilters } from '../api/miscApi';
import { Card } from '../components/common/Card';
import { DataTable, type Column } from '../components/table/DataTable';
import { exportToCsv, exportToXlsx } from '../utils/exportUtils';

interface ReportRow {
  caseNumber: string;
  title: string;
  customer: string;
  country: string;
  type: string;
  status: string;
  priority: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export function Reports() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [total, setTotal] = useState(0);

  async function runReport() {
    const result = (await reportsApi.casesReport(filters)) as { totalCases: number; rows: ReportRow[] };
    setRows(result.rows);
    setTotal(result.totalCases);
  }

  const columns: Column<ReportRow>[] = [
    { header: 'Nº do Caso', render: (r) => r.caseNumber },
    { header: 'Título', render: (r) => r.title },
    { header: 'Cliente', render: (r) => r.customer },
    { header: 'País', render: (r) => r.country },
    { header: 'Tipo', render: (r) => r.type },
    { header: 'Status', render: (r) => r.status },
    { header: 'Responsável', render: (r) => r.owner },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Relatórios</h1>

      <Card className="flex flex-wrap items-end gap-3">
        <Field label="Cliente">
          <input onChange={(e) => setFilters((f) => ({ ...f, client: e.target.value || undefined }))} className="input" />
        </Field>
        <Field label="País">
          <input onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value || undefined }))} className="input" />
        </Field>
        <Field label="Responsável">
          <input onChange={(e) => setFilters((f) => ({ ...f, owner: e.target.value || undefined }))} className="input" />
        </Field>
        <Field label="De">
          <input type="date" onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))} className="input" />
        </Field>
        <Field label="Até">
          <input type="date" onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))} className="input" />
        </Field>
        <button onClick={runReport} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Gerar
        </button>
        {rows.length > 0 && (
          <>
            <button
              onClick={() => exportToCsv('relatorio-casos', rows)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => exportToXlsx('relatorio-casos', rows, 'Casos')}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
            >
              Exportar Excel
            </button>
          </>
        )}
      </Card>

      {rows.length > 0 && (
        <>
          <p className="text-sm text-slate-500">{total} caso(s) encontrado(s)</p>
          <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.caseNumber} />
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-slate-500">{label}</span>
      {children}
    </label>
  );
}
