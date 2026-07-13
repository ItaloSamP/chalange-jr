import { ApiError, Client, CreateClientPayload, ListClientsFilters, PaginatedResponse, UpdateClientPayload } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let body: { message?: string; error?: string; statusCode?: number };
    try {
      body = await res.json();
    } catch {
      throw new ApiError(res.status, 'Erro ao conectar com o servidor');
    }
    throw new ApiError(
      body.statusCode || res.status,
      body.message || 'Erro ao conectar com o servidor',
      body.error,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function buildQueryString(filters?: ListClientsFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.nome) params.set('nome', filters.nome);
  if (filters.email) params.set('email', filters.email);
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const clientsApi = {
  async list(filters?: ListClientsFilters): Promise<PaginatedResponse<Client>> {
    return request<PaginatedResponse<Client>>(`/clients${buildQueryString(filters)}`);
  },

  async getById(id: string): Promise<Client> {
    return request<Client>(`/clients/${id}`);
  },

  async create(payload: CreateClientPayload): Promise<Client> {
    return request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: UpdateClientPayload): Promise<Client> {
    return request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async remove(id: string): Promise<void> {
    return request<void>(`/clients/${id}`, { method: 'DELETE' });
  },
};
