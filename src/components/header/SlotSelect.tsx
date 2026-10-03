import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
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
        {formatAxisSlot(value, unit)}
      </SelectTrigger>
      <SelectContent>
        {slots.map((slot) => (
          <SelectItem key={slot} value={String(slot)}>
            {formatAxisSlot(slot, unit)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}