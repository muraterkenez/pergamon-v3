import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import MilkProductionForm from '../components/MilkProductionForm';
import type { MilkRecord } from '../types/milk-production';

export default function AddMilkRecord() {
  const navigate = useNavigate();
  const location = useLocation();
  const { farm } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get initial data from location state if editing
  const initialData = location.state?.record as MilkRecord | undefined;

  const handleSubmit = async (data: MilkRecord) => {
    try {
      if (!farm?.id) {
        throw new Error('Çiftlik bilgisi bulunamadı');
      }

      setLoading(true);
      setError(null);

      if (initialData?.id) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('milk_records')
          .update({
            ...data,
            farm_id: farm.id
          })
          .eq('id', initialData.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('milk_records')
          .insert([{
            ...data,
            farm_id: farm.id
          }]);

        if (insertError) throw insertError;
      }

      navigate('/milk-production');
    } catch (err: any) {
      console.error('Error saving milk record:', err);
      setError(err.message || 'Kayıt oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Süt Kaydını Düzenle' : 'Yeni Süt Kaydı'}
        </h1>
        <p className="mt-2 text-gray-600">Süt üretim bilgilerini girin</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <MilkProductionForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/milk-production')}
          initialData={initialData}
        />
      </div>
    </div>
  );
}