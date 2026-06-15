import { useQuery } from '@tanstack/react-query';

const fetchHistory = async (endpoint: string, params: Record<string, any> = {}) => {
  const token = localStorage.getItem('token');
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const res = await fetch(`http://localhost:5000/api/v1/history/${endpoint}?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint} history`);
  }
  return res.json();
};

export const useHistoryQuery = (endpoint: string, params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['history', endpoint, params],
    queryFn: () => fetchHistory(endpoint, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
