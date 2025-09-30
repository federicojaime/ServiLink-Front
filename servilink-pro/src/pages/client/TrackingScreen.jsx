// src/pages/client/TrackingScreen.jsx - Tracking GPS en tiempo real
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, MessageCircle, Clock, Navigation } from 'lucide-react';
import { trackingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TrackingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { appointmentId, professional } = location.state || {};
  
  const [trackingData, setTrackingData] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState('en_camino');
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appointmentId) {
      loadTracking();
      // Actualizar cada 30 segundos
      const interval = setInterval(loadTracking, 30000);
      return () => clearInterval(interval);
    }
  }, [appointmentId]);

  const loadTracking = async () => {
    try {
      setLoading(true);
      const response = await trackingService.getCurrentTracking(appointmentId);
      
      if (response.success) {
        setTrackingData(response.data.tracking);
        setTrackingStatus(response.data.estado);
        
        // Calcular tiempo estimado basado en distancia
        if (response.data.tracking) {
          const distance = calculateDistance(
            response.data.tracking.latitud_actual,
            response.data.tracking.longitud_actual,
            response.data.tracking.latitud_destino,
            response.data.tracking.longitud_destino
          );
          setEstimatedTime(Math.round(distance * 3)); // Estimado: 3 min por km
        }
      }
    } catch (error) {
      console.error('Error cargando tracking:', error);
      setError('Error obteniendo ubicación del profesional');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getStatusMessage = () => {
    switch(trackingStatus) {
      case 'en_camino':
        return `${professional?.nombre || 'El profesional'} está en camino`;
      case 'llegada':
        return `${professional?.nombre || 'El profesional'} ha llegado`;
      case 'trabajando':
        return `${professional?.nombre || 'El profesional'} está trabajando`;
      case 'finalizado':
        return 'Servicio completado';
      default:
        return 'Esperando actualización';
    }
  };

  const getStatusIcon = () => {
    switch(trackingStatus) {
      case 'en_camino':
        return <Navigation className="w-8 h-8 text-blue-600" />;
      case 'llegada':
        return <MapPin className="w-8 h-8 text-green-600" />;
      case 'trabajando':
        return <Clock className="w-8 h-8 text-orange-600" />;
      default:
        return <MapPin className="w-8 h-8 text-gray-600" />;
    }
  };

  if (loading && !trackingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Cargando ubicación...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-red-600 h-16 w-full relative">
        <button
          onClick={() => navigate('/client/dashboard')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Seguimiento en Tiempo Real
          </h1>
          <p className="text-gray-600">{getStatusMessage()}</p>
        </div>

        {/* Mapa simulado */}
        <div className="bg-gray-200 rounded-2xl h-64 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200">
            {/* Simulación de mapa */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {getStatusIcon()}
            </div>
            
            {/* Línea de ruta */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 50 50 Q 100 100 150 50 T 250 100"
                stroke="#3B82F6"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
              />
            </svg>
          </div>
          
          {/* Tiempo estimado */}
          {trackingStatus === 'en_camino' && (
            <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg">
              <p className="text-sm font-medium text-gray-800">
                Llegada en: {estimatedTime} min
              </p>
            </div>
          )}
        </div>

        {/* Información del profesional */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {professional?.nombre?.charAt(0) || 'P'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {professional?.nombre || 'Profesional'}
              </h3>
              <p className="text-gray-600 text-sm">{professional?.especialidad || 'Técnico'}</p>
              <div className="flex items-center mt-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600 ml-1">
                  {professional?.rating || '4.8'}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de contacto */}
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Llamar</span>
            </button>
            <button className="bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Mensaje</span>
            </button>
          </div>
        </div>

        {/* Estados del servicio */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Estado del Servicio
          </h3>
          
          <div className="space-y-3">
            {/* En camino */}
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                trackingStatus === 'en_camino' ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                {trackingStatus === 'en_camino' ? 
                  <span className="text-white text-xs">●</span> :
                  <span className="text-white text-xs">✓</span>
                }
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  trackingStatus === 'en_camino' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  En camino
                </p>
              </div>
            </div>

            {/* Llegada */}
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                trackingStatus === 'llegada' ? 'bg-green-600' :
                trackingStatus === 'trabajando' || trackingStatus === 'finalizado' ? 'bg-green-600' :
                'bg-gray-300'
              }`}>
                {(trackingStatus === 'llegada' || trackingStatus === 'trabajando' || trackingStatus === 'finalizado') ? 
                  <span className="text-white text-xs">✓</span> :
                  <span className="text-white text-xs">●</span>
                }
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  trackingStatus === 'llegada' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  Llegó al domicilio
                </p>
              </div>
            </div>

            {/* Trabajando */}
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                trackingStatus === 'trabajando' ? 'bg-orange-600' :
                trackingStatus === 'finalizado' ? 'bg-green-600' :
                'bg-gray-300'
              }`}>
                {trackingStatus === 'finalizado' ? 
                  <span className="text-white text-xs">✓</span> :
                  trackingStatus === 'trabajando' ?
                  <span className="text-white text-xs">●</span> :
                  <span className="text-white text-xs">○</span>
                }
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  trackingStatus === 'trabajando' ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  Trabajando
                </p>
              </div>
            </div>

            {/* Finalizado */}
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                trackingStatus === 'finalizado' ? 'bg-green-600' : 'bg-gray-300'
              }`}>
                {trackingStatus === 'finalizado' ? 
                  <span className="text-white text-xs">✓</span> :
                  <span className="text-white text-xs">○</span>
                }
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  trackingStatus === 'finalizado' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  Completado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón finalizar si está completado */}
        {trackingStatus === 'finalizado' && (
          <button
            onClick={() => navigate('/client/rate-service', {
              state: { appointmentId, professional }
            })}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-medium text-lg hover:bg-orange-600 transition-colors mt-6"
          >
            Calificar Servicio
          </button>
        )}
      </div>
    </div>
  );
};

export default TrackingScreen;