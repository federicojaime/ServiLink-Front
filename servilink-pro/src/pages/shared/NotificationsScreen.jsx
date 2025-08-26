// src/pages/shared/NotificationsScreen.jsx - Pantalla de notificaciones
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle, Clock, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { notificationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const params = { limit: 50 };
      if (filter === 'unread') params.leida = 0;
      if (filter === 'read') params.leida = 1;
      
      const response = await notificationService.getNotificationsByUser(user.id, params);
      
      if (response.success) {
        setNotifications(response.data.notificaciones || []);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Actualizar la notificación localmente
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, leida: 1 }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Marcar como leída si no lo está
    if (!notification.leida) {
      await handleMarkAsRead(notification.id);
    }
    
    // Redirigir según el tipo de notificación
    switch (notification.tipo) {
      case 'nueva_asignacion':
        navigate('/contractor/dashboard');
        break;
      case 'cita_confirmada':
      case 'cita_cancelada':
        navigate(user.tipo_usuario === 'cliente' ? '/client/dashboard' : '/contractor/calendar');
        break;
      case 'pago_recibido':
      case 'pago_liberado':
        navigate(user.tipo_usuario === 'cliente' ? '/client/dashboard' : '/contractor/dashboard');
        break;
      case 'evaluacion_recibida':
        navigate(user.tipo_usuario === 'cliente' ? '/client/dashboard' : '/contractor/dashboard');
        break;
      default:
        // No hacer nada para notificaciones generales
        break;
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'nueva_asignacion':
        return <Bell className="w-5 h-5 text-blue-600" />;
      case 'cita_confirmada':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cita_cancelada':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'recordatorio':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'pago_recibido':
      case 'pago_liberado':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'evaluacion_recibida':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const unreadCount = notifications.filter(n => !n.leida).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-800">
              Notificaciones
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-600">
                {unreadCount} sin leer
              </p>
            )}
          </div>
          
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Sin leer
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'read'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Leídas
          </button>
        </div>

        {/* Lista de notificaciones */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Cargando notificaciones...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-gray-600 text-sm">
              {filter === 'unread' 
                ? 'Todas las notificaciones han sido leídas'
                : 'Te notificaremos cuando haya novedades'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                  !notification.leida 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icono */}
                  <div className={`p-2 rounded-lg ${
                    !notification.leida ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.tipo)}
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`font-medium ${
                        !notification.leida ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.titulo}
                      </h4>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    
                    <p className={`text-sm mt-1 ${
                      !notification.leida ? 'text-gray-700' : 'text-gray-600'
                    }`}>
                      {notification.mensaje}
                    </p>
                    
                    {/* Indicador de no leída */}
                    {!notification.leida && (
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        <span className="text-xs text-blue-600 font-medium">
                          Nueva
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;