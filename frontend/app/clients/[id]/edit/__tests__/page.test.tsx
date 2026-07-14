import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EditClientPage from '../page';
import { Client, ClientStatus } from '@/lib/types';

// ── Mutable mock state ─────────────────────────────────

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useParams: () => ({ id: '1' }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockSetFieldValue = vi.fn();
const mockSubmit = vi.fn();
const mockValidate = vi.fn(() => true);

let loadClientResolve: () => void;
const mockLoadClient = vi.fn().mockImplementation(() => {
  return new Promise<void>((resolve) => {
    loadClientResolve = resolve;
  });
});

const mockReset = vi.fn();

const activeClient: Client = {
  id: '1',
  nome: 'João Silva',
  email: 'joao@test.com',
  telefone: '(11) 99999-0001',
  documento: '123.456.789-00',
  status: ClientStatus.ACTIVE,
  createdAt: '2025-01-01T00:00:00.000Z',
};

const inactiveClient: Client = {
  ...activeClient,
  status: ClientStatus.INACTIVE,
};

const useClientFormState = {
  values: {
    nome: '',
    email: '',
    telefone: '',
    documento: '',
    status: 'ACTIVE' as const,
  },
  loading: false,
  error: null as string | null,
  fieldErrors: {} as Record<string, string>,
  success: null as string | null,
  isEdit: true,
  clientId: '1' as string | null,
  client: null as Client | null,
  setFieldValue: mockSetFieldValue,
  loadClient: mockLoadClient,
  validate: mockValidate,
  submit: mockSubmit,
  reset: mockReset,
};

vi.mock('@/hooks/useClientForm', () => ({
  useClientForm: () => useClientFormState,
}));

// ── Helpers ─────────────────────────────────────────────

function resolveLoadClient(client?: Client) {
  if (client) {
    useClientFormState.client = client;
    useClientFormState.values = {
      nome: client.nome,
      email: client.email,
      telefone: client.telefone,
      documento: client.documento,
      status: client.status as 'ACTIVE' | 'INACTIVE',
    };
  }
  loadClientResolve();
}

// ── Tests ───────────────────────────────────────────────

describe('EditClientPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset state
    useClientFormState.values = { nome: '', email: '', telefone: '', documento: '', status: 'ACTIVE' };
    useClientFormState.loading = false;
    useClientFormState.error = null;
    useClientFormState.fieldErrors = {};
    useClientFormState.success = null;
    useClientFormState.clientId = '1';
    useClientFormState.client = null;
    // Reset loadClient to pending state
    mockLoadClient.mockImplementation(() => {
      return new Promise<void>((resolve) => {
        loadClientResolve = resolve;
      });
    });
  });

  describe('loading state', () => {
    it('shows loading message while fetching client', () => {
      render(<EditClientPage />);
      expect(screen.getByText('Carregando cliente...')).toBeDefined();
    });
  });

  describe('not found state', () => {
    it('shows "Cliente não encontrado" when error is 404', async () => {
      render(<EditClientPage />);
      useClientFormState.error = 'Cliente não encontrado';
      loadClientResolve();
      await waitFor(() => {
        expect(screen.getByText('Cliente não encontrado')).toBeDefined();
      });
    });
  });

  describe('edit form rendering', () => {
    it('renders AppHeader after loading', async () => {
      render(<EditClientPage />);
      resolveLoadClient(activeClient);
      await waitFor(() => {
        expect(screen.getByText('Gerenciamento de Clientes')).toBeDefined();
      });
    });

    it('renders breadcrumb with "Editar Cliente" title', async () => {
      render(<EditClientPage />);
      resolveLoadClient(activeClient);
      await waitFor(() => {
        expect(screen.getByText('Editar Cliente')).toBeDefined();
      });
    });

    it('renders back link to /clients', async () => {
      render(<EditClientPage />);
      resolveLoadClient(activeClient);
      await waitFor(() => {
        const backLink = screen.getByText(/Voltar/);
        expect(backLink.closest('a')?.getAttribute('href')).toBe('/clients');
      });
    });

    it('renders "Salvar Alterações" button', async () => {
      render(<EditClientPage />);
      resolveLoadClient(activeClient);
      await waitFor(() => {
        expect(screen.getByText('Salvar Alterações')).toBeDefined();
      });
    });

    it('renders client ID and creation date metadata', async () => {
      render(<EditClientPage />);
      resolveLoadClient(activeClient);
      await waitFor(() => {
        expect(screen.getByText(/ID:/)).toBeDefined();
        expect(screen.getByText(/Criado em:/)).toBeDefined();
      });
    });

    it('pre-fills form with client data', async () => {
      render(<EditClientPage />);
      resolveLoadClient(activeClient);
      await waitFor(() => {
        const nomeInput = screen.getByDisplayValue('João Silva');
        expect(nomeInput).toBeDefined();
        const emailInput = screen.getByDisplayValue('joao@test.com');
        expect(emailInput).toBeDefined();
      });
    });
  });

  describe('inactive client', () => {
    it('shows inactive warning message', async () => {
      render(<EditClientPage />);
      resolveLoadClient(inactiveClient);
      await waitFor(() => {
        expect(screen.getByText('Este cliente está inativo e não pode ser editado')).toBeDefined();
      });
    });
  });

  describe('success redirect', () => {
    it('redirects to /clients?updated=true on success', async () => {
      render(<EditClientPage />);
      resolveLoadClient(activeClient);
      useClientFormState.success = 'Cliente atualizado com sucesso!';
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/clients?updated=true');
      });
    });
  });

  describe('error display', () => {
    it('shows general error when not inactive and no field errors', async () => {
      render(<EditClientPage />);
      resolveLoadClient(activeClient);
      useClientFormState.error = 'Erro de rede';
      await waitFor(() => {
        // Rerender needed to pick up new error state
        expect(screen.getByText('Erro de rede')).toBeDefined();
      });
    });
  });

  describe('page loading resolution', () => {
    it('stops showing loading after client is loaded', async () => {
      render(<EditClientPage />);
      expect(screen.getByText('Carregando cliente...')).toBeDefined();
      resolveLoadClient(activeClient);
      await waitFor(() => {
        expect(screen.queryByText('Carregando cliente...')).toBeNull();
      });
    });
  });
});
