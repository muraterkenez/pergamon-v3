/*
  # Add farm_id to remaining tables

  1. Changes
    - Add farm_id to notifications
    - Add farm_id to analytics_metrics
    - Add farm_id to analytics_dashboards
    - Add farm_id to analytics_reports
    - Update RLS policies to include farm_id checks

  2. Security
    - Maintain existing RLS policies
    - Add farm_id based access control
*/

-- Add farm_id to notifications
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

-- Add farm_id to analytics tables
ALTER TABLE analytics_metrics 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

ALTER TABLE analytics_dashboards 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

ALTER TABLE analytics_reports 
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES farms(id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications" ON notifications;

DROP POLICY IF EXISTS "Users can read metrics" ON analytics_metrics;
DROP POLICY IF EXISTS "Users can insert metrics" ON analytics_metrics;

DROP POLICY IF EXISTS "Users can read dashboards" ON analytics_dashboards;
DROP POLICY IF EXISTS "Users can manage own dashboards" ON analytics_dashboards;

DROP POLICY IF EXISTS "Users can read reports" ON analytics_reports;
DROP POLICY IF EXISTS "Users can manage own reports" ON analytics_reports;

-- Create new policies with farm_id checks
CREATE POLICY "notifications_read_v2"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "notifications_update_v2"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "analytics_metrics_read_v2"
  ON analytics_metrics
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "analytics_metrics_insert_v2"
  ON analytics_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "analytics_dashboards_read_v2"
  ON analytics_dashboards
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "analytics_dashboards_manage_v2"
  ON analytics_dashboards
  FOR ALL
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "analytics_reports_read_v2"
  ON analytics_reports
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "analytics_reports_manage_v2"
  ON analytics_reports
  FOR ALL
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create indexes for farm_id
CREATE INDEX IF NOT EXISTS notifications_farm_id_idx ON notifications (farm_id);
CREATE INDEX IF NOT EXISTS analytics_metrics_farm_id_idx ON analytics_metrics (farm_id);
CREATE INDEX IF NOT EXISTS analytics_dashboards_farm_id_idx ON analytics_dashboards (farm_id);
CREATE INDEX IF NOT EXISTS analytics_reports_farm_id_idx ON analytics_reports (farm_id);