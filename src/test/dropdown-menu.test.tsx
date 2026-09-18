import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

const renderMenu = (onSelect = () => {}) =>
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onSelect}>Item A</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );

describe('DropdownMenu', () => {
  it('opens the menu when the trigger is clicked', async () => {
    const user = userEvent.setup();
    renderMenu();

    expect(screen.queryByText('Item A')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Open' }));

    const item = await screen.findByText('Item A');
    const content = item.closest('[data-slot="dropdown-menu-content"]') as HTMLElement;
    expect(content.dataset['state']).toBe('open');
  });

  it('positions the content from the trigger rect', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: 'Open' }));

    const item = await screen.findByText('Item A');
    const content = item.closest('[data-slot="dropdown-menu-content"]') as HTMLElement;
    expect(content.style.position).toBe('fixed');
    expect(content.style.right).toBeTruthy();
  });

  it('calls onSelect and closes when an item is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderMenu(onSelect);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(await screen.findByText('Item A'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Item A')).toBeNull());
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByText('Item A')).toBeNull());
  });
});