// src/components/NotificationBadge.jsx - Componente de notificaciones
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationBadge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      // Actualizar cada 30 segundos
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotificationsByUser(user.id, {
        leida: 0, // Solo no leídas
        limit: 5
      });
      
      if (response.success) {
        const unread = response.data.notificaciones || [];
        setNotifications(unread);
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Marcar como leída
      await notificationService.markAsRead(notification.id);
      
      // Actualizar estado local
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Cerrar dropdown
      setShowDropdown(false);
      
      // Redirigir según el tipo
      switch (notification.tipo) {
        case 'nueva_asignacion':
          navigate('/contractor/dashboard');
          break;
        case 'cita_confirmada':
        case 'cita_cancelada':
          navigate(user.tipo_usuario === 'cliente' ? '/client/dashboard' : '/contractor/calendar');
          break;
        default:
          navigate('/notifications');
          break;
      }
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const handleViewAll = () => {
    setShowDropdown(false);
    navigate('/notifications');
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    return `hace ${diffDays} días`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="text-sm text-blue-600">{unreadCount} nuevas</span>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay notificaciones nuevas</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.titulo}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.mensaje}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleViewAll}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationBadge;