import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the human-readable label for a known status', () => {
    render(<StatusBadge status="outForDelivery" />);
    expect(screen.getByText('Out for delivery')).toBeInTheDocument();
  });

  it('falls back to the raw status value when it is unrecognized', () => {
    render(<StatusBadge status="somethingWeird" />);
    expect(screen.getByText('somethingWeird')).toBeInTheDocument();
  });
});
