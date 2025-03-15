import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  MoreVertical,
  ChevronDown,
  Package,
  AlertTriangle,
  Truck,
  Calendar,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
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
  Bar
} from 'recharts';

interface InventoryItem {
  id: string;
  name: string;
  category: 'feed' | 'medicine' | 'equipment' | 'other';
  currentStock: number;
  unit: string;
  minStock: number;
  location: string;
  lastUpdated: string;
  status: 'normal' | 'low' | 'critical';
}

// Mock data
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Mısır Silajı',
    category: 'feed',
    currentStock: 15000,
    unit: 'kg',
    minStock: 5000,
    location: 'Depo A',
    lastUpdated: '2024-03-10',
    status: 'normal'
  },
  {
    id: '2',
    name: 'Antibiyotik A',
    category: 'medicine',
    currentStock: 50,
    unit: 'adet',
    minStock: 100,
    location: 'İlaç Dolabı',
    lastUpdated: '2024-03-11',
    status: 'critical'
  }
];

const mockStockHistory = [
  { date: '2024-01', inStock: 12000, consumed: 8000 },
  { date: '2024-02', inStock: 15000, consumed: 10000 },
  { date: '2024-03', inStock: 18000, consumed: 12000 }
];

function InventoryManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredItems = mockInventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stok Yönetimi</h1>
            <p className="mt-2 text-gray-600">Toplam {mockInventoryItems.length} ürün</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/add-product')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Ürün</span>
            </button>
            <button
              onClick={() => navigate('/add-order')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Truck className="h-5 w-5" />
              <span>Yeni Sipariş</span>
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
                placeholder="Ürün adı ile ara..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="feed">Yem</option>
                <option value="medicine">İlaç</option>
                <option value="equipment">Ekipman</option>
                <option value="other">Diğer</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 divide-y">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedItem?.id === item.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center gap-4">
                    <Package className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === 'normal' ? 'bg-green-100 text-green-800' :
                          item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status === 'normal' ? 'Normal' :
                           item.status === 'low' ? 'Düşük' :
                           'Kritik'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">{item.category === 'feed' ? 'Yem' :
                          item.category === 'medicine' ? 'İlaç' :
                          item.category === 'equipment' ? 'Ekipman' :
                          'Diğer'}</span>
                        <span className="text-sm text-gray-500">{item.currentStock} {item.unit}</span>
                        <span className="text-sm text-gray-500">{item.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Item Details */}
        {selectedItem ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Ürün Detayları</h2>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Stock Level */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Stok Seviyesi</h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-lg font-semibold text-gray-900">
                        {selectedItem.currentStock} {selectedItem.unit}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-600">
                        Min: {selectedItem.minStock} {selectedItem.unit}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${(selectedItem.currentStock / (selectedItem.minStock * 2)) * 100}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        selectedItem.status === 'normal' ? 'bg-green-500' :
                        selectedItem.status === 'low' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Stock History */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">Stok Geçmişi</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={mockStockHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="inStock" name="Giriş" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="consumed" name="Çıkış" stroke="#ef4444" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 p-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                  <Truck className="h-5 w-5" />
                  <span>Sipariş Ver</span>
                </button>
                <button className="flex items-center justify-center gap-2 p-3 text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                  <Calendar className="h-5 w-5" />
                  <span>Hareket Geçmişi</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-gray-500">
            <Package className="h-12 w-12 mb-4" />
            <p>Detayları görüntülemek için bir ürün seçin</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryManagement;