'use client';

import { useClientForm } from '@/hooks/useClientForm';
import AppHeader from '@/components/layout/AppHeader';
import ClientForm from '@/components/clients/ClientForm';
import FlashMessage from '@/components/clients/FlashMessage';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClientStatus } from '@/lib/types';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className="size-4">
    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    values, loading, error, fieldErrors, success,
    client, loadClient, setFieldValue, submit
  } = useClientForm(id);

  const [pageLoading, setPageLoading] = useState(true);
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    loadClient(id).finally(() => {
      setPageLoading(false);
    });
  }, [id, loadClient]);

  useEffect(() => {
    if (client?.status === ClientStatus.INACTIVE) {
      setIsInactive(true);
    }
  }, [client]);

  useEffect(() => {
    if (success) {
      router.push('/clients?updated=true');
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  if (pageLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-0">
        <AppHeader />
        <div className="py-16 text-center text-zinc-500">Carregando cliente...</div>
      </div>
    );
  }

  if (error === 'Cliente não encontrado') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-0">
        <AppHeader />
        <div className="py-16 text-center">
          <FlashMessage
            type="error"
            message="Cliente não encontrado"
            onClose={() => router.push('/clients')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-0">
      <AppHeader />

      <div className="flex items-center gap-3 py-4">
        <Link href="/clients" className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
          <ArrowLeftIcon /> Voltar
        </Link>
        <h2 className="text-xl font-semibold text-zinc-900">Editar Cliente</h2>
      </div>

      {isInactive && (
        <div className="mb-6">
          <FlashMessage
            type="error"
            message="Este cliente está inativo e não pode ser editado"
            onClose={() => {}}
          />
        </div>
      )}

      {error && !Object.keys(fieldErrors).length && !isInactive && (
        <div className="mb-6">
          <FlashMessage type="error" message={error} onClose={() => {}} />
        </div>
      )}

      <ClientForm
        values={values}
        errors={{}}
        fieldErrors={fieldErrors}
        onChange={isInactive ? () => {} : (field, value) => setFieldValue(field as keyof typeof values, value)}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Salvar Alterações"
        isEdit
        clientId={client?.id}
        createdAt={client?.createdAt}
      />
    </div>
  );
}
