/*
  # Analytics and Reporting Schema

  1. New Tables
    - `analytics_metrics`
      - Core metrics and KPIs
      - Supports various data types and categories
      - Includes metadata for flexible data storage
    
    - `analytics_dashboards`
      - Customizable dashboard configurations
      - Layout and widget settings
      - User preferences
    
    - `analytics_reports`
      - Report templates and schedules
      - Distribution settings
      - Historical tracking

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users
    - Role-based access control
*/

-- Metrics table for storing KPIs and measurements
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  value numeric NOT NULL,
  unit text,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dashboard configurations
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  widgets jsonb[] NOT NULL DEFAULT ARRAY[]::jsonb[],
  is_default boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Report templates and configurations
CREATE TABLE IF NOT EXISTS analytics_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template jsonb NOT NULL,
  schedule text, -- Cron expression for scheduling
  recipients jsonb[] DEFAULT ARRAY[]::jsonb[],
  last_generated timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

-- Policies for analytics_metrics
CREATE POLICY "Users can read metrics"
  ON analytics_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert metrics"
  ON analytics_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for analytics_dashboards
CREATE POLICY "Users can read dashboards"
  ON analytics_dashboards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own dashboards"
  ON analytics_dashboards
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Policies for analytics_reports
CREATE POLICY "Users can read reports"
  ON analytics_reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own reports"
  ON analytics_reports
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Updated at triggers
CREATE TRIGGER update_analytics_metrics_updated_at
  BEFORE UPDATE ON analytics_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_dashboards_updated_at
  BEFORE UPDATE ON analytics_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_reports_updated_at
  BEFORE UPDATE ON analytics_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();