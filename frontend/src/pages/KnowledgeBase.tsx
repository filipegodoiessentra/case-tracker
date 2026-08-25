import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { knowledgeApi } from '../api/knowledgeApi';
import { Card } from '../components/common/Card';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { SearchBar } from '../components/common/SearchBar';
import { TagPill } from '../components/common/Tag';
import type { KnowledgeArticle } from '../types/domain';

export function KnowledgeBase() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);

  function load(q?: string) {
    setLoading(true);
    knowledgeApi
      .list({ q })
      .then(setArticles)
      .finally(() => setLoading(false));
  }

  useEffect(() => load(), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Base de Conhecimento</h1>
        <Link to="/knowledge/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          + Novo artigo
        </Link>
      </div>

      <SearchBar placeholder="Buscar artigos..." onSearch={load} />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link key={a.id} to={`/knowledge/${a.id}`}>
              <Card className="h-full transition hover:shadow-md">
                <p className="text-xs font-semibold uppercase text-brand-600">{a.category}</p>
                <h2 className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{a.title}</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.tags.map((t) => (
                    <TagPill key={t} label={t} />
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">Atualizado em {new Date(a.updatedAt).toLocaleDateString('pt-BR')}</p>
              </Card>
            </Link>
          ))}
          {articles.length === 0 && <p className="text-sm text-slate-400">Nenhum artigo encontrado.</p>}
        </div>
      )}
    </div>
  );
}
