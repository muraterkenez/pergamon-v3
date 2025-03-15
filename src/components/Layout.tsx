import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from '../lib/auth';
import { useAuthContext } from './AuthProvider';
import {
  Home,
  Users,
  Package,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Milk,
  Heart,
  Warehouse,
  DollarSign,
  BarChart
} from 'lucide-react';

// Import all route components
import Dashboard from '../routes/Dashboard';
import AnimalManagement from '../routes/AnimalManagement';
import AddAnimal from '../routes/AddAnimal';
import MilkProduction from '../routes/MilkProduction';
import AddMilkRecord from '../routes/AddMilkRecord';
import AnimalHealth from '../routes/AnimalHealth';
import AddHealthRecord from '../routes/AddHealthRecord';
import AddVaccination from '../routes/AddVaccination';
import InventoryManagement from '../routes/InventoryManagement';
import AddProduct from '../routes/AddProduct';
import AddOrder from '../routes/AddOrder';
import DairyProducts from '../routes/DairyProducts';
import Settings from '../routes/Settings';
import Analytics from '../routes/Analytics';
import AddReport from '../routes/AddReport';
import FinancialManagement from '../routes/FinancialManagement';
import AddIncome from '../routes/AddIncome';
import AddExpense from '../routes/AddExpense';
import BreedingRecord from '../routes/BreedingRecord';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, farm } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'hidden'}`}>
            <span className="text-xl font-bold text-gray-900">{farm?.name}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {isSidebarOpen ? <X className="h-5 w-5 text-gray-500" /> : <Menu className="h-5 w-5 text-gray-500" />}
          </button>
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Link
              to="/"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                location.pathname === '/' ? 'text-gray-700 bg-gray-100' : 'text-gray-600'
              }`}
            >
              <Home className="h-5 w-5" />
              {isSidebarOpen && <span>Ana Sayfa</span>}
            </Link>
            <Link
              to="/animals"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                location.pathname.startsWith('/animal') ? 'text-gray-700 bg-gray-100' : 'text-gray-600'
              }`}
            >
              <Users className="h-5 w-5" />
              {isSidebarOpen && <span>Hayvanlar</span>}
            </Link>
            <Link
              to="/milk-production"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                location.pathname.startsWith('/milk') ? 'text-gray-700 bg-gray-100' : 'text-gray-600'
              }`}
            >
              <Milk className="h-5 w-5" />
              {isSidebarOpen && <span>Süt Üretimi</span>}
            </Link>
            <Link
              to="/animal-health"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                location.pathname.startsWith('/health') ? 'text-gray-700 bg-gray-100' : 'text-gray-600'
              }`}
            >
              <Heart className="h-5 w-5" />
              {isSidebarOpen && <span>Sağlık Takibi</span>}
            </Link>
            <Link
              to="/inventory"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                location.pathname.startsWith('/inventory') ? 'text-gray-700 bg-gray-100' : 'text-gray-600'
              }`}
            >
              <Package className="h-5 w-5" />
              {isSidebarOpen && <span>Stok Yönetimi</span>}
            </Link>
            <Link
              to="/dairy-products"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                location.pathname.startsWith('/dairy') ? 'text-gray-700 bg-gray-100' : 'text-gray-600'
              }`}
            >
              <Warehouse className="h-5 w-5" />
              {isSidebarOpen && <span>Süt Ürünleri</span>}
            </Link>
            <Link
              to="/financial"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                location.pathname.startsWith('/financial') ? 'text-gray-700 bg-gray-100' : 'text-gray-600'
              }`}
            >
              <DollarSign className="h-5 w-5" />
              {isSidebarOpen && <span>Finansal Yönetim</span>}
            </Link>
            <Link
              to="/analytics"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                location.pathname.startsWith('/analytics') ? 'text-gray-700 bg-gray-100' : 'text-gray-600'
              }`}
            >
              <BarChart className="h-5 w-5" />
              {isSidebarOpen && <span>Analitik</span>}
            </Link>
            <Link
              to="/settings"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                location.pathname === '/settings' ? 'text-gray-700 bg-gray-100' : 'text-gray-600'
              }`}
            >
              <SettingsIcon className="h-5 w-5" />
              {isSidebarOpen && <span>Ayarlar</span>}
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-3 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Çıkış Yap</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/animals" element={<AnimalManagement />} />
          <Route path="/add-animal" element={<AddAnimal />} />
          <Route path="/milk-production" element={<MilkProduction />} />
          <Route path="/add-milk-record" element={<AddMilkRecord />} />
          <Route path="/animal-health" element={<AnimalHealth />} />
          <Route path="/add-health-record" element={<AddHealthRecord />} />
          <Route path="/add-vaccination" element={<AddVaccination />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/add-order" element={<AddOrder />} />
          <Route path="/dairy-products" element={<DairyProducts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/add-report" element={<AddReport />} />
          <Route path="/financial" element={<FinancialManagement />} />
          <Route path="/add-income" element={<AddIncome />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/breeding-record" element={<BreedingRecord />} />
        </Routes>
      </div>
    </div>
  );
}

export default Layout;