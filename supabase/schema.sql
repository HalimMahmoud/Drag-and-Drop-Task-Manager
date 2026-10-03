-- Supabase Schema for Horizontal Task Board with Multi-Dashboard Support

-- 1. Dashboards Table
CREATE TABLE IF NOT EXISTS public.dashboards (
  id TEXT PRIMARY KEY, -- Custom user ID/slug (e.g., "team-alpha")
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Horizontal Task Board',
  is_public BOOLEAN NOT NULL DEFAULT true,
-- Time plan for the board's timeline. startSlot/endSlot are slot indices; "unit"
  -- gives them meaning (hours, days, weeks, months, years). A board opens on its full
  -- plan, 0 through the unit's capacity, and both bounds stay user-adjustable.
  config JSONB NOT NULL DEFAULT '{"unit": "hours", "startSlot": 0, "endSlot": 24}'::jsonb,
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
  -- Canonical coordinates. Interpreted per the owning board's
  -- dashboards.config->>'unit': 1 slot == 1 hour, day, week, month or year.
  start_slot INTEGER NOT NULL DEFAULT 0 CHECK (start_slot >= 0),
  duration_slot INTEGER NOT NULL DEFAULT 1 CHECK (duration_slot > 0),
  -- Absolute-hour mirror of the slots above, kept in step by sync_task_hour_mirror().
  start_hour NUMERIC NOT NULL DEFAULT 0,
  duration_hours NUMERIC NOT NULL DEFAULT 1,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_start_slot ON public.tasks(employee_id, start_slot);

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

-- Keep the absolute-hour mirror in step with the canonical slots, so any writer that
-- only knows about slots still leaves start_hour/duration_hours correct.
CREATE OR REPLACE FUNCTION public.sync_task_hour_mirror()
RETURNS TRIGGER AS $$
DECLARE
  hours_per_slot INTEGER;
BEGIN
  SELECT CASE COALESCE(d.config->>'unit', 'hours')
    WHEN 'days' THEN 24
    WHEN 'weeks' THEN 168
    WHEN 'months' THEN 720
    WHEN 'years' THEN 8760
    ELSE 1
  END
  INTO hours_per_slot
  FROM public.dashboards d
  WHERE d.id = NEW.dashboard_id;

  IF hours_per_slot IS NULL THEN
    hours_per_slot := 1;
  END IF;

  IF NEW.start_slot IS NOT NULL THEN
    NEW.start_hour := NEW.start_slot * hours_per_slot;
  END IF;

  IF NEW.duration_slot IS NOT NULL THEN
    NEW.duration_hours := NEW.duration_slot * hours_per_slot;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_task_hour_mirror_trigger ON public.tasks;

CREATE TRIGGER sync_task_hour_mirror_trigger
  BEFORE INSERT OR UPDATE OF start_slot, duration_slot, dashboard_id ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_task_hour_mirror();
