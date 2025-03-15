-- Drop existing policies
DROP POLICY IF EXISTS "farms_read_v5" ON farms;
DROP POLICY IF EXISTS "farms_insert_v5" ON farms;
DROP POLICY IF EXISTS "farms_update_v5" ON farms;

-- Create new policies
CREATE POLICY "farms_read_v6"
  ON farms
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow any authenticated user to insert a new farm
CREATE POLICY "farms_insert_v6"
  ON farms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update farms they belong to
CREATE POLICY "farms_update_v6"
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