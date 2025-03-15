/*
  # Update farms table policies

  1. Changes
    - Drop existing policies
    - Create new policies that allow:
      - Any authenticated user to insert a new farm
      - Users to read and update only their own farm
    - Add index for better performance

  2. Security
    - Maintain RLS but allow initial farm creation
    - Restrict farm access to owners
*/

-- Drop existing policies
DROP POLICY IF EXISTS "farms_read_v3" ON farms;
DROP POLICY IF EXISTS "farms_insert_v3" ON farms;
DROP POLICY IF EXISTS "farms_update_v3" ON farms;

-- Create new policies
CREATE POLICY "farms_read_v4"
  ON farms
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow any authenticated user to insert a new farm
CREATE POLICY "farms_insert_v4"
  ON farms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only allow users to update their own farm
CREATE POLICY "farms_update_v4"
  ON farms
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS farms_id_idx ON farms(id);