import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { processesApi } from '../api/processesApi';
import { Card } from '../components/common/Card';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { SearchBar } from '../components/common/SearchBar';
import type { ProcessDoc } from '../types/domain';

export function ProcessesLibrary() {
  const [processes, setProcesses] = useState<ProcessDoc[]>([]);
  const [loading, setLoading] = useState(true);

  function load(q?: string) {
    setLoading(true);
    processesApi
      .list({ q })
      .then(setProcesses)
      .finally(() => setLoading(false));
  }

  useEffect(() => load(), []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Biblioteca de Processos</h1>
      <SearchBar placeholder="Buscar processos..." onSearch={load} />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {processes.map((p) => (
            <Link key={p.id} to={`/processes/${p.id}`}>
              <Card className="h-full transition hover:shadow-md">
                <p className="text-xs font-semibold uppercase text-brand-600">{p.category}</p>
                <h2 className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{p.objective}</p>
              </Card>
            </Link>
          ))}
          {processes.length === 0 && <p className="text-sm text-slate-400">Nenhum processo encontrado.</p>}
        </div>
      )}
    </div>
  );
}
