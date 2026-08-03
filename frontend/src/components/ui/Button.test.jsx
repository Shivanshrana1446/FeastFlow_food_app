import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Button from './Button';

describe('Button', () => {
  it('renders a native button by default and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as a router Link when `to` is provided', () => {
    render(
      <MemoryRouter>
        <Button to="/checkout">Go to checkout</Button>
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: 'Go to checkout' });
    expect(link).toHaveAttribute('href', '/checkout');
  });

  it('renders as a plain anchor when `href` is provided', () => {
    render(<Button href="https://example.com">External</Button>);
    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('href', 'https://example.com');
  });

  it('disables the button and ignores clicks while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Submitting
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Submitting' });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects an explicit disabled prop', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });
});
