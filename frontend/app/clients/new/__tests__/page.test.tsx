import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewClientPage from '../page';

// ── Mutable mock state ─────────────────────────────────

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
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

const mockSetFieldValue = vi.fn();
const mockSubmit = vi.fn();
const mockValidate = vi.fn(() => true);
const mockLoadClient = vi.fn();
const mockReset = vi.fn();

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
  isEdit: false,
  clientId: null as string | null,
  client: null,
  setFieldValue: mockSetFieldValue,
  loadClient: mockLoadClient,
  validate: mockValidate,
  submit: mockSubmit,
  reset: mockReset,
};

vi.mock('@/hooks/useClientForm', () => ({
  useClientForm: () => useClientFormState,
}));

// ── Tests ───────────────────────────────────────────────

describe('NewClientPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to defaults
    useClientFormState.loading = false;
    useClientFormState.error = null;
    useClientFormState.fieldErrors = {};
    useClientFormState.values = {
      nome: '',
      email: '',
      telefone: '',
      documento: '',
      status: 'ACTIVE',
    };
  });

  describe('rendering', () => {
    it('renders AppHeader', () => {
      render(<NewClientPage />);
      expect(screen.getByText('Gerenciamento de Clientes')).toBeDefined();
    });

    it('renders breadcrumb with "Novo Cliente" title', () => {
      render(<NewClientPage />);
      const titles = screen.getAllByText('Novo Cliente');
      // One from AppHeader button, one from breadcrumb h2
      expect(titles.length).toBeGreaterThanOrEqual(2);
    });

    it('renders back link to /clients', () => {
      render(<NewClientPage />);
      const backLink = screen.getByText(/Voltar/);
      expect(backLink.closest('a')?.getAttribute('href')).toBe('/clients');
    });

    it('renders ClientForm with "Criar Cliente" button', () => {
      render(<NewClientPage />);
      expect(screen.getByText('Criar Cliente')).toBeDefined();
    });

    it('renders form inputs for all fields', () => {
      render(<NewClientPage />);
      expect(screen.getByLabelText(/Nome/)).toBeDefined();
      expect(screen.getByLabelText(/Email/)).toBeDefined();
      expect(screen.getByLabelText(/Telefone/)).toBeDefined();
      expect(screen.getByLabelText(/Documento/)).toBeDefined();
    });
  });

  describe('form interaction', () => {
    it('calls setFieldValue when typing in nome field', () => {
      render(<NewClientPage />);
      const input = screen.getByLabelText(/Nome/);
      fireEvent.change(input, { target: { value: 'João' } });
      expect(mockSetFieldValue).toHaveBeenCalledWith('nome', 'João');
    });

    it('calls submit when form is submitted', async () => {
      mockSubmit.mockResolvedValue(true);
      render(<NewClientPage />);
      const submitBtn = screen.getByText('Criar Cliente');
      fireEvent.click(submitBtn);
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });

    it('redirects to /clients?created=true on success', async () => {
      mockSubmit.mockResolvedValue(true);
      render(<NewClientPage />);
      const submitBtn = screen.getByText('Criar Cliente');
      fireEvent.click(submitBtn);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/clients?created=true');
      });
    });

    it('does not redirect on submit failure', async () => {
      mockSubmit.mockResolvedValue(false);
      render(<NewClientPage />);
      const submitBtn = screen.getByText('Criar Cliente');
      fireEvent.click(submitBtn);
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('error display', () => {
    it('shows general error in FlashMessage', () => {
      useClientFormState.error = 'Erro ao salvar cliente';
      render(<NewClientPage />);
      expect(screen.getByText('Erro ao salvar cliente')).toBeDefined();
    });

    it('does not show error banner when only field-level errors exist', () => {
      useClientFormState.error = 'Erro geral';
      useClientFormState.fieldErrors = { email: 'Email já cadastrado' };
      render(<NewClientPage />);
      // The "Erro geral" text should NOT appear because fieldErrors exist
      // The condition is: error && !Object.keys(fieldErrors).length
      expect(screen.queryByText('Erro geral')).toBeNull();
    });
  });

  describe('loading state', () => {
    it('shows loading spinner and disables submit button when loading', () => {
      useClientFormState.loading = true;
      render(<NewClientPage />);
      const btn = screen.getByText('Criar Cliente');
      expect(btn.closest('button')?.disabled).toBe(true);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeDefined();
    });
  });
});
