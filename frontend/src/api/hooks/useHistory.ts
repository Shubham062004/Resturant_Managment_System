import { useQuery } from '@tanstack/react-query';

import apiClient from '../../services/apiClient';

const fetchHistory = async (
  endpoint: string,
  params: Record<string, any> = {}
) => {
  const res = await apiClient.get(`/history/${endpoint}`, { params });
  return res.data;
};

export const useHistoryQuery = (
  endpoint: string,
  params: Record<string, any> = {}
) => {
  return useQuery({
    queryKey: ['history', endpoint, params],
    queryFn: () => fetchHistory(endpoint, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
