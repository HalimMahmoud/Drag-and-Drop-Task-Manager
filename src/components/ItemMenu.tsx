import type React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ItemMenuProps {
  onAdd?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

export function ItemMenu({ onAdd, onEdit, onDelete }: ItemMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 rounded-md text-muted-foreground hover:text-foreground"
          onClick={stopPropagation}
          onPointerDown={stopPropagation}
          onMouseDown={stopPropagation}
          aria-label="Actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {onAdd && (
          <>
            <DropdownMenuItem onSelect={onAdd}>Add task</DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onDelete}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
