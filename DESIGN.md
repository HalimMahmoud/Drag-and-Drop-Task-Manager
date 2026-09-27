# Horizontal PDD Task Board

A horizontal task board built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and `@atlaskit/pragmatic-drag-and-drop` (PDD). Tasks are arranged in rows per employee across a customizable timeline. Includes Supabase authentication and database integration.

---

## Architecture

### Tech Stack
- **Next.js 16** (App Router, Turbopack) with React 19
- **TypeScript** for type safety
- **@atlaskit/pragmatic-drag-and-drop** (element adapter) for drag-and-drop
- **Supabase** for authentication and PostgreSQL database
- **Tailwind CSS v4** + shadcn/ui for styling
- **Lucide React** for icons
- **Vitest** + **@testing-library/react** for testing

### File Structure
- `src/app/` — Next.js App Router pages and layouts
- `src/components/` — Reusable UI components (board, header, dialogs, auth)
- `src/hooks/` — Custom React hooks for board state, DnD, theme, and forms
- `src/lib/supabase/` — Supabase server/client and database operations
- `src/state/` — Board reducer and actions (undo/redo history)
- `src/utils/` — Utility functions (color palette, task layout, DnD helpers)
- `src/styles.css` — Global styles for the task board

---

## Key Decisions

### 1. Modular Component Architecture
The app is split into focused modules:
- `src/components/board/` — `TaskCard`, `EmployeeRow`, `EmployeeLabel`, `BoardSection`, `DropIndicator`
- `src/components/header/` — `Header`, `TimelineRangeSelector`, `ThemeToggle`, `SupervisorToggle`, `UserMenu`
- `src/components/dialogs/` — `AddEmployeeDialog`, `EditEmployeeDialog`, `AddTaskDialog`, `EditTaskDialog`
- `src/components/ui/` — shadcn/ui primitives (Button, Card, Dialog, Select, DropdownMenu, etc.)

### 2. Timeline Grid & Layout Alignment
The board layout is synchronized via CSS Custom Properties:
- Timeline header uses `display: grid` with columns sized by `--hour-width`
- Task area container matches this width exactly
- Vertical hour-boundary grid lines use a repeating linear gradient
- Hour width dynamically scales to fit the viewport

### 3. Grid-Snap Task Model
Tasks store `startHour` and `durationHours` representing their position on the timeline. When tasks are dragged or resized, their positions snap to whole-hour intervals.

### 4. Absolute Positioning for Tasks
Tasks use `position: absolute` with `left` and `width` derived from `startHour` and `durationHours` multiplied by the current hour width. This provides precise, independent layout placement.

### 5. Collision Avoidance (Overlap Prevention)
- **Resizing**: If dragging a resize handle would cause overlap, the action is blocked
- **Dragging**: During drag, the system calculates the snap position under the cursor. If occupied, it performs an outward search to find the nearest valid slot
- **Validation**: `isPositionValid` checks for overlaps within the same employee row

### 6. Drag-and-Drop Drop Target Strategy
- `EmployeeRow` is draggable as `type: 'row'` for reordering employees
- The `task-area` inside each row is a drop target for tasks
- Drop indicator shows target position during drag
- A global `monitorForElements` triggers post-move flash and screen reader announcements

### 7. State Management with Undo/Redo
- `boardReducer` manages employees, tasks, and history (`past`/`future` arrays)
- Max 30 history entries with automatic trimming
- Undo/Redo only records actual changes (no-ops don't pollute history)
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y or Ctrl+Shift+Z (redo)

### 8. Color System
25 themed color variants with light/dark mode support:
- Each variant has `bg`, `border`, `dim`, and `text` colors for both themes
- Tasks and employees can pick from the palette via dropdown
- Priority-based fallback colors (High=red, Medium=amber, Low=blue)
- Colors resolve automatically based on current theme

### 9. Authentication & Authorization
- Supabase Auth with email/password and OAuth (GitHub, Google)
- `AuthProvider` provides session context via React Context
- `ProtectedLayout` redirects unauthenticated users to login
- Row Level Security ensures users only access their own data
- Middleware refreshes sessions on every request

### 10. Database Schema
- `employees` table: id, user_id, name, role, color, position, timestamps
- `tasks` table: id, user_id, employee_id, title, description, priority, duration_hours, start_hour, color, timestamps
- RLS policies enforce per-user data isolation
- Triggers auto-update `updated_at` timestamps
- Indexes on user_id, employee_id, and start_hour for query performance

---

## Important Implementation Details

### Task Positioning
```
left = startHour * hourWidth
width = durationHours * hourWidth
```

### Resize State Machine
- `resizing` state stores `{ handle, startX, startDuration, startStartHour }`
- `mousemove` calculates `deltaHours = round((clientX - startX) / hourWidth)`
- If `handle === 'right'`: new duration = `clamp(startDuration + deltaHours, 1, maxHours - startHour)`
- If `handle === 'left'`: new start hour = `clamp(startStartHour + deltaHours, 0, rightEdge - 1)`, and new duration = `rightEdge - newStartHour`
- Changes are only committed if `isPositionValid` returns true

### Drop Indicator
- Vertical line at the target drop position
- Pulsing animation during drag
- Positioned absolutely within the task area

### Color System
Each priority has a tinted background, border, and dimmed handle color:
- **High**: red tint
- **Medium**: amber tint
- **Low**: blue tint

Custom colors from the 25-color palette override priority defaults when set.

---

## Reverting to This State

- A snapshot of the initial state is saved in `.snapshots/stage-1/`
- A snapshot of the grid-snap layout state with collision avoidance is saved in `.snapshots/stage-2/`