import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { createFieldUpdater, type FieldUpdater } from '../../utils/form';

export function useFieldUpdater<T extends object>(setForm: Dispatch<SetStateAction<T>>): FieldUpdater<T> {
  return useCallback(createFieldUpdater(setForm), [setForm]);
}