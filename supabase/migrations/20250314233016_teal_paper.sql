/*
  # Create Health Records and Vaccinations Tables

  1. New Tables
    - `health_records`
      - Core health record information
      - Links to animals and farms
      - Tracks checkups, treatments, and surgeries
    
    - `vaccinations`
      - Vaccination records
      - Links to animals and farms
      - Tracks vaccine details and schedules

  2. Security
    - Enable RLS on all tables
    - Add farm-based policies
    - Add indexes for performance
*/

-- Create health records table
CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  animal_id uuid REFERENCES animals(id) NOT NULL,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('checkup', 'vaccination', 'treatment', 'surgery')),
  veterinarian text,
  diagnosis text,
  treatment text,
  medications jsonb DEFAULT '[]'::jsonb,
  temperature numeric CHECK (temperature BETWEEN 35 AND 43),
  weight numeric CHECK (weight > 0),
  next_check_date date,
  status text NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  animal_id uuid REFERENCES animals(id) NOT NULL,
  vaccine_name text NOT NULL,
  date date NOT NULL,
  batch_number text,
  dosage text,
  route text CHECK (route IN ('subcutaneous', 'intramuscular', 'oral')),
  next_dose_date date,
  administered_by text,
  notes text,
  created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

-- Create policies for health_records
CREATE POLICY "health_records_read_v1"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "health_records_insert_v1"
  ON health_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "health_records_update_v1"
  ON health_records
  FOR UPDATE
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create policies for vaccinations
CREATE POLICY "vaccinations_read_v1"
  ON vaccinations
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "vaccinations_insert_v1"
  ON vaccinations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "vaccinations_update_v1"
  ON vaccinations
  FOR UPDATE
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_health_records_updated_at_v1
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at_v1
  BEFORE UPDATE ON vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX health_records_farm_id_idx ON health_records (farm_id);
CREATE INDEX health_records_animal_id_idx ON health_records (animal_id);
CREATE INDEX health_records_date_idx ON health_records (date);
CREATE INDEX health_records_type_idx ON health_records (type);
CREATE INDEX health_records_status_idx ON health_records (status);

CREATE INDEX vaccinations_farm_id_idx ON vaccinations (farm_id);
CREATE INDEX vaccinations_animal_id_idx ON vaccinations (animal_id);
CREATE INDEX vaccinations_date_idx ON vaccinations (date);
CREATE INDEX vaccinations_next_dose_date_idx ON vaccinations (next_dose_date);