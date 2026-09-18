import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

interface HourSelectProps {
  label: string;
  value: number;
  hours: number[];
  onChange: (hour: number) => void;
}

export function HourSelect({ label, value, hours, onChange }: HourSelectProps) {
  return (
    <Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
      <SelectTrigger className="timeline-range__select" aria-label={label}>
        {`${String(value).padStart(2, '0')}:00`}
      </SelectTrigger>
      <SelectContent>
        {hours.map((hour) => (
          <SelectItem key={hour} value={String(hour)}>
            {`${String(hour).padStart(2, '0')}:00`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}