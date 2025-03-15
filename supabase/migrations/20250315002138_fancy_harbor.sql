/*
  # Add Daily Stats Table

  1. New Tables
    - `daily_stats`
      - Daily production and financial metrics
      - Farm-based access control
      - Unique constraint on farm_id and date

  2. Security
    - Enable RLS
    - Add farm-based policies
*/

-- Create daily stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  date date NOT NULL,
  milk_production numeric NOT NULL DEFAULT 0,
  milk_revenue numeric NOT NULL DEFAULT 0,
  feed_cost numeric NOT NULL DEFAULT 0,
  labor_cost numeric NOT NULL DEFAULT 0,
  other_cost numeric NOT NULL DEFAULT 0,
  total_revenue numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  profit numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(farm_id, date)
);

-- Enable RLS
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "daily_stats_read_v1"
  ON daily_stats
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "daily_stats_insert_v1"
  ON daily_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "daily_stats_update_v1"
  ON daily_stats
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
CREATE TRIGGER update_daily_stats_updated_at_v1
  BEFORE UPDATE ON daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX daily_stats_farm_id_idx_v1 ON daily_stats (farm_id);
CREATE INDEX daily_stats_date_idx_v1 ON daily_stats (date);