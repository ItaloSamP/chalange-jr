'use client';

import { useCallback, useEffect, useState } from 'react';
import { clientsApi } from '@/lib/api';
import { Client, ListClientsFilters } from '@/lib/types';

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  filters: ListClientsFilters;
  pagination: Pagination;
  fetchClients: (filters?: ListClientsFilters) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ListClientsFilters>) => void;
  setPage: (page: number) => void;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ListClientsFilters>({ page: 1, limit: 10 });
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10 });

  const fetchClients = useCallback(async (f?: ListClientsFilters) => {
    const queryFilters = f || filters;
    setLoading(true);
    setError(null);
    try {
      const result = await clientsApi.list(queryFilters);
      setClients(result.items);
      setPagination({ total: result.total, page: result.page, limit: result.limit });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchClients();
  }, []); // initial fetch only — fetchClients is called on filter/page change

  const removeClient = useCallback(async (id: string) => {
    setError(null);
    try {
      await clientsApi.remove(id);
      // Remove from local state and update pagination
      setClients(prev => prev.filter(c => c.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      throw err; // let caller handle UI feedback
    }
  }, []);

  const setFilters = useCallback((partial: Partial<ListClientsFilters>) => {
    setFiltersState(prev => {
      const newFilters = { ...prev, ...partial, page: 1 }; // reset to page 1
      // Trigger fetch with new filters (via timeout to allow state update)
      setTimeout(() => fetchClients(newFilters), 0);
      return newFilters;
    });
  }, [fetchClients]);

  const setPage = useCallback((page: number) => {
    setFiltersState(prev => {
      const newFilters = { ...prev, page };
      setTimeout(() => fetchClients(newFilters), 0);
      return newFilters;
    });
  }, [fetchClients]);

  return { clients, loading, error, filters, pagination, fetchClients, removeClient, setFilters, setPage };
}
