/*
  # Fix triggers and add farm relationships

  1. Drop all potentially duplicate triggers
  2. Add missing farm_id relationships
  3. Recreate triggers with unique names
  4. Add appropriate indexes
*/

-- Drop all potentially duplicate triggers
DO $$ 
BEGIN
  -- Drop existing triggers if they exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_metrics') THEN
    DROP TRIGGER IF EXISTS update_analytics_metrics_updated_at ON analytics_metrics;
    DROP TRIGGER IF EXISTS update_analytics_metrics_updated_at_v2 ON analytics_metrics;
    DROP TRIGGER IF EXISTS update_analytics_metrics_updated_at_v3 ON analytics_metrics;
    DROP TRIGGER IF EXISTS update_analytics_metrics_updated_at_v4 ON analytics_metrics;
    DROP TRIGGER IF EXISTS update_analytics_metrics_updated_at_v5 ON analytics_metrics;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_dashboards') THEN
    DROP TRIGGER IF EXISTS update_analytics_dashboards_updated_at ON analytics_dashboards;
    DROP TRIGGER IF EXISTS update_analytics_dashboards_updated_at_v2 ON analytics_dashboards;
    DROP TRIGGER IF EXISTS update_analytics_dashboards_updated_at_v3 ON analytics_dashboards;
    DROP TRIGGER IF EXISTS update_analytics_dashboards_updated_at_v4 ON analytics_dashboards;
    DROP TRIGGER IF EXISTS update_analytics_dashboards_updated_at_v5 ON analytics_dashboards;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_reports') THEN
    DROP TRIGGER IF EXISTS update_analytics_reports_updated_at ON analytics_reports;
    DROP TRIGGER IF EXISTS update_analytics_reports_updated_at_v2 ON analytics_reports;
    DROP TRIGGER IF EXISTS update_analytics_reports_updated_at_v3 ON analytics_reports;
    DROP TRIGGER IF EXISTS update_analytics_reports_updated_at_v4 ON analytics_reports;
    DROP TRIGGER IF EXISTS update_analytics_reports_updated_at_v5 ON analytics_reports;
  END IF;
END $$;

-- Add missing farm_id relationships
DO $$ 
BEGIN
  -- Add farm_id to tables if it doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_metrics') 
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_metrics' AND column_name = 'farm_id') THEN
    ALTER TABLE analytics_metrics ADD COLUMN farm_id uuid REFERENCES farms(id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_dashboards')
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_dashboards' AND column_name = 'farm_id') THEN
    ALTER TABLE analytics_dashboards ADD COLUMN farm_id uuid REFERENCES farms(id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_reports')
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_reports' AND column_name = 'farm_id') THEN
    ALTER TABLE analytics_reports ADD COLUMN farm_id uuid REFERENCES farms(id);
  END IF;
END $$;

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate triggers with unique names
DO $$ 
BEGIN
  -- Only create triggers for tables that exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_metrics') THEN
    CREATE TRIGGER update_analytics_metrics_updated_at_v6
      BEFORE UPDATE ON analytics_metrics
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_dashboards') THEN
    CREATE TRIGGER update_analytics_dashboards_updated_at_v6
      BEFORE UPDATE ON analytics_dashboards
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_reports') THEN
    CREATE TRIGGER update_analytics_reports_updated_at_v6
      BEFORE UPDATE ON analytics_reports
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create indexes for farm_id if they don't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_metrics')
  AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'analytics_metrics' AND indexname = 'analytics_metrics_farm_id_idx') THEN
    CREATE INDEX analytics_metrics_farm_id_idx ON analytics_metrics (farm_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_dashboards')
  AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'analytics_dashboards' AND indexname = 'analytics_dashboards_farm_id_idx') THEN
    CREATE INDEX analytics_dashboards_farm_id_idx ON analytics_dashboards (farm_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_reports')
  AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'analytics_reports' AND indexname = 'analytics_reports_farm_id_idx') THEN
    CREATE INDEX analytics_reports_farm_id_idx ON analytics_reports (farm_id);
  END IF;
END $$;