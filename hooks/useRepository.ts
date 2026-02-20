// Hook personalizado para React
// hooks/useRepository.ts

import { BaseRepository } from '@/lib/mongodb-base-repository';
import { useState, useCallback, useEffect } from 'react';

export function useRepository<T extends Document>(repository: BaseRepository<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (filter = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await repository.find(filter);
      setData(result as T[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create: async (item: Partial<T>) => {
      const result = await repository.create(item as any);
      fetchData(); // Recarrega os dados
      return result;
    },
    update: async (id: string, updates: Partial<T>) => {
      const result = await repository.updateById(id, updates);
      fetchData();
      return result;
    },
    remove: async (id: string) => {
      const success = await repository.deleteById(id);
      if (success) fetchData();
      return success;
    },
  };
}