export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Client {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  status: ClientStatus;
  createdAt: string;
}

export interface CreateClientPayload {
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  status?: ClientStatus;
}

export type UpdateClientPayload = Partial<CreateClientPayload>;

export interface ListClientsFilters {
  nome?: string;
  email?: string;
  status?: ClientStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
