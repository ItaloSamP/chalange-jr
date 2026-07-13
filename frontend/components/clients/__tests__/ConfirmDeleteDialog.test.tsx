import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDeleteDialog from '../ConfirmDeleteDialog';

describe('ConfirmDeleteDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    clientName: 'João Silva',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    loading: false,
  };

  describe('closed state', () => {
    it('returns null when isOpen is false', () => {
      const { container } = render(
        <ConfirmDeleteDialog {...defaultProps} isOpen={false} />,
      );
      expect(container.innerHTML).toBe('');
    });
  });

  describe('open state', () => {
    it('renders the dialog with overlay', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeDefined();
      const overlay = dialog.parentElement;
      expect(overlay?.className).toContain('bg-black/40');
      expect(overlay?.className).toContain('backdrop-blur-sm');
    });

    it('displays client name in bold', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('João Silva')).toBeDefined();
      const nameSpan = screen.getByText('João Silva');
      expect(nameSpan.className).toContain('font-semibold');
    });

    it('displays warning title', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('Excluir cliente')).toBeDefined();
    });

    it('has aria-modal and aria-labelledby', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe('dialog-title');
    });

    it('shows "Sim, excluir" button', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('Sim, excluir')).toBeDefined();
    });

    it('shows "Cancelar" button', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('Cancelar')).toBeDefined();
    });
  });

  describe('loading state', () => {
    it('shows spinner and "Excluindo..." when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);
      expect(screen.getByText('Excluindo...')).toBeDefined();
    });

    it('disables both buttons when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        expect((btn as HTMLButtonElement).disabled).toBe(true);
      });
    });
  });

  describe('interactions', () => {
    it('calls onConfirm when confirm clicked', () => {
      const onConfirm = vi.fn();
      render(<ConfirmDeleteDialog {...defaultProps} onConfirm={onConfirm} />);
      fireEvent.click(screen.getByText('Sim, excluir'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel clicked', () => {
      const onCancel = vi.fn();
      render(<ConfirmDeleteDialog {...defaultProps} onCancel={onCancel} />);
      fireEvent.click(screen.getByText('Cancelar'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel on ESC key', () => {
      const onCancel = vi.fn();
      render(<ConfirmDeleteDialog {...defaultProps} onCancel={onCancel} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onCancel for non-ESC keys', () => {
      const onCancel = vi.fn();
      render(<ConfirmDeleteDialog {...defaultProps} onCancel={onCancel} />);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('does not listen for ESC when closed', () => {
      const onCancel = vi.fn();
      render(
        <ConfirmDeleteDialog {...defaultProps} isOpen={false} onCancel={onCancel} />,
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('scroll lock', () => {
    it('sets body overflow to hidden when open', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body overflow on unmount', () => {
      const { unmount } = render(<ConfirmDeleteDialog {...defaultProps} />);
      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });
});
