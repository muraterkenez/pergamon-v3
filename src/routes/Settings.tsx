import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import {
  Settings as SettingsIcon,
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function Settings() {
  const { farm } = useAuthContext();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    tax_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || '',
        address: farm.address || '',
        phone: farm.phone || '',
        email: farm.email || '',
        tax_number: farm.tax_number || ''
      });
    }
  }, [farm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!farm?.id) {
      setError('Çiftlik bilgisi bulunamadı');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { error: updateError } = await supabase
        .from('farms')
        .update({
          name: formData.name,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.email || null,
          tax_number: formData.tax_number || null
        })
        .eq('id', farm.id);

      if (updateError) throw updateError;

      setSuccess('Değişiklikler başarıyla kaydedildi');

      // Sayfayı yenilemek yerine başarı mesajını göster
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating farm:', err);
      setError(err.message || 'Değişiklikler kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="mt-2 text-gray-600">Çiftlik bilgilerini ve sistem ayarlarını yönetin</p>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Çiftlik Bilgileri</h2>
            <p className="mt-1 text-sm text-gray-500">
              Temel çiftlik bilgilerini güncelleyin
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <p>{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Çiftlik Adı*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="tax_number" className="block text-sm font-medium text-gray-700 mb-1">
                Vergi Numarası
              </label>
              <input
                type="text"
                id="tax_number"
                name="tax_number"
                value={formData.tax_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}