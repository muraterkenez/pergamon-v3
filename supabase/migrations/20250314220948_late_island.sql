/*
  # Update farm policies to allow registration

  1. Changes
    - Drop existing policies
    - Create new policies that allow:
      - New users to create farms during registration
      - Users to read and update their own farms
*/

-- Drop existing policies
DROP POLICY IF EXISTS "farms_read" ON farms;
DROP POLICY IF EXISTS "farms_insert" ON farms;
DROP POLICY IF EXISTS "farms_update" ON farms;

-- Create new policies
CREATE POLICY "farms_read_v2"
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

CREATE POLICY "farms_insert_v2"
  ON farms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "farms_update_v2"
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