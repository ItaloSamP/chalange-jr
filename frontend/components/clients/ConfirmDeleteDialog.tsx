'use client';

import { useEffect } from 'react';

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" className="size-10">
    <circle cx="20" cy="20" r="20" fill="#fee2e2" />
    <path d="M20 12v10M20 26v1" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const Spinner = () => (
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

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  clientName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ConfirmDeleteDialog({
  isOpen,
  clientName,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDeleteDialogProps) {
  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6"
      >
        <div className="flex flex-col items-center text-center">
          <WarningIcon />
          <h2 id="dialog-title" className="mt-4 text-lg font-semibold text-zinc-900">
            Excluir cliente
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Tem certeza que deseja excluir{' '}
            <span className="font-semibold text-zinc-900">{clientName}</span>? Esta ação não pode
            ser desfeita.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-[38px] px-4 py-2 font-medium text-sm rounded-lg bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-[38px] px-4 py-2 font-medium text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                Excluindo...
              </>
            ) : (
              'Sim, excluir'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
