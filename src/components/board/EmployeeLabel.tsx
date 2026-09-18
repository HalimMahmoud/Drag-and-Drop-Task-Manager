'use client';

import type { RefObject } from 'react';
import type { Employee, ColorPaletteName } from '../../types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ItemMenu } from '@/components/ItemMenu';
import { useTheme } from '../../hooks/useTheme';
import { getColorByName, getColorVariant } from '../../utils/colorPalette';

interface EmployeeLabelProps {
  employee: Employee;
  supervisorMode: boolean;
  dragHandleRef: RefObject<HTMLDivElement | null>;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EmployeeLabel({ employee, supervisorMode, dragHandleRef, onAdd, onEdit, onDelete }: EmployeeLabelProps) {
  const { theme } = useTheme();
  const colorVariant = employee.color ? getColorByName(employee.color) : null;
  const colors = colorVariant ? getColorVariant(colorVariant, theme) : null;
  const borderColor = colors?.border ?? '#3b82f6';
  const bgColor = colors?.bg ?? '#f0f6ff';
  const textColor = colors?.text ?? '#3b82f6';

  return (
    <div ref={dragHandleRef} className="employee">
      <div>
        <Avatar
          className="border-2 ring-1 ring-black/5"
          style={{ borderColor }}
        >
          <AvatarFallback
            className="font-semibold"
            style={{
              color: textColor,
              backgroundColor: bgColor,
            }}
          >
            {employee.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="employee__name">{employee.name}</div>
          <div className="employee__role">{employee.role}</div>
        </div>
      </div>
      {supervisorMode && <ItemMenu onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />}
    </div>
  );
}