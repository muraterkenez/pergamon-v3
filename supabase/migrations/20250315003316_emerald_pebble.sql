/*
  # Fix Tank Status and Alerts Tables

  1. Changes
    - Drop existing tables if they exist
    - Recreate tables with proper constraints
    - Add farm-based policies
    - Add appropriate indexes

  2. Security
    - Enable RLS
    - Add farm-based access control
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS tank_status CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;

-- Create tank status table
CREATE TABLE IF NOT EXISTS tank_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  temperature numeric NOT NULL CHECK (temperature >= 0 AND temperature <= 15),
  level numeric NOT NULL CHECK (level >= 0),
  capacity numeric NOT NULL CHECK (capacity > 0),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('warning', 'danger', 'info')),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tank_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for tank_status
CREATE POLICY "tank_status_read_v2"
  ON tank_status
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "tank_status_insert_v2"
  ON tank_status
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "tank_status_update_v2"
  ON tank_status
  FOR UPDATE
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create policies for alerts
CREATE POLICY "alerts_read_v2"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "alerts_insert_v2"
  ON alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "alerts_update_v2"
  ON alerts
  FOR UPDATE
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_tank_status_updated_at_v2
  BEFORE UPDATE ON tank_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at_v2
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX tank_status_farm_id_idx_v2 ON tank_status (farm_id);
CREATE INDEX tank_status_last_updated_idx_v2 ON tank_status (last_updated);
CREATE INDEX alerts_farm_id_idx_v2 ON alerts (farm_id);
CREATE INDEX alerts_status_idx_v2 ON alerts (status);
CREATE INDEX alerts_type_idx_v2 ON alerts (type);

-- Insert initial tank status record for each farm
INSERT INTO tank_status (farm_id, temperature, level, capacity)
SELECT 
  id as farm_id,
  4.0 as temperature,
  0 as level,
  15000 as capacity
FROM farms
ON CONFLICT DO NOTHING;