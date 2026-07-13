'use client';

import { useCallback, useState } from 'react';
import { clientsApi } from '@/lib/api';
import { ApiError, Client, ClientStatus, CreateClientPayload, UpdateClientPayload } from '@/lib/types';

type FormValues = {
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  status: 'ACTIVE' | 'INACTIVE';
};

interface UseClientFormReturn {
  values: FormValues;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  success: string | null;
  isEdit: boolean;
  clientId: string | null;
  client: Client | null;
  setFieldValue: (field: keyof FormValues, value: string) => void;
  loadClient: (id: string) => Promise<void>;
  validate: () => boolean;
  submit: () => Promise<boolean>;
  reset: () => void;
}

const initialValues: FormValues = {
  nome: '',
  email: '',
  telefone: '',
  documento: '',
  status: 'ACTIVE',
};

export function useClientForm(clientId?: string): UseClientFormReturn {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const reset = useCallback(() => {
    setValues(initialValues);
    setError(null);
    setFieldErrors({});
    setSuccess(null);
    setLoading(false);
    setClient(null);
  }, []);

  const setFieldValue = useCallback((field: keyof FormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear field error when user types
    setFieldErrors(prev => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!values.nome.trim()) errors.nome = 'Nome é obrigatório';
    if (!values.email.trim()) errors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Email inválido';
    if (!values.telefone.trim()) errors.telefone = 'Telefone é obrigatório';
    else if (values.telefone.replace(/\D/g, '').length < 10) errors.telefone = 'Telefone deve ter no mínimo 10 dígitos';
    if (!values.documento.trim()) errors.documento = 'Documento é obrigatório';
    else if (values.documento.replace(/\D/g, '').length < 11) errors.documento = 'Documento deve ter no mínimo 11 caracteres';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [values]);

  const loadClient = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientsApi.getById(id);
      setClient(data);
      setValues({
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        documento: data.documento,
        status: data.status,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar cliente');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    if (!validate()) return false;

    setLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccess(null);

    const payload: CreateClientPayload = {
      nome: values.nome.trim(),
      email: values.email.trim(),
      telefone: values.telefone.trim(),
      documento: values.documento.trim(),
      status: values.status as ClientStatus,
    };

    try {
      if (clientId) {
        await clientsApi.update(clientId, payload as UpdateClientPayload);
        setSuccess('Cliente atualizado com sucesso!');
      } else {
        await clientsApi.create(payload);
        setSuccess('Cliente criado com sucesso!');
      }
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 409) {
          // Map conflict to specific field
          if (err.message.toLowerCase().includes('email')) {
            setFieldErrors(prev => ({ ...prev, email: err.message }));
          } else if (err.message.toLowerCase().includes('documento')) {
            setFieldErrors(prev => ({ ...prev, documento: err.message }));
          } else {
            setError(err.message);
          }
        } else if (err.statusCode === 403) {
          setError('Cliente inativo não pode ser editado');
        } else if (err.statusCode === 404) {
          setError('Cliente não encontrado');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro ao conectar com o servidor');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [values, clientId, validate]);

  return {
    values,
    loading,
    error,
    fieldErrors,
    success,
    isEdit: !!clientId,
    clientId: clientId || null,
    client,
    setFieldValue,
    loadClient,
    validate,
    submit,
    reset,
  };
}
