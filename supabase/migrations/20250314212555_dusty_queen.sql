/*
  # Milk Production and Health Records Schema

  1. New Tables
    - `milk_records`
      - Daily milk production records
      - Quality metrics tracking
      - Individual and group records
    
    - `health_records`
      - Animal health records
      - Treatments and medications
      - Vaccination history

    - `milk_quality_tests`
      - Detailed quality analysis
      - Lab test results
      - Batch tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create milk records table
CREATE TABLE IF NOT EXISTS milk_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id),
  date date NOT NULL,
  shift text NOT NULL CHECK (shift IN ('morning', 'evening')),
  quantity numeric NOT NULL,
  temperature numeric,
  fat_percentage numeric,
  protein_percentage numeric,
  somatic_cell_count numeric,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create milk quality tests table
CREATE TABLE IF NOT EXISTS milk_quality_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  batch_number text,
  temperature numeric NOT NULL,
  fat_percentage numeric NOT NULL,
  protein_percentage numeric NOT NULL,
  lactose_percentage numeric,
  total_solids_percentage numeric,
  somatic_cell_count numeric,
  bacterial_count numeric,
  antibiotics_residue boolean,
  ph_value numeric,
  density numeric,
  freezing_point numeric,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create health records table
CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id) NOT NULL,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('checkup', 'vaccination', 'treatment', 'surgery')),
  veterinarian text,
  diagnosis text,
  treatment text,
  medications jsonb DEFAULT '[]'::jsonb,
  temperature numeric,
  weight numeric,
  next_check_date date,
  status text NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id) NOT NULL,
  vaccine_name text NOT NULL,
  date date NOT NULL,
  batch_number text,
  dosage text,
  route text CHECK (route IN ('subcutaneous', 'intramuscular', 'oral')),
  next_dose_date date,
  administered_by text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE milk_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_quality_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

-- Create policies for milk_records
CREATE POLICY "Users can read milk records"
  ON milk_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert milk records"
  ON milk_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update milk records"
  ON milk_records
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for milk_quality_tests
CREATE POLICY "Users can read milk quality tests"
  ON milk_quality_tests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage milk quality tests"
  ON milk_quality_tests
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for health_records
CREATE POLICY "Users can read health records"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage health records"
  ON health_records
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for vaccinations
CREATE POLICY "Users can read vaccinations"
  ON vaccinations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage vaccinations"
  ON vaccinations
  FOR ALL
  TO authenticated
  USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_milk_records_updated_at
  BEFORE UPDATE ON milk_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milk_quality_tests_updated_at
  BEFORE UPDATE ON milk_quality_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at
  BEFORE UPDATE ON vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();