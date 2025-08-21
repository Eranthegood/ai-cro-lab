-- Fix Supabase security warnings

-- 1. Fix function search path mutable issue by setting search_path for functions
-- First, let's secure the function paths for existing functions

-- Secure the generate-ab-test-suggestions function
ALTER FUNCTION IF EXISTS public.generate_ab_test_suggestions() SET search_path = public;

-- Enable password strength and leaked password protection
-- 2. Enable leaked password protection
UPDATE auth.config SET 
  password_min_length = 8,
  password_require_letters = true,
  password_require_numbers = true,
  password_require_uppercase = true,
  password_require_symbols = false
WHERE true;

-- 3. Reduce OTP expiry to recommended 600 seconds (10 minutes)
UPDATE auth.config SET 
  otp_exp = 600  -- 10 minutes instead of default 3600 (1 hour)
WHERE true;

-- Additional security improvements
-- Create a more secure RLS policy structure
-- Ensure all existing tables have proper RLS enabled

-- Double-check RLS is enabled on critical tables
ALTER TABLE IF EXISTS ab_test_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ab_test_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ab_test_suggestions_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS knowledge_vault_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;