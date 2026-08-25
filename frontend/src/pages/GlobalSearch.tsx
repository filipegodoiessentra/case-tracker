import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchApi, type GlobalSearchResult } from '../api/miscApi';
import { Card } from '../components/common/Card';
import { SearchBar } from '../components/common/SearchBar';

export function GlobalSearch() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [result, setResult] = useState<GlobalSearchResult | null>(null);

  useEffect(() => {
    if (query) searchApi.search(query).then(setResult);
  }, [query]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Busca Global</h1>
      <SearchBar placeholder="Buscar em casos, base de conhecimento e processos..." onSearch={(q) => setParams({ q })} />

      {result && (
        <div className="space-y-6">
          <Section title={`Casos (${result.cases.length})`}>
            {result.cases.map((c) => (
              <Link key={c.id} to={`/cases/${c.id}`} className="block py-1.5 text-sm text-brand-600 hover:underline">
                {c.caseNumber} — {c.title}
              </Link>
            ))}
          </Section>
          <Section title={`Base de Conhecimento (${result.knowledgeArticles.length})`}>
            {result.knowledgeArticles.map((a) => (
              <Link key={a.id} to={`/knowledge/${a.id}`} className="block py-1.5 text-sm text-brand-600 hover:underline">
                {a.title}
              </Link>
            ))}
          </Section>
          <Section title={`Processos (${result.processes.length})`}>
            {result.processes.map((p) => (
              <Link key={p.id} to={`/processes/${p.id}`} className="block py-1.5 text-sm text-brand-600 hover:underline">
                {p.title}
              </Link>
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <h2 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</h2>
      {children}
    </Card>
  );
}
