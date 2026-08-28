// Formulário de cabeçalho + grade de itens da Proforma / Commercial Invoice /
// Packing List. Pré-preenche com dados do caso (cliente, país, incoterm...).
import { useState, type FormEvent } from 'react';
import { Card } from '../common/Card';
import { casesApi } from '../../api/casesApi';
import type { Case, ExportDocument, ExportItem } from '../../types/domain';

interface Props {
  caseData: Case;
  initial: ExportDocument | null;
  onCancel: () => void;
  onSaved: () => void;
}

function emptyItem(lineNo: number): ExportItem {
  return { id: crypto.randomUUID(), lineNo, itemCode: '', description: '', qty: 1, uom: 'PC', price: 0 };
}

export function ExportDocumentForm({ caseData, initial, onCancel, onSaved }: Props) {
  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoiceNumber ?? '');
  const [invoiceDate, setInvoiceDate] = useState(initial?.invoiceDate ?? new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  const [incoterm, setIncoterm] = useState(initial?.incoterm ?? caseData.incoterm ?? '');
  const [ncm, setNcm] = useState(initial?.ncm ?? '');
  const [customerName, setCustomerName] = useState(initial?.customerName ?? caseData.customerName ?? '');
  const [customerTaxId, setCustomerTaxId] = useState(initial?.customerTaxId ?? '');
  const [addressLines, setAddressLines] = useState<string[]>(
    initial?.customerAddressLines ?? ['', '', ''],
  );
  const [customerCity, setCustomerCity] = useState(initial?.customerCity ?? '');
  const [customerCountry, setCustomerCountry] = useState(initial?.customerCountry ?? caseData.country ?? '');
  const [items, setItems] = useState<ExportItem[]>(initial?.items ?? [emptyItem(1)]);
  const [saving, setSaving] = useState(false);

  function updateItem(id: string, patch: Partial<ExportItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem(prev.length + 1)]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id).map((i, idx) => ({ ...i, lineNo: idx + 1 })));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      alert('Informe o número da invoice/proforma.');
      return;
    }
    setSaving(true);
    const payload = {
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      currency,
      incoterm,
      ncm,
      customerName,
      customerTaxId,
      customerAddressLines: addressLines,
      customerCity,
      customerCountry,
      items,
    };
    try {
      if (initial) {
        await casesApi.updateExportDocument(initial.id, payload);
      } else {
        await casesApi.createExportDocument(caseData.id, payload);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <Card className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Número Invoice/Proforma">
            <input required value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Data">
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Moeda">
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Incoterm">
            <input value={incoterm} onChange={(e) => setIncoterm(e.target.value)} className={inputClass} />
          </Field>
          <Field label="NCM">
            <input value={ncm} onChange={(e) => setNcm(e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Comprador (SOLD TO)</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Nome / Razão social">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="CNPJ/Tax ID">
              <input value={customerTaxId} onChange={(e) => setCustomerTaxId(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Cidade">
              <input value={customerCity} onChange={(e) => setCustomerCity(e.target.value)} className={inputClass} />
            </Field>
            {addressLines.map((line, idx) => (
              <Field key={idx} label={`Endereço (linha ${idx + 1})`}>
                <input
                  value={line}
                  onChange={(e) =>
                    setAddressLines((prev) => prev.map((l, i) => (i === idx ? e.target.value : l)))
                  }
                  className={inputClass}
                />
              </Field>
            ))}
            <Field label="País">
              <input value={customerCountry} onChange={(e) => setCustomerCountry(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Itens</p>
            <button type="button" onClick={addItem} className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-600">
              + Adicionar linha
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-xs">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="p-1">LN</th>
                  <th className="p-1">Código</th>
                  <th className="p-1">Descrição</th>
                  <th className="p-1">Qtd</th>
                  <th className="p-1">UoM</th>
                  <th className="p-1">Preço</th>
                  <th className="p-1">N.W. (kg)</th>
                  <th className="p-1">G.W. (kg)</th>
                  <th className="p-1">Caixas</th>
                  <th className="p-1">Dim (cm)</th>
                  <th className="p-1"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-1">{item.lineNo}</td>
                    <td className="p-1">
                      <input value={item.itemCode} onChange={(e) => updateItem(item.id, { itemCode: e.target.value })} className={cellClass} />
                    </td>
                    <td className="p-1">
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        className={`${cellClass} min-w-[180px]`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) })}
                        className={`${cellClass} w-16`}
                      />
                    </td>
                    <td className="p-1">
                      <input value={item.uom} onChange={(e) => updateItem(item.id, { uom: e.target.value })} className={`${cellClass} w-14`} />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                        className={`${cellClass} w-20`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        step="0.01"
                        value={item.netWeightKg ?? ''}
                        onChange={(e) => updateItem(item.id, { netWeightKg: e.target.value ? Number(e.target.value) : null })}
                        className={`${cellClass} w-20`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        step="0.01"
                        value={item.grossWeightKg ?? ''}
                        onChange={(e) => updateItem(item.id, { grossWeightKg: e.target.value ? Number(e.target.value) : null })}
                        className={`${cellClass} w-20`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={item.boxes ?? ''}
                        onChange={(e) => updateItem(item.id, { boxes: e.target.value ? Number(e.target.value) : null })}
                        className={`${cellClass} w-16`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        value={item.dimensions ?? ''}
                        onChange={(e) => updateItem(item.id, { dimensions: e.target.value })}
                        className={`${cellClass} w-24`}
                      />
                    </td>
                    <td className="p-1">
                      <button type="button" onClick={() => removeItem(item.id)} className="text-red-500">
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
            Total: {currency} {total.toFixed(2)}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50">
            Salvar
          </button>
        </div>
      </form>
    </Card>
  );
}

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800';
const cellClass = 'w-full rounded border border-slate-200 px-1.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm">
      {label}
      {children}
    </label>
  );
}
