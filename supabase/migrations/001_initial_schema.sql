-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
  id TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  config JSONB DEFAULT '{"startHour": 0, "endHour": 12}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member',
  color TEXT,
  position_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
  duration_hours INTEGER NOT NULL DEFAULT 1 CHECK (duration_hours > 0),
  start_hour INTEGER NOT NULL DEFAULT 0 CHECK (start_hour >= 0),
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboards
CREATE POLICY "Users can view their own dashboards"
  ON dashboards FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public dashboards"
  ON dashboards FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert their own dashboards"
  ON dashboards FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own dashboards"
  ON dashboards FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own dashboards"
  ON dashboards FOR DELETE
  USING (auth.uid() = owner_id);

-- Create policies for employees
CREATE POLICY "Users can view employees in their dashboards"
  ON employees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = employees.dashboard_id
      AND dashboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view public dashboard employees"
  ON employees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = employees.dashboard_id
      AND dashboards.is_public = true
    )
  );

CREATE POLICY "Users can insert employees in their dashboards"
  ON employees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = employees.dashboard_id
      AND dashboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update employees in their dashboards"
  ON employees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = employees.dashboard_id
      AND dashboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete employees in their dashboards"
  ON employees FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = employees.dashboard_id
      AND dashboards.owner_id = auth.uid()
    )
  );

-- Create policies for tasks
CREATE POLICY "Users can view tasks in their dashboards"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = tasks.dashboard_id
      AND dashboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view public dashboard tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = tasks.dashboard_id
      AND dashboards.is_public = true
    )
  );

CREATE POLICY "Users can insert tasks in their dashboards"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = tasks.dashboard_id
      AND dashboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their dashboards"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = tasks.dashboard_id
      AND dashboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their dashboards"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = tasks.dashboard_id
      AND dashboards.owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboards_owner_id ON dashboards(owner_id);
CREATE INDEX IF NOT EXISTS idx_employees_dashboard_id ON employees(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(dashboard_id, position_order);
CREATE INDEX IF NOT EXISTS idx_tasks_dashboard_id ON tasks(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_tasks_employee_id ON tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_start_hour ON tasks(employee_id, start_hour);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();