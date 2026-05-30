-- Phase 8: Loyalty Points (balance per user)
-- Flyway disabled (ddl-auto=create), file kept as schema reference

CREATE TABLE IF NOT EXISTS loyalty_points (
    id            BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       BIGINT       NOT NULL,
    points        INT          NOT NULL DEFAULT 0 CHECK (points >= 0),
    total_points  INT          NOT NULL DEFAULT 0 CHECK (total_points >= 0),
    status        VARCHAR(30)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_loyalty_points_user   UNIQUE (user_id),
    CONSTRAINT fk_loyalty_points_user   FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON loyalty_points (user_id);
