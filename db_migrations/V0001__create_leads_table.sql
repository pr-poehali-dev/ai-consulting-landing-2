CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  task_type TEXT CHECK (task_type IN ('pilot', 'full_project', 'audit')),
  message TEXT,
  tg_notified BOOLEAN NOT NULL DEFAULT FALSE,
  tg_error TEXT
);
