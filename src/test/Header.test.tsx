import { render, screen } from '../setupTests';
import { describe, expect, it, vi } from 'vitest';
import { AppHeader } from '../components/layout/AppHeader';

const noop = vi.fn();

const renderHeader = (props: Partial<Parameters<typeof AppHeader>[0]> = {}) =>
  render(
    <AppHeader
      title="Test Board"
      subtitle="/test-board"
      supervisorMode={false}
      onSupervisorModeChange={noop}
      onAddEmployee={noop}
      onUndo={noop}
      onRedo={noop}
      canUndo={false}
      canRedo={false}
      {...props}
    />,
  );

describe('AppHeader', () => {
  it('renders the title and subtitle', () => {
    renderHeader({ title: 'My Board', subtitle: '/my-board' });
    expect(screen.getByText('My Board')).toBeTruthy();
    expect(screen.getByText('/my-board')).toBeTruthy();
  });

  it('shows the supervisor toggle when onSupervisorModeChange is provided', () => {
    renderHeader();
    expect(screen.getByText('Supervisor Mode')).toBeTruthy();
  });

  it('hides the supervisor toggle when no callback is provided', () => {
    renderHeader({ onSupervisorModeChange: undefined });
    expect(screen.queryByText('Supervisor Mode')).toBeNull();
  });

  it('shows the create board button by default', () => {
    renderHeader();
    expect(screen.getByText('New Board')).toBeTruthy();
  });

  it('hides the create board button when showCreateButton is false', () => {
    renderHeader({ showCreateButton: false });
    expect(screen.queryByText('New Board')).toBeNull();
  });

  it('shows Add Employee button when supervisor mode is on', () => {
    renderHeader({ supervisorMode: true });
    expect(screen.getByRole('button', { name: 'Add Employee' })).toBeTruthy();
  });

  it('hides Add Employee button when supervisor mode is off', () => {
    renderHeader({ supervisorMode: false });
    expect(screen.queryByRole('button', { name: 'Add Employee' })).toBeNull();
  });
});