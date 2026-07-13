'use client';

import { ListClientsFilters, ClientStatus } from '@/lib/types';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className="size-4">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className="size-4">
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ClientFiltersProps {
  filters: ListClientsFilters;
  onChange: (filters: ListClientsFilters) => void;
  onSearch: () => void;
  loading?: boolean;
}

export default function ClientFilters({
  filters,
  onChange,
  onSearch,
  loading = false,
}: ClientFiltersProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4">
      <div className="flex items-end gap-3 flex-wrap">
        {/* Nome */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium uppercase text-zinc-500 mb-1">Nome</label>
          <input
            type="text"
            value={filters.nome ?? ''}
            onChange={(e) => onChange({ ...filters, nome: e.target.value || undefined })}
            placeholder="Buscar por nome..."
            className="w-full h-9 px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium uppercase text-zinc-500 mb-1">Email</label>
          <input
            type="text"
            value={filters.email ?? ''}
            onChange={(e) => onChange({ ...filters, email: e.target.value || undefined })}
            placeholder="Buscar por email..."
            className="w-full h-9 px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Status */}
        <div className="w-[160px]">
          <label className="block text-xs font-medium uppercase text-zinc-500 mb-1">Status</label>
          <div className="relative">
            <select
              value={filters.status ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  status: e.target.value ? (e.target.value as ClientStatus) : undefined,
                })
              }
              className="w-full h-9 px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none appearance-none pr-8"
            >
              <option value="">Todos</option>
              <option value={ClientStatus.ACTIVE}>Ativo</option>
              <option value={ClientStatus.INACTIVE}>Inativo</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={onSearch}
          disabled={loading}
          className="h-[38px] px-4 py-2 font-medium text-sm rounded-lg bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <SearchIcon />
          Buscar
        </button>
      </div>
    </div>
  );
}
