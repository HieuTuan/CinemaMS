-- Align deployed PostgreSQL schema with the current ticket pricing code.
--
-- Current code expects:
-- ticket_pricing_rules.room_type
-- ticket_combos.adult_count / child_count / senior_count / student_count / price

DO $$
BEGIN
    IF to_regclass('public.ticket_pricing_rules') IS NOT NULL THEN
        ALTER TABLE ticket_pricing_rules
            ADD COLUMN IF NOT EXISTS room_type VARCHAR(30);

        UPDATE ticket_pricing_rules
        SET room_type = 'STANDARD'
        WHERE room_type IS NULL;

        ALTER TABLE ticket_pricing_rules
            ALTER COLUMN room_type SET DEFAULT 'STANDARD',
            ALTER COLUMN room_type SET NOT NULL;

        ALTER TABLE ticket_pricing_rules
            ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

        UPDATE ticket_pricing_rules
        SET active = TRUE
        WHERE active IS NULL;

        ALTER TABLE ticket_pricing_rules
            ALTER COLUMN active SET DEFAULT TRUE,
            ALTER COLUMN active SET NOT NULL;

        ALTER TABLE ticket_pricing_rules
            DROP COLUMN IF EXISTS age_rating;
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('public.ticket_pricing_rules') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_ticket_pricing_rules_lookup
            ON ticket_pricing_rules(ticket_type, room_type, weekend, holiday, active);
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('public.ticket_combos') IS NOT NULL THEN
        ALTER TABLE ticket_combos
            ADD COLUMN IF NOT EXISTS adult_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS child_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS senior_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS student_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS price NUMERIC(12, 2),
            ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

        UPDATE ticket_combos
        SET adult_count = 0
        WHERE adult_count IS NULL;

        UPDATE ticket_combos
        SET child_count = 0
        WHERE child_count IS NULL;

        UPDATE ticket_combos
        SET senior_count = 0
        WHERE senior_count IS NULL;

        UPDATE ticket_combos
        SET student_count = 0
        WHERE student_count IS NULL;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'ticket_combos'
              AND column_name = 'discount_amount'
        ) THEN
            UPDATE ticket_combos
            SET price = COALESCE(price, discount_amount, 0)
            WHERE price IS NULL;
        ELSE
            UPDATE ticket_combos
            SET price = COALESCE(price, 0)
            WHERE price IS NULL;
        END IF;

        UPDATE ticket_combos
        SET active = TRUE
        WHERE active IS NULL;

        ALTER TABLE ticket_combos
            ALTER COLUMN adult_count SET DEFAULT 0,
            ALTER COLUMN adult_count SET NOT NULL,
            ALTER COLUMN child_count SET DEFAULT 0,
            ALTER COLUMN child_count SET NOT NULL,
            ALTER COLUMN senior_count SET DEFAULT 0,
            ALTER COLUMN senior_count SET NOT NULL,
            ALTER COLUMN student_count SET DEFAULT 0,
            ALTER COLUMN student_count SET NOT NULL,
            ALTER COLUMN price SET NOT NULL,
            ALTER COLUMN active SET DEFAULT TRUE,
            ALTER COLUMN active SET NOT NULL;

        ALTER TABLE ticket_combos
            DROP COLUMN IF EXISTS discount_amount,
            DROP COLUMN IF EXISTS discount_percent;
    END IF;
END $$;
