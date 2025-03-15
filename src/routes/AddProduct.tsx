import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Save,
  X,
  Package,
  Boxes,
  AlertTriangle,
  Thermometer,
  Calendar
} from 'lucide-react';

interface ProductFormData {
  name: string;
  category: 'feed' | 'medicine' | 'equipment' | 'other';
  currentStock: string;
  unit: string;
  minStock: string;
  location: string;
  barcode?: string;
  description?: string;
  supplier?: string;
  price?: string;
  expiryDate?: string;
  storageConditions?: string;
  notes?: string;
}

const storageLocations = [
  'Depo A',
  'Depo B',
  'İlaç Dolabı',
  'Ekipman Odası',
  'Soğuk Depo'
];

function AddProduct() {
  const navigate = useNavigate();
  const { farm } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: 'feed',
    currentStock: '',
    unit: '',
    minStock: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!farm?.id) {
        throw new Error('Çiftlik bilgisi bulunamadı');
      }

      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('medications')
        .insert([{
          farm_id: farm.id,
          name: formData.name,
          type: formData.category,
          unit: formData.unit,
          current_stock: parseFloat(formData.currentStock),
          min_stock: parseFloat(formData.minStock),
          batch_number: formData.barcode,
          expiry_date: formData.expiryDate || null,
          storage_conditions: formData.storageConditions,
          notes: formData.notes
        }]);

      if (insertError) throw insertError;

      navigate('/inventory');
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Ürün kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            onClick={() => navigate('/inventory')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/inventory')}
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
                  <option value="feed">Yem</option>
                  <option value="medicine">İlaç</option>
                  <option value="equipment">Ekipman</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Barkod
                </label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Barkod numarası"
                />
              </div>
            </div>
          </div>

          {/* Stok Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stok Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Stok*
                </label>
                <input
                  type="number"
                  id="currentStock"
                  name="currentStock"
                  required
                  value={formData.currentStock}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Birim*
                </label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  required
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="kg, adet, litre"
                />
              </div>
              <div>
                <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Stok*
                </label>
                <input
                  type="number"
                  id="minStock"
                  name="minStock"
                  required
                  value={formData.minStock}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Depolama Konumu*
                </label>
                <select
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Konum seçin</option>
                  {storageLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="storageConditions" className="block text-sm font-medium text-gray-700 mb-1">
                  Depolama Koşulları
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="storageConditions"
                    name="storageConditions"
                    value={formData.storageConditions}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: 2-8°C"
                  />
                  <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Son Kullanma Tarihi
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Tedarik Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tedarik Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                  Tedarikçi
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tedarikçi adı"
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Birim Fiyat (₺)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Ek Bilgiler */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ek Bilgiler</h2>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Açıklaması
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ürün hakkında detaylı bilgi..."
              />
            </div>
            <div className="mt-4">
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

export default AddProduct;