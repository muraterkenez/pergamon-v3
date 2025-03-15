/*
  # Fix deliveries table policies

  1. Changes
    - Drop existing policies
    - Recreate policies with unique names
    - Keep same security rules
*/

-- Drop existing policies
DROP POLICY IF EXISTS "deliveries_read" ON deliveries;
DROP POLICY IF EXISTS "deliveries_insert" ON deliveries;
DROP POLICY IF EXISTS "deliveries_update" ON deliveries;

-- Create new policies with unique names
CREATE POLICY "deliveries_read_v2"
  ON deliveries
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "deliveries_insert_v2"
  ON deliveries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "deliveries_update_v2"
  ON deliveries
  FOR UPDATE
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );