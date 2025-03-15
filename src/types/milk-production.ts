export interface MilkRecord {
  id: string;
  farm_id: string;
  animal_id?: string;
  date: string;
  shift: 'morning' | 'evening';
  milking_type: 'individual' | 'group';
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
  farm_id: string;
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

export interface MilkProductionTarget {
  id: string;
  farm_id: string;
  start_date: string;
  end_date: string;
  daily_target: number;
  fat_target?: number;
  protein_target?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const QUALITY_THRESHOLDS = {
  temperature: { min: 2, max: 4.4 },
  fat: { min: 3.5, max: 4.5 },
  protein: { min: 3.0, max: 3.6 },
  lactose: { min: 4.5, max: 5.0 },
  somatic_cell_count: { max: 200 },
  bacterial_count: { max: 100 },
  ph: { min: 6.4, max: 6.8 },
  density: { min: 1.028, max: 1.034 }
} as const;