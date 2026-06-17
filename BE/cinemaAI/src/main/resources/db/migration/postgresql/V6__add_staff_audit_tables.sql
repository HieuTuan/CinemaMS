-- Phase 10: Staff, Audit & Reports
-- Creates staff_profiles, staff_shifts, and audit_logs tables if they do not exist yet.

CREATE TABLE IF NOT EXISTS staff_profiles (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT      NOT NULL UNIQUE REFERENCES users(id),
    cinema_id     BIGINT               REFERENCES cinemas(id),
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    position      VARCHAR(100) NOT NULL,
    status        VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_cinema  ON staff_profiles(cinema_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_status  ON staff_profiles(status);

CREATE TABLE IF NOT EXISTS staff_shifts (
    id               BIGSERIAL PRIMARY KEY,
    staff_profile_id BIGINT       NOT NULL REFERENCES staff_profiles(id),
    start_time       TIMESTAMP    NOT NULL,
    end_time         TIMESTAMP    NOT NULL,
    note             VARCHAR(500),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_shifts_staff_time
    ON staff_shifts(staff_profile_id, start_time, end_time);

CREATE TABLE IF NOT EXISTS audit_logs (
    id            BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT               REFERENCES users(id),
    action        VARCHAR(30)  NOT NULL,
    target_type   VARCHAR(100) NOT NULL,
    target_id     BIGINT,
    detail        TEXT,
    ip_address    VARCHAR(100),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor  ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
