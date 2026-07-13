import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppHeader from '../AppHeader';

// Mock next/link to render a plain <a> tag
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

describe('AppHeader', () => {
  describe('rendering', () => {
    it('renders the title', () => {
      render(<AppHeader />);
      expect(screen.getByText('Gerenciamento de Clientes')).toBeDefined();
    });

    it('renders the indigo indicator dot', () => {
      render(<AppHeader />);
      const dot = screen.getByText('Gerenciamento de Clientes').querySelector('span');
      expect(dot?.className).toContain('bg-indigo-600');
      expect(dot?.className).toContain('size-2');
      expect(dot?.className).toContain('rounded-full');
    });

    it('renders "Novo Cliente" link button', () => {
      render(<AppHeader />);
      const link = screen.getByText('Novo Cliente');
      expect(link).toBeDefined();
      expect(link.closest('a')?.getAttribute('href')).toBe('/clients/new');
    });

    it('applies primary button style to link', () => {
      render(<AppHeader />);
      const link = screen.getByText('Novo Cliente').closest('a');
      expect(link?.className).toContain('bg-indigo-600');
      expect(link?.className).toContain('text-white');
    });

    it('renders PlusIcon inside the button', () => {
      const { container } = render(<AppHeader />);
      const link = screen.getByText('Novo Cliente').closest('a');
      const svgs = link?.querySelectorAll('svg');
      expect(svgs?.length).toBeGreaterThan(0);
    });
  });

  describe('layout', () => {
    it('has header element with flex layout', () => {
      const { container } = render(<AppHeader />);
      const header = container.querySelector('header');
      expect(header?.className).toContain('flex');
      expect(header?.className).toContain('justify-between');
    });

    it('has bottom border separator', () => {
      const { container } = render(<AppHeader />);
      const header = container.querySelector('header');
      expect(header?.className).toContain('border-b');
      expect(header?.className).toContain('border-zinc-200');
    });

    it('title uses correct typography', () => {
      render(<AppHeader />);
      const title = screen.getByText('Gerenciamento de Clientes');
      expect(title.className).toContain('text-2xl');
      expect(title.className).toContain('font-bold');
      expect(title.className).toContain('text-zinc-900');
    });
  });
});
