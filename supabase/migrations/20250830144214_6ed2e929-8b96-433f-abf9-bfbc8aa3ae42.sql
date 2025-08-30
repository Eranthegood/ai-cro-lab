-- Add missing columns to waitlist table for enhanced qualification data
ALTER TABLE public.waitlist 
ADD COLUMN company_size text,
ADD COLUMN role text,
ADD COLUMN current_tools text[];