import type { Dispatch, SetStateAction } from 'react';
import type { ColorPaletteName } from '../../types';
import { useFieldUpdater } from '../../hooks/form/useFieldUpdater';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Field } from './Field';
import { getAllColorNames, getColorByName, getColorVariant } from '../../utils/colorPalette';
import { useTheme } from '../../hooks/useTheme';

interface EmployeeCommonFieldsProps<T extends { name: string; role: string; color: ColorPaletteName }> {
  form: T;
  setForm: Dispatch<SetStateAction<T>>;
  autoFocus?: boolean;
}

export function EmployeeCommonFields<T extends { name: string; role: string; color: ColorPaletteName }>({
  form,
  setForm,
  autoFocus,
}: EmployeeCommonFieldsProps<T>) {
  const updateField = useFieldUpdater(setForm);
  const { theme } = useTheme();
  const colorNames = getAllColorNames();

  return (
    <>
      <Field label="Name">
        <Input
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Employee name"
          autoFocus={autoFocus}
        />
      </Field>

      <Field label="Role / Description">
        <Textarea
          value={form.role}
          onChange={(e) => updateField('role', e.target.value)}
          placeholder="e.g. Frontend Developer"
        />
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