import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { supabase, isAuthenticated } from '../lib/supabase';

interface Notification {
  id: string;
  title: string;
  type: 'warning' | 'success' | 'info';
  content?: string;
  read: boolean;
  created_at: string;
}

const mockNotifications: Notification[] = [
  { 
    id: '1', 
    title: 'Süt tankı %90 dolulukta',
    type: 'warning',
    read: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Yeni doğum gerçekleşti (#245)',
    type: 'success',
    read: false,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: '3 hayvan için aşı zamanı yaklaşıyor',
    type: 'info',
    read: false,
    created_at: new Date().toISOString()
  }
];

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated
      const authenticated = await isAuthenticated();
      
      if (!authenticated) {
        console.log('User not authenticated, using mock data');
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Bildirimler yüklenirken bir hata oluştu');
      // Fallback to mock data
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const authenticated = await isAuthenticated();
      
      if (!authenticated) {
        // Update UI only for mock data
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return;
      }

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Update UI even if API call fails
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100';
      case 'success':
        return 'bg-green-50 text-green-800 hover:bg-green-100';
      case 'info':
        return 'bg-blue-50 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-50 text-gray-800 hover:bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none relative"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500">{unreadCount} okunmamış bildirim</p>
                )}
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Yükleniyor...</p>
                </div>
              ) : error ? (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg mb-3">
                  <p className="text-sm">{error}</p>
                  <button 
                    onClick={fetchNotifications}
                    className="text-xs font-medium text-red-700 hover:text-red-800 mt-1"
                  >
                    Yeniden Dene
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Bildirim bulunmuyor
                </p>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      getNotificationColor(notification.type)
                    } ${!notification.read ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium break-words pr-2">{notification.title}</p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      {notification.content && (
                        <p className="text-xs mt-1 break-words">{notification.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}