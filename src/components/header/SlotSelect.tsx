import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TimeUnit } from '../../types';
import { formatAxisSlot } from '../../utils/timeUnits';

interface SlotSelectProps {
  label: string;
  value: number;
  slots: number[];
  unit: TimeUnit;
  onChange: (slot: number) => void;
}

export function SlotSelect({ label, value, slots, unit, onChange }: SlotSelectProps) {
  return (
    <Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
      <SelectTrigger className="timeline-range__select" aria-label={label}>
        {/* `SelectValue` mirrors the selected item's text, which is what lets the popup
            line its row up with this trigger. Plain text in the trigger leaves the value
            element missing and the popup can only fall back to top-aligning. */}
        <SelectValue />
      </SelectTrigger>
      {/* `min-w-0` drops the shared popup's `min-w-36`, which would otherwise beat
          `w-(--anchor-width)` and leave the list wider than the trigger it belongs to. */}
      <SelectContent className="min-w-0">
        {slots.map((slot) => (
          <SelectItem key={slot} value={String(slot)}>
            {formatAxisSlot(slot, unit)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}