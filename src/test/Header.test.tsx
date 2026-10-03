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
  it('renders the title as a level-one heading', () => {
    renderHeader({ title: 'My Board', subtitle: '/my-board' });
    const heading = screen.getByRole('heading', { level: 1, name: 'My Board' });
    expect(heading).toBeTruthy();
  });

  it('renders the subtitle as supporting text', () => {
    renderHeader({ title: 'My Board', subtitle: '/my-board' });
    expect(screen.getByText('/my-board')).toBeTruthy();
  });

  it('omits the subtitle when none is provided', () => {
    renderHeader({ title: 'My Board', subtitle: undefined });
    expect(screen.getByRole('heading', { level: 1, name: 'My Board' })).toBeTruthy();
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

  it('hides the back link by default', () => {
    renderHeader();
    expect(screen.queryByRole('link', { name: 'All Boards' })).toBeNull();
  });

  it('shows a labeled back link when showBackButton is true', () => {
    renderHeader({ showBackButton: true, backHref: '/' });
    const link = screen.getByRole('link', { name: 'All Boards' });
    expect(link.getAttribute('href')).toBe('/');
  });

  it('accepts a custom back label and href', () => {
    renderHeader({
      showBackButton: true,
      backHref: '/team',
      backLabel: 'Team boards',
    });
    const link = screen.getByRole('link', { name: 'Team boards' });
    expect(link.getAttribute('href')).toBe('/team');
  });
});