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
  BarChart3,
  Warehouse,
  Clock,
  Thermometer,
  QrCode,
  LineChart,
  Droplet
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

interface DairyProduct {
  id: string;
  name: string;
  category: 'cheese' | 'butter' | 'yogurt' | 'other';
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  status: 'in_production' | 'aging' | 'ready' | 'sold';
  storageConditions: string;
  qualityScore: number;
}

// Mock data
const mockDairyProducts: DairyProduct[] = [
  {
    id: '1',
    name: 'Beyaz Peynir',
    category: 'cheese',
    batchNumber: 'BP2024001',
    productionDate: '2024-03-01',
    expiryDate: '2024-06-01',
    quantity: 500,
    unit: 'kg',
    status: 'aging',
    storageConditions: '4-8°C',
    qualityScore: 95
  },
  {
    id: '2',
    name: 'Tereyağı',
    category: 'butter',
    batchNumber: 'TB2024001',
    productionDate: '2024-03-05',
    expiryDate: '2024-05-05',
    quantity: 200,
    unit: 'kg',
    status: 'ready',
    storageConditions: '2-6°C',
    qualityScore: 98
  }
];

const mockProductionHistory = [
  { date: '2024-01', cheese: 1200, butter: 500, yogurt: 800 },
  { date: '2024-02', cheese: 1500, butter: 600, yogurt: 900 },
  { date: '2024-03', cheese: 1300, butter: 550, yogurt: 850 }
];

function DairyProducts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<DairyProduct | null>(null);

  const filteredProducts = mockDairyProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Süt Ürünleri Yönetimi</h1>
            <p className="mt-2 text-gray-600">Toplam {mockDairyProducts.length} ürün</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/add-dairy-product')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Ürün</span>
            </button>
            <button
              onClick={() => navigate('/production-batch')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Package className="h-5 w-5" />
              <span>Yeni Üretim</span>
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
                placeholder="Ürün adı veya parti numarası ile ara..."
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
                <option value="cheese">Peynir</option>
                <option value="butter">Tereyağı</option>
                <option value="yogurt">Yoğurt</option>
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
        {/* Product List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 divide-y">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedProduct?.id === product.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex items-center gap-4">
                    <Warehouse className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.status === 'ready' ? 'bg-green-100 text-green-800' :
                          product.status === 'aging' ? 'bg-yellow-100 text-yellow-800' :
                          product.status === 'in_production' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status === 'ready' ? 'Hazır' :
                           product.status === 'aging' ? 'Olgunlaşıyor' :
                           product.status === 'in_production' ? 'Üretimde' :
                           'Satıldı'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">Parti: {product.batchNumber}</span>
                        <span className="text-sm text-gray-500">{product.quantity} {product.unit}</span>
                        <span className="text-sm text-gray-500">{format(new Date(product.productionDate), 'd MMMM yyyy', { locale: tr })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        {selectedProduct ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Ürün Detayları</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <QrCode className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Temel Bilgiler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Parti Numarası</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProduct.batchNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Kategori</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedProduct.category === 'cheese' ? 'Peynir' :
                       selectedProduct.category === 'butter' ? 'Tereyağı' :
                       selectedProduct.category === 'yogurt' ? 'Yoğurt' :
                       'Diğer'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Üretim Tarihi</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(selectedProduct.productionDate), 'd MMMM yyyy', { locale: tr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Son Kullanma Tarihi</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(selectedProduct.expiryDate), 'd MMMM yyyy', { locale: tr })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Storage Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Depolama Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Miktar</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProduct.quantity} {selectedProduct.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Depolama Koşulları</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProduct.storageConditions}</p>
                  </div>
                </div>
              </div>

              {/* Quality Score */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Kalite Puanı</h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-lg font-semibold text-gray-900">
                        {selectedProduct.qualityScore}/100
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${selectedProduct.qualityScore}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        selectedProduct.qualityScore >= 90 ? 'bg-green-500' :
                        selectedProduct.qualityScore >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Production History */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">Üretim Geçmişi</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={mockProductionHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="cheese" name="Peynir" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="butter" name="Tereyağı" stroke="#10b981" />
                      <Line type="monotone" dataKey="yogurt" name="Yoğurt" stroke="#f59e0b" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 p-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                  <Package className="h-5 w-5" />
                  <span>Üretim Detayları</span>
                </button>
                <button className="flex items-center justify-center gap-2 p-3 text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                  <Truck className="h-5 w-5" />
                  <span>Sevkiyat Planla</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-gray-500">
            <Warehouse className="h-12 w-12 mb-4" />
            <p>Detayları görüntülemek için bir ürün seçin</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DairyProducts;