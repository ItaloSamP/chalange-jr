import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClientForm from '../ClientForm';
import { ClientStatus } from '@/lib/types';

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

const defaultValues = {
  nome: '',
  email: '',
  telefone: '',
  documento: '',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
};

const defaultProps = {
  values: defaultValues,
  errors: {} as Record<string, string>,
  fieldErrors: {} as Record<string, string>,
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  loading: false,
  submitLabel: 'Criar cliente',
};

describe('ClientForm', () => {
  describe('create mode', () => {
    it('renders all input fields', () => {
      render(<ClientForm {...defaultProps} />);
      expect(screen.getByLabelText(/Nome/)).toBeDefined();
      expect(screen.getByLabelText(/Email/)).toBeDefined();
      expect(screen.getByLabelText(/Telefone/)).toBeDefined();
      expect(screen.getByLabelText(/Documento/)).toBeDefined();
      expect(screen.getByLabelText(/Status/)).toBeDefined();
    });

    it('shows required asterisks on all fields except status', () => {
      render(<ClientForm {...defaultProps} />);
      const nameLabel = screen.getByText(/Nome/).closest('label');
      const emailLabel = screen.getByText(/Email/).closest('label');
      const phoneLabel = screen.getByText(/Telefone/).closest('label');
      const docLabel = screen.getByText(/Documento/).closest('label');
      const statusLabel = screen.getByText(/Status/).closest('label');

      expect(nameLabel?.querySelector('.text-red-500')).toBeDefined();
      expect(emailLabel?.querySelector('.text-red-500')).toBeDefined();
      expect(phoneLabel?.querySelector('.text-red-500')).toBeDefined();
      expect(docLabel?.querySelector('.text-red-500')).toBeDefined();
      expect(statusLabel?.querySelector('.text-red-500')).toBeNull();
    });

    it('shows submit button with correct label', () => {
      render(<ClientForm {...defaultProps} />);
      expect(screen.getByText('Criar cliente')).toBeDefined();
    });

    it('does not show edit metadata', () => {
      render(<ClientForm {...defaultProps} />);
      expect(screen.queryByText(/ID:/)).toBeNull();
      expect(screen.queryByText(/Criado em:/)).toBeNull();
    });

    it('has rounded-2xl card', () => {
      const { container } = render(<ClientForm {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('rounded-2xl');
    });
  });

  describe('edit mode', () => {
    it('shows edit metadata when isEdit is true', () => {
      render(
        <ClientForm
          {...defaultProps}
          isEdit={true}
          clientId="abc-123"
          createdAt="2025-03-15T10:00:00.000Z"
        />,
      );
      expect(screen.getByText(/ID:/)).toBeDefined();
      expect(screen.getByText(/abc-123/)).toBeDefined();
      expect(screen.getByText(/Criado em:/)).toBeDefined();
    });

    it('formats the date in Brazilian locale', () => {
      render(
        <ClientForm
          {...defaultProps}
          isEdit={true}
          clientId="1"
          createdAt="2025-07-13T12:00:00.000Z"
        />,
      );
      expect(screen.getByText(/13\/07\/2025/)).toBeDefined();
    });

    it('does not show metadata when isEdit is false', () => {
      render(
        <ClientForm
          {...defaultProps}
          isEdit={false}
          clientId="abc-123"
          createdAt="2025-01-01T00:00:00.000Z"
        />,
      );
      expect(screen.queryByText(/ID:/)).toBeNull();
    });
  });

  describe('form fields', () => {
    it('calls onChange when nome input changes', () => {
      const onChange = vi.fn();
      render(<ClientForm {...defaultProps} onChange={onChange} />);
      fireEvent.change(screen.getByLabelText(/Nome/), { target: { value: 'João' } });
      expect(onChange).toHaveBeenCalledWith('nome', 'João');
    });

    it('calls onChange when email input changes', () => {
      const onChange = vi.fn();
      render(<ClientForm {...defaultProps} onChange={onChange} />);
      fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'test@test.com' } });
      expect(onChange).toHaveBeenCalledWith('email', 'test@test.com');
    });

    it('renders hint text for telefone', () => {
      render(<ClientForm {...defaultProps} />);
      expect(screen.getByText('Formato: (DDD) 99999-9999')).toBeDefined();
    });

    it('renders hint text for documento', () => {
      render(<ClientForm {...defaultProps} />);
      expect(screen.getByText('CPF ou CNPJ')).toBeDefined();
    });

    it('renders hint text for status', () => {
      render(<ClientForm {...defaultProps} />);
      expect(screen.getByText('Clientes inativos não podem ser editados')).toBeDefined();
    });
  });

  describe('field errors', () => {
    it('applies red border to field with error', () => {
      render(
        <ClientForm
          {...defaultProps}
          fieldErrors={{ nome: 'Nome é obrigatório' }}
        />,
      );
      const input = screen.getByLabelText(/Nome/) as HTMLInputElement;
      expect(input.className).toContain('border-red-500');
    });

    it('shows error message below field', () => {
      render(
        <ClientForm
          {...defaultProps}
          fieldErrors={{ nome: 'Nome é obrigatório' }}
        />,
      );
      expect(screen.getByText('Nome é obrigatório')).toBeDefined();
    });

    it('hides hint when field has error (telefone)', () => {
      render(
        <ClientForm
          {...defaultProps}
          fieldErrors={{ telefone: 'Telefone inválido' }}
        />,
      );
      expect(screen.queryByText('Formato: (DDD) 99999-9999')).toBeNull();
    });
  });

  describe('general error', () => {
    it('renders general error banner', () => {
      render(
        <ClientForm
          {...defaultProps}
          errors={{ general: 'Erro no servidor' }}
        />,
      );
      expect(screen.getByText('Erro no servidor')).toBeDefined();
    });
  });

  describe('loading state', () => {
    it('disables submit button when loading', () => {
      render(<ClientForm {...defaultProps} loading={true} />);
      const btn = screen.getByRole('button', { name: /Criar cliente/ }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });
  });

  describe('submit', () => {
    it('calls onSubmit when form submitted', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(<ClientForm {...defaultProps} onSubmit={onSubmit} />);
      const form = screen.getByRole('button', { name: /Criar cliente/ }).closest('form');
      fireEvent.submit(form!);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('footer', () => {
    it('has "Cancelar" link back to /clients', () => {
      render(<ClientForm {...defaultProps} />);
      const cancelLink = screen.getByText('Cancelar');
      expect(cancelLink).toBeDefined();
      expect(cancelLink.closest('a')?.getAttribute('href')).toBe('/clients');
    });

    it('has border-top separator in footer', () => {
      const { container } = render(<ClientForm {...defaultProps} />);
      // Find the footer div (last child of the form)
      const footerDivs = container.querySelectorAll('.border-t.border-zinc-200');
      expect(footerDivs.length).toBeGreaterThan(0);
    });
  });

  describe('pre-filled values', () => {
    it('renders inputs with pre-filled values', () => {
      const filledValues = {
        nome: 'Carlos',
        email: 'carlos@test.com',
        telefone: '(11) 91234-5678',
        documento: '111.222.333-44',
        status: 'INACTIVE' as 'ACTIVE' | 'INACTIVE',
      };
      render(<ClientForm {...defaultProps} values={filledValues} />);

      expect((screen.getByLabelText(/Nome/) as HTMLInputElement).value).toBe('Carlos');
      expect((screen.getByLabelText(/Email/) as HTMLInputElement).value).toBe('carlos@test.com');
      expect((screen.getByLabelText(/Telefone/) as HTMLInputElement).value).toBe('(11) 91234-5678');
      expect((screen.getByLabelText(/Documento/) as HTMLInputElement).value).toBe('111.222.333-44');
      expect((screen.getByLabelText(/Status/) as HTMLSelectElement).value).toBe(ClientStatus.INACTIVE);
    });
  });
});
