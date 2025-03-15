/*
  # Üreme Takibi Tabloları

  1. Yeni Tablolar
    - `breeding_records`
      - Tohumlama, gebelik kontrolü ve doğum kayıtları
      - Veteriner/teknisyen bilgileri
      - Sonuç ve notlar
    
    - `breeding_cycles`
      - Üreme döngüsü takibi
      - Gebelik durumu ve tarihleri
      - Buzağı bilgileri

  2. Güvenlik
    - RLS aktif
    - Authenticated kullanıcılar için politikalar
*/

-- Üreme kayıtları tablosu
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

-- Üreme döngüleri tablosu
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

-- RLS'yi aktifleştir
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_cycles ENABLE ROW LEVEL SECURITY;

-- Üreme kayıtları için politikalar
CREATE POLICY "breeding_records_read_v3"
  ON breeding_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "breeding_records_insert_v3"
  ON breeding_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "breeding_records_update_v3"
  ON breeding_records
  FOR UPDATE
  TO authenticated
  USING (true);

-- Üreme döngüleri için politikalar
CREATE POLICY "breeding_cycles_read_v3"
  ON breeding_cycles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "breeding_cycles_manage_v3"
  ON breeding_cycles
  FOR ALL
  TO authenticated
  USING (true);

-- Updated_at tetikleyicileri
CREATE TRIGGER update_breeding_records_updated_at
  BEFORE UPDATE ON breeding_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breeding_cycles_updated_at
  BEFORE UPDATE ON breeding_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();