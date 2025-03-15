import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Droplet, Beaker, AlertTriangle, Search, Users, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';
import type { Animal } from '../types/breeding';
import type { MilkRecord } from '../types/milk-health';

interface MilkProductionFormProps {
  onSubmit: (data: MilkRecord) => void;
  onCancel: () => void;
  initialData?: Partial<MilkRecord>;
}

interface FormData {
  date: string;
  shift: 'morning' | 'evening';
  milkingType: 'individual' | 'group';
  quantity: string;
  temperature: string;
  fatPercentage: string;
  proteinPercentage: string;
  somaticCellCount: string;
  notes: string;
  selectedAnimals: string[];
}

const QUALITY_THRESHOLDS = {
  temperature: { min: 2, max: 4.4 },
  fat: { min: 3.5, max: 4.5 },
  protein: { min: 3.0, max: 3.6 },
  scc: { max: 200 }
};

export default function MilkProductionForm({ onSubmit, onCancel, initialData }: MilkProductionFormProps) {
  const { farm } = useAuthContext();
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    milkingType: 'individual',
    quantity: '',
    temperature: '',
    fatPercentage: '',
    proteinPercentage: '',
    somaticCellCount: '',
    notes: '',
    selectedAnimals: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        date: initialData.date || prev.date,
        shift: initialData.shift || prev.shift,
        milkingType: initialData.milking_type || prev.milkingType,
        quantity: initialData.quantity?.toString() || '',
        temperature: initialData.temperature?.toString() || '',
        fatPercentage: initialData.fat_percentage?.toString() || '',
        proteinPercentage: initialData.protein_percentage?.toString() || '',
        somaticCellCount: initialData.somatic_cell_count?.toString() || '',
        notes: initialData.notes || '',
        selectedAnimals: initialData.animal_id ? [initialData.animal_id] : []
      }));
    }
    fetchAnimals();
  }, [initialData]);

  const fetchAnimals = async () => {
    try {
      if (!farm?.id) {
        setError('Çiftlik bilgisi bulunamadı');
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('farm_id', farm.id)
        .eq('status', 'lactating')
        .order('name');

      if (error) throw error;
      setAnimals(data || []);
    } catch (err) {
      console.error('Error fetching animals:', err);
      setError('Hayvanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnimalSelection = (animalId: string) => {
    setFormData(prev => {
      if (prev.milkingType === 'individual' && prev.selectedAnimals.length === 1 && !prev.selectedAnimals.includes(animalId)) {
        return { ...prev, selectedAnimals: [animalId] };
      }
      
      const newSelectedAnimals = prev.selectedAnimals.includes(animalId)
        ? prev.selectedAnimals.filter(id => id !== animalId)
        : [...prev.selectedAnimals, animalId];
      
      return { ...prev, selectedAnimals: newSelectedAnimals };
    });
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.date) errors.push('Tarih gerekli');
    if (!formData.quantity) errors.push('Miktar gerekli');
    if (formData.selectedAnimals.length === 0) errors.push('En az bir hayvan seçilmeli');

    // Kalite parametreleri kontrolleri - sadece değer girilmişse kontrol et
    if (formData.temperature) {
      const temp = parseFloat(formData.temperature);
      if (temp < QUALITY_THRESHOLDS.temperature.min || temp > QUALITY_THRESHOLDS.temperature.max) {
        errors.push(`Sıcaklık ${QUALITY_THRESHOLDS.temperature.min}-${QUALITY_THRESHOLDS.temperature.max}°C arasında olmalı`);
      }
    }

    if (formData.fatPercentage) {
      const fat = parseFloat(formData.fatPercentage);
      if (fat < QUALITY_THRESHOLDS.fat.min || fat > QUALITY_THRESHOLDS.fat.max) {
        errors.push(`Yağ oranı ${QUALITY_THRESHOLDS.fat.min}-${QUALITY_THRESHOLDS.fat.max}% arasında olmalı`);
      }
    }

    if (formData.proteinPercentage) {
      const protein = parseFloat(formData.proteinPercentage);
      if (protein < QUALITY_THRESHOLDS.protein.min || protein > QUALITY_THRESHOLDS.protein.max) {
        errors.push(`Protein oranı ${QUALITY_THRESHOLDS.protein.min}-${QUALITY_THRESHOLDS.protein.max}% arasında olmalı`);
      }
    }

    if (formData.somaticCellCount) {
      const scc = parseFloat(formData.somaticCellCount);
      if (scc > QUALITY_THRESHOLDS.scc.max) {
        errors.push(`Somatik hücre sayısı ${QUALITY_THRESHOLDS.scc.max} x1000/ml'den düşük olmalı`);
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    if (!farm?.id) {
      setError('Çiftlik bilgisi bulunamadı');
      return;
    }

    const record: MilkRecord = {
      ...initialData,
      farm_id: farm.id,
      date: formData.date,
      shift: formData.shift,
      milking_type: formData.milkingType,
      quantity: parseFloat(formData.quantity),
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      fat_percentage: formData.fatPercentage ? parseFloat(formData.fatPercentage) : undefined,
      protein_percentage: formData.proteinPercentage ? parseFloat(formData.proteinPercentage) : undefined,
      somatic_cell_count: formData.somaticCellCount ? parseFloat(formData.somaticCellCount) : undefined,
      notes: formData.notes || undefined,
      animal_id: formData.selectedAnimals[0]
    };

    onSubmit(record);
  };

  const filteredAnimals = animals.filter(animal =>
    animal.ear_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Temel Bilgiler */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sağım Bilgileri</h2>
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
            <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
              Vardiya*
            </label>
            <select
              id="shift"
              name="shift"
              required
              value={formData.shift}
              onChange={handleChange}
              
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="morning">Sabah Sağımı</option>
              <option value="evening">Akşam Sağımı</option>
            </select>
          </div>
          <div>
            <label htmlFor="milkingType" className="block text-sm font-medium text-gray-700 mb-1">
              Sağım Tipi*
            </label>
            <select
              id="milkingType"
              name="milkingType"
              required
              value={formData.milkingType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="individual">Bireysel Sağım</option>
              <option value="group">Toplu Sağım</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hayvan Seçimi */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {formData.milkingType === 'individual' ? 'Hayvan Seçimi' : 'Hayvan Grubu Seçimi'}
        </h2>
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
                  formData.selectedAnimals.includes(animal.id)
                    ? 'bg-blue-50 border-blue-500'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Droplet className={`h-6 w-6 ${
                    formData.selectedAnimals.includes(animal.id) ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{animal.name}</p>
                    <p className="text-sm text-gray-500">{animal.ear_tag}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {formData.selectedAnimals.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-blue-700">
                  {formData.selectedAnimals.length} hayvan seçildi
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Süt Miktarı */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Süt Miktarı</h2>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Miktar (L)*
          </label>
          <div className="relative">
            <input
              type="number"
              id="quantity"
              name="quantity"
              required
              value={formData.quantity}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1250.5"
            />
            <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Kalite Parametreleri */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kalite Parametreleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
              Sıcaklık (°C)
            </label>
            <input
              type="number"
              id="temperature"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              step="0.1"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="4.2"
            />
          </div>
          <div>
            <label htmlFor="fatPercentage" className="block text-sm font-medium text-gray-700 mb-1">
              Yağ Oranı (%)
            </label>
            <div className="relative">
              <input
                type="number"
                id="fatPercentage"
                name="fatPercentage"
                value={formData.fatPercentage}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="3.8"
              />
              <Beaker className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label htmlFor="proteinPercentage" className="block text-sm font-medium text-gray-700 mb-1">
              Protein Oranı (%)
            </label>
            <div className="relative">
              <input
                type="number"
                id="proteinPercentage"
                name="proteinPercentage"
                value={formData.proteinPercentage}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="3.2"
              />
              <Beaker className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label htmlFor="somaticCellCount" className="block text-sm font-medium text-gray-700 mb-1">
              Somatik Hücre (x1000/ml)
            </label>
            <input
              type="number"
              id="somaticCellCount"
              name="somaticCellCount"
              value={formData.somaticCellCount}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="180"
            />
          </div>
        </div>
      </div>

      {/* Kalite Uyarıları */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kalite Kontrol</h2>
        <div className="grid grid-cols-1 gap-4">
          {parseFloat(formData.temperature) > QUALITY_THRESHOLDS.temperature.max && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <span>Süt sıcaklığı çok yüksek! (Max: {QUALITY_THRESHOLDS.temperature.max}°C)</span>
            </div>
          )}
          {parseFloat(formData.fatPercentage) < QUALITY_THRESHOLDS.fat.min && formData.fatPercentage !== '' && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 text-yellow-700 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <span>Yağ oranı düşük! (Min: {QUALITY_THRESHOLDS.fat.min}%)</span>
            </div>
          )}
          {parseFloat(formData.somaticCellCount) > QUALITY_THRESHOLDS.scc.max && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 text-yellow-700 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <span>Yüksek somatik hücre sayısı! (Max: {QUALITY_THRESHOLDS.scc.max},000)</span>
            </div>
          )}
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

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Kaydet
        </button>
      </div>
    </form>
  );
}