import { render, screen, within } from '../setupTests';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import { EMPLOYEES, INITIAL_TASKS } from '../utils/seed';

const mockUseAuth = vi.fn();

vi.mock('@/components/AuthProvider', async () => {
  const actual = await vi.importActual<typeof import('@/components/AuthProvider')>(
    '@/components/AuthProvider'
  );
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
  };
});

const signedInUser = { id: 'u1', email: 'user@example.com', user_metadata: {} };

const renderApp = (supervisorMode = false) =>
  render(
    <App
      initialEmployees={EMPLOYEES}
      initialTasks={INITIAL_TASKS}
      supervisorMode={supervisorMode}
      onSupervisorModeChange={() => {}}
    />
  );

describe('App', () => {
  it('renders the seed employees and their tasks', () => {
    mockUseAuth.mockReturnValue({ user: signedInUser, loading: false });
    renderApp();
    expect(screen.getByText('Ahmed')).toBeTruthy();
    expect(screen.getByText('Mohamed')).toBeTruthy();
    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('does not show supervisor-only controls by default', () => {
    mockUseAuth.mockReturnValue({ user: signedInUser, loading: false });
    renderApp();
    expect(screen.queryByRole('button', { name: 'Add Employee' })).toBeNull();
    expect(screen.queryByLabelText('Timeline start')).toBeNull();
  });

  it('reveals supervisor controls after toggling the mode', async () => {
    mockUseAuth.mockReturnValue({ user: signedInUser, loading: false });
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
    // Both range bounds are editable, and the plan is chosen from the unit tabs.
    expect(screen.getByLabelText('Timeline start')).toBeTruthy();
    expect(screen.getByLabelText('Timeline end')).toBeTruthy();
    for (const unit of ['Hours', 'Days', 'Weeks', 'Months', 'Years']) {
      expect(screen.getByRole('button', { name: unit })).toBeTruthy();
    }
  });

  it('adds an employee through the header dialog', async () => {
    mockUseAuth.mockReturnValue({ user: signedInUser, loading: false });
    const user = userEvent.setup();
    const Wrapper = () => {
      const [mode, setMode] = useState(false);
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

describe('App permissions', () => {
  it('hides the supervisor toggle and edit button when signed out', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(
      <App
        initialEmployees={EMPLOYEES}
        initialTasks={INITIAL_TASKS}
        supervisorMode={false}
        onSupervisorModeChange={() => {}}
        extraButton={<button>Edit board</button>}
      />
    );

    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByText('Supervisor Mode')).toBeNull();
    expect(screen.queryByText('Edit board')).toBeNull();
  });

  it('keeps the board read-only even when supervisorMode is forced true while signed out', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    renderApp(true);

    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add Employee' })).toBeNull();
    expect(screen.queryByLabelText('Timeline start')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
  });

  it('still shows the back link while signed out', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(
      <App
        initialEmployees={EMPLOYEES}
        initialTasks={INITIAL_TASKS}
        supervisorMode={false}
        onSupervisorModeChange={() => {}}
        showBackButton
        backHref="/"
      />
    );

    expect(screen.getByRole('link', { name: 'All Boards' })).toBeTruthy();
  });

  it('turns supervisor mode off when the user signs out', async () => {
    const user = userEvent.setup();
    const authState = { user: signedInUser as typeof signedInUser | null };
    mockUseAuth.mockImplementation(() => ({ user: authState.user, loading: false }));

    let modeSetter: ((v: boolean) => void) | null = null;
    const Wrapper = () => {
      const [mode, setMode] = useState(false);
      modeSetter = setMode;
      return (
        <App
          initialEmployees={EMPLOYEES}
          initialTasks={INITIAL_TASKS}
          supervisorMode={mode}
          onSupervisorModeChange={setMode}
        />
      );
    };

    const { rerender } = render(<Wrapper />);

    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('button', { name: 'Add Employee' })).toBeTruthy();

    // Sign out: App must force the toggle back off even though the parent still says true.
    authState.user = null;
    rerender(<Wrapper />);

    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add Employee' })).toBeNull();
    expect(modeSetter).toBeTruthy();
  });
});