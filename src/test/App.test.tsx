import { render, screen, within } from '../setupTests';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { EMPLOYEES, INITIAL_TASKS } from '../utils/seed';

describe('App', () => {
  it('renders the seed employees and their tasks', () => {
    render(
      <App
        initialEmployees={EMPLOYEES}
        initialTasks={INITIAL_TASKS}
        supervisorMode={false}
        onSupervisorModeChange={() => {}}
      />
    );
    expect(screen.getByText('Ahmed')).toBeTruthy();
    expect(screen.getByText('Mohamed')).toBeTruthy();
    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('does not show supervisor-only controls by default', () => {
    render(
      <App
        initialEmployees={EMPLOYEES}
        initialTasks={INITIAL_TASKS}
        supervisorMode={false}
        onSupervisorModeChange={() => {}}
      />
    );
    expect(screen.queryByRole('button', { name: 'Add Employee' })).toBeNull();
    expect(screen.queryByLabelText('Timeline start hour')).toBeNull();
  });

  it('reveals supervisor controls after toggling the mode', async () => {
    const user = userEvent.setup();
    let setSupervisorMode: ((v: boolean) => void) | null = null;
    const Wrapper = () => {
      const [mode, setMode] = useState(false);
      setSupervisorMode = setMode;
      return (
        <App
          initialEmployees={EMPLOYEES}
          initialTasks={INITIAL_TASKS}
          supervisorMode={mode}
          onSupervisorModeChange={setMode}
        />
      );
    };
    render(<Wrapper />);

    await user.click(screen.getByRole('checkbox'));

    expect(screen.getByRole('button', { name: 'Add Employee' })).toBeTruthy();
    expect(screen.getByLabelText('Timeline start hour')).toBeTruthy();
    expect(screen.getByRole('button', { name: '12h' })).toBeTruthy();
  });

  it('adds an employee through the header dialog', async () => {
    const user = userEvent.setup();
    let setSupervisorMode: ((v: boolean) => void) | null = null;
    const Wrapper = () => {
      const [mode, setMode] = useState(false);
      setSupervisorMode = setMode;
      return (
        <App
          initialEmployees={EMPLOYEES}
          initialTasks={INITIAL_TASKS}
          supervisorMode={mode}
          onSupervisorModeChange={setMode}
        />
      );
    };
    render(<Wrapper />);

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Add Employee' }));

    const heading = await screen.findByRole('heading', { name: 'Add Employee' });
    const dialog = heading.closest('div[data-slot="dialog-content"]') as HTMLElement;

    await user.type(within(dialog).getByPlaceholderText('Employee name'), 'Sara');
    await user.click(within(dialog).getByRole('button', { name: 'Add Employee' }));

    expect(await screen.findByText('Sara')).toBeTruthy();
  });
});