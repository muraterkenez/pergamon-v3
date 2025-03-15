/*
  # Fix Duplicate Policies

  1. Drop duplicate policies
  2. Recreate necessary policies if missing
  3. Ensure unique policy names
*/

-- Drop potentially duplicate policies
DO $$ 
BEGIN
  -- Drop breeding_records policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'breeding_records' 
    AND policyname = 'Users can read breeding records'
  ) THEN
    DROP POLICY IF EXISTS "Users can read breeding records" ON breeding_records;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'breeding_records' 
    AND policyname = 'Users can insert breeding records'
  ) THEN
    DROP POLICY IF EXISTS "Users can insert breeding records" ON breeding_records;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'breeding_records' 
    AND policyname = 'Users can update breeding records'
  ) THEN
    DROP POLICY IF EXISTS "Users can update breeding records" ON breeding_records;
  END IF;

  -- Drop breeding_cycles policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'breeding_cycles' 
    AND policyname = 'Users can read breeding cycles'
  ) THEN
    DROP POLICY IF EXISTS "Users can read breeding cycles" ON breeding_cycles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'breeding_cycles' 
    AND policyname = 'Users can manage breeding cycles'
  ) THEN
    DROP POLICY IF EXISTS "Users can manage breeding cycles" ON breeding_cycles;
  END IF;
END $$;

-- Recreate policies with unique names
CREATE POLICY "breeding_records_read" ON breeding_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "breeding_records_insert" ON breeding_records
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "breeding_records_update" ON breeding_records
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "breeding_cycles_read" ON breeding_cycles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "breeding_cycles_manage" ON breeding_cycles
  FOR ALL TO authenticated
  USING (true);