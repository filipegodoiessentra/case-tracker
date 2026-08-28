// Painel "Documentos de Exportação": cria a Proforma Invoice do caso, permite
// baixar o .xlsx e depois convertê-la em Commercial Invoice + Packing List
// (mesmo arquivo, novo estágio), seguindo o modelo hoje usado em Excel.
import { useEffect, useState } from 'react';
import { Card } from '../common/Card';
import { casesApi } from '../../api/casesApi';
import { downloadExportDocument } from '../../utils/exportDocumentXlsx';
import type { Case, ExportDocument, ExportItem } from '../../types/domain';
import { ExportDocumentForm } from './ExportDocumentForm';

interface Props {
  caseData: Case;
}

export function ExportDocumentsPanel({ caseData }: Props) {
  const [docs, setDocs] = useState<ExportDocument[]>([]);
  const [editing, setEditing] = useState<ExportDocument | 'new' | null>(null);

  async function reload() {
    setDocs(await casesApi.listExportDocuments(caseData.id));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseData.id]);

  async function handleConvert(doc: ExportDocument) {
    const missingWeights = doc.items.some((i: ExportItem) => !i.netWeightKg || !i.grossWeightKg || !i.boxes);
    if (missingWeights && !confirm('Alguns itens estão sem peso/volumes preenchidos. Converter mesmo assim?')) return;
    await casesApi.convertToCommercialInvoice(doc.id);
    await reload();
  }

  async function handleDelete(doc: ExportDocument) {
    if (!confirm(`Excluir o documento ${doc.invoiceNumber}?`)) return;
    await casesApi.deleteExportDocument(doc.id);
    await reload();
  }

  if (editing) {
    return (
      <ExportDocumentForm
        caseData={caseData}
        initial={editing === 'new' ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await reload();
        }}
      />
    );
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Proforma / Commercial Invoice / Packing List</p>
        <button onClick={() => setEditing('new')} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700">
          + Nova Proforma
        </button>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {docs.map((doc) => (
          <li key={doc.id} className="space-y-2 py-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {doc.invoiceNumber}{' '}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      doc.stage === 'PROFORMA' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {doc.stage === 'PROFORMA' ? 'Proforma' : 'Commercial Invoice + Packing List'}
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  {doc.customerName} · {doc.items.length} item(ns) · atualizado em {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => downloadExportDocument(doc)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-600">
                  Baixar .xlsx
                </button>
                <button onClick={() => setEditing(doc)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-600">
                  Editar
                </button>
                {doc.stage === 'PROFORMA' && (
                  <button onClick={() => handleConvert(doc)} className="rounded-lg bg-brand-600 px-2 py-1 text-xs text-white hover:bg-brand-700">
                    Converter em Commercial Invoice + Packing List
                  </button>
                )}
                <button onClick={() => handleDelete(doc)} className="text-xs text-red-500 hover:underline">
                  Excluir
                </button>
              </div>
            </div>
          </li>
        ))}
        {docs.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Nenhum documento de exportação gerado para este caso.</p>}
      </ul>
    </Card>
  );
}
