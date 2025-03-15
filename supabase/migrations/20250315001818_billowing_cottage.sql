/*
  # Create deliveries table

  1. New Table
    - `deliveries`
      - Track milk and dairy product deliveries
      - Link to farms and customers
      - Store delivery details and status

  2. Security
    - Enable RLS
    - Add farm-based policies
*/

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  customer_name text NOT NULL,
  date date NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  status text NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes text,
  created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "deliveries_read"
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

CREATE POLICY "deliveries_insert"
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

CREATE POLICY "deliveries_update"
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

-- Create updated_at trigger
CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX deliveries_farm_id_idx ON deliveries (farm_id);
CREATE INDEX deliveries_date_idx ON deliveries (date);
CREATE INDEX deliveries_status_idx ON deliveries (status);