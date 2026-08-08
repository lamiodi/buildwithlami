-- v29_expense_tracking.sql
-- Adds the expenses table for MVP Expense Tracking feature

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
        CREATE TABLE expenses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            amount NUMERIC(12,2) NOT NULL,
            division TEXT NOT NULL DEFAULT 'SOFTWARE' CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE')),
            payment_method TEXT NOT NULL DEFAULT 'BANK_TRANSFER' CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'CARD', 'OTHER')),
            receipt_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX idx_expenses_date ON expenses (expense_date DESC);
        CREATE INDEX idx_expenses_division ON expenses (division);
        CREATE INDEX idx_expenses_category ON expenses (category);
    END IF;
END $$;
