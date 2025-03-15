import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Calendar,
  Syringe,
  Stethoscope,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  ChevronDown,
  Activity,
  Thermometer,
  Pill,
  Users,
  Clock,
  CalendarClock,
  Scale,
  Microscope,
  ShieldCheck,
  BarChart,
  LineChart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';
import type { Animal } from '../types/breeding';
import type { HealthRecord, Vaccination } from '../types/animal-health';

interface DailyStats {
  totalAnimals: number;
  sickAnimals: number;
  activeVaccinations: number;
  plannedCheckups: number;
}

export default function AnimalHealth() {
  const navigate = useNavigate();
  const { farm } = useAuthContext();
  const [selectedView, setSelectedView] = useState<'records' | 'calendar' | 'analytics'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalAnimals: 0,
    sickAnimals: 0,
    activeVaccinations: 0,
    plannedCheckups: 0
  });

  useEffect(() => {
    if (farm?.id) {
      fetchData();
    }
  }, [farm?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch animals
      const { data: animalsData, error: animalsError } = await supabase
        .from('animals')
        .select('*')
        .eq('farm_id', farm?.id)
        .order('name');

      if (animalsError) throw animalsError;

      // Fetch health records
      const { data: recordsData, error: recordsError } = await supabase
        .from('health_records')
        .select('*')
        .eq('farm_id', farm?.id)
        .order('date', { ascending: false });

      if (recordsError) throw recordsError;

      // Fetch vaccinations
      const { data: vaccinationsData, error: vaccinationsError } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('farm_id', farm?.id)
        .order('date', { ascending: false });

      if (vaccinationsError) throw vaccinationsError;

      // Update states
      setAnimals(animalsData || []);
      setHealthRecords(recordsData || []);
      setVaccinations(vaccinationsData || []);

      // Calculate daily stats
      const stats: DailyStats = {
        totalAnimals: animalsData?.length || 0,
        sickAnimals: animalsData?.filter(a => a.status === 'sick').length || 0,
        activeVaccinations: vaccinationsData?.filter(v => 
          new Date(v.next_dose_date || '') > new Date()
        ).length || 0,
        plannedCheckups: recordsData?.filter(r => 
          r.status === 'scheduled' && 
          new Date(r.date) > new Date()
        ).length || 0
      };
      setDailyStats(stats);

    } catch (err: any) {
      console.error('Error fetching health data:', err);
      setError(err.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return healthRecords
      .filter(record => 
        record.status === 'scheduled' && 
        new Date(record.date) >= today
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getActiveHealthIssues = () => {
    return healthRecords
      .filter(record => 
        record.status === 'completed' && 
        record.type === 'treatment' &&
        record.next_check_date && 
        new Date(record.next_check_date) >= new Date()
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

  const upcomingAppointments = getUpcomingAppointments();
  const activeHealthIssues = getActiveHealthIssues();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hayvan Sağlığı Yönetimi</h1>
            <p className="mt-2 text-gray-600">Toplam {dailyStats.totalAnimals} hayvan</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/add-health-record')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Sağlık Kaydı</span>
            </button>
            <button
              onClick={() => navigate('/add-vaccination')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Syringe className="h-5 w-5" />
              <span>Yeni Aşılama</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Planlı Kontroller</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStats.plannedCheckups}</p>
              <p className="text-xs text-blue-600 mt-1">Önümüzdeki 7 gün</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktif Tedaviler</p>
              <p className="text-2xl font-bold text-gray-900">{activeHealthIssues.length}</p>
              <p className="text-xs text-yellow-600 mt-1">Devam eden tedaviler</p>
            </div>
            <Pill className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hasta Hayvanlar</p>
              <p className="text-2xl font-bold text-red-600">{dailyStats.sickAnimals}</p>
              <p className="text-xs text-red-600 mt-1">Tedavi gerektiren</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aşı Takibi</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStats.activeVaccinations}</p>
              <p className="text-xs text-purple-600 mt-1">Aktif aşılama</p>
            </div>
            <Syringe className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('records')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'records'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Sağlık Kayıtları
            </button>
            <button
              onClick={() => setSelectedView('calendar')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'calendar'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Sağlık Takvimi
            </button>
            <button
              onClick={() => setSelectedView('analytics')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'analytics'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Sağlık Analizi
            </button>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Download className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {selectedView === 'records' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Sağlık Kayıtları</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Kulak numarası veya isim ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <select
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Tüm Kayıtlar</option>
                      <option value="checkup">Kontroller</option>
                      <option value="treatment">Tedaviler</option>
                      <option value="vaccination">Aşılamalar</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {healthRecords
                    .filter(record => {
                      const animal = animals.find(a => a.id === record.animal_id);
                      const matchesSearch = animal && (
                        animal.ear_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        animal.name.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                      const matchesFilter = filterStatus === 'all' || record.type === filterStatus;
                      return matchesSearch && matchesFilter;
                    })
                    .map((record) => {
                      const animal = animals.find(a => a.id === record.animal_id);
                      return (
                        <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {record.type === 'checkup' && <Stethoscope className="h-6 w-6 text-blue-500" />}
                              {record.type === 'treatment' && <Pill className="h-6 w-6 text-yellow-500" />}
                              {record.type === 'vaccination' && <Syringe className="h-6 w-6 text-green-500" />}
                              <div>
                                <h3 className="font-medium text-gray-900">{animal?.name}</h3>
                                <p className="text-sm text-gray-500">{animal?.ear_tag}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              record.status === 'completed' ? 'bg-green-100 text-green-800' :
                              record.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.status === 'completed' ? 'Tamamlandı' :
                               record.status === 'scheduled' ? 'Planlandı' :
                               'İptal Edildi'}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Tarih</p>
                              <p className="text-sm font-medium text-gray-900">
                                {format(new Date(record.date), 'd MMMM yyyy', { locale: tr })}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Veteriner</p>
                              <p className="text-sm font-medium text-gray-900">{record.veterinarian || '-'}</p>
                            </div>
                            {record.diagnosis && (
                              <div className="col-span-2">
                                <p className="text-sm text-gray-500">Teşhis</p>
                                <p className="text-sm font-medium text-gray-900">{record.diagnosis}</p>
                              </div>
                            )}
                            {record.treatment && (
                              <div className="col-span-2">
                                <p className="text-sm text-gray-500">Tedavi</p>
                                <p className="text-sm font-medium text-gray-900">{record.treatment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}

            {selectedView === 'calendar' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Sağlık Takvimi</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDate(subDays(selectedDate, 7))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(selectedDate, 'd MMMM yyyy', { locale: tr })}
                    </h3>
                    <button
                      onClick={() => setSelectedDate(subDays(selectedDate, -7))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Calendar content will be implemented later */}
                  <p className="text-center text-gray-500">Takvim görünümü yakında eklenecek</p>
                </div>
              </>
            )}

            {selectedView === 'analytics' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Sağlık Analizi</h2>
                  <select className="px-3 py-2 border rounded-lg">
                    <option value="month">Son 30 Gün</option>
                    <option value="quarter">Son 3 Ay</option>
                    <option value="year">Son 1 Yıl</option>
                  </select>
                </div>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Hastalık Dağılımı</h3>
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Grafik yakında eklenecek</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Tedavi Başarı Oranları</h3>
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Grafik yakında eklenecek</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Additional Info */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Yaklaşan Randevular</h2>
              <CalendarClock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => {
                const animal = animals.find(a => a.id === appointment.animal_id);
                return (
                  <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{animal?.name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(appointment.date), 'd MMMM yyyy', { locale: tr })}
                        </p>
                      </div>
                      {appointment.type === 'checkup' && <Stethoscope className="h-5 w-5 text-blue-500" />}
                      {appointment.type === 'vaccination' && <Syringe className="h-5 w-5 text-green-500" />}
                      {appointment.type === 'treatment' && <Pill className="h-5 w-5 text-yellow-500" />}
                    </div>
                  </div>
                );
              })}
              {upcomingAppointments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  Yaklaşan randevu bulunmuyor
                </p>
              )}
            </div>
          </div>

          {/* Active Health Issues */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Aktif Sağlık Sorunları</h2>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {activeHealthIssues.map((issue) => {
                const animal = animals.find(a => a.id === issue.animal_id);
                return (
                  <div key={issue.id} className="p-3 bg-red-50 text-red-700 rounded-lg">
                    <p className="text-sm font-medium">{animal?.name}</p>
                    <p className="text-xs">{issue.diagnosis}</p>
                  </div>
                );
              })}
              {activeHealthIssues.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  Aktif sağlık sorunu bulunmuyor
                </p>
              )}
            </div>
          </div>

          {/* Vaccinations */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Aşı Takibi</h2>
              <Syringe className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {vaccinations
                .filter(v => v.next_dose_date && new Date(v.next_dose_date) > new Date())
                .map((vaccination) => {
                  const animal = animals.find(a => a.id === vaccination.animal_id);
                  return (
                    <div key={vaccination.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{animal?.name}</p>
                      <p className="text-xs text-gray-500">{vaccination.vaccine_name}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          Sonraki doz: {format(new Date(vaccination.next_dose_date!), 'd MMMM yyyy', { locale: tr })}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}