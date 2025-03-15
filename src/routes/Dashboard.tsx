import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import { format, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Droplet,
  Calendar,
  Truck,
  Users,
  Package,
  Thermometer
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DailyStats {
  totalAnimals: number;
  activeAnimals: number;
  milkProduction: number;
  revenue: number;
  tankLevel: number;
  tankCapacity: number;
  tankTemperature: number;
}

interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
}

interface Delivery {
  id: string;
  customer_name: string;
  date: string;
  quantity: number;
  unit: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function Dashboard() {
  const { farm } = useAuthContext();
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalAnimals: 0,
    activeAnimals: 0,
    milkProduction: 0,
    revenue: 0,
    tankLevel: 0,
    tankCapacity: 15000,
    tankTemperature: 4
  });
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (farm?.id) {
      Promise.all([
        fetchDailyStats(),
        fetchUpcomingTasks(),
        fetchDeliveries()
      ]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [farm?.id]);

  const fetchDailyStats = async () => {
    try {
      if (!farm?.id) {
        throw new Error('Çiftlik bilgisi bulunamadı');
      }

      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      // Fetch tank status
      const { data: tankData, error: tankError } = await supabase
        .from('tank_status')
        .select('*')
        .eq('farm_id', farm.id)
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tankError) throw tankError;

      // Fetch total animals
      const { data: animalsData, error: animalsError } = await supabase
        .from('animals')
        .select('id, status')
        .eq('farm_id', farm.id);

      if (animalsError) throw animalsError;

      // Fetch today's milk production
      const { data: milkData, error: milkError } = await supabase
        .from('milk_records')
        .select('quantity')
        .eq('farm_id', farm.id)
        .gte('created_at', startOfToday)
        .lte('created_at', endOfToday);

      if (milkError) throw milkError;

      // Calculate stats
      const totalAnimals = animalsData?.length || 0;
      const activeAnimals = animalsData?.filter(a => a.status === 'healthy' || a.status === 'lactating').length || 0;
      const milkProduction = milkData?.reduce((sum, record) => sum + (record.quantity || 0), 0) || 0;
      const revenue = milkProduction * 10;

      // Get tank status
      const tankCapacity = tankData?.capacity || 15000;
      const tankLevel = tankData?.level || 0;
      const tankTemperature = tankData?.temperature || 4;

      setDailyStats({
        totalAnimals,
        activeAnimals,
        milkProduction,
        revenue,
        tankLevel: Math.min((tankLevel / tankCapacity) * 100, 100),
        tankCapacity,
        tankTemperature
      });

    } catch (err: any) {
      console.error('Error fetching daily stats:', err);
      setError('Veriler yüklenirken bir hata oluştu');
    }
  };

  const fetchUpcomingTasks = async () => {
    try {
      if (!farm?.id) return;

      const today = new Date();
      const nextWeek = addDays(today, 7);

      // Fetch upcoming health records
      const { data: healthData, error: healthError } = await supabase
        .from('health_records')
        .select('id, date, type, veterinarian')
        .eq('farm_id', farm.id)
        .eq('status', 'scheduled')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', nextWeek.toISOString().split('T')[0])
        .order('date');

      if (healthError) throw healthError;

      // Fetch upcoming vaccinations
      const { data: vaccData, error: vaccError } = await supabase
        .from('vaccinations')
        .select('id, date, vaccine_name')
        .eq('farm_id', farm.id)
        .gte('next_dose_date', today.toISOString().split('T')[0])
        .lte('next_dose_date', nextWeek.toISOString().split('T')[0])
        .order('next_dose_date');

      if (vaccError) throw vaccError;

      const tasks: Task[] = [
        ...(healthData || []).map(record => ({
          id: record.id,
          title: record.type === 'checkup' ? 'Veteriner Kontrolü' : 'Tedavi',
          date: record.date,
          time: '10:00',
          type: 'health'
        })),
        ...(vaccData || []).map(vacc => ({
          id: vacc.id,
          title: `${vacc.vaccine_name} Aşısı`,
          date: vacc.date,
          time: '09:00',
          type: 'vaccination'
        }))
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setUpcomingTasks(tasks);
    } catch (err) {
      console.error('Error fetching upcoming tasks:', err);
    }
  };

  const fetchDeliveries = async () => {
    try {
      if (!farm?.id) return;

      const today = new Date();
      const nextWeek = addDays(today, 7);

      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('farm_id', farm.id)
        .eq('status', 'scheduled')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', nextWeek.toISOString().split('T')[0])
        .order('date');

      if (error) throw error;
      setDeliveries(data || []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Hoş Geldiniz, {farm?.name}</h1>
        <p className="mt-2 text-gray-600">{format(new Date(), 'd MMMM yyyy', { locale: tr })}</p>
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
              <p className="text-sm text-gray-500">Günlük Süt Üretimi</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStats.milkProduction.toFixed(1)} L</p>
              <p className="text-xs text-green-600 mt-1">{dailyStats.activeAnimals} aktif hayvan</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Günlük Gelir</p>
              <p className="text-2xl font-bold text-gray-900">₺{dailyStats.revenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">₺10/L</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tank Sıcaklığı</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStats.tankTemperature.toFixed(1)}°C</p>
              <p className="text-xs text-green-600 mt-1">Normal aralıkta</p>
            </div>
            <Thermometer className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Günlük Aktiviteler</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplet className="h-5 w-5" />
                  <p>Sabah sağımı tamamlandı - {(dailyStats.milkProduction / 2).toFixed(1)} L</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 text-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <p>Yem siparişi teslim alındı - 5,000 kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Yaklaşan Görevler</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map(task => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(task.date), 'd MMMM yyyy', { locale: tr })}, {task.time}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  Yaklaşan görev bulunmuyor
                </p>
              )}
            </div>
          </div>

          {/* Deliveries */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sevkiyatlar</h2>
              <Truck className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {deliveries.length > 0 ? (
                deliveries.map(delivery => (
                  <div key={delivery.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{delivery.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(delivery.date), 'd MMMM yyyy', { locale: tr })} - {delivery.quantity} {delivery.unit}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  Yaklaşan sevkiyat bulunmuyor
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}