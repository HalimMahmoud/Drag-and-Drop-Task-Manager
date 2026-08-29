# Horizontal PDD Task Board

A horizontal task board built with React, TypeScript, Vite, and `@atlaskit/pragmatic-drag-and-drop` (PDD). Tasks are arranged in rows per employee across a 12-hour timeline from 12:00 to 11:00.

---

## Architecture

### Tech Stack
- **React 19** with TypeScript
- **Vite** for bundling and dev server
- **@atlaskit/pragmatic-drag-and-drop** (element adapter) for drag-and-drop
- Plain CSS (no CSS-in-JS or modules)

### File Structure
- `src/App.tsx` — single-file app containing all components and logic
- `src/styles.css` — global styles
- `src/main.tsx` — React entry point

---

## Key Decisions

### 1. Single-File Component Architecture
All components (`TimeHeader`, `TaskCard`, `EmployeeRow`, `App`) live in `App.tsx`. This keeps the project minimal and avoids build complexity.

### 2. Timeline Grid & Layout Alignment
The board layout is synchronized via CSS Custom Properties. The timeline header uses `display: grid` with columns sized by `--hour-width` (100px). The task area container matches this width exactly and displays vertical hour-boundary grid lines using a repeating linear gradient.

### 3. Grid-Snap Task Model
Tasks store `startHour` (0 to 11) and `durationHours` (1 to 12). This represents their coordinate on the 12-hour timeline. When tasks are dragged or resized, their positions snap to whole-hour intervals.

### 4. Absolute Positioning for Tasks
Tasks use `position: absolute` with `left` and `width` derived from their `startHour` and `durationHours` multiplied by `HOUR_WIDTH` (100px). This provides precise, independent layout placement and avoids layout-flow logic.

### 5. Collision Avoidance (Overlap Prevention)
To prevent tasks from overlapping during layout changes:
- **Resizing**: If dragging a resize handle (left or right) would cause the task to overlap another task in the same row, the action is blocked. The left handle shifts both `startHour` and `durationHours`, while the right handle changes only `durationHours`.
- **Dragging**: During a drag, the system calculates the snap position under the cursor. If that slot is occupied, it performs an outward search (left and right) to find the nearest valid, non-overlapping `startHour`. If the row has no space, the drop indicator is hidden, and the drop is ignored.

### 6. Drag-and-Drop Drop Target Strategy
- `EmployeeRow` is draggable as `type: 'row'` for reordering employees.
- The `task-area` inside each row is a drop target for tasks. During drag, the drop target computes the target snap hour based on the cursor X coordinate (offset by the drag grab point) and updates the drop indicator's position.
- A global `monitorForElements` triggers post-move flash and screen reader live region announcements on successful drop.

---

## Important Implementation Details

### Task Positioning
```
left = startHour * HOUR_WIDTH
width = durationHours * HOUR_WIDTH
```

### Resize State Machine
- `resizing` state stores `{ handle, startX, startDuration, startStartHour }`.
- `mousemove` calculates `deltaHours = round((clientX - startX) / HOUR_WIDTH)`.
- If `handle === 'right'`: new duration = `clamp(startDuration + deltaHours, 1, 12 - startHour)`.
- If `handle === 'left'`: new start hour = `clamp(startStartHour + deltaHours, 0, rightEdge - 1)`, and new duration = `rightEdge - newStartHour`.
- Changes are only committed if `isPositionValid` returns true.

### Color System
Each priority has a tinted background, border, and dimmed handle color:
- **High**: red tint (`#fff0f0` bg, `#c9372c` border)
- **Medium**: amber tint (`#fffbeb` bg, `#b45309` border)
- **Low**: blue tint (`#f0f9ff` bg, `#0c66e4` border)

---

## Reverting to This State

- A snapshot of the initial sequential stacking state is saved in `.snapshots/stage-1/`.
- A snapshot of the grid-snap layout state with collision avoidance is saved in `.snapshots/stage-2/`.
