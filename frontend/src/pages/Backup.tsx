import { useRef, useState } from 'react';
import { localStore } from '../store/localStore';
import { Card } from '../components/common/Card';

export function Backup() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleExport() {
    const json = localStore.exportSnapshot();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      localStore.importSnapshot(text);
      setMessage('Backup importado com sucesso. Recarregando...');
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setMessage('Não foi possível ler o arquivo — verifique se é um backup JSON válido gerado por este app.');
    } finally {
      e.target.value = '';
    }
  }

  function handleReset() {
    if (!confirm('Isso substitui todos os dados atuais pelos dados de demonstração originais. Continuar?')) return;
    localStore.resetToDemoData();
    setMessage('Dados resetados para a demonstração original. Recarregando...');
    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Backup de Dados</h1>
      <Card className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
        <p>
          Este app roda 100% no navegador: todos os casos, artigos e processos ficam salvos em <code>localStorage</code>. Não há
          servidor nem banco de dados — por isso é importante exportar um backup em JSON periodicamente (e antes de limpar o
          cache do navegador).
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Exportar backup (JSON)</h2>
        <p className="text-sm text-slate-500">Baixa um arquivo com todos os dados atuais.</p>
        <button onClick={handleExport} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Exportar JSON
        </button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Importar backup (JSON)</h2>
        <p className="text-sm text-slate-500">Substitui os dados atuais pelo conteúdo do arquivo selecionado.</p>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
        <button
          onClick={handleImportClick}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          Selecionar arquivo...
        </button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Restaurar dados de demonstração</h2>
        <p className="text-sm text-slate-500">Descarta as alterações atuais e volta ao conjunto de dados original de exemplo.</p>
        <button onClick={handleReset} className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
          Resetar para dados demo
        </button>
      </Card>

      {message && <p className="text-sm text-emerald-600">{message}</p>}
    </div>
  );
}
