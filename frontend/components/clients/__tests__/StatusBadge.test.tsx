import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';
import { ClientStatus } from '@/lib/types';

describe('StatusBadge', () => {
  describe('ACTIVE status', () => {
    it('renders "Ativo" text', () => {
      render(<StatusBadge status={ClientStatus.ACTIVE} />);
      expect(screen.getByText('Ativo')).toBeDefined();
    });

    it('applies emerald color classes', () => {
      render(<StatusBadge status={ClientStatus.ACTIVE} />);
      const badge = screen.getByText('Ativo');
      expect(badge.className).toContain('bg-emerald-50');
      expect(badge.className).toContain('text-emerald-700');
    });

    it('renders green dot', () => {
      render(<StatusBadge status={ClientStatus.ACTIVE} />);
      const dot = screen.getByText('Ativo').querySelector('span');
      expect(dot?.className).toContain('bg-emerald-600');
    });
  });

  describe('INACTIVE status', () => {
    it('renders "Inativo" text', () => {
      render(<StatusBadge status={ClientStatus.INACTIVE} />);
      expect(screen.getByText('Inativo')).toBeDefined();
    });

    it('applies zinc color classes', () => {
      render(<StatusBadge status={ClientStatus.INACTIVE} />);
      const badge = screen.getByText('Inativo');
      expect(badge.className).toContain('bg-zinc-100');
      expect(badge.className).toContain('text-zinc-600');
    });

    it('renders gray dot', () => {
      render(<StatusBadge status={ClientStatus.INACTIVE} />);
      const dot = screen.getByText('Inativo').querySelector('span');
      expect(dot?.className).toContain('bg-zinc-500');
    });
  });

  describe('base structure', () => {
    it('has inline-flex badge layout', () => {
      render(<StatusBadge status={ClientStatus.ACTIVE} />);
      const badge = screen.getByText('Ativo');
      expect(badge.className).toContain('inline-flex');
      expect(badge.className).toContain('rounded-full');
      expect(badge.className).toContain('text-xs');
      expect(badge.className).toContain('font-semibold');
    });

    it('dot has correct size classes', () => {
      render(<StatusBadge status={ClientStatus.ACTIVE} />);
      const dot = screen.getByText('Ativo').querySelector('span');
      expect(dot?.className).toContain('size-1.5');
      expect(dot?.className).toContain('rounded-full');
    });
  });
});
