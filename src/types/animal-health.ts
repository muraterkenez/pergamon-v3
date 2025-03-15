export interface HealthRecord {
  id: string;
  farm_id: string;
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

export interface Vaccination {
  id: string;
  farm_id: string;
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

export interface Medication {
  id: string;
  farm_id: string;
  name: string;
  type: 'antibiotic' | 'vaccine' | 'supplement' | 'other';
  unit: string;
  current_stock: number;
  min_stock?: number;
  batch_number?: string;
  expiry_date?: string;
  storage_conditions?: string;
  withdrawal_period?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationTransaction {
  id: string;
  farm_id: string;
  medication_id: string;
  type: 'purchase' | 'usage' | 'adjustment';
  quantity: number;
  date: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export const HEALTH_THRESHOLDS = {
  temperature: {
    normal: { min: 38.0, max: 39.5 },
    fever: 39.5,
    hypothermia: 38.0
  },
  weight: {
    daily_gain: { min: 0.7, max: 1.2 }, // kg/day
    adult: { min: 450, max: 750 } // kg
  },
  medication: {
    stock_warning: 0.25 // Warn when stock is below 25% of min_stock
  }
} as const;