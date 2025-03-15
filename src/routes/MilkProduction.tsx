import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  LineChart,
  Plus,
  AlertTriangle,
  Droplet,
  Beaker,
  Users,
  Clock,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';
import type { MilkRecord } from '../types/milk-production';
import MilkQualityChart from '../components/MilkQualityChart';

interface DailyStats {
  totalQuantity: number;
  avgFat: number;
  avgProtein: number;
  avgTemperature: number;
  revenue: number;
  tankLevel: number;
  tankCapacity: number;
}

export default function MilkProduction() {
  const navigate = useNavigate();
  const { farm } = useAuthContext();
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MilkRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalQuantity: 0,
    avgFat: 0,
    avgProtein: 0,
    avgTemperature: 0,
    revenue: 0,
    tankLevel: 0,
    tankCapacity: 15000
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [farm?.id]);

  const fetchRecords = async () => {
    try {
      if (!farm?.id) {
        setError('Çiftlik bilgisi bulunamadı');
        return;
      }

      setLoading(true);
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      // Fetch today's records
      const { data: todayRecords, error: recordsError } = await supabase
        .from('milk_records')
        .select('*')
        .eq('farm_id', farm.id)
        .gte('created_at', startOfToday)
        .lte('created_at', endOfToday)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      // Fetch last 7 days records for trends
      const { data: weekRecords, error: weekError } = await supabase
        .from('milk_records')
        .select('*')
        .eq('farm_id', farm.id)
        .gte('date', subDays(today, 7).toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (weekError) throw weekError;

      setRecords(weekRecords || []);

      // Calculate daily stats from today's records
      if (todayRecords) {
        const stats = calculateDailyStats(todayRecords);
        setDailyStats(stats);
      }
    } catch (err: any) {
      console.error('Error fetching milk records:', err);
      setError(err.message || 'Kayıtlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: MilkRecord) => {
    navigate('/add-milk-record', { state: { record } });
  };

  const handleDelete = async () => {
    try {
      if (!selectedRecord) return;

      const { error: deleteError } = await supabase
        .from('milk_records')
        .delete()
        .eq('id', selectedRecord.id);

      if (deleteError) throw deleteError;

      // Refresh records after deletion
      await fetchRecords();
      setSelectedRecord(null);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      console.error('Error deleting record:', err);
      setError(err.message || 'Kayıt silinirken bir hata oluştu');
    }
  };

  const calculateDailyStats = (records: MilkRecord[]): DailyStats => {
    const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
    const validFatRecords = records.filter(r => r.fat_percentage !== null && r.fat_percentage !== undefined);
    const validProteinRecords = records.filter(r => r.protein_percentage !== null && r.protein_percentage !== undefined);
    const validTempRecords = records.filter(r => r.temperature !== null && r.temperature !== undefined);

    const avgFat = validFatRecords.length > 0
      ? validFatRecords.reduce((sum, r) => sum + (r.fat_percentage || 0), 0) / validFatRecords.length
      : 0;

    const avgProtein = validProteinRecords.length > 0
      ? validProteinRecords.reduce((sum, r) => sum + (r.protein_percentage || 0), 0) / validProteinRecords.length
      : 0;

    const avgTemperature = validTempRecords.length > 0
      ? validTempRecords.reduce((sum, r) => sum + (r.temperature || 0), 0) / validTempRecords.length
      : 0;

    // Calculate revenue (assuming 10 TL per liter)
    const revenue = totalQuantity * 10;

    // Calculate tank level (assuming 15,000L capacity)
    const tankLevel = Math.min((totalQuantity / 15000) * 100, 100);

    return {
      totalQuantity,
      avgFat,
      avgProtein,
      avgTemperature,
      revenue,
      tankLevel,
      tankCapacity: 15000
    };
  };

  const calculateWeeklyTrend = () => {
    const lastWeekQuantity = records
      .filter(r => r.date === subDays(new Date(), 7).toISOString().split('T')[0])
      .reduce((sum, r) => sum + r.quantity, 0);

    const todayQuantity = dailyStats.totalQuantity;

    if (lastWeekQuantity === 0) return 0;
    return ((todayQuantity - lastWeekQuantity) / lastWeekQuantity) * 100;
  };

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

  const weeklyTrend = calculateWeeklyTrend();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Süt Üretim Takibi</h1>
            <p className="mt-2 text-gray-600">Günlük üretim: {dailyStats.totalQuantity.toFixed(1)} L</p>
          </div>
          <button
            onClick={() => navigate('/add-milk-record')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Süt Kaydı</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tank Doluluk</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStats.tankLevel.toFixed(1)}%</p>
              <p className="text-xs text-blue-600 mt-1">{dailyStats.tankCapacity.toLocaleString()} L kapasite</p>
            </div>
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
              <div
                className="absolute inset-0 rounded-full border-4 border-blue-500"
                style={{
                  clipPath: `inset(${100 - dailyStats.tankLevel}% 0 0 0)`,
                  transition: 'clip-path 0.3s ease-in-out'
                }}
              />
              <Droplet className="absolute inset-0 m-auto h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ortalama Yağ Oranı</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStats.avgFat.toFixed(1)}%</p>
              <p className="text-xs text-green-600 mt-1">Normal aralıkta</p>
            </div>
            <Beaker className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Günlük Gelir</p>
              <p className="text-2xl font-bold text-gray-900">₺{dailyStats.revenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">
                {weeklyTrend > 0 ? `+${weeklyTrend.toFixed(1)}%` : `${weeklyTrend.toFixed(1)}%`} geçen haftaya göre
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tank Sıcaklığı</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStats.avgTemperature.toFixed(1)}°C</p>
              <p className="text-xs text-green-600 mt-1">Normal aralıkta</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Milk Records Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Süt Kayıtları</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vardiya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miktar (L)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yağ (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protein (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SHS
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(record.date), 'd MMMM yyyy', { locale: tr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.shift === 'morning' ? 'Sabah' : 'Akşam'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.fat_percentage?.toFixed(1) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.protein_percentage?.toFixed(1) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.somatic_cell_count || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quality Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Kalite Trendi</h2>
              <LineChart className="h-5 w-5 text-gray-400" />
            </div>
            <MilkQualityChart
              data={records.map(record => ({
                date: record.date,
                fat: record.fat_percentage || 0,
                protein: record.protein_percentage || 0,
                scc: record.somatic_cell_count || 0
              }))}
              height={200}
            />
          </div>

          {/* Alerts */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Uyarılar</h2>
              <AlertTriangle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {dailyStats.avgTemperature > 4.4 && (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                  <p className="text-sm">Tank sıcaklığı yükseliyor ({dailyStats.avgTemperature.toFixed(1)}°C)</p>
                </div>
              )}
              {dailyStats.avgFat < 3.5 && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg">
                  <p className="text-sm">Yağ oranı düşük ({dailyStats.avgFat.toFixed(1)}%)</p>
                </div>
              )}
              {dailyStats.tankLevel > 75 && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-lg">
                  <p className="text-sm">Tank {dailyStats.tankLevel.toFixed(1)}% dolulukta</p>
                </div>
              )}
              {dailyStats.avgProtein < 3.0 && (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                  <p className="text-sm">Protein oranı düşük ({dailyStats.avgProtein.toFixed(1)}%)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Kaydı Sil</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Bu süt kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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