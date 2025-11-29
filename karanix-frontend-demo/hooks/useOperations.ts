import useSWR from 'swr';
import { apiFetch, Operation } from '../lib/api';
import { useAuth } from '../components/AuthProvider';

export const useOperations = (date?: string) => {
  const { guide, loading: authLoading } = useAuth();
  const token = guide?.token;
  const query = date ? `?date=${date}` : '';
  const key = token ? `/api/operations${query}` : null;
  const { data, error, isValidating, mutate } = useSWR<Operation[]>(
    key,
    (path: string) => apiFetch<Operation[]>(path, { token })
  );

  return {
    operations: data || [],
    isLoading: authLoading || (!data && !error),
    isValidating,
    error,
    refresh: mutate
  };
};
