import type { Dispatch, SetStateAction } from 'react';

export type FieldUpdater<T extends object> = <K extends keyof T>(key: K, value: T[K]) => void;

export function createFieldUpdater<T extends object>(setForm: Dispatch<SetStateAction<T>>): FieldUpdater<T> {
  return (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
}