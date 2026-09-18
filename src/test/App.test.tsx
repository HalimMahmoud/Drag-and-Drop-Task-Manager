import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the seed employees and their tasks', () => {
    render(<App />);
    expect(screen.getByText('Ahmed')).toBeTruthy();
    expect(screen.getByText('Mohamed')).toBeTruthy();
    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('does not show supervisor-only controls by default', () => {
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Add Employee' })).toBeNull();
    expect(screen.queryByLabelText('Timeline start hour')).toBeNull();
  });

  it('reveals supervisor controls after toggling the mode', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('checkbox'));

    expect(screen.getByRole('button', { name: 'Add Employee' })).toBeTruthy();
    expect(screen.getByLabelText('Timeline start hour')).toBeTruthy();
    expect(screen.getByRole('button', { name: '12h' })).toBeTruthy();
  });

  it('adds an employee through the header dialog', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Add Employee' }));

    const heading = await screen.findByRole('heading', { name: 'Add Employee' });
    const dialog = heading.closest('div[data-slot="dialog-content"]') as HTMLElement;

    await user.type(within(dialog).getByPlaceholderText('Employee name'), 'Sara');
    await user.click(within(dialog).getByRole('button', { name: 'Add Employee' }));

    expect(await screen.findByText('Sara')).toBeTruthy();
  });
});