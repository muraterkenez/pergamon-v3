/*
  # Animal Health Schema

  1. New Tables
    - `health_records`
      - Health checks, treatments, and surgeries
      - Diagnosis and treatment details
      - Medication tracking
      - Follow-up scheduling
    
    - `vaccinations`
      - Vaccination records
      - Batch tracking
      - Next dose scheduling

    - `medications`
      - Medication inventory
      - Usage tracking
      - Expiry management

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users
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
  created_by uuid REFERENCES auth.users(id),
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
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('antibiotic', 'vaccine', 'supplement', 'other')),
  unit text NOT NULL,
  current_stock numeric NOT NULL DEFAULT 0,
  min_stock numeric,
  batch_number text,
  expiry_date date,
  storage_conditions text,
  withdrawal_period integer, -- Days
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medication transactions table
CREATE TABLE IF NOT EXISTS medication_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  medication_id uuid REFERENCES medications(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'usage', 'adjustment')),
  quantity numeric NOT NULL,
  date date NOT NULL,
  reference_id uuid, -- Can reference health_records or vaccinations
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for health_records
CREATE POLICY "Users can read health records from their farm"
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

CREATE POLICY "Users can manage health records in their farm"
  ON health_records
  FOR ALL
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create policies for vaccinations
CREATE POLICY "Users can read vaccinations from their farm"
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

CREATE POLICY "Users can manage vaccinations in their farm"
  ON vaccinations
  FOR ALL
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create policies for medications
CREATE POLICY "Users can read medications from their farm"
  ON medications
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage medications in their farm"
  ON medications
  FOR ALL
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create policies for medication_transactions
CREATE POLICY "Users can read medication transactions from their farm"
  ON medication_transactions
  FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert medication transactions to their farm"
  ON medication_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farm_id IN (
      SELECT farm_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at
  BEFORE UPDATE ON vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX health_records_farm_date_idx ON health_records (farm_id, date);
CREATE INDEX health_records_animal_idx ON health_records (animal_id);
CREATE INDEX vaccinations_farm_date_idx ON vaccinations (farm_id, date);
CREATE INDEX vaccinations_animal_idx ON vaccinations (animal_id);
CREATE INDEX medications_farm_name_idx ON medications (farm_id, name);
CREATE INDEX medication_transactions_medication_idx ON medication_transactions (medication_id);
CREATE INDEX medication_transactions_date_idx ON medication_transactions (date);