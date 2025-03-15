/*
  # Update Alerts Table

  1. Changes
    - Add category field for better organization
    - Add priority field for sorting
    - Add source field to track alert origin
    - Add metadata for additional context

  2. Security
    - Maintain existing RLS policies
    - Add appropriate indexes
*/

-- Add new columns to alerts table
ALTER TABLE alerts 
ADD COLUMN IF NOT EXISTS category text CHECK (category IN ('milk', 'health', 'inventory', 'system')) DEFAULT 'system',
ADD COLUMN IF NOT EXISTS priority integer CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS alerts_category_idx ON alerts (category);
CREATE INDEX IF NOT EXISTS alerts_priority_idx ON alerts (priority);

-- Insert some sample alerts
INSERT INTO alerts (farm_id, type, category, priority, message, source, metadata)
SELECT 
  id as farm_id,
  'warning' as type,
  'milk' as category,
  4 as priority,
  'Tank sıcaklığı yükseliyor' as message,
  'tank_monitor' as source,
  jsonb_build_object(
    'temperature', 4.8,
    'threshold', 4.4,
    'tank_id', 'main'
  ) as metadata
FROM farms
WHERE NOT EXISTS (
  SELECT 1 FROM alerts WHERE alerts.farm_id = farms.id AND type = 'warning' AND category = 'milk'
);