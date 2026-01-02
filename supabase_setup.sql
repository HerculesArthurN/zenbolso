-- ==========================================
-- ZENBOLSO: FULL DATABASE SETUP
-- Includes:
-- 1. SQL Runner (RPC) for Admin Tool
-- 2. Core Tables (Accounts, Categories, Transactions)
-- 3. Security (RLS Policies)
-- 4. Triggers (updated_at & default categories)
-- ==========================================

-- 1. SQL RUNNER FUNCTION (FOR ADMIN TOOL)
-- This function allows running raw SQL from the SqlEditor component
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    IF UPPER(TRIM(sql_query)) LIKE 'SELECT%' OR UPPER(TRIM(sql_query)) LIKE 'WITH%' THEN
        EXECUTE 'SELECT json_agg(t) FROM (' || sql_query || ') t' INTO result;
    ELSE
        EXECUTE sql_query;
        result := json_build_object(
            'status', 'success',
            'query', sql_query,
            'message', 'Command executed successfully'
        );
    END IF;
    RETURN COALESCE(result, '[]'::JSON);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Postgres Error: %', SQLERRM;
END;
$$;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    name TEXT NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'BANK'
        CHECK (type IN ('WALLET', 'BANK', 'INVESTMENT')),
    color TEXT NOT NULL DEFAULT '#6366f1',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TRIGGER set_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Tag',
    type TEXT NOT NULL
        CHECK (type IN ('INCOME', 'EXPENSE')),
    color TEXT NOT NULL DEFAULT '#94a3b8',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- 6. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    account_id UUID NOT NULL,
    category_id UUID,
    amount NUMERIC NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL
        CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TRIGGER set_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- 8. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES

-- ACCOUNTS
CREATE POLICY accounts_select ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY accounts_insert ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY accounts_update ON accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY accounts_delete ON accounts FOR DELETE USING (auth.uid() = user_id);

-- CATEGORIES
CREATE POLICY categories_select ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY categories_insert ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY categories_update ON categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY categories_delete ON categories FOR DELETE USING (auth.uid() = user_id);

-- TRANSACTIONS
CREATE POLICY transactions_select ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY transactions_insert ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY transactions_update ON transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY transactions_delete ON transactions FOR DELETE USING (auth.uid() = user_id);

-- 10. DEFAULT CATEGORIES SEEDING FUNCTION
CREATE OR REPLACE FUNCTION seed_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO categories (user_id, name, icon, type, color) VALUES
        (NEW.id, 'Alimentação', 'Utensils', 'EXPENSE', '#f87171'),
        (NEW.id, 'Transporte', 'Car', 'EXPENSE', '#fbbf24'),
        (NEW.id, 'Moradia', 'Home', 'EXPENSE', '#60a5fa'),
        (NEW.id, 'Lazer', 'Palmtree', 'EXPENSE', '#34d399'),
        (NEW.id, 'Salário', 'Briefcase', 'INCOME', '#10b981'),
        (NEW.id, 'Investimentos', 'TrendingUp', 'INCOME', '#6366f1'),
        (NEW.id, 'Outros', 'PlusCircle', 'EXPENSE', '#94a3b8');
    RETURN NEW;
END;
$$;

-- Trigger to seed categories on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE seed_default_categories();
