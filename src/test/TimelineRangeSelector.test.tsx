import { render, screen, waitFor, within } from '../setupTests';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TimelineRangeSelector from '../components/header/TimelineRangeSelector';
import type { TimelineConfig } from '../types';

const months: TimelineConfig = { unit: 'months', startSlot: 0, endSlot: 12 };

const renderSelector = (timelineConfig: TimelineConfig = months, onChange = vi.fn()) => {
  render(
    <TimelineRangeSelector
      timelineConfig={timelineConfig}
      onTimelineConfigChange={onChange}
      hiddenTaskCount={0}
    />,
  );
  return onChange;
};

/** Opens one of the two bound dropdowns and returns its popup element. */
const openBound = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByRole('combobox', { name: label }));
  const popup = await waitFor(() => {
    const found = document.querySelector<HTMLElement>('[data-slot="select-content"]');
    expect(found).not.toBeNull();
    return found as HTMLElement;
  });
  return popup;
};

describe('TimelineRangeSelector', () => {
  it('labels both bounds with the configured unit', () => {
    renderSelector();

    expect(screen.getByRole('combobox', { name: 'Timeline start' }).textContent).toContain('0');
    expect(screen.getByRole('combobox', { name: 'Timeline end' }).textContent).toContain('12');
  });

  it('offers every slot up to the unit capacity as the start bound', async () => {
    const user = userEvent.setup();
    renderSelector({ unit: 'weeks', startSlot: 0, endSlot: 52 });

    const popup = await openBound(user, 'Timeline start');
    expect(within(popup).getByRole('option', { name: '0' })).toBeTruthy();
    // The end bound sits at 52, so the start list has to stop one slot short of it.
    expect(within(popup).queryByRole('option', { name: '52' })).toBeNull();
  });

  it('offers slots past the start bound as the end bound', async () => {
    const user = userEvent.setup();
    renderSelector({ unit: 'weeks', startSlot: 4, endSlot: 52 });

    const popup = await openBound(user, 'Timeline end');
    expect(within(popup).getByRole('option', { name: '52' })).toBeTruthy();
    // A range always keeps at least one visible slot, so the start bound is excluded.
    expect(within(popup).queryByRole('option', { name: '4' })).toBeNull();
  });

  it('reports the updated config when a bound is picked', async () => {
    const user = userEvent.setup();
    const onChange = renderSelector({ unit: 'weeks', startSlot: 4, endSlot: 52 });

    const popup = await openBound(user, 'Timeline start');
    await user.click(within(popup).getByRole('option', { name: '9' }));

    expect(onChange).toHaveBeenCalledWith({ unit: 'weeks', startSlot: 9, endSlot: 52 });
  });

  it('keeps the popup no wider than its trigger', async () => {
    const user = userEvent.setup();
    renderSelector();

    const popup = await openBound(user, 'Timeline start');
    // The shared popup defaults to `min-w-36`, which would beat `w-(--anchor-width)` and
    // leave the list hanging off to the right of the 96px trigger it belongs to.
    expect(popup.className).toContain('min-w-0');
    expect(popup.className).not.toContain('min-w-36');
  });

  it('lets the option list scroll without dragging the page with it', async () => {
    const user = userEvent.setup();
    renderSelector();

    const popup = await openBound(user, 'Timeline start');
    // Base UI makes the list, not the popup, the scroll container in align mode.
    const list = within(popup).getByRole('listbox');
    expect(list.className).toContain('overscroll-contain');
  });

  it('keeps both bounds and their dash in a single non-wrapping group', () => {
    const { container } = render(
      <TimelineRangeSelector timelineConfig={months} onTimelineConfigChange={vi.fn()} hiddenTaskCount={0} />,
    );

    const window = container.querySelector('.timeline-range__window');
    expect(window).not.toBeNull();
    expect(window?.querySelectorAll('[data-slot="select-trigger"]')).toHaveLength(2);
  });

  it('summarises the visible span against the unit capacity', () => {
    renderSelector({ unit: 'months', startSlot: 2, endSlot: 6 });

    expect(screen.getByText(/4 months \/ 12 months max/)).toBeTruthy();
  });
});