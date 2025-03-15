import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Mail,
  Clock,
  Plus,
  Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReportFormData {
  name: string;
  description: string;
  type: 'production' | 'health' | 'financial' | 'inventory';
  metrics: string[];
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  recipients: string[];
  format: 'pdf' | 'excel';
}

const metricOptions = {
  production: [
    'daily_milk_production',
    'milk_quality_metrics',
    'production_efficiency',
    'milk_temperature'
  ],
  health: [
    'animal_health_status',
    'vaccination_schedule',
    'treatment_records',
    'mortality_rate'
  ],
  financial: [
    'revenue_metrics',
    'cost_analysis',
    'profit_margins',
    'expense_breakdown'
  ],
  inventory: [
    'feed_stock_levels',
    'medicine_inventory',
    'equipment_status',
    'supply_usage'
  ]
};

function AddReport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ReportFormData>({
    name: '',
    description: '',
    type: 'production',
    metrics: [],
    schedule: {
      frequency: 'daily',
      time: '08:00'
    },
    recipients: [''],
    format: 'pdf'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('analytics_reports')
        .insert([{
          name: formData.name,
          description: formData.description,
          template: {
            type: formData.type,
            metrics: formData.metrics,
            format: formData.format
          },
          schedule: formData.schedule.frequency === 'daily' 
            ? `0 ${formData.schedule.time.split(':')[1]} ${formData.schedule.time.split(':')[0]} * * *`
            : formData.schedule.frequency === 'weekly'
            ? `0 ${formData.schedule.time.split(':')[1]} ${formData.schedule.time.split(':')[0]} * * ${formData.schedule.dayOfWeek}`
            : `0 ${formData.schedule.time.split(':')[1]} ${formData.schedule.time.split(':')[0]} ${formData.schedule.dayOfMonth} * *`,
          recipients: formData.recipients.filter(r => r.trim() !== '')
        }])
        .select();

      if (error) throw error;

      navigate('/analytics');
    } catch (error) {
      console.error('Error creating report:', error);
      // TODO: Show error message to user
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMetricToggle = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  const addRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? value : r)
    }));
  };

  const removeRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/analytics')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Rapor Oluştur</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/analytics')}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rapor Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Rapor Adı*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Günlük Üretim Raporu"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Rapor Tipi*
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="production">Üretim Raporu</option>
                  <option value="health">Sağlık Raporu</option>
                  <option value="financial">Finansal Rapor</option>
                  <option value="inventory">Stok Raporu</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rapor açıklaması..."
                />
              </div>
            </div>
          </div>

          {/* Metrikler */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metrikler</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {metricOptions[formData.type].map((metric) => (
                <label
                  key={metric}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.metrics.includes(metric)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.metrics.includes(metric)}
                    onChange={() => handleMetricToggle(metric)}
                    className="hidden"
                  />
                  <span className="text-sm">{metric.split('_').join(' ').toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Zamanlama */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Zamanlama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Sıklık*
                </label>
                <select
                  id="frequency"
                  value={formData.schedule.frequency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, frequency: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Günlük</option>
                  <option value="weekly">Haftalık</option>
                  <option value="monthly">Aylık</option>
                </select>
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Saat*
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.schedule.time}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, time: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {formData.schedule.frequency === 'weekly' && (
                <div>
                  <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
                    Gün*
                  </label>
                  <select
                    id="dayOfWeek"
                    value={formData.schedule.dayOfWeek}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, dayOfWeek: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>Pazartesi</option>
                    <option value={2}>Salı</option>
                    <option value={3}>Çarşamba</option>
                    <option value={4}>Perşembe</option>
                    <option value={5}>Cuma</option>
                    <option value={6}>Cumartesi</option>
                    <option value={0}>Pazar</option>
                  </select>
                </div>
              )}
              {formData.schedule.frequency === 'monthly' && (
                <div>
                  <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-700 mb-1">
                    Ayın Günü*
                  </label>
                  <select
                    id="dayOfMonth"
                    value={formData.schedule.dayOfMonth}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, dayOfMonth: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Alıcılar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Alıcılar</h2>
              <button
                type="button"
                onClick={addRecipient}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                + Alıcı Ekle
              </button>
            </div>
            <div className="space-y-3">
              {formData.recipients.map((recipient, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRecipient(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rapor Formatı</h2>
            <div className="flex gap-4">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.format === 'pdf' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={formData.format === 'pdf'}
                  onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as 'pdf' | 'excel' }))}
                  className="hidden"
                />
                <span className="text-sm font-medium">PDF</span>
              </label>
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.format === 'excel' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={formData.format === 'excel'}
                  onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as 'pdf' | 'excel' }))}
                  className="hidden"
                />
                <span className="text-sm font-medium">Excel</span>
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddReport;