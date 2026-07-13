import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClientFilters from '../ClientFilters';
import { ClientStatus } from '@/lib/types';

describe('ClientFilters', () => {
  const defaultFilters = { nome: '', email: '', status: undefined as ClientStatus | undefined };

  const defaultProps = {
    filters: defaultFilters,
    onChange: vi.fn(),
    onSearch: vi.fn(),
  };

  describe('rendering', () => {
    it('renders three filter labels', () => {
      render(<ClientFilters {...defaultProps} />);
      expect(screen.getByText('Nome')).toBeDefined();
      expect(screen.getByText('Email')).toBeDefined();
      expect(screen.getByText('Status')).toBeDefined();
    });

    it('renders "Buscar" button with search icon', () => {
      render(<ClientFilters {...defaultProps} />);
      expect(screen.getByText('Buscar')).toBeDefined();
    });

    it('renders name input with placeholder', () => {
      render(<ClientFilters {...defaultProps} />);
      const input = screen.getByPlaceholderText('Buscar por nome...');
      expect(input).toBeDefined();
    });

    it('renders email input with placeholder', () => {
      render(<ClientFilters {...defaultProps} />);
      const input = screen.getByPlaceholderText('Buscar por email...');
      expect(input).toBeDefined();
    });

    it('renders status select with three options', () => {
      render(<ClientFilters {...defaultProps} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeDefined();
      const options = select.querySelectorAll('option');
      expect(options.length).toBe(3);
      expect(options[0].textContent).toBe('Todos');
      expect(options[1].textContent).toBe('Ativo');
      expect(options[2].textContent).toBe('Inativo');
    });

    it('has card styling', () => {
      const { container } = render(<ClientFilters {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('bg-white');
      expect(card.className).toContain('border-zinc-200');
      expect(card.className).toContain('rounded-xl');
    });
  });

  describe('interactions', () => {
    it('calls onChange with updated nome when typing', () => {
      const onChange = vi.fn();
      render(<ClientFilters {...defaultProps} onChange={onChange} />);
      const input = screen.getByPlaceholderText('Buscar por nome...');
      fireEvent.change(input, { target: { value: 'João' } });
      expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, nome: 'João' });
    });

    it('calls onChange with updated email when typing', () => {
      const onChange = vi.fn();
      render(<ClientFilters {...defaultProps} onChange={onChange} />);
      const input = screen.getByPlaceholderText('Buscar por email...');
      fireEvent.change(input, { target: { value: 'joao@test.com' } });
      expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, email: 'joao@test.com' });
    });

    it('calls onChange with undefined when clearing nome', () => {
      const onChange = vi.fn();
      const filtersWithName = { nome: 'João', email: '', status: undefined as ClientStatus | undefined };
      render(<ClientFilters {...defaultProps} filters={filtersWithName} onChange={onChange} />);
      const input = screen.getByPlaceholderText('Buscar por nome...');
      fireEvent.change(input, { target: { value: '' } });
      expect(onChange).toHaveBeenCalledWith({ email: '', status: undefined, nome: undefined });
    });

    it('calls onSearch when "Buscar" clicked', () => {
      const onSearch = vi.fn();
      render(<ClientFilters {...defaultProps} onSearch={onSearch} />);
      fireEvent.click(screen.getByText('Buscar'));
      expect(onSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading state', () => {
    it('disables the "Buscar" button when loading', () => {
      render(<ClientFilters {...defaultProps} loading={true} />);
      const btn = screen.getByText('Buscar') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });
  });

  describe('filter values prop', () => {
    it('pre-fills name input from filters', () => {
      render(
        <ClientFilters
          {...defaultProps}
          filters={{ nome: 'Carlos', email: '', status: undefined }}
        />,
      );
      const input = screen.getByPlaceholderText('Buscar por nome...') as HTMLInputElement;
      expect(input.value).toBe('Carlos');
    });

    it('pre-fills status select from filters', () => {
      render(
        <ClientFilters
          {...defaultProps}
          filters={{ nome: '', email: '', status: ClientStatus.INACTIVE }}
        />,
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe(ClientStatus.INACTIVE);
    });
  });
});
