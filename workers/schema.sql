-- ============================================
-- schema.sql — tabela de comentários
-- Rode com: wrangler d1 execute DB_COMENTARIOS --file=./schema.sql
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT    NOT NULL,          -- identifica o artigo (ex: /parto-normal)
  google_sub   TEXT    NOT NULL,          -- id único e estável do usuário Google
  name         TEXT,
  email        TEXT,
  picture      TEXT,
  texto        TEXT    NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_slug_status
  ON comments (slug, status);

CREATE INDEX IF NOT EXISTS idx_comments_google_sub
  ON comments (google_sub, created_at);
