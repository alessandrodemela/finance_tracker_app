-- ============================================================
-- Migration: Sprint 6 Security - RLS + Atomic Balance RPC
-- Execute in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: RPC atomica per aggiornamento saldo
-- Risolve la race condition READ > UPDATE in adjustAccountBalance
-- ============================================================

CREATE OR REPLACE FUNCTION adjust_account_balance(
  p_account_id UUID,
  p_amount     NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE accounts
  SET active_balance = active_balance + p_amount
  WHERE id = p_account_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION ''Account % not found'', p_account_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION adjust_account_balance(UUID, NUMERIC) TO authenticated;

-- ============================================================
-- STEP 2: Aggiunta colonna user_id a tutte le tabelle
-- ============================================================

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

ALTER TABLE budget_categories
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- ============================================================
-- STEP 3: Abilita RLS
-- ============================================================

ALTER TABLE accounts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 4-8: Policy RLS per ogni tabella
-- IS NULL per compatibilita dati pre-migrazione
-- ============================================================

-- accounts
DROP POLICY IF EXISTS "accounts_select_own" ON accounts;
DROP POLICY IF EXISTS "accounts_insert_own" ON accounts;
DROP POLICY IF EXISTS "accounts_update_own" ON accounts;
DROP POLICY IF EXISTS "accounts_delete_own" ON accounts;

CREATE POLICY "accounts_select_own" ON accounts FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "accounts_insert_own" ON accounts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "accounts_update_own" ON accounts FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL) WITH CHECK (user_id = auth.uid());
CREATE POLICY "accounts_delete_own" ON accounts FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- transactions
DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
DROP POLICY IF EXISTS "transactions_insert_own" ON transactions;
DROP POLICY IF EXISTS "transactions_update_own" ON transactions;
DROP POLICY IF EXISTS "transactions_delete_own" ON transactions;

CREATE POLICY "transactions_select_own" ON transactions FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "transactions_insert_own" ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "transactions_update_own" ON transactions FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL) WITH CHECK (user_id = auth.uid());
CREATE POLICY "transactions_delete_own" ON transactions FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- categories
DROP POLICY IF EXISTS "categories_select_own" ON categories;
DROP POLICY IF EXISTS "categories_insert_own" ON categories;
DROP POLICY IF EXISTS "categories_update_own" ON categories;
DROP POLICY IF EXISTS "categories_delete_own" ON categories;

CREATE POLICY "categories_select_own" ON categories FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "categories_insert_own" ON categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "categories_update_own" ON categories FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL) WITH CHECK (user_id = auth.uid());
CREATE POLICY "categories_delete_own" ON categories FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- budget_categories
DROP POLICY IF EXISTS "budget_categories_select_own" ON budget_categories;
DROP POLICY IF EXISTS "budget_categories_insert_own" ON budget_categories;
DROP POLICY IF EXISTS "budget_categories_update_own" ON budget_categories;
DROP POLICY IF EXISTS "budget_categories_delete_own" ON budget_categories;

CREATE POLICY "budget_categories_select_own" ON budget_categories FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "budget_categories_insert_own" ON budget_categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "budget_categories_update_own" ON budget_categories FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL) WITH CHECK (user_id = auth.uid());
CREATE POLICY "budget_categories_delete_own" ON budget_categories FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- budgets
DROP POLICY IF EXISTS "budgets_select_own" ON budgets;
DROP POLICY IF EXISTS "budgets_insert_own" ON budgets;
DROP POLICY IF EXISTS "budgets_update_own" ON budgets;
DROP POLICY IF EXISTS "budgets_delete_own" ON budgets;

CREATE POLICY "budgets_select_own" ON budgets FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "budgets_insert_own" ON budgets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "budgets_update_own" ON budgets FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL) WITH CHECK (user_id = auth.uid());
CREATE POLICY "budgets_delete_own" ON budgets FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- ============================================================
-- STEP 9 (OPZIONALE): Backfill dati esistenti
-- Decommentare e sostituire YOUR-USER-ID con il tuo auth.uid()
-- ============================================================
-- UPDATE accounts          SET user_id = 'YOUR-USER-ID' WHERE user_id IS NULL;
-- UPDATE transactions      SET user_id = 'YOUR-USER-ID' WHERE user_id IS NULL;
-- UPDATE categories        SET user_id = 'YOUR-USER-ID' WHERE user_id IS NULL;
-- UPDATE budget_categories SET user_id = 'YOUR-USER-ID' WHERE user_id IS NULL;
-- UPDATE budgets           SET user_id = 'YOUR-USER-ID' WHERE user_id IS NULL;

-- ============================================================
-- Verifica finale
-- ============================================================
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename IN (''accounts'', ''transactions'', ''categories'', ''budget_categories'', ''budgets'');
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = ''public'' ORDER BY tablename, policyname;
