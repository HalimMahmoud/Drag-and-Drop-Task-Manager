import { useState, type ReactNode } from 'react';
import type { Employee } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EditEmployeeDialogProps {
  trigger?: ReactNode;
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Omit<Employee, 'id'>>) => void;
}

export function EditEmployeeDialog({ trigger, employee, open, onOpenChange, onSave }: EditEmployeeDialogProps) {
  const [form, setForm] = useState({ name: employee.name, role: employee.role, color: employee.color ?? '#3b82f6' });
  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => onSave(form);

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
            <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role / Description</label>
            <Textarea value={form.role} onChange={(e) => updateField('role', e.target.value)} placeholder="e.g. Frontend Developer" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex items-center gap-2">
              <Input type="color" value={form.color} onChange={(e) => updateField('color', e.target.value)} className="w-12 h-8 p-0" />
              <span className="text-sm text-muted-foreground">{form.color}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
