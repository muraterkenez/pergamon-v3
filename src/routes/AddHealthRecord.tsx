import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Save,
  X,
  Search,
  Stethoscope,
  AlertTriangle,
  Clock,
  FileText,
  Camera,
  Microscope,
  Scale,
  Heart,
  Thermometer
} from 'lucide-react';
import type { Animal } from '../types/breeding';
import type { HealthRecord } from '../types/animal-health';

interface HealthRecordFormData {
  animalId: string;
  date: string;
  type: 'checkup' | 'vaccination' | 'treatment' | 'surgery';
  veterinarianId: string;
  temperature?: string;
  weight?: string;
  symptoms?: string[];
  diagnosis?: string;
  treatment?: string;
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    withdrawalPeriod?: number;
  }[];
  notes?: string;
  followUpDate?: string;
  attachments?: File[];
}

// Mock data for veterinarians
const mockVeterinarians = [
  { id: '1', name: 'Dr. Ahmet Yılmaz', specialization: 'Büyükbaş Hayvan Uzmanı' },
  { id: '2', name: 'Dr. Ayşe Demir', specialization: 'Sürü Sağlığı Uzmanı' }
];

const commonSymptoms = [
  'İştahsızlık',
  'Yüksek Ateş',
  'Öksürük',
  'İshal',
  'Topallık',
  'Mastitis',
  'Rumen Asidozu',
  'Solunum Güçlüğü'
];

export default function AddHealthRecord() {
  const navigate = useNavigate();
  const { farm } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<HealthRecordFormData>({
    animalId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'checkup',
    veterinarianId: '',
    symptoms: [],
    medications: []
  });

  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (farm?.id) {
      fetchAnimals();
    }
  }, [farm?.id]);

  const fetchAnimals = async () => {
    try {
      if (!farm?.id) {
        throw new Error('Çiftlik bilgisi bulunamadı');
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('animals')
        .select('*')
        .eq('farm_id', farm.id)
        .order('name');

      if (fetchError) throw fetchError;
      setAnimals(data || []);
    } catch (err: any) {
      console.error('Error fetching animals:', err);
      setError(err.message || 'Hayvanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!farm?.id) {
        throw new Error('Çiftlik bilgisi bulunamadı');
      }

      if (!formData.animalId) {
        throw new Error('Lütfen bir hayvan seçin');
      }

      setLoading(true);
      setError(null);

      // Create health record
      const { error: insertError } = await supabase
        .from('health_records')
        .insert([{
          farm_id: farm.id,
          animal_id: formData.animalId,
          date: formData.date,
          type: formData.type,
          veterinarian: formData.veterinarianId,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
          medications: formData.medications,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          next_check_date: formData.followUpDate,
          status: 'scheduled',
          notes: formData.notes
        }]);

      if (insertError) throw insertError;

      navigate('/animal-health');
    } catch (err: any) {
      console.error('Error saving health record:', err);
      setError(err.message || 'Sağlık kaydı oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnimalSelection = (animalId: string) => {
    setFormData(prev => ({ ...prev, animalId }));
    setSelectedAnimal(animals.find(a => a.id === animalId) || null);
  };

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms?.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...(prev.symptoms || []), symptom]
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...(prev.medications || []),
        {
          name: '',
          dosage: '',
          frequency: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }
      ]
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications?.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications?.filter((_, i) => i !== index)
    }));
  };

  const filteredAnimals = animals.filter(animal =>
    animal.ear_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!farm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center text-gray-500">
          Çiftlik bilgisi yüklenemedi
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/animal-health')}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Sağlık Kaydı</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/animal-health')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="h-5 w-5" />
              <span>İptal</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hayvan Seçimi */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hayvan Seçimi</h2>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Kulak numarası veya isim ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAnimals.map((animal) => (
                  <div
                    key={animal.id}
                    onClick={() => handleAnimalSelection(animal.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.animalId === animal.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Heart className={`h-6 w-6 ${
                        formData.animalId === animal.id ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{animal.name}</p>
                        <p className="text-sm text-gray-500">{animal.ear_tag}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Muayene Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Muayene Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tarih*
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  İşlem Tipi*
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="checkup">Rutin Kontrol</option>
                  <option value="vaccination">Aşılama</option>
                  <option value="treatment">Tedavi</option>
                  <option value="surgery">Cerrahi Operasyon</option>
                </select>
              </div>
              <div>
                <label htmlFor="veterinarianId" className="block text-sm font-medium text-gray-700 mb-1">
                  Veteriner*
                </label>
                <select
                  id="veterinarianId"
                  name="veterinarianId"
                  required
                  value={formData.veterinarianId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Veteriner seçin</option>
                  {mockVeterinarians.map(vet => (
                    <option key={vet.id} value={vet.id}>{vet.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fiziksel Muayene */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fiziksel Muayene</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                  Vücut Sıcaklığı (°C)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="temperature"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    step="0.1"
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="38.5"
                  />
                  <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Ağırlık (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="450"
                  />
                  <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Belirtiler */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Belirtiler</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonSymptoms.map((symptom) => (
                <label
                  key={symptom}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.symptoms?.includes(symptom)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.symptoms?.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="hidden"
                  />
                  <span className="text-sm">{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Teşhis ve Tedavi */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Teşhis ve Tedavi</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                  Teşhis
                </label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Teşhis detayları..."
                />
              </div>
              <div>
                <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">
                  Tedavi Planı
                </label>
                <textarea
                  id="treatment"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tedavi detayları..."
                />
              </div>
            </div>
          </div>

          {/* İlaçlar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">İlaç Tedavisi</h2>
              <button
                type="button"
                onClick={addMedication}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                + İlaç Ekle
              </button>
            </div>
            <div className="space-y-4">
              {formData.medications?.map((medication, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İlaç Adı*
                      </label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Örn: Amoksisilin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doz*
                      </label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Örn: 10ml"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kullanım Sıklığı*
                      </label>
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Örn: Günde 2 kez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Başlangıç Tarihi*
                      </label>
                      <input
                        type="date"
                        value={medication.startDate}
                        onChange={(e) => updateMedication(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bitiş Tarihi*
                      </label>
                      <input
                        type="date"
                        value={medication.endDate}
                        onChange={(e) => updateMedication(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İlaç Arınma Süresi (Gün)
                      </label>
                      <input
                        type="number"
                        value={medication.withdrawalPeriod}
                        onChange={(e) => updateMedication(index, 'withdrawalPeriod', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="7"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="mt-4 text-sm text-red-600 hover:text-red-700"
                  >
                    İlacı Kaldır
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Kontrol Randevusu */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontrol Randevusu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Kontrol Tarihi
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="followUpDate"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ek Bilgiler</h2>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notlar
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Varsa eklemek istediğiniz notlar..."
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}