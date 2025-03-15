/*
  # Create notifications table with farm-based access control

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `farm_id` (uuid, references farms)
      - `title` (text)
      - `type` (text, enum: warning, success, info)
      - `content` (text, optional)
      - `read` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add farm-based access policies
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('warning', 'success', 'info')),
  content text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "notifications_read"
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

CREATE POLICY "notifications_update"
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

CREATE POLICY "notifications_insert"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for farm_id
CREATE INDEX notifications_farm_id_idx ON notifications (farm_id);