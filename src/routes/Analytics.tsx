import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Download,
  Printer,
  Filter,
  Search,
  ChevronDown
} from 'lucide-react';

function Analytics() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<'overview' | 'reports' | 'dashboards'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
            <p className="mt-2 text-gray-600">Çiftlik performans metrikleri ve raporları</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/add-report')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Rapor</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'overview'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setSelectedView('reports')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'reports'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Raporlar
            </button>
            <button
              onClick={() => setSelectedView('dashboards')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'dashboards'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Panolar
            </button>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">Son 7 Gün</option>
              <option value="month">Son 30 Gün</option>
              <option value="year">Son 1 Yıl</option>
            </select>
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
        {/* Left Panel - Main Charts */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Performans Metrikleri</h2>
              <div className="flex gap-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">Grafik yakında eklenecek</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Additional Info */}
        <div className="space-y-6">
          {/* Recent Reports */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Son Raporlar</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Günlük Üretim Raporu</p>
                <p className="text-xs text-gray-500">15 Mart 2024</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Sağlık Durumu Raporu</p>
                <p className="text-xs text-gray-500">14 Mart 2024</p>
              </div>
            </div>
          </div>

          {/* Scheduled Reports */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Planlı Raporlar</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Haftalık Finansal Rapor</p>
                <p className="text-xs text-gray-500">Her Pazartesi, 09:00</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Aylık Performans Raporu</p>
                <p className="text-xs text-gray-500">Her ayın 1'i, 10:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;