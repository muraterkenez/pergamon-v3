export interface MilkRecord {
  id: string;
  animal_id?: string;
  date: string;
  shift: 'morning' | 'evening';
  quantity: number;
  temperature?: number;
  fat_percentage?: number;
  protein_percentage?: number;
  somatic_cell_count?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MilkQualityTest {
  id: string;
  date: string;
  batch_number?: string;
  temperature: number;
  fat_percentage: number;
  protein_percentage: number;
  lactose_percentage?: number;
  total_solids_percentage?: number;
  somatic_cell_count?: number;
  bacterial_count?: number;
  antibiotics_residue?: boolean;
  ph_value?: number;
  density?: number;
  freezing_point?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  animal_id: string;
  date: string;
  type: 'checkup' | 'vaccination' | 'treatment' | 'surgery';
  veterinarian?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Medication[];
  temperature?: number;
  weight?: number;
  next_check_date?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
  withdrawal_period?: number;
}

export interface Vaccination {
  id: string;
  animal_id: string;
  vaccine_name: string;
  date: string;
  batch_number?: string;
  dosage?: string;
  route?: 'subcutaneous' | 'intramuscular' | 'oral';
  next_dose_date?: string;
  administered_by?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}