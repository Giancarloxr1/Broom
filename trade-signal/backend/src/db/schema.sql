-- Trade Signal - Schema DB PostgreSQL
-- Esecuzione idempotente: usa IF NOT EXISTS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Asset crypto monitorati
CREATE TABLE IF NOT EXISTS assets (
  id          SERIAL PRIMARY KEY,
  symbol      VARCHAR(32) UNIQUE NOT NULL,
  display_name VARCHAR(64),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Config indicatori per asset (o globale se asset_id NULL)
CREATE TABLE IF NOT EXISTS indicator_configs (
  id             SERIAL PRIMARY KEY,
  asset_id       INT REFERENCES assets(id) ON DELETE CASCADE,
  indicator_name VARCHAR(32) NOT NULL,
  params         JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (asset_id, indicator_name)
);

CREATE INDEX IF NOT EXISTS idx_indicator_configs_asset
  ON indicator_configs(asset_id);

-- Regole manuali segnali
CREATE TABLE IF NOT EXISTS rules (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(120) NOT NULL,
  type             VARCHAR(8) NOT NULL CHECK (type IN ('BUY','SELL')),
  dsl              JSONB NOT NULL,
  timeframes       TEXT[] NOT NULL DEFAULT ARRAY['1h']::TEXT[],
  confluence_mode  VARCHAR(16) NOT NULL DEFAULT 'all_tf',
  cooldown_minutes INT NOT NULL DEFAULT 60,
  enabled          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rules_enabled ON rules(enabled);

-- Segnali emessi
CREATE TABLE IF NOT EXISTS signals (
  id                  BIGSERIAL PRIMARY KEY,
  asset_id            INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  rule_id             INT REFERENCES rules(id) ON DELETE SET NULL,
  source              VARCHAR(16) NOT NULL DEFAULT 'manual',
  type                VARCHAR(8) NOT NULL CHECK (type IN ('BUY','SELL')),
  timeframe           VARCHAR(8) NOT NULL,
  price               NUMERIC(24,10) NOT NULL,
  score               NUMERIC(10,6),
  snapshot_indicators JSONB,
  telegram_sent       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_asset_created
  ON signals(asset_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_rule_created
  ON signals(rule_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at DESC);

-- Cache candele Binance
CREATE TABLE IF NOT EXISTS candles_cache (
  asset_id   INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  timeframe  VARCHAR(8) NOT NULL,
  open_time  BIGINT NOT NULL,
  close_time BIGINT NOT NULL,
  open       NUMERIC(24,10) NOT NULL,
  high       NUMERIC(24,10) NOT NULL,
  low        NUMERIC(24,10) NOT NULL,
  close      NUMERIC(24,10) NOT NULL,
  volume     NUMERIC(30,10) NOT NULL,
  PRIMARY KEY (asset_id, timeframe, open_time)
);

CREATE INDEX IF NOT EXISTS idx_candles_lookup
  ON candles_cache(asset_id, timeframe, open_time DESC);

-- Settings chiave/valore
CREATE TABLE IF NOT EXISTS settings (
  key        VARCHAR(64) PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio (singleton)
CREATE TABLE IF NOT EXISTS portfolio (
  id              INT PRIMARY KEY DEFAULT 1,
  initial_capital NUMERIC(20,4) NOT NULL DEFAULT 0,
  current_capital NUMERIC(20,4) NOT NULL DEFAULT 0,
  currency        VARCHAR(8) NOT NULL DEFAULT 'EUR',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT portfolio_singleton CHECK (id = 1)
);

-- Trade effettuati
CREATE TABLE IF NOT EXISTS trades (
  id          BIGSERIAL PRIMARY KEY,
  asset_id    INT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  side        VARCHAR(8) NOT NULL CHECK (side IN ('LONG','SHORT')),
  quantity    NUMERIC(30,10) NOT NULL CHECK (quantity > 0),
  entry_price NUMERIC(24,10) NOT NULL,
  exit_price  NUMERIC(24,10),
  entry_time  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exit_time   TIMESTAMPTZ,
  signal_id   BIGINT REFERENCES signals(id) ON DELETE SET NULL,
  pnl_abs     NUMERIC(20,6),
  pnl_pct     NUMERIC(12,6),
  status      VARCHAR(8) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trades_status  ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_asset   ON trades(asset_id);
CREATE INDEX IF NOT EXISTS idx_trades_entry   ON trades(entry_time DESC);

-- Config Smart Mode (pesi per indicatore)
CREATE TABLE IF NOT EXISTS indicator_weights (
  indicator_name      VARCHAR(32) PRIMARY KEY,
  weight              NUMERIC(8,4) NOT NULL DEFAULT 1.0,
  enabled             BOOLEAN NOT NULL DEFAULT TRUE,
  threshold_buy       NUMERIC(8,4) NOT NULL DEFAULT 0.6,
  threshold_sell      NUMERIC(8,4) NOT NULL DEFAULT 0.6,
  tf_confluence_count INT NOT NULL DEFAULT 2,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Risultati backtest Smart Mode
CREATE TABLE IF NOT EXISTS smart_backtests (
  id         BIGSERIAL PRIMARY KEY,
  run_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  params     JSONB NOT NULL,
  score      NUMERIC(12,6),
  best_config JSONB,
  stats      JSONB
);

CREATE INDEX IF NOT EXISTS idx_backtests_run ON smart_backtests(run_at DESC);
