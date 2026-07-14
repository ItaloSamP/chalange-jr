import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientsPage from '../page';
import { Client, ClientStatus } from '@/lib/types';

// ── Mutable mock state ─────────────────────────────────

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
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

const mockFetchClients = vi.fn();
const mockRemoveClient = vi.fn();
const mockSetFilters = vi.fn();
const mockSetPage = vi.fn();

const useClientsState = {
  clients: [] as Client[],
  loading: false,
  error: null as string | null,
  filters: { page: 1, limit: 10 },
  pagination: { total: 0, page: 1, limit: 10 },
  fetchClients: mockFetchClients,
  removeClient: mockRemoveClient,
  setFilters: mockSetFilters,
  setPage: mockSetPage,
};

vi.mock('@/hooks/useClients', () => ({
  useClients: () => useClientsState,
}));

const mockClient: Client = {
  id: '1',
  nome: 'João Silva',
  email: 'joao@test.com',
  telefone: '(11) 99999-0001',
  documento: '123.456.789-00',
  status: ClientStatus.ACTIVE,
  createdAt: '2025-01-01T00:00:00.000Z',
};

// ── Tests ───────────────────────────────────────────────

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to defaults
    useClientsState.clients = [];
    useClientsState.loading = false;
    useClientsState.error = null;
    useClientsState.filters = { page: 1, limit: 10 };
    useClientsState.pagination = { total: 0, page: 1, limit: 10 };
  });

  describe('rendering', () => {
    it('renders AppHeader', () => {
      render(<ClientsPage />);
      expect(screen.getByText('Gerenciamento de Clientes')).toBeDefined();
    });

    it('renders ClientFilters with search button', () => {
      render(<ClientsPage />);
      expect(screen.getByText('Buscar')).toBeDefined();
    });

    it('renders ClientTable with empty state', () => {
      render(<ClientsPage />);
      expect(screen.getByText('Nenhum cliente encontrado')).toBeDefined();
    });
  });

  describe('loading state', () => {
    it('shows skeleton loading in ClientTable when loading is true', () => {
      useClientsState.loading = true;
      useClientsState.clients = [];
      const { container } = render(<ClientsPage />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('table with data', () => {
    it('renders client name when clients are loaded', () => {
      useClientsState.clients = [mockClient];
      useClientsState.pagination = { total: 1, page: 1, limit: 10 };
      render(<ClientsPage />);
      expect(screen.getByText('João Silva')).toBeDefined();
    });

    it('shows delete button for a client', () => {
      useClientsState.clients = [mockClient];
      useClientsState.pagination = { total: 1, page: 1, limit: 10 };
      render(<ClientsPage />);
      expect(screen.getByLabelText('Excluir João Silva')).toBeDefined();
    });
  });

  describe('delete flow', () => {
    it('opens ConfirmDeleteDialog when delete is clicked', () => {
      useClientsState.clients = [mockClient];
      useClientsState.pagination = { total: 1, page: 1, limit: 10 };
      render(<ClientsPage />);
      const deleteBtn = screen.getByLabelText('Excluir João Silva');
      fireEvent.click(deleteBtn);
      expect(screen.getByText('Excluir cliente')).toBeDefined();
    });

    it('closes dialog when cancel is clicked', () => {
      useClientsState.clients = [mockClient];
      useClientsState.pagination = { total: 1, page: 1, limit: 10 };
      render(<ClientsPage />);
      fireEvent.click(screen.getByLabelText('Excluir João Silva'));
      expect(screen.getByText('Excluir cliente')).toBeDefined();
      fireEvent.click(screen.getByText('Cancelar'));
      expect(screen.queryByText('Excluir cliente')).toBeNull();
    });

    it('shows success flash on successful delete', async () => {
      useClientsState.clients = [mockClient];
      useClientsState.pagination = { total: 1, page: 1, limit: 10 };
      mockRemoveClient.mockResolvedValue(undefined);
      render(<ClientsPage />);
      fireEvent.click(screen.getByLabelText('Excluir João Silva'));
      fireEvent.click(screen.getByText('Sim, excluir'));
      await waitFor(() => {
        expect(screen.getByText('Cliente excluído com sucesso!')).toBeDefined();
      });
    });

    it('shows error flash on failed delete', async () => {
      useClientsState.clients = [mockClient];
      useClientsState.pagination = { total: 1, page: 1, limit: 10 };
      mockRemoveClient.mockRejectedValue(new Error('Falha'));
      render(<ClientsPage />);
      fireEvent.click(screen.getByLabelText('Excluir João Silva'));
      fireEvent.click(screen.getByText('Sim, excluir'));
      await waitFor(() => {
        expect(screen.getByText('Erro ao excluir cliente')).toBeDefined();
      });
    });
  });

  describe('error state', () => {
    it('shows error from hook in FlashMessage and ClientTable', () => {
      useClientsState.error = 'Erro ao carregar clientes';
      render(<ClientsPage />);
      // Error appears in both FlashMessage and ClientTable
      const errorElements = screen.getAllByText('Erro ao carregar clientes');
      expect(errorElements.length).toBeGreaterThanOrEqual(2);
    });
  });
});
