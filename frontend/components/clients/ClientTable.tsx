'use client';

import Link from 'next/link';
import { Client, ClientStatus } from '@/lib/types';
import StatusBadge from './StatusBadge';

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className="size-4">
    <path
      d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 4l2 2" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className="size-4">
    <path
      d="M2.5 4h11M5.5 4V2.5h5V4M6.5 7v4M9.5 7v4M3.5 4l.75 9.5h7.5l.75-9.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClientsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="size-12">
    <circle cx="24" cy="24" r="24" fill="#f4f4f5" />
    <path
      d="M16 28v4a2 2 0 002 2h12a2 2 0 002-2v-4M20 20a4 4 0 118 0M18 34h12"
      stroke="#a1a1aa"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

interface ClientTableProps {
  clients: Client[];
  loading: boolean;
  error: string | null;
  onDelete: (client: Client) => void;
  onEdit: (id: string) => void;
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export default function ClientTable({
  clients,
  loading,
  error,
  onDelete,
  onEdit,
  pagination,
  onPageChange,
}: ClientTableProps) {
  // --- Loading state ---
  if (loading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 grid grid-cols-6 gap-4">
          {['Nome', 'Email', 'Telefone', 'Documento', 'Status', 'Ações'].map((col) => (
            <span
              key={col}
              className="text-xs font-semibold text-zinc-500 uppercase tracking-wider"
            >
              {col}
            </span>
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-zinc-100">
            <div className="h-4 animate-pulse bg-zinc-200 rounded" />
            <div className="h-4 animate-pulse bg-zinc-200 rounded" />
            <div className="h-4 animate-pulse bg-zinc-200 rounded" />
            <div className="h-4 animate-pulse bg-zinc-200 rounded" />
            <div className="h-4 animate-pulse bg-zinc-200 rounded" />
            <div className="h-4 animate-pulse bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
        <p className="text-red-600 text-sm font-medium">{error}</p>
        <button
          onClick={() => onPageChange(pagination.page)}
          className="mt-4 h-[38px] px-4 py-2 font-medium text-sm rounded-lg bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // --- Empty state ---
  if (clients.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-12 flex flex-col items-center text-center">
        <ClientsIcon />
        <h3 className="mt-4 text-lg font-semibold text-zinc-900">Nenhum cliente encontrado</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Comece cadastrando seu primeiro cliente.
        </p>
        <Link
          href="/clients/new"
          className="mt-6 h-[38px] px-4 py-2 font-medium text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors inline-flex items-center"
        >
          Cadastrar primeiro cliente
        </Link>
      </div>
    );
  }

  // --- Table ---
  const { total, page, limit } = pagination;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr_1fr] gap-4">
        {['Nome', 'Email', 'Telefone', 'Documento', 'Status', 'Ações'].map((col) => (
          <span
            key={col}
            className="text-xs font-semibold text-zinc-500 uppercase tracking-wider"
          >
            {col}
          </span>
        ))}
      </div>

      {/* Table body */}
      {clients.map((client) => {
        const isInactive = client.status === ClientStatus.INACTIVE;

        return (
          <div
            key={client.id}
            className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-4 py-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors items-center"
          >
            <span className="font-medium text-zinc-900 text-sm truncate">{client.nome}</span>
            <span className="text-zinc-500 text-sm truncate">{client.email}</span>
            <span className="text-zinc-500 text-sm truncate">{client.telefone}</span>
            <span className="font-mono text-zinc-500 text-sm truncate">{client.documento}</span>
            <span>
              <StatusBadge status={client.status} />
            </span>
            <span className="flex gap-1">
              {isInactive ? (
                <span className="p-1.5 rounded-lg text-zinc-500 opacity-30 cursor-not-allowed">
                  <PencilIcon />
                </span>
              ) : (
                <button
                  onClick={() => onEdit(client.id)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
                  aria-label={`Editar ${client.nome}`}
                >
                  <PencilIcon />
                </button>
              )}
              <button
                onClick={() => onDelete(client)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                aria-label={`Excluir ${client.nome}`}
              >
                <TrashIcon />
              </button>
            </span>
          </div>
        );
      })}

      {/* Pagination footer */}
      <div className="bg-zinc-50 border-t border-zinc-200 px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          Mostrando {start}–{end} de {total} clientes
        </span>
        <nav className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-[38px] px-3 py-2 font-medium text-sm rounded-lg bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 transition-colors disabled:opacity-40"
          >
            ← Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-[38px] w-[38px] font-medium text-sm rounded-lg border transition-colors ${
                p === page
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-[38px] px-3 py-2 font-medium text-sm rounded-lg bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 transition-colors disabled:opacity-40"
          >
            Próximo →
          </button>
        </nav>
      </div>
    </div>
  );
}
