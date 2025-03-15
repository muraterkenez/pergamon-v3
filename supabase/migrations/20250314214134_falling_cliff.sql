/*
  # Add farm_id to remaining tables

  1. Changes
    - Add farm_id column to animals table
    - Add farm_id column to breeding_records table
    - Add farm_id column to breeding_cycles table
    - Update RLS policies to include farm_id checks

  2. Security
    - Maintain existing RLS policies
    - Add farm_id based access control
*/

-- Add farm_id to animals
ALTER TABLE animals 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

-- Add farm_id to breeding_records
ALTER TABLE breeding_records 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

-- Add farm_id to breeding_cycles
ALTER TABLE breeding_cycles 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

-- Drop existing policies
DROP POLICY IF EXISTS "animals_read" ON animals;
DROP POLICY IF EXISTS "animals_insert" ON animals;
DROP POLICY IF EXISTS "animals_update" ON animals;

DROP POLICY IF EXISTS "breeding_records_read_v3" ON breeding_records;
DROP POLICY IF EXISTS "breeding_records_insert_v3" ON breeding_records;
DROP POLICY IF EXISTS "breeding_records_update_v3" ON breeding_records;

DROP POLICY IF EXISTS "breeding_cycles_read_v3" ON breeding_cycles;
DROP POLICY IF EXISTS "breeding_cycles_manage_v3" ON breeding_cycles;

-- Create new policies with farm_id checks
CREATE POLICY "animals_read_v2"
  ON animals
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "animals_insert_v2"
  ON animals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "animals_update_v2"
  ON animals
  FOR UPDATE
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "breeding_records_read_v4"
  ON breeding_records
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "breeding_records_insert_v4"
  ON breeding_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "breeding_records_update_v4"
  ON breeding_records
  FOR UPDATE
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "breeding_cycles_read_v4"
  ON breeding_cycles
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "breeding_cycles_manage_v4"
  ON breeding_cycles
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
CREATE INDEX IF NOT EXISTS animals_farm_id_idx ON animals (farm_id);
CREATE INDEX IF NOT EXISTS breeding_records_farm_id_idx ON breeding_records (farm_id);
CREATE INDEX IF NOT EXISTS breeding_cycles_farm_id_idx ON breeding_cycles (farm_id);