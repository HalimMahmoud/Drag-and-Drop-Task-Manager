interface SupervisorToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function SupervisorToggle({ checked, onChange }: SupervisorToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none" title="Show or hide the time-range controls">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <div className="w-9 h-5 rounded-full bg-muted peer-checked:bg-primary transition-colors relative">
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </div>
      <span className="text-sm font-medium">Supervisor Mode</span>
    </label>
  );
}