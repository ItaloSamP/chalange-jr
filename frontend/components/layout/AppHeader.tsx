'use client';

import Link from 'next/link';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className="size-4">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function AppHeader() {
  return (
    <header className="flex items-center justify-between py-6 border-b border-zinc-200">
      <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
        <span className="size-2 bg-indigo-600 rounded-full inline-block" />
        Gerenciamento de Clientes
      </h1>
      <Link
        href="/clients/new"
        className="bg-indigo-600 text-white h-[38px] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
      >
        <PlusIcon />
        Novo Cliente
      </Link>
    </header>
  );
}
