import { localStore } from '../store/localStore';
import type { ProcessDoc } from '../types/domain';

export const processesApi = {
  list: async (params: { q?: string; category?: string } = {}) => localStore.listProcesses(params),
  get: async (id: string) => {
    const found = localStore.getProcess(id);
    if (!found) throw new Error('Processo não encontrado.');
    return found;
  },
};
