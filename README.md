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
- Horizontal timeline with slot grid lines
- Five time plans: hours (24), days (31), weeks (52), months (12), years (6)
- Dynamic slot width that scales to fit the viewport
- Tasks positioned absolutely by start slot and duration

### Supervisor Mode
- Toggle supervisor mode to reveal editing controls
- Add/remove employees
- Add/edit/delete tasks
- Timeline start/end range selectors and time-plan tabs
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
## Deployment (GitHub Pages)

The app is exported as a **fully static site**. There is no server at runtime: the
browser talks to Supabase directly with the public credentials, and routing is
hash-based (`/#/my-board`) because a static host cannot resolve a path like `/my-board`
to a different page.

### One-time setup

1. Run both migrations in the Supabase SQL Editor, in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_time_plans.sql`

2. In your Supabase project, add the app's URL as an allowed redirect, covering both
   the sign-in and callback routes for a user site:
   `https://<user>.github.io/**`
   For a project site: `https://<user>.github.io/<repo>/**`

3. In your GitHub repository, go to **Settings ? Pages ? Build and deployment**, set
   **Source** to **GitHub Actions**.

4. Add three repository variables under **Settings ? Secrets and variables ?
   Actions ? Variables** (not secrets; these are public values baked into the
   published JavaScript):

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your publishable key |
   | `NEXT_PUBLIC_BASE_PATH` | `/<repo>` for a project site, empty for a user site |

   Never put the service-role key here. Anything in `NEXT_PUBLIC_*` ships to browsers.

### Publishing

Push to `main`. `.github/workflows/deploy.yml` runs the type check, the test suite and
the export, then publishes `out/` through `actions/deploy-pages`. Pull requests get the
same checks from `.github/workflows/ci.yml` without publishing.

### Notes

- `public/.nojekyll` is required, otherwise Jekyll serves the site and silently drops
  `_next/`, breaking every asset.
- Board URLs are `https://<user>.github.io/<repo>/#/my-board`. Only the part before `#`
  is ever sent to the server.
- Because boards are addressed by fragment, a board created after a deploy works
  immediately and needs no rebuild.