/*
  # Create Breeding Management Tables

  1. New Tables
    - `breeding_records`
      - Records individual breeding events (insemination, checks, births)
      - Tracks technicians, results, and follow-up dates
    
    - `breeding_cycles`
      - Tracks complete breeding cycles from insemination to calving
      - Manages pregnancy status and expected dates

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create breeding records table
CREATE TABLE IF NOT EXISTS breeding_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id) NOT NULL,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('insemination', 'pregnancy_check', 'birth')),
  technician text,
  result text,
  next_check_date date,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create breeding cycles table
CREATE TABLE IF NOT EXISTS breeding_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id) NOT NULL,
  start_date date NOT NULL,
  end_date date,
  status text NOT NULL CHECK (status IN ('open', 'inseminated', 'pregnant', 'calved', 'failed')),
  insemination_count int DEFAULT 0,
  pregnancy_confirmed_date date,
  expected_calving_date date,
  actual_calving_date date,
  calf_id uuid REFERENCES animals(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_cycles ENABLE ROW LEVEL SECURITY;

-- Create policies for breeding_records
CREATE POLICY "Users can read breeding records"
  ON breeding_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert breeding records"
  ON breeding_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update breeding records"
  ON breeding_records
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for breeding_cycles
CREATE POLICY "Users can read breeding cycles"
  ON breeding_cycles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage breeding cycles"
  ON breeding_cycles
  FOR ALL
  TO authenticated
  USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_breeding_records_updated_at
  BEFORE UPDATE ON breeding_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breeding_cycles_updated_at
  BEFORE UPDATE ON breeding_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();