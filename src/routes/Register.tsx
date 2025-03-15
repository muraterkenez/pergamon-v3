import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../lib/auth';
import { Lock, Mail, AlertTriangle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryTimeout, setRetryTimeout] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't allow submission if we're in retry timeout
    if (retryTimeout !== null) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signUp(formData.email, formData.password);
      navigate('/login', { state: { message: 'Hesabınız oluşturuldu. Lütfen giriş yapın.' } });
    } catch (err: any) {
      setError(err.message || 'Kayıt olurken bir hata oluştu');
      
      // If it's a rate limit error, start a countdown
      if (err.message.includes('bekleyip tekrar deneyin')) {
        let countdown = 20; // Start with 20 seconds
        setRetryTimeout(countdown);
        
        const timer = setInterval(() => {
          countdown -= 1;
          if (countdown <= 0) {
            clearInterval(timer);
            setRetryTimeout(null);
          } else {
            setRetryTimeout(countdown);
          }
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Kayıt Ol
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <p>{error}</p>
              </div>
              {retryTimeout !== null && (
                <p className="mt-2 text-sm text-red-600">
                  {retryTimeout} saniye sonra tekrar deneyebilirsiniz
                </p>
              )}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || retryTimeout !== null}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Kayıt yapılıyor...' : 
                 retryTimeout !== null ? `${retryTimeout} saniye bekleyin...` : 
                 'Kayıt Ol'}
              </button>
            </div>

            <div className="text-sm text-center">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Zaten hesabınız var mı? Giriş yapın
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}