'use client';

import { ClientStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ClientStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === ClientStatus.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-zinc-500'}`}
      />
      {isActive ? 'Ativo' : 'Inativo'}
    </span>
  );
}
