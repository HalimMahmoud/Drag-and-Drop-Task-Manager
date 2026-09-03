import React, { useState } from 'react';
import type { Employee } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EditEmployeeDialogProps {
  trigger?: React.ReactNode;
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Omit<Employee, 'id'>>) => void;
}

export function EditEmployeeDialog({
  trigger,
  employee,
  open,
  onOpenChange,
  onSave,
}: EditEmployeeDialogProps) {
  const [name, setName] = useState(employee.name);
  const [role, setRole] = useState(employee.role);
  const [color, setColor] = useState(employee.color ?? '#3b82f6');

  const handleSave = () => {
    const updates: Partial<Omit<Employee, 'id'>> = { name, role, color };
    onSave(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Update employee details below.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role / Description</label>
            <Textarea
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex items-center gap-2">
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-8 p-0" />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
