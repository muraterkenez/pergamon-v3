/*
  # Add farm_id to health records

  1. Changes
    - Add farm_id column to health_records table
    - Add foreign key constraint to farms table
    - Update RLS policies to include farm_id checks

  2. Security
    - Maintain existing RLS policies
    - Add farm_id based access control
*/

-- Add farm_id column to health_records
ALTER TABLE health_records 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read health records" ON health_records;
DROP POLICY IF EXISTS "Users can manage health records" ON health_records;

-- Create new policies with farm_id checks
CREATE POLICY "health_records_read"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "health_records_manage"
  ON health_records
  FOR ALL
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create index for farm_id
CREATE INDEX IF NOT EXISTS health_records_farm_id_idx ON health_records (farm_id);