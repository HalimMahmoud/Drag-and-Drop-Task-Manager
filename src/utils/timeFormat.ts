export const formatClockHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

export const formatHour = (hour: number) => {
  const normalizedHour = ((Math.floor(hour) % 24) + 24) % 24;
  return `${normalizedHour % 12 || 12}:00`;
};