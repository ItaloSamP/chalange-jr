'use client';

import Link from 'next/link';
import { ClientStatus } from '@/lib/types';

const SpinnerIcon = () => (
  <svg
    className="animate-spin size-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
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

type FormValues = {
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  status: 'ACTIVE' | 'INACTIVE';
};

interface ClientFormProps {
  values: FormValues;
  errors: Record<string, string>;
  fieldErrors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  submitLabel: string;
  isEdit?: boolean;
  clientId?: string;
  createdAt?: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Shared input class builder
function inputClass(hasError: boolean): string {
  return `w-full h-9 px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none ${
    hasError
      ? 'border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500'
      : 'border-zinc-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500'
  }`;
}

const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-900 mb-1">
    {children}
  </label>
);

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className="text-red-600 text-xs mt-1">{message}</p>;
};

export default function ClientForm({
  values,
  errors,
  fieldErrors,
  onChange,
  onSubmit,
  loading,
  submitLabel,
  isEdit = false,
  clientId,
  createdAt,
}: ClientFormProps) {
  // Combine field errors and general error for display
  const displayErrors = { ...fieldErrors };
  // If there's a general error that likely applies to a specific field
  // (handled by the hook already mapping 409 to fields)

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-8 max-w-2xl mx-auto">
      {/* Edit metadata — only when editing */}
      {isEdit && clientId && (
        <div className="flex gap-6 text-xs text-zinc-400 border-b border-zinc-100 pb-3 mb-6">
          <span>
            ID: <span className="font-mono">{clientId}</span>
          </span>
          {createdAt && <span>Criado em: {formatDate(createdAt)}</span>}
        </div>
      )}

      {/* General error banner */}
      {errors.general && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4">
          {/* Nome — full width */}
          <div className="col-span-2">
            <Label htmlFor="nome">
              Nome <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <input
              id="nome"
              type="text"
              value={values.nome}
              onChange={(e) => onChange('nome', e.target.value)}
              className={inputClass(!!displayErrors.nome)}
              placeholder="Nome completo"
            />
            <FieldError message={displayErrors.nome} />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => onChange('email', e.target.value)}
              className={inputClass(!!displayErrors.email)}
              placeholder="cliente@exemplo.com"
            />
            <FieldError message={displayErrors.email} />
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="telefone">
              Telefone <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <input
              id="telefone"
              type="tel"
              value={values.telefone}
              onChange={(e) => onChange('telefone', e.target.value)}
              className={inputClass(!!displayErrors.telefone)}
              placeholder="(11) 99999-9999"
            />
            <FieldError message={displayErrors.telefone} />
            {!displayErrors.telefone && (
              <p className="text-xs text-zinc-400 mt-1">Formato: (DDD) 99999-9999</p>
            )}
          </div>

          {/* Documento */}
          <div>
            <Label htmlFor="documento">
              Documento <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <input
              id="documento"
              type="text"
              value={values.documento}
              onChange={(e) => onChange('documento', e.target.value)}
              className={inputClass(!!displayErrors.documento)}
              placeholder="123.456.789-00"
            />
            <FieldError message={displayErrors.documento} />
            {!displayErrors.documento && (
              <p className="text-xs text-zinc-400 mt-1">CPF ou CNPJ</p>
            )}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <div className="relative">
              <select
                id="status"
                value={values.status}
                onChange={(e) => onChange('status', e.target.value)}
                className={`${inputClass(false)} appearance-none pr-8`}
              >
                <option value={ClientStatus.ACTIVE}>Ativo</option>
                <option value={ClientStatus.INACTIVE}>Inativo</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <ChevronDownIcon />
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Clientes inativos não podem ser editados</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-zinc-200">
          <Link
            href="/clients"
            className="h-[38px] px-4 py-2 font-medium text-sm rounded-lg bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 transition-colors inline-flex items-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="h-[38px] px-4 py-2 font-medium text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <SpinnerIcon />}
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
