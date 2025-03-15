import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, QrCode, Download, Printer, MoreVertical, ChevronDown, Activity, Calendar, LineChart, Beef, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import type { Animal } from '../types/breeding';

function AnimalManagement() {
  const navigate = useNavigate();
  const { farm } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchAnimals();
  }, [farm?.id]);

  const fetchAnimals = async () => {
    try {
      if (!farm?.id) {
        setError('Çiftlik bilgisi bulunamadı');
        return;
      }

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

  const handleDelete = async () => {
    try {
      if (!selectedAnimal) return;

      const { error: deleteError } = await supabase
        .from('animals')
        .delete()
        .eq('id', selectedAnimal.id);

      if (deleteError) throw deleteError;

      setAnimals(prev => prev.filter(a => a.id !== selectedAnimal.id));
      setSelectedAnimal(null);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      console.error('Error deleting animal:', err);
      setError(err.message || 'Hayvan silinirken bir hata oluştu');
    }
  };

  const handleEdit = () => {
    if (!selectedAnimal) return;
    navigate('/add-animal', { state: { animal: selectedAnimal } });
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.ear_tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || animal.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">Yükleniyor...</div>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hayvan Yönetimi</h1>
            <p className="mt-2 text-gray-600">Toplam {animals.length} hayvan</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/add-animal')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Hayvan</span>
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <QrCode className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Download className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Kulak numarası veya isim ile ara..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="healthy">Sağlıklı</option>
                <option value="sick">Hasta</option>
                <option value="pregnant">Gebe</option>
                <option value="lactating">Laktasyonda</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Animal List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 divide-y">
              {filteredAnimals.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Kayıtlı hayvan bulunamadı
                </div>
              ) : (
                filteredAnimals.map((animal) => (
                  <div
                    key={animal.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedAnimal?.id === animal.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedAnimal(animal)}
                  >
                    <div className="flex items-center gap-4">
                      <Beef className="h-8 w-8 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{animal.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            animal.status === 'healthy' ? 'bg-green-100 text-green-800' :
                            animal.status === 'sick' ? 'bg-red-100 text-red-800' :
                            animal.status === 'pregnant' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {animal.status === 'healthy' ? 'Sağlıklı' :
                             animal.status === 'sick' ? 'Hasta' :
                             animal.status === 'pregnant' ? 'Gebe' :
                             'Laktasyonda'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-500">#{animal.ear_tag}</span>
                          <span className="text-sm text-gray-500">{animal.breed}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(animal.birth_date), 'd MMMM yyyy', { locale: tr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Animal Details */}
        {selectedAnimal ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Hayvan Detayları</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Düzenle"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Sil"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Temel Bilgiler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Kulak Numarası</p>
                    <p className="text-sm font-medium text-gray-900">#{selectedAnimal.ear_tag}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">İsim</p>
                    <p className="text-sm font-medium text-gray-900">{selectedAnimal.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Doğum Tarihi</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(selectedAnimal.birth_date), 'd MMMM yyyy', { locale: tr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Irk</p>
                    <p className="text-sm font-medium text-gray-900">{selectedAnimal.breed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cinsiyet</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAnimal.gender === 'female' ? 'Dişi' : 'Erkek'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Durum</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAnimal.status === 'healthy' ? 'Sağlıklı' :
                       selectedAnimal.status === 'sick' ? 'Hasta' :
                       selectedAnimal.status === 'pregnant' ? 'Gebe' :
                       'Laktasyonda'}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">QR Kod</h3>
                <div className="flex justify-center bg-white p-4 rounded-lg border">
                  <QRCodeSVG value={selectedAnimal.ear_tag} size={128} />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/add-health-record', { state: { animalId: selectedAnimal.id } })}
                  className="flex items-center justify-center gap-2 p-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Activity className="h-5 w-5" />
                  <span>Sağlık Kaydı</span>
                </button>
                <button
                  onClick={() => navigate('/breeding-record', { state: { animalId: selectedAnimal.id } })}
                  className="flex items-center justify-center gap-2 p-3 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Üreme Takibi</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-gray-500">
            <Beef className="h-12 w-12 mb-4" />
            <p>Detayları görüntülemek için bir hayvan seçin</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Hayvanı Sil</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Bu hayvanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnimalManagement;