/*
  # Milk Production Schema

  1. New Tables
    - `milk_records`
      - Individual and group milk production records
      - Quality parameters tracking
      - Links to animals
    
    - `milk_quality_tests`
      - Detailed quality test results
      - Batch tracking
      - Quality parameters

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users
*/

-- Create milk records table
CREATE TABLE IF NOT EXISTS milk_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  animal_id uuid REFERENCES animals(id),
  date date NOT NULL,
  shift text NOT NULL CHECK (shift IN ('morning', 'evening')),
  milking_type text NOT NULL CHECK (milking_type IN ('individual', 'group')),
  quantity numeric NOT NULL CHECK (quantity > 0),
  temperature numeric CHECK (temperature BETWEEN 0 AND 10),
  fat_percentage numeric CHECK (fat_percentage BETWEEN 0 AND 10),
  protein_percentage numeric CHECK (protein_percentage BETWEEN 0 AND 10),
  somatic_cell_count numeric CHECK (somatic_cell_count >= 0),
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create milk quality tests table
CREATE TABLE IF NOT EXISTS milk_quality_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  date date NOT NULL,
  batch_number text,
  temperature numeric NOT NULL CHECK (temperature BETWEEN 0 AND 10),
  fat_percentage numeric NOT NULL CHECK (fat_percentage BETWEEN 0 AND 10),
  protein_percentage numeric NOT NULL CHECK (protein_percentage BETWEEN 0 AND 10),
  lactose_percentage numeric CHECK (lactose_percentage BETWEEN 0 AND 10),
  total_solids_percentage numeric CHECK (total_solids_percentage BETWEEN 0 AND 100),
  somatic_cell_count numeric CHECK (somatic_cell_count >= 0),
  bacterial_count numeric CHECK (bacterial_count >= 0),
  antibiotics_residue boolean DEFAULT false,
  ph_value numeric CHECK (ph_value BETWEEN 0 AND 14),
  density numeric CHECK (density > 0),
  freezing_point numeric,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create milk production targets table
CREATE TABLE IF NOT EXISTS milk_production_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  daily_target numeric NOT NULL CHECK (daily_target > 0),
  fat_target numeric CHECK (fat_target BETWEEN 0 AND 10),
  protein_target numeric CHECK (protein_target BETWEEN 0 AND 10),
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (end_date > start_date)
);

-- Enable RLS
ALTER TABLE milk_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_quality_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production_targets ENABLE ROW LEVEL SECURITY;

-- Create policies for milk_records
CREATE POLICY "Users can read milk records from their farm"
  ON milk_records
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert milk records to their farm"
  ON milk_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update milk records in their farm"
  ON milk_records
  FOR UPDATE
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create policies for milk_quality_tests
CREATE POLICY "Users can read milk quality tests from their farm"
  ON milk_quality_tests
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage milk quality tests in their farm"
  ON milk_quality_tests
  FOR ALL
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create policies for milk_production_targets
CREATE POLICY "Users can read milk production targets from their farm"
  ON milk_production_targets
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage milk production targets in their farm"
  ON milk_production_targets
  FOR ALL
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_milk_records_updated_at
  BEFORE UPDATE ON milk_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milk_quality_tests_updated_at
  BEFORE UPDATE ON milk_quality_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milk_production_targets_updated_at
  BEFORE UPDATE ON milk_production_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX milk_records_farm_date_idx ON milk_records (farm_id, date);
CREATE INDEX milk_records_animal_idx ON milk_records (animal_id);
CREATE INDEX milk_quality_tests_farm_date_idx ON milk_quality_tests (farm_id, date);
CREATE INDEX milk_production_targets_farm_date_idx ON milk_production_targets (farm_id, start_date, end_date);