import { localStore } from '../store/localStore';
import type { DashboardData } from '../types/domain';

export const dashboardApi = {
  get: async (): Promise<DashboardData> => localStore.getDashboardData(),
};
