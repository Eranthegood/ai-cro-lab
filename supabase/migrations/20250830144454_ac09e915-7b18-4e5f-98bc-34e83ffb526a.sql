-- Extract data from JSON user_agent field to new columns for existing waitlist entries
UPDATE public.waitlist 
SET 
  company_size = (user_agent::jsonb->>'companySize'),
  role = (user_agent::jsonb->>'role'),
  current_tools = CASE 
    WHEN user_agent::jsonb->>'currentTools' IS NOT NULL AND user_agent::jsonb->>'currentTools' != '' 
    THEN ARRAY[user_agent::jsonb->>'currentTools']
    ELSE NULL 
  END
WHERE 
  user_agent ~ '^{.*}$' -- Only process JSON-formatted user_agent fields
  AND company_size IS NULL -- Only update rows that haven't been updated yet
  AND (user_agent::jsonb->>'companySize') IS NOT NULL;