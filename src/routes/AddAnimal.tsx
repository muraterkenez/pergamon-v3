import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, X } from 'lucide-react';

interface AnimalFormData {
  earTag: string;
  name: string;
  birthDate: string;
  breed: string;
  gender: 'male' | 'female';
  weight: string;
  mother: string;
  father: string;
  purchaseDate?: string;
  purchasePrice?: string;
  notes?: string;
  status: 'healthy' | 'sick' | 'pregnant' | 'lactating';
}

const breeds = [
  'Holstein',
  'Simental',
  'Jersey',
  'Montofon',
  'Angus',
  'Hereford',
  'Şarole',
];

export default function AddAnimal() {
  const navigate = useNavigate();
  const { farm } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AnimalFormData>({
    earTag: '',
    name: '',
    birthDate: '',
    breed: '',
    gender: 'female',
    weight: '',
    mother: '',
    father: '',
    purchaseDate: '',
    purchasePrice: '',
    notes: '',
    status: 'healthy',
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
        .from('animals')
        .insert([{
          farm_id: farm.id,
          ear_tag: formData.earTag,
          name: formData.name,
          birth_date: formData.birthDate,
          breed: formData.breed,
          gender: formData.gender,
          current_stage: formData.gender === 'female' ? 'cow' : 'bull',
          weight: formData.weight ? parseFloat(formData.weight) : null,
          mother_id: formData.mother || null,
          father_id: formData.father || null,
          status: formData.status,
          notes: formData.notes || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (insertError) throw insertError;

      navigate('/animals');
    } catch (err: any) {
      console.error('Error adding animal:', err);
      setError(err.message || 'Hayvan eklenirken bir hata oluştu');
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
          Çiftlik bilgisi yüklenemedi
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
            onClick={() => navigate('/animals')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Hayvan Ekle</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/animals')}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="h-5 w-5" />
            <span>İptal</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
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
                <label htmlFor="earTag" className="block text-sm font-medium text-gray-700 mb-1">
                  Kulak Numarası*
                </label>
                <input
                  type="text"
                  id="earTag"
                  name="earTag"
                  required
                  value={formData.earTag}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="TR123456789"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  İsim*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hayvanın adı"
                />
              </div>
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Doğum Tarihi*
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  required
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                  Irk*
                </label>
                <select
                  id="breed"
                  name="breed"
                  required
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Irk seçin</option>
                  {breeds.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Cinsiyet*
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="female">Dişi</option>
                  <option value="male">Erkek</option>
                </select>
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Ağırlık (kg)*
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  required
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="450"
                />
              </div>
            </div>
          </div>

          {/* Soy Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Soy Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mother" className="block text-sm font-medium text-gray-700 mb-1">
                  Anne Kulak Numarası
                </label>
                <input
                  type="text"
                  id="mother"
                  name="mother"
                  value={formData.mother}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="TR123456789"
                />
              </div>
              <div>
                <label htmlFor="father" className="block text-sm font-medium text-gray-700 mb-1">
                  Baba Kulak Numarası
                </label>
                <input
                  type="text"
                  id="father"
                  name="father"
                  value={formData.father}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="TR123456789"
                />
              </div>
            </div>
          </div>

          {/* Satın Alma Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Satın Alma Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Satın Alma Tarihi
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Satın Alma Fiyatı (₺)
                </label>
                <input
                  type="number"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="25000"
                />
              </div>
            </div>
          </div>

          {/* Durum Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Durum Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Sağlık Durumu*
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="healthy">Sağlıklı</option>
                  <option value="sick">Hasta</option>
                  <option value="pregnant">Gebe</option>
                  <option value="lactating">Laktasyonda</option>
                </select>
              </div>
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
                  placeholder="Ek bilgiler..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}