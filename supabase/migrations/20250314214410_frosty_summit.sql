/*
  # Create farms and related tables

  1. New Tables
    - `farms`
      - Core farm information and settings
      - Base table for farm-based access control
    
    - `user_profiles`
      - Extended user information
      - Links users to farms
      - Stores user roles and preferences

  2. Security
    - Enable RLS on all tables
    - Farm-based access policies
*/

-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  tax_number text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  farm_id uuid REFERENCES farms(id),
  full_name text,
  role text NOT NULL DEFAULT 'worker',
  phone text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for farms
CREATE POLICY "farms_read"
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

CREATE POLICY "farms_insert"
  ON farms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "farms_update"
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

-- Create policies for user_profiles
CREATE POLICY "user_profiles_read"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "user_profiles_manage_own"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid());

-- Create updated_at triggers
CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX farms_name_idx ON farms (name);
CREATE INDEX user_profiles_farm_id_idx ON user_profiles (farm_id);