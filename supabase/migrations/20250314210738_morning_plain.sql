/*
  # Animal Lifecycle Management Schema

  1. New Tables
    - `animals`
      - Core animal information
      - Tracks basic details and current lifecycle stage
    
    - `animal_stages`
      - Lifecycle stage definitions and requirements
      - Tracks stage transitions and milestones
    
    - `animal_stage_changes`
      - Historical record of stage transitions
      - Tracks important events and measurements

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users
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

-- Stage transitions and requirements
CREATE TABLE IF NOT EXISTS animal_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id) NOT NULL,
  stage animal_lifecycle_stage NOT NULL,
  start_date date NOT NULL,
  end_date date,
  weight_at_start numeric,
  weight_at_end numeric,
  completed boolean DEFAULT false,
  requirements_met jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stage change history
CREATE TABLE IF NOT EXISTS animal_stage_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id) NOT NULL,
  from_stage animal_lifecycle_stage NOT NULL,
  to_stage animal_lifecycle_stage NOT NULL,
  change_date date NOT NULL,
  reason text,
  recorded_by uuid REFERENCES auth.users(id),
  measurements jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_stage_changes ENABLE ROW LEVEL SECURITY;

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

-- Policies for animal_stages
CREATE POLICY "Users can read animal stages"
  ON animal_stages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage animal stages"
  ON animal_stages
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for animal_stage_changes
CREATE POLICY "Users can read stage changes"
  ON animal_stage_changes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert stage changes"
  ON animal_stage_changes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON animals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_animal_stages_updated_at
  BEFORE UPDATE ON animal_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();