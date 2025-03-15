-- Add farm_id to animals table
ALTER TABLE animals 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

-- Drop existing policies
DROP POLICY IF EXISTS "animals_read" ON animals;
DROP POLICY IF EXISTS "animals_insert" ON animals;
DROP POLICY IF EXISTS "animals_update" ON animals;

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

-- Create index for farm_id
CREATE INDEX IF NOT EXISTS animals_farm_id_idx ON animals (farm_id);