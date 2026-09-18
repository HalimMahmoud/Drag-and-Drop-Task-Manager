import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ItemMenu } from '../components/ItemMenu';

describe('ItemMenu', () => {
  it('invokes onAdd when provided', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ItemMenu onAdd={onAdd} onEdit={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(await screen.findByText('Add task'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('invokes onEdit from the menu', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<ItemMenu onEdit={onEdit} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(await screen.findByText('Edit'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('invokes onDelete from the menu', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<ItemMenu onEdit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(await screen.findByText('Delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('hides the Add task item when onAdd is omitted', async () => {
    const user = userEvent.setup();
    render(<ItemMenu onEdit={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(await screen.findByText('Edit')).toBeTruthy();
    expect(screen.queryByText('Add task')).toBeNull();
  });
});