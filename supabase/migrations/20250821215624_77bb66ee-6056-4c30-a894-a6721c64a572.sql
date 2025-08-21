-- Enhance AB Test suggestions with visual context
-- Update the generate-ab-test-suggestions function to handle screenshot data

-- First, let's modify the existing structure to support visual analysis
ALTER TABLE IF EXISTS ab_test_suggestions 
ADD COLUMN IF NOT EXISTS screenshot_data JSONB,
ADD COLUMN IF NOT EXISTS visual_elements JSONB,
ADD COLUMN IF NOT EXISTS detected_colors TEXT[],
ADD COLUMN IF NOT EXISTS page_performance JSONB;