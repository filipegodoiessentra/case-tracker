import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { casesApi } from '../api/casesApi';
import { Card } from '../components/common/Card';
import { CASE_PRIORITY_LABELS, CASE_STATUS_LABELS, CASE_TYPE_LABELS, type Case } from '../types/domain';

const emptyCase: Partial<Case> = {
  title: '',
  type: 'OTHER',
  status: 'NEW',
  priority: 'MEDIUM',
  customerName: '',
  country: '',
  tags: [],
};

export function CaseForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<Case>>(emptyCase);
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      casesApi.get(id).then((c) => {
        setForm(c);
        setTagsInput(c.tags.join(', '));
      });
    }
  }, [id, isEdit]);

  function update<K extends keyof Case>(key: K, value: Case[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (isEdit && id) {
        await casesApi.update(id, payload);
        navigate(`/cases/${id}`);
      } else {
        const created = await casesApi.create(payload);
        navigate(`/cases/${created.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{isEdit ? 'Editar caso' : 'Novo caso'}</h1>

      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm">
            Título
            <input
              required
              value={form.title ?? ''}
              onChange={(e) => update('title', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>

          <label className="text-sm">
            Cliente
            <input
              value={form.customerName ?? ''}
              onChange={(e) => update('customerName', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>

          <label className="text-sm">
            País
            <input
              value={form.country ?? ''}
              onChange={(e) => update('country', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>

          <label className="text-sm">
            Tipo
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value as Case['type'])}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              {Object.entries(CASE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            Status
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value as Case['status'])}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            Prioridade
            <select
              value={form.priority}
              onChange={(e) => update('priority', e.target.value as Case['priority'])}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              {Object.entries(CASE_PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            Prazo (due date)
            <input
              type="date"
              value={form.dueDate?.substring(0, 10) ?? ''}
              onChange={(e) => update('dueDate', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>

          <label className="sm:col-span-2 text-sm">
            Tags (separadas por vírgula)
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>

          <label className="sm:col-span-2 text-sm">
            Comentários
            <textarea
              rows={4}
              value={form.comments ?? ''}
              onChange={(e) => update('comments', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>

          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
