import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, X, Calendar, Clock, AlertTriangle, Calculator } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';
import type { Animal, BreedingCycle } from '../types/breeding';
import BreedingTimeline from '../components/BreedingTimeline';

// Gebelik ile ilgili sabit değerler
const PREGNANCY_DURATION = 280; // Ortalama gebelik süresi (gün)
const DRY_PERIOD_START = 60; // Doğumdan önce kuruya çıkarma süresi (gün)
const PREGNANCY_CHECK_AFTER = 30; // Tohumlamadan sonra gebelik kontrolü süresi (gün)

interface BreedingFormData {
  animalId: string;
  date: string;
  type: 'insemination' | 'pregnancy_check' | 'birth';
  notes: string;
  nextCheckDate?: string;
  result?: string;
  technician?: string;
  isPregnant?: boolean;
  inseminationDate?: string;
}

export default function BreedingRecord() {
  const navigate = useNavigate();
  const location = useLocation();
  const { farm } = useAuthContext();
  const animalId = location.state?.animalId;

  const [formData, setFormData] = useState<BreedingFormData>({
    animalId: animalId || '',
    date: new Date().toISOString().split('T')[0],
    type: 'insemination',
    notes: ''
  });

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCycle, setCurrentCycle] = useState<BreedingCycle | null>(null);

  useEffect(() => {
    if (animalId && farm?.id) {
      fetchAnimal();
      fetchCurrentBreedingCycle();
    }
  }, [animalId, farm?.id]);

  const fetchAnimal = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('id', animalId)
        .eq('farm_id', farm?.id)
        .single();

      if (error) throw error;
      setAnimal(data);
    } catch (err) {
      console.error('Error fetching animal:', err);
      setError('Hayvan bilgileri yüklenirken bir hata oluştu');
    }
  };

  const fetchCurrentBreedingCycle = async () => {
    try {
      // Önce mevcut açık döngüyü kontrol et
      const { data: openCycle, error: openError } = await supabase
        .from('breeding_cycles')
        .select('*')
        .eq('animal_id', animalId)
        .eq('farm_id', farm?.id)
        .in('status', ['open', 'inseminated', 'pregnant'])
        .maybeSingle();

      if (openError) throw openError;

      if (openCycle) {
        setCurrentCycle(openCycle);
        return;
      }

      // Açık döngü yoksa en son tamamlanan döngüyü getir
      const { data: lastCycle, error: lastError } = await supabase
        .from('breeding_cycles')
        .select('*')
        .eq('animal_id', animalId)
        .eq('farm_id', farm?.id)
        .in('status', ['calved', 'failed'])
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (lastError) throw lastError;
      setCurrentCycle(lastCycle);
    } catch (err) {
      console.error('Error fetching breeding cycle:', err);
      setError('Üreme döngüsü bilgileri yüklenirken bir hata oluştu');
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

      setLoading(true);
      setError(null);

      // Yeni üreme kaydı oluştur
      const { error: recordError } = await supabase
        .from('breeding_records')
        .insert([{
          farm_id: farm.id,
          animal_id: animalId,
          date: formData.date,
          type: formData.type,
          technician: formData.technician,
          result: formData.result,
          next_check_date: formData.nextCheckDate,
          notes: formData.notes,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (recordError) throw recordError;

      // Üreme döngüsünü güncelle
      if (formData.type === 'insemination') {
        // Yeni döngü başlat
        const { error: cycleError } = await supabase
          .from('breeding_cycles')
          .insert([{
            farm_id: farm.id,
            animal_id: animalId,
            start_date: formData.date,
            status: 'inseminated',
            insemination_count: 1,
            notes: formData.notes,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]);

        if (cycleError) throw cycleError;
      } else if (formData.type === 'pregnancy_check' && formData.isPregnant) {
        // Mevcut döngüyü güncelle
        const expectedCalvingDate = new Date(formData.inseminationDate || formData.date);
        expectedCalvingDate.setDate(expectedCalvingDate.getDate() + PREGNANCY_DURATION);

        const { error: updateError } = await supabase
          .from('breeding_cycles')
          .update({
            status: 'pregnant',
            pregnancy_confirmed_date: formData.date,
            expected_calving_date: expectedCalvingDate.toISOString().split('T')[0]
          })
          .eq('id', currentCycle?.id);

        if (updateError) throw updateError;
      } else if (formData.type === 'birth') {
        // Doğum kaydı
        const { error: birthError } = await supabase
          .from('breeding_cycles')
          .update({
            status: 'calved',
            actual_calving_date: formData.date,
            end_date: formData.date
          })
          .eq('id', currentCycle?.id);

        if (birthError) throw birthError;
      }

      navigate('/animal-health');
    } catch (err: any) {
      console.error('Error saving breeding record:', err);
      setError(err.message || 'Üreme kaydı oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!animalId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center text-gray-500">
          Hayvan seçilmedi
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Üreme Takibi</h1>
              <p className="mt-1 text-gray-600">{animal?.name} - #{animal?.ear_tag}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Yeni Kayıt</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <option value="insemination">Tohumlama</option>
                      <option value="pregnancy_check">Gebelik Kontrolü</option>
                      <option value="birth">Doğum</option>
                    </select>
                  </div>
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
                    <label htmlFor="technician" className="block text-sm font-medium text-gray-700 mb-1">
                      Teknisyen
                    </label>
                    <input
                      type="text"
                      id="technician"
                      name="technician"
                      value={formData.technician || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {formData.type === 'pregnancy_check' && (
                    <>
                      <div>
                        <label htmlFor="isPregnant" className="block text-sm font-medium text-gray-700 mb-1">
                          Gebelik Durumu*
                        </label>
                        <select
                          id="isPregnant"
                          name="isPregnant"
                          required
                          value={formData.isPregnant ? 'true' : 'false'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            isPregnant: e.target.value === 'true'
                          }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="true">Gebe</option>
                          <option value="false">Gebe Değil</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="inseminationDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Tohumlama Tarihi
                        </label>
                        <input
                          type="date"
                          id="inseminationDate"
                          name="inseminationDate"
                          value={formData.inseminationDate || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label htmlFor="result" className="block text-sm font-medium text-gray-700 mb-1">
                      Sonuç
                    </label>
                    <input
                      type="text"
                      id="result"
                      name="result"
                      value={formData.result || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="nextCheckDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Sonraki Kontrol Tarihi
                    </label>
                    <input
                      type="date"
                      id="nextCheckDate"
                      name="nextCheckDate"
                      value={formData.nextCheckDate || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notlar
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/animal-health')}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Timeline */}
        <div>
          {currentCycle && <BreedingTimeline cycle={currentCycle} />}
        </div>
      </div>
    </div>
  );
}