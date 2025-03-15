import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Save,
  X,
  Package,
  Thermometer,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Beaker
} from 'lucide-react';

interface DairyProductFormData {
  name: string;
  category: 'cheese' | 'butter' | 'yogurt' | 'other';
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  quantity: string;
  unit: string;
  storageConditions: string;
  ingredients?: string[];
  processingSteps?: string[];
  packagingType?: string;
  qualityParameters?: {
    fatContent?: string;
    moisture?: string;
    ph?: string;
    saltContent?: string;
  };
  notes?: string;
}

const categories = [
  { value: 'cheese', label: 'Peynir' },
  { value: 'butter', label: 'Tereyağı' },
  { value: 'yogurt', label: 'Yoğurt' },
  { value: 'other', label: 'Diğer' }
];

const units = ['kg', 'lt', 'adet'];

const commonIngredients = [
  'Çiğ Süt',
  'Pastörize Süt',
  'Krema',
  'Maya',
  'Tuz',
  'Kalsiyum Klorür',
  'Starter Kültür'
];

function AddDairyProduct() {
  const navigate = useNavigate();
  const { farm } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DairyProductFormData>({
    name: '',
    category: 'cheese',
    batchNumber: '',
    productionDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    quantity: '',
    unit: 'kg',
    storageConditions: '',
    ingredients: [],
    processingSteps: [],
    qualityParameters: {
      fatContent: '',
      moisture: '',
      ph: '',
      saltContent: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!farm?.id) {
        throw new Error('Çiftlik bilgisi bulunamadı');
      }

      setLoading(true);
      setError(null);

      // Create dairy product record
      const { error: insertError } = await supabase
        .from('dairy_products')
        .insert([{
          farm_id: farm.id,
          name: formData.name,
          category: formData.category,
          batch_number: formData.batchNumber,
          production_date: formData.productionDate,
          expiry_date: formData.expiryDate,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          storage_conditions: formData.storageConditions,
          ingredients: formData.ingredients,
          processing_steps: formData.processingSteps,
          packaging_type: formData.packagingType,
          quality_parameters: formData.qualityParameters,
          notes: formData.notes
        }]);

      if (insertError) throw insertError;

      navigate('/dairy-products');
    } catch (err: any) {
      console.error('Error saving dairy product:', err);
      setError(err.message || 'Ürün kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQualityParamChange = (param: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      qualityParameters: {
        ...prev.qualityParameters,
        [param]: value
      }
    }));
  };

  const handleIngredientToggle = (ingredient: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.includes(ingredient)
        ? prev.ingredients.filter(i => i !== ingredient)
        : [...(prev.ingredients || []), ingredient]
    }));
  };

  const addProcessingStep = () => {
    setFormData(prev => ({
      ...prev,
      processingSteps: [...(prev.processingSteps || []), '']
    }));
  };

  const updateProcessingStep = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      processingSteps: prev.processingSteps?.map((step, i) =>
        i === index ? value : step
      )
    }));
  };

  const removeProcessingStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      processingSteps: prev.processingSteps?.filter((_, i) => i !== index)
    }));
  };

  if (!farm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center text-gray-500">
          Çiftlik bilgisi bulunamadı
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dairy-products')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Süt Ürünü Ekle</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dairy-products')}
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
          {/* Temel Bilgiler */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ürün adı"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori*
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="batchNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Parti Numarası*
                </label>
                <input
                  type="text"
                  id="batchNumber"
                  name="batchNumber"
                  required
                  value={formData.batchNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="BP2024001"
                />
              </div>
            </div>
          </div>

          {/* Üretim Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Üretim Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="productionDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Üretim Tarihi*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="productionDate"
                    name="productionDate"
                    required
                    value={formData.productionDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Son Kullanma Tarihi*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    required
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Miktar*
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                  <select
                    id="unit"
                    name="unit"
                    required
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Depolama Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Depolama Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="storageConditions" className="block text-sm font-medium text-gray-700 mb-1">
                  Depolama Koşulları*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="storageConditions"
                    name="storageConditions"
                    required
                    value={formData.storageConditions}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="4-8°C"
                  />
                  <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="packagingType" className="block text-sm font-medium text-gray-700 mb-1">
                  Ambalaj Tipi
                </label>
                <input
                  type="text"
                  id="packagingType"
                  name="packagingType"
                  value={formData.packagingType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Vakumlu paket"
                />
              </div>
            </div>
          </div>

          {/* İçerik Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İçerik Bilgileri</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Malzemeler
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {commonIngredients.map((ingredient) => (
                    <label
                      key={ingredient}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.ingredients?.includes(ingredient)
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.ingredients?.includes(ingredient)}
                        onChange={() => handleIngredientToggle(ingredient)}
                        className="hidden"
                      />
                      <span className="text-sm">{ingredient}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    İşlem Adımları
                  </label>
                  <button
                    type="button"
                    onClick={addProcessingStep}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                  >
                    + Adım Ekle
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.processingSteps?.map((step, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => updateProcessingStep(index, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`${index + 1}. İşlem adımı`}
                      />
                      <button
                        type="button"
                        onClick={() => removeProcessingStep(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Sil
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Kalite Parametreleri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kalite Parametreleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label htmlFor="fatContent" className="block text-sm font-medium text-gray-700 mb-1">
                  Yağ Oranı (%)
                </label>
                <input
                  type="number"
                  id="fatContent"
                  value={formData.qualityParameters?.fatContent}
                  onChange={(e) => handleQualityParamChange('fatContent', e.target.value)}
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3.5"
                />
              </div>
              <div>
                <label htmlFor="moisture" className="block text-sm font-medium text-gray-700 mb-1">
                  Nem Oranı (%)
                </label>
                <input
                  type="number"
                  id="moisture"
                  value={formData.qualityParameters?.moisture}
                  onChange={(e) => handleQualityParamChange('moisture', e.target.value)}
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="40"
                />
              </div>
              <div>
                <label htmlFor="ph" className="block text-sm font-medium text-gray-700 mb-1">
                  pH Değeri
                </label>
                <input
                  type="number"
                  id="ph"
                  value={formData.qualityParameters?.ph}
                  onChange={(e) => handleQualityParamChange('ph', e.target.value)}
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="6.5"
                />
              </div>
              <div>
                <label htmlFor="saltContent" className="block text-sm font-medium text-gray-700 mb-1">
                  Tuz Oranı (%)
                </label>
                <input
                  type="number"
                  id="saltContent"
                  value={formData.qualityParameters?.saltContent}
                  onChange={(e) => handleQualityParamChange('saltContent', e.target.value)}
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1.5"
                />
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
                placeholder="Eklemek istediğiniz notlar..."
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDairyProduct;