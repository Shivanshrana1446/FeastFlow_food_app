import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Add address">
        <p>Body</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the title and children when open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Add address">
        <p>Body content</p>
      </Modal>
    );
    const dialog = screen.getByRole('dialog', { name: 'Add address' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Add address">
        <p>Body</p>
      </Modal>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Add address">
        <p>Body</p>
      </Modal>
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the dialog on open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Add address">
        <p>Body</p>
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
  });
});
