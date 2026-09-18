import type { Dispatch, SetStateAction } from 'react';
import type { Priority, ColorPaletteName } from '../../types';
import { useFieldUpdater } from '../../hooks/form/useFieldUpdater';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Field } from './Field';
import { getAllColorNames, getColorByName, getColorVariant } from '../../utils/colorPalette';
import { useTheme } from '../../hooks/useTheme';

const PRIORITY_OPTIONS: Priority[] = ['Low', 'Medium', 'High'];

interface TaskCommonFieldsProps<T extends { title: string; description: string; priority: Priority; color: ColorPaletteName }> {
  form: T;
  setForm: Dispatch<SetStateAction<T>>;
  autoFocus?: boolean;
}

export function TaskCommonFields<T extends { title: string; description: string; priority: Priority; color: ColorPaletteName }>({
  form,
  setForm,
  autoFocus,
}: TaskCommonFieldsProps<T>) {
  const updateField = useFieldUpdater(setForm);
  const { theme } = useTheme();
  const colorNames = getAllColorNames();

  return (
    <>
      <Field label="Title">
        <Input
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Task title"
          autoFocus={autoFocus}
        />
      </Field>

      <Field label="Description">
        <Textarea
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Optional task description"
        />
      </Field>

      <Field label="Priority">
        <Select value={form.priority} onValueChange={(val) => updateField('priority', val as Priority)}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((priority) => (
              <SelectItem key={priority} value={priority}>{priority}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Color">
        <Select value={form.color} onValueChange={(val) => updateField('color', val as ColorPaletteName)}>
          <SelectTrigger>
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            {colorNames.map((name) => {
              const variant = getColorByName(name);
              const v = variant ? getColorVariant(variant, theme) : null;
              return (
                <SelectItem key={name} value={name}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded border" style={{ backgroundColor: v?.bg, borderColor: v?.border }} />
                    <span className="capitalize">{name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </Field>
    </>
  );
}