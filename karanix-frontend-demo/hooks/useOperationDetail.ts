import useSWR from 'swr';
import { apiFetch, Operation } from '../lib/api';
import { useAuth } from '../components/AuthProvider';

export const useOperationDetail = (id?: string) => {
  const { guide, loading: authLoading } = useAuth();
  const token = guide?.token;
  const { data, error, isValidating, mutate } = useSWR<Operation>(
    id && token ? `/api/operations/${id}` : null,
    (path: string) => apiFetch<Operation>(path, { token })
  );

  return {
    operation: data,
    isLoading: authLoading || (!data && !error),
    isValidating,
    error,
    refresh: mutate
  };
};
