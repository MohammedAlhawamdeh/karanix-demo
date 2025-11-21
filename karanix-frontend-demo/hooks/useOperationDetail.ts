import useSWR from 'swr';
import { apiFetch, Operation } from '../lib/api';

export const useOperationDetail = (id?: string) => {
  const { data, error, isValidating, mutate } = useSWR<Operation>(
    id ? `/api/operations/${id}` : null,
    (path: string) => apiFetch<Operation>(path)
  );

  return {
    operation: data,
    isLoading: !data && !error,
    isValidating,
    error,
    refresh: mutate
  };
};
