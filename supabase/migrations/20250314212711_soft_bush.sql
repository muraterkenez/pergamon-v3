/*
  # Base Schema Migration

  1. New Tables
    - `animals`
      - Core animal information
      - Lifecycle tracking
      - Health and breeding status

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Animal lifecycle stages enum
CREATE TYPE animal_lifecycle_stage AS ENUM (
  'calf',           -- Buzağı (0-2 ay)
  'weaned_calf',    -- Sütten Kesilmiş Buzağı (2-3 ay)
  'young_heifer',   -- Genç Düve Adayı (3-12 ay)
  'heifer',         -- Düve (12-24 ay)
  'cow'            -- İnek (24+ ay)
);

-- Create animals table
CREATE TABLE IF NOT EXISTS animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ear_tag text UNIQUE NOT NULL,
  name text NOT NULL,
  birth_date date NOT NULL,
  breed text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  current_stage animal_lifecycle_stage NOT NULL,
  mother_id uuid REFERENCES animals(id),
  father_id uuid REFERENCES animals(id),
  weight numeric,
  status text NOT NULL CHECK (status IN ('healthy', 'sick', 'pregnant', 'lactating')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read animals"
  ON animals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert animals"
  ON animals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update animals"
  ON animals
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON animals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();