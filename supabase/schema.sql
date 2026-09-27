-- Supabase Schema for Horizontal Task Board with Multi-Dashboard Support

-- 1. Dashboards Table
CREATE TABLE IF NOT EXISTS public.dashboards (
  id TEXT PRIMARY KEY, -- Custom user ID/slug (e.g., "team-alpha")
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Horizontal Task Board',
  is_public BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{"startHour": 0, "endHour": 12}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT REFERENCES public.dashboards(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member',
  color TEXT,
  position_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT REFERENCES public.dashboards(id) ON DELETE CASCADE NOT NULL,
  employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium',
  start_hour NUMERIC NOT NULL DEFAULT 0,
  duration_hours NUMERIC NOT NULL DEFAULT 1,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public dashboards are viewable by everyone" ON public.dashboards;
DROP POLICY IF EXISTS "Dashboard employees viewable by everyone" ON public.employees;
DROP POLICY IF EXISTS "Dashboard tasks viewable by everyone" ON public.tasks;
DROP POLICY IF EXISTS "Owners can manage dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Owners can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Owners can manage tasks" ON public.tasks;

-- RLS Policies: Viewable by anyone if public or owned
CREATE POLICY "Public dashboards are viewable by everyone" ON public.dashboards
  FOR SELECT USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Dashboard employees viewable by everyone" ON public.employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dashboards d
      WHERE d.id = employees.dashboard_id AND (d.is_public = true OR d.owner_id = auth.uid())
    )
  );

CREATE POLICY "Dashboard tasks viewable by everyone" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dashboards d
      WHERE d.id = tasks.dashboard_id AND (d.is_public = true OR d.owner_id = auth.uid())
    )
  );

-- RLS Policies: Modification only by dashboard owner
CREATE POLICY "Owners can manage dashboards" ON public.dashboards
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can manage employees" ON public.employees
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.dashboards d WHERE d.id = employees.dashboard_id AND d.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.dashboards d WHERE d.id = employees.dashboard_id AND d.owner_id = auth.uid())
  );

CREATE POLICY "Owners can manage tasks" ON public.tasks
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.dashboards d WHERE d.id = tasks.dashboard_id AND d.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.dashboards d WHERE d.id = tasks.dashboard_id AND d.owner_id = auth.uid())
  );
