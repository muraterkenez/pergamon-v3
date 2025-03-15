/*
  # Add farm_id to remaining tables

  1. Changes
    - Add farm_id to milk_records
    - Add farm_id to milk_quality_tests
    - Add farm_id to milk_production_targets
    - Update RLS policies to include farm_id checks

  2. Security
    - Maintain existing RLS policies
    - Add farm_id based access control
*/

-- Add farm_id to milk_records
ALTER TABLE milk_records 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

-- Add farm_id to milk_quality_tests
ALTER TABLE milk_quality_tests 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

-- Add farm_id to milk_production_targets
ALTER TABLE milk_production_targets 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read milk records" ON milk_records;
DROP POLICY IF EXISTS "Users can insert milk records" ON milk_records;
DROP POLICY IF EXISTS "Users can update milk records" ON milk_records;

DROP POLICY IF EXISTS "Users can read milk quality tests" ON milk_quality_tests;
DROP POLICY IF EXISTS "Users can manage milk quality tests" ON milk_quality_tests;

DROP POLICY IF EXISTS "Users can read milk production targets" ON milk_production_targets;
DROP POLICY IF EXISTS "Users can manage milk production targets" ON milk_production_targets;

-- Create new policies with farm_id checks
CREATE POLICY "milk_records_read_v2"
  ON milk_records
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "milk_records_insert_v2"
  ON milk_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "milk_records_update_v2"
  ON milk_records
  FOR UPDATE
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "milk_quality_tests_read_v2"
  ON milk_quality_tests
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "milk_quality_tests_manage_v2"
  ON milk_quality_tests
  FOR ALL
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "milk_production_targets_read_v2"
  ON milk_production_targets
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "milk_production_targets_manage_v2"
  ON milk_production_targets
  FOR ALL
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create indexes for farm_id
CREATE INDEX IF NOT EXISTS milk_records_farm_id_idx ON milk_records (farm_id);
CREATE INDEX IF NOT EXISTS milk_quality_tests_farm_id_idx ON milk_quality_tests (farm_id);
CREATE INDEX IF NOT EXISTS milk_production_targets_farm_id_idx ON milk_production_targets (farm_id);