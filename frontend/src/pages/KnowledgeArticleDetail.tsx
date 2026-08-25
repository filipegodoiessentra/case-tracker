import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { knowledgeApi } from '../api/knowledgeApi';
import { Card } from '../components/common/Card';
import { TagPill } from '../components/common/Tag';
import type { KnowledgeArticle } from '../types/domain';

export function KnowledgeArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [article, setArticle] = useState<Partial<KnowledgeArticle>>({
    title: '',
    category: '',
    contentMarkdown: '',
    tags: [],
  });
  const [editing, setEditing] = useState(isNew);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      knowledgeApi.get(id).then((a) => {
        setArticle(a);
        setTagsInput(a.tags.join(', '));
      });
    }
  }, [id, isNew]);

  async function save() {
    const payload = {
      ...article,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    };
    if (isNew) {
      const created = await knowledgeApi.create(payload);
      navigate(`/knowledge/${created.id}`);
    } else if (id) {
      const updated = await knowledgeApi.update(id, payload);
      setArticle(updated);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{isNew ? 'Novo artigo' : 'Editar artigo'}</h1>
        <Card className="space-y-3">
          <input
            placeholder="Título"
            value={article.title}
            onChange={(e) => setArticle((a) => ({ ...a, title: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
          <input
            placeholder="Categoria"
            value={article.category}
            onChange={(e) => setArticle((a) => ({ ...a, category: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
          <input
            placeholder="Tags (separadas por vírgula)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
          <textarea
            placeholder="Conteúdo (Markdown)"
            rows={10}
            value={article.contentMarkdown}
            onChange={(e) => setArticle((a) => ({ ...a, contentMarkdown: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono dark:border-slate-600 dark:bg-slate-800"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => navigate(-1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600">
              Cancelar
            </button>
            <button onClick={save} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
              Salvar
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-brand-600">{article.category}</p>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{article.title}</h1>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          Editar
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {article.tags?.map((t) => (
          <TagPill key={t} label={t} />
        ))}
      </div>
      <Card>
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-200">{article.contentMarkdown}</pre>
      </Card>
    </div>
  );
}
