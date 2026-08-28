// Gera Proforma / Commercial Invoice / Packing List em .xlsx no mesmo layout
// usado hoje manualmente (ver "PROFORMA .xlsx"), 100% no navegador via SheetJS.
// Vendedor é sempre a Essentra Brasil; comprador vem dos dados do documento.
import * as XLSX from 'xlsx';
import type { ExportDocument } from '../types/domain';

const SELLER_NAME = 'ESSENTRA INDÚSTRIA E COMÉRCIO LTDA';
const SELLER_ADDRESS = 'AV EMÍLIO MARCONATO, 1000 GL R18A';
const SELLER_CITY = 'JAGUARIUNA SP BRAZIL';
const SELLER_ZIP = 'ZIP CODE: 13820-000';
const SELLER_CNPJ = 'CNPJ: 56.993.074/0010-11';

const ITEM_ROWS = 9; // linhas de item disponíveis no layout (16..24), igual ao modelo original.
const INVOICE_FIRST_ITEM_ROW = 16;

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR');
}

function buildInvoiceSheet(doc: ExportDocument): XLSX.WorkSheet {
  const title = doc.stage === 'PROFORMA' ? 'PROFORMA INVOICE' : 'COMMERCIAL INVOICE';
  const rows: unknown[][] = [];
  rows[0] = [];
  rows[0][3] = SELLER_NAME; // D1
  rows[0][7] = 'INVOICE #'; // H1
  rows[0][8] = doc.invoiceNumber; // I1
  rows[1] = [];
  rows[1][3] = SELLER_ADDRESS;
  rows[1][7] = 'INVOICE DATE';
  rows[1][8] = formatDate(doc.invoiceDate);
  rows[2] = [];
  rows[2][3] = SELLER_CITY;
  rows[2][7] = 'CUSTOMER ID';
  rows[2][8] = doc.customerTaxId ?? '';
  rows[3] = [];
  rows[3][3] = SELLER_ZIP;
  rows[3][7] = 'CURRENCY';
  rows[3][8] = doc.currency;
  rows[4] = [];
  rows[4][3] = SELLER_CNPJ;
  rows[5] = [];
  rows[6] = [];
  rows[6][2] = title; // C7
  rows[7] = [];
  rows[7][0] = 'SOLD TO:'; // A8
  rows[8] = [];
  rows[8][0] = doc.customerName; // A9
  rows[9] = [doc.customerAddressLines[0] ?? '']; // A10
  rows[9][5] = doc.stage === 'PROFORMA' ? 'NO COMMERCIAL VALUE' : ''; // F10
  rows[10] = [doc.customerAddressLines[1] ?? '']; // A11
  rows[11] = [doc.customerAddressLines[2] ?? '']; // A12
  rows[12] = [doc.customerCity ?? '']; // A13
  rows[13] = [doc.customerCountry ?? '']; // A14
  rows[14] = ['LN', 'ITEM', 'DESCRIPTION', '', '', 'QTY', 'UoM', 'PRICE', 'TOTAL']; // A15..I15 header

  doc.items.slice(0, ITEM_ROWS).forEach((item, i) => {
    rows[15 + i] = [item.lineNo, item.itemCode, item.description, '', '', item.qty, item.uom, item.price];
  });

  const totalRowIndex = 24; // linha 25 (0-based 24)
  rows[totalRowIndex] = [];
  rows[totalRowIndex][7] = 'TOTAL'; // H25
  rows[25] = [];
  rows[25][1] = `NCM: ${doc.ncm ?? ''}`;
  rows[26] = [];
  rows[26][1] = `INCOTERM: ${doc.incoterm}`;

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Fórmulas de total por linha e total geral, iguais ao modelo original (F*H e SUM).
  doc.items.slice(0, ITEM_ROWS).forEach((_, i) => {
    const r = INVOICE_FIRST_ITEM_ROW + i;
    XLSX.utils.sheet_add_aoa(ws, [[{ t: 'n', f: `F${r}*H${r}` }]], { origin: `I${r}` });
  });
  const lastItemRow = INVOICE_FIRST_ITEM_ROW + Math.min(doc.items.length, ITEM_ROWS) - 1;
  XLSX.utils.sheet_add_aoa(ws, [[{ t: 'n', f: `SUM(I${INVOICE_FIRST_ITEM_ROW}:I${Math.max(lastItemRow, INVOICE_FIRST_ITEM_ROW)})` }]], {
    origin: 'I25',
  });

  ws['!merges'] = [
    { s: { r: 6, c: 2 }, e: { r: 6, c: 7 } }, // C7:H7
    { s: { r: 8, c: 0 }, e: { r: 8, c: 4 } }, // A9 (nome do cliente) — largura confortável
    { s: { r: 14, c: 2 }, e: { r: 14, c: 4 } }, // C15:E15 (DESCRIPTION)
    ...doc.items.slice(0, ITEM_ROWS).map((_, i) => ({ s: { r: 15 + i, c: 2 }, e: { r: 15 + i, c: 4 } })),
  ];
  ws['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 8 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
  ];
  return ws;
}

function buildPackingListSheet(doc: ExportDocument): XLSX.WorkSheet {
  const rows: unknown[][] = [];
  rows[0] = [];
  rows[0][3] = SELLER_NAME;
  rows[0][6] = 'INVOICE #';
  rows[0][8] = doc.invoiceNumber;
  rows[1] = [];
  rows[1][3] = SELLER_ADDRESS;
  rows[1][6] = 'INVOICE DATE';
  rows[1][8] = formatDate(doc.invoiceDate);
  rows[2] = [];
  rows[2][3] = SELLER_CITY;
  rows[2][6] = 'CUSTOMER ID';
  rows[2][8] = doc.customerTaxId ?? '';
  rows[3] = [];
  rows[3][3] = SELLER_ZIP;
  rows[4] = [doc.customerAddressLines[0] ?? ''];
  rows[4][3] = SELLER_CNPJ;
  rows[7] = [];
  rows[7][3] = 'PACKING LIST'; // D8
  rows[8] = ['SOLD TO:'];
  rows[8][6] = 'SHIP TO:';
  rows[9] = [doc.customerName];
  rows[10] = [doc.customerAddressLines[1] ?? ''];
  rows[11] = [doc.customerAddressLines[2] ?? ''];
  rows[12] = [doc.customerCity ?? ''];
  rows[13] = [doc.customerCountry ?? ''];
  rows[15] = ['LN', 'ITEM', '', '', 'QTY', 'N.W. [KG]', 'G.W. [KG]', 'QTD BOX', 'DIM (CM)'];

  doc.items.slice(0, ITEM_ROWS).forEach((item, i) => {
    rows[16 + i] = [
      item.lineNo,
      item.itemCode,
      '',
      '',
      item.qty,
      item.netWeightKg ?? '',
      item.grossWeightKg ?? '',
      item.boxes ?? '',
      item.dimensions ?? '',
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!merges'] = [
    { s: { r: 7, c: 3 }, e: { r: 7, c: 5 } }, // D8:F8
    ...doc.items.slice(0, ITEM_ROWS).map((_, i) => ({ s: { r: 16 + i, c: 1 }, e: { r: 16 + i, c: 3 } })),
  ];
  ws['!cols'] = [{ wch: 5 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
  return ws;
}

export function buildExportWorkbook(doc: ExportDocument): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const invoiceSheetName = doc.stage === 'PROFORMA' ? 'PROFORMA INVOICE' : 'COMMERCIAL INVOICE';
  XLSX.utils.book_append_sheet(wb, buildInvoiceSheet(doc), invoiceSheetName);
  if (doc.stage === 'COMMERCIAL_INVOICE') {
    XLSX.utils.book_append_sheet(wb, buildPackingListSheet(doc), 'Packing List');
  }
  return wb;
}

export function downloadExportDocument(doc: ExportDocument) {
  const wb = buildExportWorkbook(doc);
  const label = doc.stage === 'PROFORMA' ? 'Proforma' : 'Commercial-Invoice-Packing-List';
  XLSX.writeFile(wb, `${label}-${doc.invoiceNumber}.xlsx`);
}
