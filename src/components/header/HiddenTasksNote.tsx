interface HiddenTasksNoteProps {
  count: number;
}

export function HiddenTasksNote({ count }: HiddenTasksNoteProps) {
  if (count <= 0) return null;
  return <span className="timeline-range__hidden">{count} task{count === 1 ? '' : 's'} outside this range</span>;
}