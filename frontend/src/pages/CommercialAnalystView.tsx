import { useEffect, useState } from 'react';
import { casesApi } from '../api/casesApi';
import { Card } from '../components/common/Card';
import { DataTable, type Column } from '../components/table/DataTable';
import type { Case } from '../types/domain';

// Visão especializada para o Analista Comercial, com campos operacionais
// adicionais (SO/PO, material, incoterm, tracking) que normalmente não
// aparecem na lista padrão de casos.
export function CommercialAnalystView() {
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    casesApi.list({ type: 'EXPORT_BRAZIL' }).then(setCases);
  }, []);

  const columns: Column<Case>[] = [
    { header: 'Nº do Caso', render: (c) => c.caseNumber },
    { header: 'Cliente', render: (c) => c.customerName ?? '—' },
    { header: 'Sales Order', render: (c) => c.salesOrder ?? '—' },
    { header: 'Purchase Order', render: (c) => c.purchaseOrder ?? '—' },
    { header: 'Material', render: (c) => c.material ?? '—' },
    { header: 'Part Number', render: (c) => c.partNumber ?? '—' },
    { header: 'Incoterm', render: (c) => c.incoterm ?? '—' },
    { header: 'Ship From', render: (c) => c.shipFrom ?? '—' },
    { header: 'Ship To', render: (c) => c.shipTo ?? '—' },
    { header: 'Tracking', render: (c) => c.tracking ?? '—' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Modo Analista Comercial</h1>
      <Card>
        <p className="text-sm text-slate-500">
          Exibe campos adicionais de exportação (pedido, material, incoterm, tracking) para os casos do tipo Exportação
          Brasil / Direct Shipment.
        </p>
      </Card>
      <DataTable columns={columns} rows={cases} keyExtractor={(c) => c.id} />
    </div>
  );
}
