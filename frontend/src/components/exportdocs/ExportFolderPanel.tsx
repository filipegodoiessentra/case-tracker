// Painel de "Pasta de Exportação": vincula uma pasta local (cliente/exportação)
// ao caso via File System Access API e permite navegar/abrir arquivos e
// registrá-los no histórico do caso, sem copiá-los (só referência).
import { useEffect, useState } from 'react';
import { Card } from '../common/Card';
import {
  clearCaseFolderHandle,
  getCaseFolderHandle,
  isFileSystemAccessSupported,
  listFolder,
  openFileInNewTab,
  pickRootFolder,
  setCaseFolderHandle,
  verifyPermission,
  type FolderEntry,
} from '../../store/fsAccess';
import { casesApi } from '../../api/casesApi';
import type { LinkedFile } from '../../types/domain';

interface Props {
  caseId: string;
  onLinked?: () => void;
}

export function ExportFolderPanel({ caseId, onLinked }: Props) {
  const supported = isFileSystemAccessSupported();
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [pathStack, setPathStack] = useState<{ name: string; handle: FileSystemDirectoryHandle }[]>([]);
  const [entries, setEntries] = useState<FolderEntry[]>([]);
  const [linkedFiles, setLinkedFiles] = useState<LinkedFile[]>([]);
  const [folderPath, setFolderPath] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const link = await casesApi.getCaseFolderLink(caseId);
    setFolderPath(link?.folderPath ?? []);
    setLinkedFiles(await casesApi.listLinkedFiles(caseId));
    if (!link) {
      setFolderHandle(null);
      setPathStack([]);
      setEntries([]);
      return;
    }
    try {
      const handle = await getCaseFolderHandle(caseId);
      if (!handle) return;
      const ok = await verifyPermission(handle);
      if (!ok) {
        setError('Permissão de acesso à pasta expirou — clique em "Reconectar pasta".');
        return;
      }
      setFolderHandle(handle);
      setPathStack([{ name: link.folderPath[link.folderPath.length - 1] ?? handle.name, handle }]);
      setEntries(await listFolder(handle));
    } catch {
      setError('Não foi possível reabrir a pasta vinculada. Reconecte-a.');
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function handleLinkFolder() {
    setError(null);
    setLoading(true);
    try {
      const root = await pickRootFolder();
      await setCaseFolderHandle(caseId, root);
      await casesApi.setCaseFolderLink(caseId, [root.name]);
      onLinked?.();
      await reload();
    } catch {
      // usuário cancelou o seletor de pasta — não é um erro.
    } finally {
      setLoading(false);
    }
  }

  async function handleReconnect() {
    setError(null);
    setLoading(true);
    try {
      const handle = await getCaseFolderHandle(caseId);
      if (handle && (await verifyPermission(handle))) {
        await reload();
      } else {
        setError('Ainda sem permissão. Clique em "Trocar pasta" para selecionar novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink() {
    await clearCaseFolderHandle(caseId);
    await casesApi.clearCaseFolderLink(caseId);
    await reload();
  }

  async function openSubfolder(entry: FolderEntry) {
    if (entry.kind !== 'directory') return;
    const handle = entry.handle as FileSystemDirectoryHandle;
    const newStack = [...pathStack, { name: entry.name, handle }];
    setPathStack(newStack);
    setEntries(await listFolder(handle));
  }

  async function goToBreadcrumb(index: number) {
    const target = pathStack[index];
    setPathStack(pathStack.slice(0, index + 1));
    setEntries(await listFolder(target.handle));
  }

  async function handleOpenFile(entry: FolderEntry) {
    await openFileInNewTab(entry.handle as FileSystemFileHandle);
  }

  async function handleLinkFile(entry: FolderEntry) {
    const relativePath = [...pathStack.slice(1).map((p) => p.name), entry.name].join('/') || entry.name;
    await casesApi.addLinkedFile(caseId, entry.name, relativePath);
    setLinkedFiles(await casesApi.listLinkedFiles(caseId));
  }

  async function handleRemoveLinkedFile(id: string) {
    await casesApi.removeLinkedFile(id);
    setLinkedFiles(await casesApi.listLinkedFiles(caseId));
  }

  if (!supported) {
    return (
      <Card>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Este recurso usa a API de acesso ao sistema de arquivos do navegador e funciona apenas no Edge ou Chrome (desktop).
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pasta de exportação vinculada</p>
            <p className="text-xs text-slate-400">{folderPath.length > 0 ? folderPath.join(' / ') : 'Nenhuma pasta vinculada a este caso.'}</p>
          </div>
          <div className="flex gap-2">
            {folderPath.length === 0 ? (
              <button
                onClick={handleLinkFolder}
                disabled={loading}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Selecionar pasta do cliente
              </button>
            ) : (
              <>
                <button
                  onClick={handleReconnect}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
                >
                  Reconectar pasta
                </button>
                <button
                  onClick={handleLinkFolder}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
                >
                  Trocar pasta
                </button>
                <button onClick={handleUnlink} className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600">
                  Desvincular
                </button>
              </>
            )}
          </div>
        </div>
        {error && <p className="text-xs text-amber-600">{error}</p>}
      </Card>

      {folderHandle && (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
            {pathStack.map((p, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <button onClick={() => goToBreadcrumb(i)} className="hover:underline">
                  {p.name}
                </button>
              </span>
            ))}
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {entries.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between gap-2 py-2 text-sm">
                {entry.kind === 'directory' ? (
                  <button onClick={() => openSubfolder(entry)} className="flex-1 text-left font-medium text-brand-600 hover:underline">
                    📁 {entry.name}
                  </button>
                ) : (
                  <button onClick={() => handleOpenFile(entry)} className="flex-1 text-left hover:underline">
                    📄 {entry.name}
                  </button>
                )}
                {entry.kind === 'file' && (
                  <button
                    onClick={() => handleLinkFile(entry)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                  >
                    Vincular ao histórico
                  </button>
                )}
              </li>
            ))}
            {entries.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Pasta vazia.</p>}
          </ul>
        </Card>
      )}

      <Card className="space-y-2">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Arquivos vinculados ao caso</p>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {linkedFiles.map((f) => (
            <li key={f.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {f.relativePath}
                <span className="ml-2 text-xs text-slate-400">{new Date(f.addedAt).toLocaleDateString('pt-BR')}</span>
              </span>
              <button onClick={() => handleRemoveLinkedFile(f.id)} className="text-xs text-red-500 hover:underline">
                Remover
              </button>
            </li>
          ))}
          {linkedFiles.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Nenhum arquivo vinculado ainda.</p>}
        </ul>
      </Card>
    </div>
  );
}
