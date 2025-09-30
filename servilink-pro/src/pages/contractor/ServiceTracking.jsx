// src/pages/contractor/ServiceTracking.jsx - Tracking para contratistas
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Navigation, MapPin, Check, Camera, DollarSign } from 'lucide-react';
import { trackingService, appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ServiceTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { appointmentId, clientInfo } = location.state || {};
  
  const [currentStatus, setCurrentStatus] = useState('en_camino');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [additionalQuote, setAdditionalQuote] = useState({
    show: false,
    items: [],
    total: 0
  });

  useEffect(() => {
    // Obtener ubicación actual
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Actualizar posición en el servidor cada 30 segundos
          if (appointmentId && currentStatus === 'en_camino') {
            updatePosition(position.coords.latitude, position.coords.longitude);
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [appointmentId, currentStatus]);

  const updatePosition = async (lat, lng) => {
    try {
      await trackingService.updatePosition(appointmentId, lat, lng);
    } catch (error) {
      console.error('Error actualizando posición:', error);
    }
  };

  const handleConfirmArrival = async () => {
    setLoading(true);
    try {
      if (currentLocation) {
        await trackingService.confirmArrival(
          appointmentId,
          currentLocation.lat,
          currentLocation.lng
        );
      }
      
      setCurrentStatus('llegada');
      alert('Llegada confirmada. El cliente ha sido notificado.');
    } catch (error) {
      console.error('Error confirmando llegada:', error);
      alert('Error al confirmar llegada');
    } finally {
      setLoading(false);
    }
  };

  const handleStartService = async () => {
    setLoading(true);
    try {
      await appointmentService.startService(appointmentId);
      setCurrentStatus('trabajando');
      alert('Servicio iniciado');
    } catch (error) {
      console.error('Error iniciando servicio:', error);
      alert('Error al iniciar servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdditionalItem = () => {
    setAdditionalQuote({
      ...additionalQuote,
      items: [...additionalQuote.items, {
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        precio_total: 0
      }]
    });
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...additionalQuote.items];
    newItems[index][field] = value;
    
    if (field === 'cantidad' || field === 'precio_unitario') {
      newItems[index].precio_total = newItems[index].cantidad * newItems[index].precio_unitario;
    }
    
    const total = newItems.reduce((sum, item) => sum + item.precio_total, 0);
    
    setAdditionalQuote({
      ...additionalQuote,
      items: newItems,
      total: total
    });
  };

  const handleSendAdditionalQuote = async () => {
    if (additionalQuote.items.length === 0) return;
    
    setLoading(true);
    try {
      const quoteData = {
        descripcion: 'Trabajos adicionales encontrados durante la inspección',
        items: additionalQuote.items,
        total_adicional: additionalQuote.total,
        justificacion: 'Se detectaron problemas adicionales que requieren reparación'
      };
      
      const response = await appointmentService.createAdditionalQuote(appointmentId, quoteData);
      
      if (response.success) {
        alert('Presupuesto adicional enviado al cliente');
        setAdditionalQuote({ show: false, items: [], total: 0 });
      }
    } catch (error) {
      console.error('Error enviando presupuesto adicional:', error);
      alert('Error al enviar presupuesto adicional');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteService = async () => {
    setLoading(true);
    try {
      const completionData = {
        notas_final: 'Trabajo completado satisfactoriamente',
        fotos_trabajo: [] // Aquí irían las URLs de las fotos
      };
      
      await appointmentService.completeService(appointmentId, completionData);
      setCurrentStatus('finalizado');
      
      alert('Servicio completado. Esperando confirmación del cliente.');
      navigate('/contractor/dashboard');
    } catch (error) {
      console.error('Error completando servicio:', error);
      alert('Error al completar servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-red-600 h-16 w-full relative">
        <button
          onClick={() => navigate('/contractor/dashboard')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Servicio en Progreso
          </h1>
          <p className="text-gray-600">Cliente: {clientInfo?.nombre || 'Cliente'}</p>
        </div>

        {/* Estado actual */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Estado Actual
          </h3>
          
          <div className="flex items-center justify-center mb-6">
            {currentStatus === 'en_camino' && (
              <Navigation className="w-16 h-16 text-blue-600" />
            )}
            {currentStatus === 'llegada' && (
              <MapPin className="w-16 h-16 text-green-600" />
            )}
            {currentStatus === 'trabajando' && (
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
            )}
            {currentStatus === 'finalizado' && (
              <Check className="w-16 h-16 text-green-600" />
            )}
          </div>

          <p className="text-center text-gray-600 mb-6">
            {currentStatus === 'en_camino' && 'En camino al domicilio del cliente'}
            {currentStatus === 'llegada' && 'Has llegado al domicilio'}
            {currentStatus === 'trabajando' && 'Trabajando en el servicio'}
            {currentStatus === 'finalizado' && 'Servicio completado'}
          </p>

          {/* Botones de acción según estado */}
          {currentStatus === 'en_camino' && (
            <button
              onClick={handleConfirmArrival}
              disabled={loading}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-medium text-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Confirmando...' : 'Confirmar Llegada'}
            </button>
          )}

          {currentStatus === 'llegada' && (
            <button
              onClick={handleStartService}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Iniciando...' : 'Iniciar Servicio'}
            </button>
          )}

          {currentStatus === 'trabajando' && (
            <div className="space-y-3">
              <button
                onClick={() => setAdditionalQuote({ ...additionalQuote, show: true })}
                className="w-full bg-yellow-500 text-white py-3 rounded-xl font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
              >
                <DollarSign className="w-5 h-5" />
                <span>Agregar Presupuesto Adicional</span>
              </button>
              
              <button
                onClick={handleCompleteService}
                disabled={loading}
                className="w-full bg-green-500 text-white py-4 rounded-xl font-medium text-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Completando...' : 'Completar Servicio'}
              </button>
            </div>
          )}
        </div>

        {/* Información del servicio */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Detalles del Servicio
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Dirección:</p>
              <p className="font-medium text-gray-800">
                {clientInfo?.direccion || 'Av. Corrientes 1234, CABA'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Problema reportado:</p>
              <p className="font-medium text-gray-800">
                {clientInfo?.descripcion || 'Servicio solicitado'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Precio acordado:</p>
              <p className="font-medium text-green-600 text-lg">
                ${clientInfo?.precio || '8000'}
              </p>
            </div>
          </div>
        </div>

        {/* Botón para adjuntar fotos */}
        {currentStatus === 'trabajando' && (
          <button className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 mb-6">
            <Camera className="w-5 h-5" />
            <span>Tomar Fotos del Trabajo</span>
          </button>
        )}
      </div>

      {/* Modal de presupuesto adicional */}
      {additionalQuote.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Presupuesto Adicional
              </h3>
              <button
                onClick={() => setAdditionalQuote({ ...additionalQuote, show: false })}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {additionalQuote.items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <input
                    type="text"
                    placeholder="Descripción del trabajo"
                    value={item.descripcion}
                    onChange={(e) => handleUpdateItem(index, 'descripcion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Cant."
                      value={item.cantidad}
                      onChange={(e) => handleUpdateItem(index, 'cantidad', parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="P. Unit."
                      value={item.precio_unitario}
                      onChange={(e) => handleUpdateItem(index, 'precio_unitario', parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={item.precio_total}
                      disabled
                      className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleAddAdditionalItem}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                + Agregar ítem
              </button>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-800">Total adicional:</span>
                <span className="text-xl font-bold text-green-600">
                  ${additionalQuote.total}
                </span>
              </div>
              
              <button
                onClick={handleSendAdditionalQuote}
                disabled={loading || additionalQuote.items.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar al Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTracking;