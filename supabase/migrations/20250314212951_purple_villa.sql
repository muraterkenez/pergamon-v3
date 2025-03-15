/*
  # Fix Duplicate Policies

  1. Drop all potentially duplicate policies
  2. Recreate policies with unique names
  3. Ensure consistent policy naming across tables
*/

-- Drop all potentially duplicate policies
DO $$ 
BEGIN
  -- Animals
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'animals' AND policyname = 'Users can read animals') THEN
    DROP POLICY IF EXISTS "Users can read animals" ON animals;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'animals' AND policyname = 'Users can insert animals') THEN
    DROP POLICY IF EXISTS "Users can insert animals" ON animals;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'animals' AND policyname = 'Users can update animals') THEN
    DROP POLICY IF EXISTS "Users can update animals" ON animals;
  END IF;

  -- Breeding Records
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'breeding_records' AND policyname = 'Users can read breeding records') THEN
    DROP POLICY IF EXISTS "Users can read breeding records" ON breeding_records;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'breeding_records' AND policyname = 'Users can insert breeding records') THEN
    DROP POLICY IF EXISTS "Users can insert breeding records" ON breeding_records;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'breeding_records' AND policyname = 'Users can update breeding records') THEN
    DROP POLICY IF EXISTS "Users can update breeding records" ON breeding_records;
  END IF;

  -- Breeding Cycles
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'breeding_cycles' AND policyname = 'Users can read breeding cycles') THEN
    DROP POLICY IF EXISTS "Users can read breeding cycles" ON breeding_cycles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'breeding_cycles' AND policyname = 'Users can manage breeding cycles') THEN
    DROP POLICY IF EXISTS "Users can manage breeding cycles" ON breeding_cycles;
  END IF;

  -- Health Records
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'health_records' AND policyname = 'Users can read health records') THEN
    DROP POLICY IF EXISTS "Users can read health records" ON health_records;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'health_records' AND policyname = 'Users can manage health records') THEN
    DROP POLICY IF EXISTS "Users can manage health records" ON health_records;
  END IF;
END $$;

-- Recreate policies with consistent naming
-- Animals
CREATE POLICY "animals_read" ON animals
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "animals_insert" ON animals
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "animals_update" ON animals
  FOR UPDATE TO authenticated
  USING (true);

-- Breeding Records
CREATE POLICY "breeding_records_read" ON breeding_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "breeding_records_insert" ON breeding_records
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "breeding_records_update" ON breeding_records
  FOR UPDATE TO authenticated
  USING (true);

-- Breeding Cycles
CREATE POLICY "breeding_cycles_read" ON breeding_cycles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "breeding_cycles_manage" ON breeding_cycles
  FOR ALL TO authenticated
  USING (true);

-- Health Records
CREATE POLICY "health_records_read" ON health_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "health_records_manage" ON health_records
  FOR ALL TO authenticated
  USING (true);