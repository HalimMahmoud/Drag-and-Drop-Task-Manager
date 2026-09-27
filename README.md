# Horizontal Pragmatic Drag and Drop Task Board

A standalone React + TypeScript + Next.js example based on the Atlassian Pragmatic Drag and Drop board example, with Supabase auth and database.

## Features

### Drag & Drop
- Drag tasks left/right to reorder them within a row
- Drag tasks into another employee row to move them
- Drag rows to reorder employees vertically
- Drag task edges to resize duration (left/right handles)
- Collision avoidance: tasks snap to valid positions, overlapping is prevented
- Drop indicator shows target position during drag
- Post-move flash animation on successful drop
- Screen reader live region announcements

### Timeline
- Horizontal timeline with hour grid lines
- Customizable timeline range (6h, 8h, 12h, 24h presets)
- Dynamic hour width that scales to fit the viewport
- Tasks positioned absolutely by start hour and duration

### Supervisor Mode
- Toggle supervisor mode to reveal editing controls
- Add/remove employees
- Add/edit/delete tasks
- Timeline range selector with presets
- Undo/Redo with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Color palette selection for tasks and employees (25 themed colors)
- Dark/light theme toggle

### Authentication
- Email/password sign up and sign in
- GitHub and Google OAuth
- Protected routes (redirect to login when unauthenticated)
- Session persistence across page refreshes
- User menu with sign out

### Database (Supabase)
- Employees and tasks stored in Supabase PostgreSQL
- Row Level Security (users only access their own data)
- Real-time sync via Supabase Realtime
- Dashboard boards with public/private sharing
- Board listing page with search and copyable links

### UI Components
- shadcn/ui-based components (Button, Card, Dialog, Select, Badge, Avatar, etc.)
- Dropdown menus with proper positioning and scroll handling
- Responsive layout with Tailwind CSS
- Custom CSS for task board layout
- Smooth animations for drag states and transitions

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** with TypeScript
- **@atlaskit/pragmatic-drag-and-drop** for drag-and-drop
- **Supabase** for authentication and database
- **Tailwind CSS v4** + shadcn/ui for styling
- **Lucide React** for icons
- **@testing-library/react** + Vitest for tests

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/login/       # Login page
│   ├── auth/callback/      # OAuth callback
│   ├── layout.tsx          # Root layout with AuthProvider
│   └── page.tsx            # Home/dashboard listing page
├── components/
│   ├── AuthProvider.tsx     # Auth context
│   ├── ProtectedLayout.tsx # Route guard
│   ├── board/              # Board components
│   ├── header/             # Header components
│   └── dialogs/            # Modal dialogs
├── hooks/                  # Custom React hooks
│   ├── board/              # Board state and DnD hooks
│   ├── dnd/                # Drag and drop hooks
│   └── useTheme.ts         # Theme hook
├── lib/
│   └── supabase/           # Supabase clients and DB operations
├── state/                  # Redux-like state with reducer
├── utils/                  # Utility functions
│   ├── colorPalette.ts     # 25 color variants
│   ├── taskLayout.ts       # Task positioning and collision logic
│   └── seed.ts             # Initial data
└── styles.css              # Global styles
```

## Run

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal.

## Environment Setup

Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key:

```bash
cp .env.example .env.local
```

Apply the database migration:
```bash
# In Supabase Dashboard → SQL Editor, run:
supabase/migrations/001_initial_schema.sql
```

## Testing

```bash
npm run test      # Run all tests
npm run typecheck # TypeScript type checking
npm run build     # Production build
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm run typecheck` - Run TypeScript type checker