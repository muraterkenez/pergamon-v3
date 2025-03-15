export interface Animal {
  id: string;
  farm_id: string;
  ear_tag: string;
  name: string;
  birth_date: string;
  breed: string;
  gender: 'male' | 'female';
  current_stage: 'calf' | 'weaned_calf' | 'young_heifer' | 'heifer' | 'cow';
  mother_id?: string;
  father_id?: string;
  weight?: number;
  status: 'healthy' | 'sick' | 'pregnant' | 'lactating';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BreedingRecord {
  id: string;
  farm_id: string;
  animal_id: string;
  date: string;
  type: 'insemination' | 'pregnancy_check' | 'birth';
  technician?: string;
  result?: string;
  next_check_date?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BreedingCycle {
  id: string;
  farm_id: string;
  animal_id: string;
  start_date: string;
  end_date?: string;
  status: 'open' | 'inseminated' | 'pregnant' | 'calved' | 'failed';
  insemination_count: number;
  pregnancy_confirmed_date?: string;
  expected_calving_date?: string;
  actual_calving_date?: string;
  calf_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}