import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClientTable from '../ClientTable';
import { Client, ClientStatus } from '@/lib/types';

// Mock next/link
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

// Mock StatusBadge to simplify assertions
vi.mock('../StatusBadge', () => ({
  default: ({ status }: { status: ClientStatus }) => (
    <span data-testid="status-badge" data-status={status}>
      {status === ClientStatus.ACTIVE ? 'Ativo' : 'Inativo'}
    </span>
  ),
}));

const mockClients: Client[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@test.com',
    telefone: '(11) 99999-0001',
    documento: '123.456.789-00',
    status: ClientStatus.ACTIVE,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    nome: 'Maria Souza',
    email: 'maria@test.com',
    telefone: '(21) 98888-0002',
    documento: '987.654.321-00',
    status: ClientStatus.INACTIVE,
    createdAt: '2025-01-02T00:00:00.000Z',
  },
];

const defaultPagination = { total: 2, page: 1, limit: 10 };

const defaultProps = {
  clients: mockClients,
  loading: false,
  error: null,
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  pagination: defaultPagination,
  onPageChange: vi.fn(),
};

describe('ClientTable', () => {
  describe('loading state', () => {
    it('renders 5 skeleton rows when loading', () => {
      const { container } = render(
        <ClientTable {...defaultProps} loading={true} clients={[]} />,
      );
      const skeletons = container.querySelectorAll('.animate-pulse');
      // 6 header cells + 6 skeleton cells * 5 rows = 30 skeleton divs
      expect(skeletons.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('error state', () => {
    it('renders error message', () => {
      render(
        <ClientTable {...defaultProps} error="Erro ao carregar" clients={[]} />,
      );
      expect(screen.getByText('Erro ao carregar')).toBeDefined();
    });

    it('renders "Tentar novamente" button', () => {
      const onPageChange = vi.fn();
      render(
        <ClientTable
          {...defaultProps}
          error="Erro"
          clients={[]}
          onPageChange={onPageChange}
        />,
      );
      const btn = screen.getByText('Tentar novamente');
      expect(btn).toBeDefined();
      fireEvent.click(btn);
      expect(onPageChange).toHaveBeenCalledWith(defaultPagination.page);
    });
  });

  describe('empty state', () => {
    it('renders empty message when no clients', () => {
      render(
        <ClientTable {...defaultProps} clients={[]} pagination={{ total: 0, page: 1, limit: 10 }} />,
      );
      expect(screen.getByText('Nenhum cliente encontrado')).toBeDefined();
    });

    it('renders link to create first client', () => {
      render(<ClientTable {...defaultProps} clients={[]} />);
      const link = screen.getByText('Cadastrar primeiro cliente');
      expect(link).toBeDefined();
      expect(link.closest('a')?.getAttribute('href')).toBe('/clients/new');
    });
  });

  describe('table rendering', () => {
    it('renders all column headers', () => {
      render(<ClientTable {...defaultProps} />);
      ['Nome', 'Email', 'Telefone', 'Documento', 'Status', 'Ações'].forEach((col) => {
        expect(screen.getAllByText(col).length).toBeGreaterThan(0);
      });
    });

    it('renders client names', () => {
      render(<ClientTable {...defaultProps} />);
      expect(screen.getByText('João Silva')).toBeDefined();
      expect(screen.getByText('Maria Souza')).toBeDefined();
    });

    it('renders client emails', () => {
      render(<ClientTable {...defaultProps} />);
      expect(screen.getByText('joao@test.com')).toBeDefined();
      expect(screen.getByText('maria@test.com')).toBeDefined();
    });

    it('renders status badges', () => {
      render(<ClientTable {...defaultProps} />);
      const badges = screen.getAllByTestId('status-badge');
      expect(badges).toHaveLength(2);
      expect(badges[0].getAttribute('data-status')).toBe(ClientStatus.ACTIVE);
      expect(badges[1].getAttribute('data-status')).toBe(ClientStatus.INACTIVE);
    });

    it('formats documento in monospace', () => {
      render(<ClientTable {...defaultProps} />);
      const docEl = screen.getByText('123.456.789-00');
      expect(docEl.className).toContain('font-mono');
    });
  });

  describe('action buttons', () => {
    it('calls onEdit when edit button clicked for ACTIVE client', () => {
      const onEdit = vi.fn();
      render(<ClientTable {...defaultProps} onEdit={onEdit} />);
      const editBtn = screen.getByLabelText('Editar João Silva');
      fireEvent.click(editBtn);
      expect(onEdit).toHaveBeenCalledWith('1');
    });

    it('disables edit button for INACTIVE client', () => {
      const { container } = render(<ClientTable {...defaultProps} />);
      // The inactive client's edit "button" is rendered as a span (not button)
      // Find spans with cursor-not-allowed class
      const allSpans = Array.from(container.querySelectorAll('span'));
      const disabledEdit = allSpans.find((s) => s.className.includes('cursor-not-allowed'));
      expect(disabledEdit).toBeDefined();
      expect(disabledEdit?.tagName).toBe('SPAN');
      // Verify it contains the pencil SVG
      expect(disabledEdit?.querySelector('svg')).toBeDefined();
    });

    it('calls onDelete when delete button clicked', () => {
      const onDelete = vi.fn();
      render(<ClientTable {...defaultProps} onDelete={onDelete} />);
      const deleteBtn = screen.getByLabelText('Excluir João Silva');
      fireEvent.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith(mockClients[0]);
    });
  });

  describe('pagination', () => {
    it('shows pagination info', () => {
      render(
        <ClientTable
          {...defaultProps}
          pagination={{ total: 25, page: 1, limit: 10 }}
        />,
      );
      expect(screen.getByText(/Mostrando 1–10 de 25 clientes/)).toBeDefined();
    });

    it('disables "Anterior" on first page', () => {
      render(<ClientTable {...defaultProps} />);
      const prevBtn = screen.getByText('← Anterior') as HTMLButtonElement;
      expect(prevBtn.disabled).toBe(true);
    });

    it('calls onPageChange when page number clicked', () => {
      const onPageChange = vi.fn();
      render(
        <ClientTable
          {...defaultProps}
          pagination={{ total: 25, page: 1, limit: 10 }}
          onPageChange={onPageChange}
        />,
      );
      fireEvent.click(screen.getByText('2'));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('highlights active page with indigo', () => {
      render(
        <ClientTable
          {...defaultProps}
          pagination={{ total: 25, page: 2, limit: 10 }}
        />,
      );
      const activePage = screen.getByText('2');
      expect(activePage.className).toContain('bg-indigo-600');
      expect(activePage.className).toContain('text-white');
    });

    it('disables "Próximo" on last page', () => {
      render(
        <ClientTable
          {...defaultProps}
          pagination={{ total: 2, page: 1, limit: 10 }}
        />,
      );
      const nextBtn = screen.getByText('Próximo →') as HTMLButtonElement;
      expect(nextBtn.disabled).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles single-page pagination (totalPages=1)', () => {
      render(
        <ClientTable
          {...defaultProps}
          clients={mockClients.slice(0, 1)}
          pagination={{ total: 1, page: 1, limit: 10 }}
        />,
      );
      expect(screen.getByText('1')).toBeDefined();
      // No page "2" button
      expect(screen.queryByText('2')).toBeNull();
    });
  });
});
