-- Time plans: allow a board to be scheduled in hours, days, weeks, months or years.
--
-- Design:
--   * tasks.start_slot / tasks.duration_slot are the canonical coordinates and are
--     interpreted according to the owning board's dashboards.config->>'unit'.
--   * tasks.start_hour / tasks.duration_hours are retained as an absolute-hour mirror
--     so existing reads, reports and mixed-unit tooling keep working unchanged.
--   * dashboards.config keeps startSlot/endSlot and gains "unit". Legacy configs that
--     still carry startHour/endHour are migrated in place.

-- 1. Unit-aware task coordinates.
--    start_slot stays nullable so pre-migration rows remain distinguishable, which lets
--    the application fall back to start_hour while backfill runs.
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS start_slot INTEGER,
  ADD COLUMN IF NOT EXISTS duration_slot INTEGER;

-- Backfill: every existing board is an hours board, so slot == hour.
UPDATE tasks
SET
  start_slot = start_hour,
  duration_slot = duration_hours
WHERE start_slot IS NULL OR duration_slot IS NULL;

ALTER TABLE tasks
  ALTER COLUMN start_slot SET DEFAULT 0,
  ALTER COLUMN duration_slot SET DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_duration_slot_positive'
  ) THEN
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_duration_slot_positive CHECK (duration_slot > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_start_slot_non_negative'
  ) THEN
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_start_slot_non_negative CHECK (start_slot >= 0);
  END IF;
END $$;

-- 2. Migrate dashboard config to the slot-based shape with an explicit unit.
UPDATE dashboards
SET config = jsonb_build_object(
  'unit', COALESCE(config->>'unit', 'hours'),
  'startSlot', COALESCE((config->>'startSlot')::int, (config->>'startHour')::int, 0),
  'endSlot', COALESCE((config->>'endSlot')::int, (config->>'endHour')::int, 12)
)
WHERE config IS NULL
   OR NOT (config ? 'startSlot')
   OR NOT (config ? 'endSlot');

-- Guard against configs that survive with a null/garbage unit.
UPDATE dashboards
SET config = jsonb_set(config, '{unit}', '"hours"'::jsonb)
WHERE config IS NULL
   OR config->>'unit' IS NULL
   OR config->>'unit' NOT IN ('hours', 'days', 'weeks', 'months', 'years');

UPDATE dashboards
SET config = '{"unit":"hours","startSlot":0,"endSlot":24}'::jsonb
WHERE config IS NULL;

-- New boards open on the full 24-hour plan rather than the old 0-12 half day.
-- Existing boards keep whatever window they were saved with.
ALTER TABLE dashboards
  ALTER COLUMN config SET DEFAULT '{"unit":"hours","startSlot":0,"endSlot":24}'::jsonb;

-- 3. Slot lookups replace the hour index.
CREATE INDEX IF NOT EXISTS idx_tasks_start_slot ON tasks(employee_id, start_slot);

-- 4. Keep the hour mirror honest for any writer that touches only slots.
CREATE OR REPLACE FUNCTION sync_task_hour_mirror()
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
  FROM dashboards d
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

DROP TRIGGER IF EXISTS sync_task_hour_mirror_trigger ON tasks;

CREATE TRIGGER sync_task_hour_mirror_trigger
  BEFORE INSERT OR UPDATE OF start_slot, duration_slot, dashboard_id ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION sync_task_hour_mirror();