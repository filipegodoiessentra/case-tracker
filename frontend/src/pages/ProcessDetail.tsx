import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { processesApi } from '../api/processesApi';
import { Card } from '../components/common/Card';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import type { ProcessDoc } from '../types/domain';

export function ProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const [process, setProcess] = useState<ProcessDoc | null>(null);

  useEffect(() => {
    if (id) processesApi.get(id).then(setProcess);
  }, [id]);

  if (!process) return <LoadingSkeleton rows={5} />;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase text-brand-600">{process.category}</p>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{process.title}</h1>
      </div>

      <Card>
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Objetivo</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{process.objective}</p>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Responsáveis</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{process.responsible.join(', ')}</p>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Documentos necessários</h2>
        <ul className="mt-1 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
          {process.requiredDocuments.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Passo a passo</h2>
        <pre className="mt-1 whitespace-pre-wrap font-sans text-sm text-slate-600 dark:text-slate-300">{process.stepByStep}</pre>
      </Card>

      {process.commonErrors && (
        <Card>
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">Erros comuns</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{process.commonErrors}</p>
        </Card>
      )}

      {process.faq && (
        <Card>
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">FAQ</h2>
          <pre className="mt-1 whitespace-pre-wrap font-sans text-sm text-slate-600 dark:text-slate-300">{process.faq}</pre>
        </Card>
      )}
    </div>
  );
}
