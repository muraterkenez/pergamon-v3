import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Search, Package, Truck, Calendar, DollarSign, FileText } from 'lucide-react';

interface OrderFormData {
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: OrderItem[];
  status: 'draft' | 'pending' | 'approved' | 'ordered';
  shippingAddress: string;
  paymentTerms: string;
  notes?: string;
  totalAmount: number;
}

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

// Mock data
const mockSuppliers = [
  { id: '1', name: 'Yem A.Ş.', type: 'Yem Tedarikçisi' },
  { id: '2', name: 'Veteriner Malzemeleri Ltd.', type: 'İlaç Tedarikçisi' },
  { id: '3', name: 'Ekipman Market', type: 'Ekipman Tedarikçisi' }
];

const mockProducts = [
  { id: '1', name: 'Mısır Silajı', category: 'feed', unit: 'kg', price: 2.5 },
  { id: '2', name: 'Yonca Kuru Ot', category: 'feed', unit: 'kg', price: 3.0 },
  { id: '3', name: 'Antibiyotik A', category: 'medicine', unit: 'adet', price: 150 }
];

function AddOrder() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<OrderFormData>({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    items: [],
    status: 'draft',
    shippingAddress: '',
    paymentTerms: '',
    totalAmount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API entegrasyonu yapılacak
    console.log('Form data:', formData);
    navigate('/inventory');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addOrderItem = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId,
          quantity: 1,
          unitPrice: product.price
        }
      ]
    }));
  };

  const updateOrderItem = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeOrderItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/inventory')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Sipariş Oluştur</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/inventory')}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">
                  Tedarikçi*
                </label>
                <select
                  id="supplierId"
                  name="supplierId"
                  required
                  value={formData.supplierId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tedarikçi seçin</option>
                  {mockSuppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Sipariş Tarihi*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="orderDate"
                    name="orderDate"
                    required
                    value={formData.orderDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Tahmini Teslimat Tarihi*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="expectedDeliveryDate"
                    name="expectedDeliveryDate"
                    required
                    value={formData.expectedDeliveryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Ürün Seçimi */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Kalemleri</h2>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockProducts
                  .filter(product =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addOrderItem(product.id)}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-6 w-6 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.price} ₺/{product.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {formData.items.length > 0 && (
                <div className="mt-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ürün
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Miktar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Birim Fiyat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toplam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlem
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => {
                        const product = mockProducts.find(p => p.id === item.productId);
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {product?.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateOrderItem(index, 'quantity', Number(e.target.value))}
                                className="w-24 px-2 py-1 border rounded"
                                min="1"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateOrderItem(index, 'unitPrice', Number(e.target.value))}
                                className="w-24 px-2 py-1 border rounded"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {(item.quantity * item.unitPrice).toFixed(2)} ₺
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => removeOrderItem(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Kaldır
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right font-medium">
                          Toplam:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-gray-900">
                            {calculateTotal().toFixed(2)} ₺
                          </div>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Teslimat ve Ödeme */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Teslimat ve Ödeme Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Teslimat Adresi*
                </label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  required
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Teslimat adresi..."
                
                />
              </div>
              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                  Ödeme Koşulları*
                </label>
                <textarea
                  id="paymentTerms"
                  name="paymentTerms"
                  required
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ödeme koşulları..."
                />
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ek Bilgiler</h2>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notlar
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Eklemek istediğiniz notlar..."
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddOrder;