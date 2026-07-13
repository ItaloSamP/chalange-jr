import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FlashMessage from '../FlashMessage';

describe('FlashMessage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders success message with correct styles', () => {
      render(
        <FlashMessage message="Operação concluída!" type="success" onClose={vi.fn()} />,
      );
      expect(screen.getByText('Operação concluída!')).toBeDefined();
      const container = screen.getByText('Operação concluída!').closest('div');
      expect(container?.className).toContain('bg-emerald-50');
      expect(container?.className).toContain('border-emerald-200');
      expect(container?.className).toContain('text-emerald-700');
    });

    it('renders error message with correct styles', () => {
      render(
        <FlashMessage message="Erro ao salvar!" type="error" onClose={vi.fn()} />,
      );
      expect(screen.getByText('Erro ao salvar!')).toBeDefined();
      const container = screen.getByText('Erro ao salvar!').closest('div');
      expect(container?.className).toContain('bg-red-50');
      expect(container?.className).toContain('border-red-200');
      expect(container?.className).toContain('text-red-700');
    });

    it('renders close button', () => {
      render(
        <FlashMessage message="Test" type="success" onClose={vi.fn()} />,
      );
      const closeBtn = screen.getByLabelText('Fechar');
      expect(closeBtn).toBeDefined();
    });

    it('renders check icon for success', () => {
      const { container } = render(
        <FlashMessage message="Success" type="success" onClose={vi.fn()} />,
      );
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('renders X icon for error', () => {
      const { container } = render(
        <FlashMessage message="Error" type="error" onClose={vi.fn()} />,
      );
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('auto-dismiss', () => {
    it('calls onClose after 5 seconds', () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      render(
        <FlashMessage message="Auto close" type="success" onClose={onClose} />,
      );

      expect(onClose).not.toHaveBeenCalled();
      vi.advanceTimersByTime(5000);
      expect(onClose).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('cleans up timer on unmount', () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      const { unmount } = render(
        <FlashMessage message="Test" type="success" onClose={onClose} />,
      );

      unmount();
      vi.advanceTimersByTime(5000);
      expect(onClose).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('close button interaction', () => {
    it('calls onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(
        <FlashMessage message="Closable" type="success" onClose={onClose} />,
      );

      fireEvent.click(screen.getByLabelText('Fechar'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
