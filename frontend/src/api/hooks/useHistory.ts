import { useQuery } from '@tanstack/react-query';

import apiClient from '../../services/apiClient';
import type { DatePreset } from '../../shared/utils/exportData';

const fetchHistory = async (
  endpoint: string,
  params: Record<string, unknown> = {}
) => {
  const res = await apiClient.get(`/history/${endpoint}`, { params });
  return res.data;
};

export interface HistoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  preset?: DatePreset;
  startDate?: string;
  endDate?: string;
  status?: string;
  branchId?: string;
  module?: string;
  level?: string;
  [key: string]: unknown;
}

export const useHistoryQuery = (
  endpoint: string,
  params: HistoryQueryParams = {}
) => {
  return useQuery({
    queryKey: ['history', endpoint, params],
    queryFn: () => fetchHistory(endpoint, params),
    staleTime: 2 * 60 * 1000,
  });
};
