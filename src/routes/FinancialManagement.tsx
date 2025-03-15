import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart,
  Calendar,
  Download,
  Printer,
  Filter,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  FileText,
  CreditCard,
  Wallet,
  Building2,
  Receipt,
  Calculator,
  ChevronDown
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

// Mock data
const mockCashFlow = [
  { date: '2024-01', income: 450000, expense: 380000 },
  { date: '2024-02', income: 480000, expense: 395000 },
  { date: '2024-03', income: 520000, expense: 410000 }
];

const mockExpenseCategories = [
  { name: 'Yem', value: 250000, color: '#3b82f6' },
  { name: 'İşçilik', value: 120000, color: '#10b981' },
  { name: 'Veteriner', value: 45000, color: '#f59e0b' },
  { name: 'Enerji', value: 35000, color: '#ef4444' },
  { name: 'Diğer', value: 25000, color: '#6b7280' }
];

const mockIncomeCategories = [
  { name: 'Süt Satışı', value: 380000, color: '#3b82f6' },
  { name: 'Ürün Satışı', value: 85000, color: '#10b981' },
  { name: 'Hayvan Satışı', value: 45000, color: '#f59e0b' },
  { name: 'Destekler', value: 25000, color: '#8b5cf6' }
];

const mockRecentTransactions = [
  {
    id: '1',
    date: '2024-03-15',
    description: 'Süt Satışı - Süt Fabrikası A.Ş.',
    amount: 125000,
    type: 'income',
    category: 'Süt Satışı'
  },
  {
    id: '2',
    date: '2024-03-14',
    description: 'Yem Alımı - Yem Ltd.',
    amount: 85000,
    type: 'expense',
    category: 'Yem'
  }
];

const mockBudgetItems = [
  {
    category: 'Yem',
    budgeted: 280000,
    actual: 250000,
    variance: -30000
  },
  {
    category: 'İşçilik',
    budgeted: 110000,
    actual: 120000,
    variance: 10000
  }
];

function FinancialManagement() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'income' | 'expense' | 'budget'>('overview');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finansal Yönetim</h1>
            <p className="mt-2 text-gray-600">Mart 2024 finansal durumu</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/add-income')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Gelir Ekle</span>
            </button>
            <button
              onClick={() => navigate('/add-expense')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Plus className="h-5 w-5" />
              <span>Gider Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aylık Gelir</p>
              <p className="text-2xl font-bold text-gray-900">₺520,000</p>
              <p className="text-xs text-green-600 mt-1">+8.3% geçen aya göre</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aylık Gider</p>
              <p className="text-2xl font-bold text-gray-900">₺410,000</p>
              <p className="text-xs text-red-600 mt-1">+3.8% geçen aya göre</p>
            </div>
            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Kâr</p>
              <p className="text-2xl font-bold text-gray-900">₺110,000</p>
              <p className="text-xs text-green-600 mt-1">%21.2 kâr marjı</p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Litre Başı Maliyet</p>
              <p className="text-2xl font-bold text-gray-900">₺8.45</p>
              <p className="text-xs text-blue-600 mt-1">48,500 L üretim</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
              <Calculator className="h-6 w-6 text-purple-600" />
            </div>
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
              onClick={() => setSelectedView('income')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'income'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Gelirler
            </button>
            <button
              onClick={() => setSelectedView('expense')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'expense'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Giderler
            </button>
            <button
              onClick={() => setSelectedView('budget')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'budget'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Bütçe
            </button>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="month">Bu Ay</option>
              <option value="quarter">Bu Çeyrek</option>
              <option value="year">Bu Yıl</option>
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
            {selectedView === 'overview' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Nakit Akışı</h2>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={mockCashFlow}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="income" name="Gelir" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {selectedView === 'income' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Gelir Dağılımı</h2>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={mockIncomeCategories}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {mockIncomeCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {selectedView === 'expense' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Gider Dağılımı</h2>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={mockExpenseCategories}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {mockExpenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {selectedView === 'budget' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Bütçe Karşılaştırması</h2>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={mockBudgetItems}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="budgeted" name="Planlanan" fill="#3b82f6" />
                      <Bar dataKey="actual" name="Gerçekleşen" fill="#10b981" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Additional Info */}
        <div className="space-y-6">
          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Son İşlemler</h2>
              <Receipt className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {mockRecentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{format(new Date(transaction.date), 'd MMMM yyyy', { locale: tr })}</p>
                    </div>
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Yaklaşan Ödemeler</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                <p className="text-sm font-medium">Yem Ödemesi</p>
                <p className="text-xs">₺85,000 - 3 gün kaldı</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-800 rounded-lg">
                <p className="text-sm font-medium">SGK Ödemesi</p>
                <p className="text-xs">₺45,000 - 7 gün kaldı</p>
              </div>
            </div>
          </div>

          {/* Budget Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Bütçe Durumu</h2>
              <Calculator className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {mockBudgetItems.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.category}</span>
                    <span className={`text-sm font-medium ${
                      item.variance < 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.variance < 0 ? '-' : '+'}₺{Math.abs(item.variance).toLocaleString()}
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${(item.actual / item.budgeted) * 100}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          item.actual <= item.budgeted ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialManagement;