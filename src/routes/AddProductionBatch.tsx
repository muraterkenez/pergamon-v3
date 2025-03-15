import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  Package,
  Beaker,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Thermometer,
  Droplet,
  Users,
  Scale
} from 'lucide-react';

interface ProductionBatchFormData {
  batchNumber: string;
  productType: 'cheese' | 'butter' | 'yogurt' | 'other';
  startDate: string;
  startTime: string;
  milkQuantity: string;
  temperature: string;
  operators: string[];
  recipe: {
    ingredients: {
      name: string;
      quantity: string;
      unit: string;
    }[];
    steps: {
      description: string;
      duration: string;
      temperature?: string;
    }[];
  };
  qualityChecks: {
    ph?: string;
    temperature?: string;
    density?: string;
  };
  notes?: string;
}

const productTypes = [
  { value: 'cheese', label: 'Peynir' },
  { value: 'butter', label: 'Tereyağı' },
  { value: 'yogurt', label: 'Yoğurt' },
  { value: 'other', label: 'Diğer' }
];

const operators = [
  { id: '1', name: 'Ahmet Yılmaz' },
  { id: '2', name: 'Ayşe Demir' },
  { id: '3', name: 'Mehmet Kaya' }
];

function AddProductionBatch() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductionBatchFormData>({
    batchNumber: '',
    productType: 'cheese',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    milkQuantity: '',
    temperature: '',
    operators: [],
    recipe: {
      ingredients: [],
      steps: []
    },
    qualityChecks: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API entegrasyonu yapılacak
    console.log('Form data:', formData);
    navigate('/dairy-products');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOperatorToggle = (operatorId: string) => {
    setFormData(prev => ({
      ...prev,
      operators: prev.operators.includes(operatorId)
        ? prev.operators.filter(id => id !== operatorId)
        : [...prev.operators, operatorId]
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      recipe: {
        ...prev.recipe,
        ingredients: [
          ...prev.recipe.ingredients,
          { name: '', quantity: '', unit: '' }
        ]
      }
    }));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipe: {
        ...prev.recipe,
        ingredients: prev.recipe.ingredients.map((ingredient, i) =>
          i === index ? { ...ingredient, [field]: value } : ingredient
        )
      }
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipe: {
        ...prev.recipe,
        ingredients: prev.recipe.ingredients.filter((_, i) => i !== index)
      }
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      recipe: {
        ...prev.recipe,
        steps: [
          ...prev.recipe.steps,
          { description: '', duration: '', temperature: '' }
        ]
      }
    }));
  };

  const updateStep = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipe: {
        ...prev.recipe,
        steps: prev.recipe.steps.map((step, i) =>
          i === index ? { ...step, [field]: value } : step
        )
      }
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipe: {
        ...prev.recipe,
        steps: prev.recipe.steps.filter((_, i) => i !== index)
      }
    }));
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Yeni Üretim Partisi</h1>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            <span>Kaydet</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Temel Bilgiler */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div>
                <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Tipi*
                </label>
                <select
                  id="productType"
                  name="productType"
                  required
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {productTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="milkQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Süt Miktarı (L)*
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="milkQuantity"
                    name="milkQuantity"
                    required
                    value={formData.milkQuantity}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1000"
                  />
                  <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Tarihi*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Saati*
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                  Süt Sıcaklığı (°C)*
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="temperature"
                    name="temperature"
                    required
                    value={formData.temperature}
                    onChange={handleChange}
                    step="0.1"
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="4.2"
                  />
                  <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Operatörler */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Operatörler</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {operators.map((operator) => (
                <label
                  key={operator.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.operators.includes(operator.id)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.operators.includes(operator.id)}
                    onChange={() => handleOperatorToggle(operator.id)}
                    className="hidden"
                  />
                  <span className="text-sm">{operator.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Malzemeler */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Malzemeler</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                + Malzeme Ekle
              </button>
            </div>
            <div className="space-y-3">
              {formData.recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-4">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    placeholder="Malzeme adı"
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    placeholder="Miktar"
                    className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    placeholder="Birim"
                    className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* İşlem Adımları */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">İşlem Adımları</h2>
              <button
                type="button"
                onClick={addStep}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                + Adım Ekle
              </button>
            </div>
            <div className="space-y-4">
              {formData.recipe.steps.map((step, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                        placeholder="İşlem açıklaması"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={step.duration}
                        onChange={(e) => updateStep(index, 'duration', e.target.value)}
                        placeholder="Süre (dk)"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={step.temperature}
                        onChange={(e) => updateStep(index, 'temperature', e.target.value)}
                        placeholder="Sıcaklık (°C)"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Adımı Sil
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Kalite Kontrol */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kalite Kontrol</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="ph" className="block text-sm font-medium text-gray-700 mb-1">
                  pH Değeri
                </label>
                <input
                  type="number"
                  id="ph"
                  value={formData.qualityChecks.ph}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    qualityChecks: { ...prev.qualityChecks, ph: e.target.value }
                  }))}
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="6.5"
                />
              </div>
              <div>
                <label htmlFor="density" className="block text-sm font-medium text-gray-700 mb-1">
                  Yoğunluk (g/cm³)
                </label>
                <input
                  type="number"
                  id="density"
                  value={formData.qualityChecks.density}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    qualityChecks: { ...prev.qualityChecks, density: e.target.value }
                  }))}
                  step="0.001"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1.030"
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

export default AddProductionBatch;