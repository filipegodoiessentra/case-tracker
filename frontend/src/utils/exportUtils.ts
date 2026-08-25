// Exportação de dados para CSV/Excel — usa SheetJS (xlsx), 100% no navegador.
import * as XLSX from 'xlsx';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv<T extends object>(filename: string, rows: T[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export function exportToXlsx<T extends object>(filename: string, rows: T[], sheetName = 'Dados') {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
