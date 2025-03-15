/*
  # Fix duplicate triggers

  1. Drop all potentially duplicate triggers
  2. Recreate triggers with unique names
  3. Only create triggers for tables that exist
*/

-- Drop all potentially duplicate triggers
DO $$ 
BEGIN
  -- Drop existing triggers if they exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_metrics') THEN
    DROP TRIGGER IF EXISTS update_analytics_metrics_updated_at ON analytics_metrics;
    DROP TRIGGER IF EXISTS update_analytics_metrics_updated_at_v2 ON analytics_metrics;
    DROP TRIGGER IF EXISTS update_analytics_metrics_updated_at_v3 ON analytics_metrics;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_dashboards') THEN
    DROP TRIGGER IF EXISTS update_analytics_dashboards_updated_at ON analytics_dashboards;
    DROP TRIGGER IF EXISTS update_analytics_dashboards_updated_at_v2 ON analytics_dashboards;
    DROP TRIGGER IF EXISTS update_analytics_dashboards_updated_at_v3 ON analytics_dashboards;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_reports') THEN
    DROP TRIGGER IF EXISTS update_analytics_reports_updated_at ON analytics_reports;
    DROP TRIGGER IF EXISTS update_analytics_reports_updated_at_v2 ON analytics_reports;
    DROP TRIGGER IF EXISTS update_analytics_reports_updated_at_v3 ON analytics_reports;
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
    CREATE TRIGGER update_analytics_metrics_updated_at_v4
      BEFORE UPDATE ON analytics_metrics
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_dashboards') THEN
    CREATE TRIGGER update_analytics_dashboards_updated_at_v4
      BEFORE UPDATE ON analytics_dashboards
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_reports') THEN
    CREATE TRIGGER update_analytics_reports_updated_at_v4
      BEFORE UPDATE ON analytics_reports
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;