'use client';

import { useClients } from '@/hooks/useClients';
import AppHeader from '@/components/layout/AppHeader';
import ClientFilters from '@/components/clients/ClientFilters';
import ClientTable from '@/components/clients/ClientTable';
import FlashMessage from '@/components/clients/FlashMessage';
import ConfirmDeleteDialog from '@/components/clients/ConfirmDeleteDialog';
import { Client } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function ClientsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    clients, loading, error, filters, pagination,
    fetchClients, removeClient, setFilters, setPage
  } = useClients();

  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('created')) {
      setFlashMessage({ type: 'success', message: 'Cliente criado com sucesso!' });
      router.replace('/clients');
    } else if (searchParams.get('updated')) {
      setFlashMessage({ type: 'success', message: 'Cliente atualizado com sucesso!' });
      router.replace('/clients');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (error) setFlashMessage({ type: 'error', message: error });
  }, [error]);

  const handleSearch = () => fetchClients(filters);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await removeClient(deleteTarget.id);
      setFlashMessage({ type: 'success', message: 'Cliente excluído com sucesso!' });
    } catch {
      setFlashMessage({ type: 'error', message: 'Erro ao excluir cliente' });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleEdit = (id: string) => router.push(`/clients/${id}/edit`);

  return (
    <div className="max-w-6xl mx-auto px-6 py-0">
      <AppHeader />

      {flashMessage && (
        <div className="mb-4">
          <FlashMessage {...flashMessage} onClose={() => setFlashMessage(null)} />
        </div>
      )}

      <div className="mb-4">
        <ClientFilters
          filters={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          loading={loading}
        />
      </div>

      <ClientTable
        clients={clients}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        pagination={pagination}
        onPageChange={setPage}
      />

      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        clientName={deleteTarget?.nome ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-6 py-16 text-center text-zinc-500">Carregando...</div>}>
      <ClientsContent />
    </Suspense>
  );
}
