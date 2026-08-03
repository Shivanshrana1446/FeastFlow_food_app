import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StarRating from './StarRating';

describe('StarRating', () => {
  it('renders a single labeled image in read-only mode, with no interactive controls', () => {
    render(<StarRating value={4.5} count={12} />);
    expect(screen.getByRole('img', { name: '4.5 out of 5 stars' })).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });

  it('renders a radiogroup of 5 stars in interactive mode', () => {
    render(<StarRating value={3} onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
    expect(radios[3]).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with the clicked star value', async () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Rate 4 stars' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
