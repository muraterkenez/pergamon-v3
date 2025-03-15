/*
  # Update animal policies with unique names

  1. Changes
    - Drop existing policies
    - Create new policies with unique names
    - Add farm_id check to policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "animals_read_v2" ON animals;
DROP POLICY IF EXISTS "animals_insert_v2" ON animals;
DROP POLICY IF EXISTS "animals_update_v2" ON animals;

-- Create new policies with unique names
CREATE POLICY "animals_read_v3"
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

CREATE POLICY "animals_insert_v3"
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

CREATE POLICY "animals_update_v3"
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