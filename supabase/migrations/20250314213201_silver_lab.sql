/*
  # Fix Duplicate Policies

  1. Changes
    - Drop all potentially duplicate policies
    - Recreate policies with consistent naming
    - Ensure no policy name conflicts

  2. Security
    - Maintain same security rules
    - Keep RLS enabled
*/

-- Drop all potentially duplicate policies
DO $$ 
BEGIN
  -- Drop breeding_records policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'breeding_records' 
    AND policyname IN (
      'breeding_records_read',
      'Users can read breeding records',
      'breeding_records_insert',
      'Users can insert breeding records',
      'breeding_records_update',
      'Users can update breeding records'
    )
  ) THEN
    DROP POLICY IF EXISTS "breeding_records_read" ON breeding_records;
    DROP POLICY IF EXISTS "Users can read breeding records" ON breeding_records;
    DROP POLICY IF EXISTS "breeding_records_insert" ON breeding_records;
    DROP POLICY IF EXISTS "Users can insert breeding records" ON breeding_records;
    DROP POLICY IF EXISTS "breeding_records_update" ON breeding_records;
    DROP POLICY IF EXISTS "Users can update breeding records" ON breeding_records;
  END IF;

  -- Drop breeding_cycles policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'breeding_cycles' 
    AND policyname IN (
      'breeding_cycles_read',
      'Users can read breeding cycles',
      'breeding_cycles_manage',
      'Users can manage breeding cycles'
    )
  ) THEN
    DROP POLICY IF EXISTS "breeding_cycles_read" ON breeding_cycles;
    DROP POLICY IF EXISTS "Users can read breeding cycles" ON breeding_cycles;
    DROP POLICY IF EXISTS "breeding_cycles_manage" ON breeding_cycles;
    DROP POLICY IF EXISTS "Users can manage breeding cycles" ON breeding_cycles;
  END IF;
END $$;

-- Recreate policies with consistent naming
-- Breeding Records
CREATE POLICY "breeding_records_read_v2" ON breeding_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "breeding_records_insert_v2" ON breeding_records
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "breeding_records_update_v2" ON breeding_records
  FOR UPDATE TO authenticated
  USING (true);

-- Breeding Cycles
CREATE POLICY "breeding_cycles_read_v2" ON breeding_cycles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "breeding_cycles_manage_v2" ON breeding_cycles
  FOR ALL TO authenticated
  USING (true);