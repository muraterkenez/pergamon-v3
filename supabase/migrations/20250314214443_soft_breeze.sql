/*
  # Fix duplicate triggers

  1. Drop all potentially duplicate triggers
  2. Recreate triggers with unique names
  3. Add missing triggers for new tables
*/

-- Drop all potentially duplicate triggers
DO $$ 
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS update_farms_updated_at ON farms;
  DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
  DROP TRIGGER IF EXISTS update_animals_updated_at ON animals;
  DROP TRIGGER IF EXISTS update_breeding_records_updated_at ON breeding_records;
  DROP TRIGGER IF EXISTS update_breeding_cycles_updated_at ON breeding_cycles;
  DROP TRIGGER IF EXISTS update_health_records_updated_at ON health_records;
  DROP TRIGGER IF EXISTS update_vaccinations_updated_at ON vaccinations;
  DROP TRIGGER IF EXISTS update_medications_updated_at ON medications;
  DROP TRIGGER IF EXISTS update_milk_records_updated_at ON milk_records;
  DROP TRIGGER IF EXISTS update_milk_quality_tests_updated_at ON milk_quality_tests;
  DROP TRIGGER IF EXISTS update_milk_production_targets_updated_at ON milk_production_targets;
  DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
  DROP TRIGGER IF EXISTS update_analytics_metrics_updated_at ON analytics_metrics;
  DROP TRIGGER IF EXISTS update_analytics_dashboards_updated_at ON analytics_dashboards;
  DROP TRIGGER IF EXISTS update_analytics_reports_updated_at ON analytics_reports;
END $$;

-- Recreate triggers with unique names
CREATE TRIGGER update_farms_updated_at_v2
  BEFORE UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at_v2
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_animals_updated_at_v2
  BEFORE UPDATE ON animals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breeding_records_updated_at_v2
  BEFORE UPDATE ON breeding_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breeding_cycles_updated_at_v2
  BEFORE UPDATE ON breeding_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at_v2
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at_v2
  BEFORE UPDATE ON vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at_v2
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milk_records_updated_at_v2
  BEFORE UPDATE ON milk_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milk_quality_tests_updated_at_v2
  BEFORE UPDATE ON milk_quality_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milk_production_targets_updated_at_v2
  BEFORE UPDATE ON milk_production_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at_v2
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_metrics_updated_at_v2
  BEFORE UPDATE ON analytics_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_dashboards_updated_at_v2
  BEFORE UPDATE ON analytics_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_reports_updated_at_v2
  BEFORE UPDATE ON analytics_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();