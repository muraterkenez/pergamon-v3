import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  DollarSign,
  Calendar,
  FileText,
  Building2,
  Receipt,
  Calculator,
  Plus,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Customer {
  id: string;
  name: string;
  type: 'company' | 'individual';
  tax_number?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface IncomeFormData {
  date: string;
  category: 'milk' | 'product' | 'animal' | 'support' | 'other';
  amount: string;
  customer: string;
  customerId?: string;
  description: string;
  invoiceNumber?: string;
  paymentMethod: 'cash' | 'bank' | 'check';
  paymentDue?: string;
  notes?: string;
}

const categories = [
  { value: 'milk', label: 'Süt Satışı' },
  { value: 'product', label: 'Ürün Satışı' },
  { value: 'animal', label: 'Hayvan Satışı' },
  { value: 'support', label: 'Devlet Desteği' },
  { value: 'other', label: 'Diğer' }
];

function AddIncome() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IncomeFormData>({
    date: new Date().toISOString().split('T')[0],
    category: 'milk',
    amount: '',
    customer: '',
    description: '',
    paymentMethod: 'bank'
  });

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch customers on component mount
    fetchCustomers();

    // Add click outside listener for dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Filter customers based on search input
    if (customerSearch) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.tax_number?.toLowerCase().includes(customerSearch.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [customerSearch, customers]);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching customers:', error);
      return;
    }

    setCustomers(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save income record
    console.log('Form data:', formData);
    navigate('/financial');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'customer') {
      setCustomerSearch(value);
      setShowCustomerDropdown(true);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customer: customer.name,
      customerId: customer.id
    }));
    setShowCustomerDropdown(false);
  };

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    type: 'company'
  });

  const handleNewCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('customers')
      .insert([newCustomer])
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return;
    }

    // Update customers list
    setCustomers(prev => [...prev, data]);

    // Update form with new customer
    setFormData(prev => ({
      ...prev,
      customer: data.name,
      customerId: data.id
    }));

    // Close modal
    setShowCustomerModal(false);
    setNewCustomer({ type: 'company' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/financial')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Gelir Kaydı</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/financial')}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gelir Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tarih*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori*
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Tutar (₺)*
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    required
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                  Müşteri/Kaynak*
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      id="customer"
                      name="customer"
                      ref={customerInputRef}
                      required
                      value={formData.customer}
                      onChange={handleChange}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Müşteri adı"
                    />
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomerModal(true)}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Yeni</span>
                  </button>
                </div>
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
                  >
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="font-medium">{customer.name}</div>
                        {customer.tax_number && (
                          <div className="text-sm text-gray-500">VKN: {customer.tax_number}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama*
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="İşlem açıklaması"
                />
              </div>
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Fatura Numarası
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="invoiceNumber"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Fatura no"
                  />
                  <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Ödeme Bilgileri */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Ödeme Yöntemi*
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  required
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">Nakit</option>
                  <option value="bank">Banka Transferi</option>
                  <option value="check">Çek</option>
                </select>
              </div>
              <div>
                <label htmlFor="paymentDue" className="block text-sm font-medium text-gray-700 mb-1">
                  Vade Tarihi
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="paymentDue"
                    name="paymentDue"
                    value={formData.paymentDue}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
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

      {/* New Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Yeni Müşteri Ekle</h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleNewCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müşteri Tipi*
                </label>
                <select
                  value={newCustomer.type}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, type: e.target.value as 'company' | 'individual' }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="company">Kurumsal</option>
                  <option value="individual">Bireysel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newCustomer.type === 'company' ? 'Firma Adı*' : 'Ad Soyad*'}
                </label>
                <input
                  type="text"
                  value={newCustomer.name || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              {newCustomer.type === 'company' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vergi Numarası
                  </label>
                  <input
                    type="text"
                    value={newCustomer.tax_number || ''}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, tax_number: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <textarea
                  value={newCustomer.address || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  value={newCustomer.email || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddIncome;