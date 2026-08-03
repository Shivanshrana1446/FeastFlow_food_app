import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState title="No orders yet" description="Your orders will show up here." />);
    expect(screen.getByText('No orders yet')).toBeInTheDocument();
    expect(screen.getByText('Your orders will show up here.')).toBeInTheDocument();
  });

  it('does not render an action when no handler or target is given', () => {
    render(<EmptyState title="Nothing here" actionLabel="Do something" />);
    expect(screen.queryByRole('button', { name: 'Do something' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Do something' })).not.toBeInTheDocument();
  });

  it('renders a clickable action button when onAction is provided', async () => {
    const onAction = vi.fn();
    render(<EmptyState title="Empty" actionLabel="Retry" onAction={onAction} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders a navigable link action when actionTo is provided', () => {
    render(
      <MemoryRouter>
        <EmptyState title="Cart is empty" actionLabel="Browse restaurants" actionTo="/restaurants" />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'Browse restaurants' })).toHaveAttribute('href', '/restaurants');
  });
});
