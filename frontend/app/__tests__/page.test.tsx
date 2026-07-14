import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// ── Mocks ──────────────────────────────────────────────

const { mockRedirect } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

import HomePage from '../page';

// ── Tests ───────────────────────────────────────────────

describe('HomePage', () => {
  it('renders without crashing', () => {
    const { container } = render(<HomePage />);
    expect(container).toBeDefined();
  });

  it('calls redirect with /clients', () => {
    render(<HomePage />);
    expect(mockRedirect).toHaveBeenCalledWith('/clients');
  });
});
