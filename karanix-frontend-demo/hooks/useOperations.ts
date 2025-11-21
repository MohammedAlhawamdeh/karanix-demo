import useSWR from 'swr';
import { apiFetch, Operation } from '../lib/api';

export const useOperations = (date?: string) => {
  const query = date ? `?date=${date}` : '';
  const { data, error, isValidating, mutate } = useSWR<Operation[]>(
    `/api/operations${query}`,
    (path: string) => apiFetch<Operation[]>(path)
  );

  return {
    operations: data || [],
    isLoading: !data && !error,
    isValidating,
    error,
    refresh: mutate
  };
};
