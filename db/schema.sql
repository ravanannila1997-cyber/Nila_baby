CREATE TABLE IF NOT EXISTS personas (
  id text PRIMARY KEY, name text NOT NULL, en_name text NOT NULL,
  tagline text NOT NULL, system_prompt text NOT NULL, pitch real NOT NULL DEFAULT 1.0
);
CREATE TABLE IF NOT EXISTS messages (
  id bigserial PRIMARY KEY, session_id text NOT NULL,
  persona_id text NOT NULL REFERENCES personas(id),
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_session_idx ON messages (session_id, persona_id, created_at);
