import type { MilkRecord, MilkQualityTest, HealthRecord, Vaccination } from './milk-health';
import type { Animal, BreedingRecord, BreedingCycle } from './breeding';

export interface Farm {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_number?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  farm_id: string;
  full_name?: string;
  role: string;
  phone?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  farm_id: string;
  category: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      farms: {
        Row: Farm;
        Insert: Omit<Farm, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Farm, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      roles: {
        Row: Role;
        Insert: Omit<Role, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>;
      };
      settings: {
        Row: Setting;
        Insert: Omit<Setting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Setting, 'id' | 'created_at' | 'updated_at'>>;
      };
      animals: {
        Row: Animal;
        Insert: Omit<Animal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Animal, 'id' | 'created_at' | 'updated_at'>>;
      };
      breeding_records: {
        Row: BreedingRecord;
        Insert: Omit<BreedingRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BreedingRecord, 'id' | 'created_at' | 'updated_at'>>;
      };
      breeding_cycles: {
        Row: BreedingCycle;
        Insert: Omit<BreedingCycle, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BreedingCycle, 'id' | 'created_at' | 'updated_at'>>;
      };
      milk_records: {
        Row: MilkRecord;
        Insert: Omit<MilkRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MilkRecord, 'id' | 'created_at' | 'updated_at'>>;
      };
      milk_quality_tests: {
        Row: MilkQualityTest;
        Insert: Omit<MilkQualityTest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MilkQualityTest, 'id' | 'created_at' | 'updated_at'>>;
      };
      health_records: {
        Row: HealthRecord;
        Insert: Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>>;
      };
      vaccinations: {
        Row: Vaccination;
        Insert: Omit<Vaccination, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Vaccination, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}