import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { createFieldUpdater } from '../utils/form';
import { useFieldUpdater } from '../hooks/form/useFieldUpdater';

interface Form {
  name: string;
  count: number;
  optional?: string;
}

function useTestForm(initial: Form) {
  const [form, setForm] = useState(initial);
  const updateField = createFieldUpdater(setForm);
  return { form, updateField };
}

function useTestForm2(initial: Form) {
  const [form, setForm] = useState(initial);
  const updateField = useFieldUpdater(setForm);
  return { form, updateField };
}

describe('createFieldUpdater', () => {
  it('updates a single field without touching others', () => {
    const { result } = renderHook(() => useTestForm({ name: 'Alice', count: 0 }));

    act(() => result.current.updateField('name', 'Bob'));
    expect(result.current.form.name).toBe('Bob');
    expect(result.current.form.count).toBe(0);
  });

  it('handles numeric and optional fields', () => {
    const { result } = renderHook(() => useTestForm({ name: 'x', count: 1 }));

    act(() => result.current.updateField('count', 5));
    expect(result.current.form.count).toBe(5);

    act(() => result.current.updateField('optional', 'yes'));
    expect(result.current.form.optional).toBe('yes');
  });
});

describe('useFieldUpdater', () => {
  it('updates a single field without touching others', () => {
    const { result } = renderHook(() => useTestForm2({ name: 'Alice', count: 0 }));

    act(() => result.current.updateField('name', 'Bob'));
    expect(result.current.form.name).toBe('Bob');
    expect(result.current.form.count).toBe(0);
  });

  it('reuses the memoized updater across renders', () => {
    const { result, rerender } = renderHook(() => useTestForm2({ name: 'Alice', count: 0 }));

    const firstUpdater = result.current.updateField;
    rerender();
    expect(result.current.updateField).toBe(firstUpdater);
  });
});