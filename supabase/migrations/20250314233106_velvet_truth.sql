/*
  # Fix Health Records and Vaccinations Indexes

  1. Drop existing indexes if they exist
  2. Recreate indexes with unique names
  3. Add missing farm_id relationships
*/

-- Drop existing indexes if they exist
DO $$ 
BEGIN
  -- Drop health records indexes
  DROP INDEX IF EXISTS health_records_farm_id_idx;
  DROP INDEX IF EXISTS health_records_animal_id_idx;
  DROP INDEX IF EXISTS health_records_date_idx;
  DROP INDEX IF EXISTS health_records_type_idx;
  DROP INDEX IF EXISTS health_records_status_idx;

  -- Drop vaccinations indexes
  DROP INDEX IF EXISTS vaccinations_farm_id_idx;
  DROP INDEX IF EXISTS vaccinations_animal_id_idx;
  DROP INDEX IF EXISTS vaccinations_date_idx;
  DROP INDEX IF EXISTS vaccinations_next_dose_date_idx;
END $$;

-- Recreate indexes with unique names
DO $$ 
BEGIN
  -- Create health records indexes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_records') THEN
    CREATE INDEX health_records_farm_id_idx_v2 ON health_records (farm_id);
    CREATE INDEX health_records_animal_id_idx_v2 ON health_records (animal_id);
    CREATE INDEX health_records_date_idx_v2 ON health_records (date);
    CREATE INDEX health_records_type_idx_v2 ON health_records (type);
    CREATE INDEX health_records_status_idx_v2 ON health_records (status);
  END IF;

  -- Create vaccinations indexes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vaccinations') THEN
    CREATE INDEX vaccinations_farm_id_idx_v2 ON vaccinations (farm_id);
    CREATE INDEX vaccinations_animal_id_idx_v2 ON vaccinations (animal_id);
    CREATE INDEX vaccinations_date_idx_v2 ON vaccinations (date);
    CREATE INDEX vaccinations_next_dose_date_idx_v2 ON vaccinations (next_dose_date);
  END IF;
END $$;