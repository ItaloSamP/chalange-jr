'use client';

import { useClientForm } from '@/hooks/useClientForm';
import AppHeader from '@/components/layout/AppHeader';
import ClientForm from '@/components/clients/ClientForm';
import FlashMessage from '@/components/clients/FlashMessage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className="size-4">
    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function NewClientPage() {
  const router = useRouter();
  const { values, loading, error, fieldErrors, setFieldValue, submit } = useClientForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) {
      router.push('/clients?created=true');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-0">
      <AppHeader />

      <div className="flex items-center gap-3 py-4">
        <Link href="/clients" className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
          <ArrowLeftIcon /> Voltar
        </Link>
        <h2 className="text-xl font-semibold text-zinc-900">Novo Cliente</h2>
      </div>

      {error && !Object.keys(fieldErrors).length && (
        <div className="mb-6">
          <FlashMessage type="error" message={error} onClose={() => {}} />
        </div>
      )}

      <ClientForm
        values={values}
        errors={{}}
        fieldErrors={fieldErrors}
        onChange={(field, value) => setFieldValue(field as keyof typeof values, value)}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Criar Cliente"
      />
    </div>
  );
}
