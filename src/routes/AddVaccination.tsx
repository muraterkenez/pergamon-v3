import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Save,
  X,
  Search,
  Syringe,
  Calendar,
  AlertTriangle,
  Clock,
  FileText,
  Heart
} from 'lucide-react';
import type { Animal } from '../types/breeding';

interface VaccinationFormData {
  animalId: string;
  date: string;
  vaccineName: string;
  batchNumber: string;
  dosage: string;
  route: 'subcutaneous' | 'intramuscular' | 'oral';
  nextDoseDate?: string;
  administeredBy: string;
  notes?: string;
}

const routes = [
  { value: 'subcutaneous', label: 'Deri Altı' },
  { value: 'intramuscular', label: 'Kas İçi' },
  { value: 'oral', label: 'Ağız Yoluyla' }
];

const commonVaccines = [
  'Şap Aşısı',
  'Brusella Aşısı',
  'LSD Aşısı',
  'IBR Aşısı',
  'BVD Aşısı',
  'Mastitis Aşısı',
  'Clostridial Aşı'
];

export default function AddVaccination() {
  const navigate = useNavigate();
  const { farm } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<VaccinationFormData>({
    animalId: '',
    date: new Date().toISOString().split('T')[0],
    vaccineName: '',
    batchNumber: '',
    dosage: '',
    route: 'intramuscular',
    administeredBy: ''
  });

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

      // Create vaccination record
      const { error: insertError } = await supabase
        .from('vaccinations')
        .insert([{
          farm_id: farm.id,
          animal_id: formData.animalId,
          vaccine_name: formData.vaccineName,
          date: formData.date,
          batch_number: formData.batchNumber || null,
          dosage: formData.dosage,
          route: formData.route,
          next_dose_date: formData.nextDoseDate || null,
          administered_by: formData.administeredBy,
          notes: formData.notes
        }]);

      if (insertError) throw insertError;

      navigate('/animal-health');
    } catch (err: any) {
      console.error('Error saving vaccination:', err);
      setError(err.message || 'Aşı kaydı oluşturulurken bir hata oluştu');
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
            <h1 className="text-2xl font-bold text-gray-900">Yeni Aşılama Kaydı</h1>
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

          {/* Aşı Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aşı Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Aşılama Tarihi*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="vaccineName" className="block text-sm font-medium text-gray-700 mb-1">
                  Aşı Tipi*
                </label>
                <select
                  id="vaccineName"
                  name="vaccineName"
                  required
                  value={formData.vaccineName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Aşı seçin</option>
                  {commonVaccines.map(vaccine => (
                    <option key={vaccine} value={vaccine}>{vaccine}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="batchNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Seri Numarası
                </label>
                <input
                  type="text"
                  id="batchNumber"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ABC123"
                />
              </div>
              <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                  Doz*
                </label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  required
                  value={formData.dosage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2ml"
                />
              </div>
              <div>
                <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-1">
                  Uygulama Yolu*
                </label>
                <select
                  id="route"
                  name="route"
                  required
                  value={formData.route}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {routes.map(route => (
                    <option key={route.value} value={route.value}>{route.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="administeredBy" className="block text-sm font-medium text-gray-700 mb-1">
                  Uygulayan*
                </label>
                <input
                  type="text"
                  id="administeredBy"
                  name="administeredBy"
                  required
                  value={formData.administeredBy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dr. Ahmet Yılmaz"
                />
              </div>
            </div>
          </div>

          {/* Sonraki Doz */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sonraki Doz Bilgisi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nextDoseDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Sonraki Doz Tarihi
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="nextDoseDate"
                    name="nextDoseDate"
                    value={formData.nextDoseDate}
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