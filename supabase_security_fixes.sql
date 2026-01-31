-- ==========================================
-- ZENBOLSO: SECURITY FIXES
-- Resolves all Supabase Linter warnings
-- ==========================================

-- 1. FIX: Function Search Path Mutable
-- Add search_path to handle_updated_at() function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 2. FIX: Extension in Public Schema
-- Move pg_trgm extension to extensions schema (Supabase best practice)
-- Note: This requires dropping and recreating the extension
-- If you're using pg_trgm for fuzzy search, ensure no dependencies exist first

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop the extension from public (if it exists)
DROP EXTENSION IF EXISTS pg_trgm CASCADE;

-- Recreate in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Grant usage to authenticated users if needed
GRANT USAGE ON SCHEMA extensions TO authenticated;

-- 3. VERIFICATION: Check that all functions now have search_path set
-- Run this query to verify (optional, for manual checking):
-- SELECT 
--     n.nspname as schema,
--     p.proname as function_name,
--     pg_get_function_identity_arguments(p.oid) as arguments,
--     CASE 
--         WHEN p.proconfig IS NULL THEN 'NO search_path set'
--         ELSE array_to_string(p.proconfig, ', ')
--     END as config
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public' 
--   AND p.prokind = 'f'
--   AND p.proname IN ('exec_sql', 'handle_updated_at', 'seed_default_categories');

-- ==========================================
-- MANUAL STEPS REQUIRED (Do these in Supabase Dashboard):
-- ==========================================

-- 4. FIX: Leaked Password Protection
-- This cannot be fixed via SQL - you must enable it in the Supabase Dashboard:
-- 
-- Steps:
-- 1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/policies
-- 2. Navigate to: Authentication > Policies
-- 3. Find: "Password Strength and Leaked Password Protection"
-- 4. Enable: "Check against HaveIBeenPwned database"
-- 5. Save changes
--
-- Documentation: https://supabase.com/docs/guides/auth/password-security

-- ==========================================
-- NOTES:
-- ==========================================
-- - All functions now have 'SET search_path = public' for security
-- - pg_trgm extension moved to 'extensions' schema (Supabase best practice)
-- - Password leak protection requires manual dashboard configuration
-- - After running this migration, re-run the Supabase Linter to verify
