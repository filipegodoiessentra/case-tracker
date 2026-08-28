// Acesso à pasta local de exportação via File System Access API (Edge/Chrome).
// Os handles (não serializáveis em JSON/localStorage) ficam em um IndexedDB
// próprio; o localStore guarda só metadados (nomes/caminhos) para exibição.
const DB_NAME = 'case-tracker-fs';
const DB_VERSION = 1;
const STORE = 'handles';
const ROOT_KEY = 'root';

export function isFileSystemAccessSupported() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function caseFolderKey(caseId: string) {
  return `case-folder:${caseId}`;
}

export async function verifyPermission(handle: FileSystemHandle, mode: 'read' | 'readwrite' = 'read') {
  const opts = { mode };
  // @ts-expect-error — queryPermission/requestPermission ainda não estão no lib.dom padrão em todas as versões do TS.
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  // @ts-expect-error — idem.
  return (await handle.requestPermission(opts)) === 'granted';
}

export async function pickRootFolder(): Promise<FileSystemDirectoryHandle> {
  // @ts-expect-error — showDirectoryPicker pode não estar tipado em libs mais antigas.
  const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker({ id: 'case-tracker-export-root' });
  await idbSet(ROOT_KEY, handle);
  return handle;
}

export async function getRootFolder(): Promise<FileSystemDirectoryHandle | undefined> {
  return idbGet<FileSystemDirectoryHandle>(ROOT_KEY);
}

export async function clearRootFolder(): Promise<void> {
  await idbDelete(ROOT_KEY);
}

export async function setCaseFolderHandle(caseId: string, handle: FileSystemDirectoryHandle): Promise<void> {
  await idbSet(caseFolderKey(caseId), handle);
}

export async function getCaseFolderHandle(caseId: string): Promise<FileSystemDirectoryHandle | undefined> {
  return idbGet<FileSystemDirectoryHandle>(caseFolderKey(caseId));
}

export async function clearCaseFolderHandle(caseId: string): Promise<void> {
  await idbDelete(caseFolderKey(caseId));
}

export interface FolderEntry {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemHandle;
}

export async function listFolder(handle: FileSystemDirectoryHandle): Promise<FolderEntry[]> {
  const entries: FolderEntry[] = [];
  // @ts-expect-error — entries() do FileSystemDirectoryHandle é assíncrono e iterável.
  for await (const [name, entryHandle] of handle.entries()) {
    entries.push({ name, kind: entryHandle.kind, handle: entryHandle });
  }
  entries.sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'directory' ? -1 : 1));
  return entries;
}

export async function openFileInNewTab(handle: FileSystemFileHandle) {
  const file = await handle.getFile();
  const url = URL.createObjectURL(file);
  window.open(url, '_blank', 'noopener,noreferrer');
  // O objectURL é liberado depois de um tempo — a aba aberta já terá carregado o conteúdo.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
