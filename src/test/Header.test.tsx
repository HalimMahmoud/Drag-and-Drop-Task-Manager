import { render, screen } from '../setupTests';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { TimelineRange } from '../types';
import Header from '../components/header/Header';

const range: TimelineRange = { startHour: 0, endHour: 12 };
const noop = vi.fn();

const renderHeader = (props: Partial<Parameters<typeof Header>[0]> = {}) =>
  render(
    <Header
      isAuthenticated={true}
      supervisorMode={false}
      onSupervisorModeChange={noop}
      onAddEmployee={noop}
      timelineRange={range}
      onTimelineRangeChange={noop}
      hiddenTaskCount={0}
      {...props}
    />,
  );

describe('Header: rendering', () => {
  it('renders the board title', () => {
    renderHeader();
    expect(screen.getByText('Horizontal Task Board')).toBeTruthy();
  });

  it('hides Add Employee button outside supervisor mode', () => {
    renderHeader();
    expect(screen.queryByRole('button', { name: 'Add Employee' })).toBeNull();
  });

  it('shows Add Employee button in supervisor mode', () => {
    renderHeader({ supervisorMode: true });
    expect(screen.getByRole('button', { name: 'Add Employee' })).toBeTruthy();
  });

  it('reports hidden tasks when outside the visible range', () => {
    renderHeader({ supervisorMode: true, hiddenTaskCount: 2 });
    expect(screen.getByText('2 tasks outside this range')).toBeTruthy();
  });

  it('omits the hidden-task note when nothing is hidden', () => {
    renderHeader({ supervisorMode: true, hiddenTaskCount: 0 });
    expect(screen.queryByText(/outside this range/)).toBeNull();
  });
});

describe('Header: interactions', () => {
  it('toggles supervisor mode via the checkbox', async () => {
    const user = userEvent.setup();
    const onSupervisor = vi.fn();
    renderHeader({ onSupervisorModeChange: onSupervisor });

    await user.click(screen.getByRole('checkbox'));
    expect(onSupervisor).toHaveBeenCalledWith(true);
  });

  it('applies the active preset scaled from the current start hour', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderHeader({
      supervisorMode: true,
      timelineRange: { startHour: 0, endHour: 12 },
      onTimelineRangeChange: onChange,
    });

    await user.click(screen.getByRole('button', { name: '6h' }));
    expect(onChange).toHaveBeenCalledWith({ startHour: 0, endHour: 6 });

    await user.click(screen.getByRole('button', { name: '24h' }));
    expect(onChange).toHaveBeenCalledWith({ startHour: 0, endHour: 24 });
  });

  it('marks the current preset as active', () => {
    renderHeader({
      supervisorMode: true,
      timelineRange: { startHour: 0, endHour: 12 },
    });
    expect(screen.getByRole('button', { name: '12h' }).className).toContain('timeline-range__preset--active');
  });

  it('highlights the start and end hour triggers', () => {
    renderHeader({
      supervisorMode: true,
      timelineRange: { startHour: 4, endHour: 10 },
    });
    expect(screen.getByLabelText('Timeline start hour').textContent).toContain('04:00');
    expect(screen.getByLabelText('Timeline end hour').textContent).toContain('10:00');
  });
});