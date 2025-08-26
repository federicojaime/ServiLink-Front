// src/pages/client/ConfirmService.jsx - Actualizado para integración con pago
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, Calendar, MapPin, User } from 'lucide-react';
import { appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ConfirmService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { requestId, serviceData, professional, selectedDate, selectedTime } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [estimatedPrice] = useState(8000); // Precio estimado

  const formatDate = (date) => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const dateObj = new Date(2025, 7, date); // Agosto 2025
    const dayName = days[dateObj.getDay()];
    const monthName = months[dateObj.getMonth()];
    
    return `${dayName}, ${date} de ${monthName} a las ${selectedTime} hs`;
  };

  const handleConfirmarServicio = async () => {
    setLoading(true);
    
    try {
      // Crear la cita primero
      const appointmentData = {
        solicitud_id: requestId,
        contratista_id: professional?.id || 4,
        cliente_id: user?.id || 1,
        fecha_servicio: `2025-08-${selectedDate.toString().padStart(2, '0')}`,
        hora_inicio: `${selectedTime}:00`,
        hora_fin: `${parseInt(selectedTime) + 2}:00:00`,
        precio_acordado: estimatedPrice,
        notas_cliente: serviceData?.description || 'Servicio solicitado'
      };

      const appointmentResponse = await appointmentService.createAppointment(appointmentData);
      
      if (appointmentResponse.success) {
        const appointmentId = appointmentResponse.data.cita_id;
        
        // Redirigir a la pantalla de pago
        navigate('/client/payment', {
          state: {
            appointmentId: appointmentId,
            amount: estimatedPrice,
            serviceData: {
              category: serviceData?.category,
              description: serviceData?.description,
              professional: professional?.nombre,
              date: formatDate(selectedDate),
              address: 'Av. Corrientes 1234, CABA'
            }
          }
        });
      } else {
        throw new Error(appointmentResponse.message || 'Error al confirmar la cita');
      }
    } catch (error) {
      console.error('Error confirmando servicio:', error);
      alert('Error al confirmar el servicio. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header rojo */}
      <div className="bg-red-600 h-16 w-full relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
      
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            <span className="text-blue-600">ServiLink Pro</span>
          </h1>
        </div>

        {/* Subtítulo */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800">
            Confirmar Servicio
          </h2>
        </div>

        {/* Detalles del servicio */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          {/* Profesional */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {professional?.nombre || 'Roberto Funes'}
              </h3>
              <p className="text-blue-600 text-sm">
                {professional?.especialidad || serviceData?.category || 'Profesional'}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600 ml-1">
                  {professional?.rating || '4.8'} ({professional?.reviews || '124'} reseñas)
                </span>
              </div>
            </div>
          </div>

          {/* Detalles del servicio */}
          <div className="space-y-4">
            {/* Problema */}
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  PROBLEMA
                </h4>
                <p className="text-gray-800 font-medium">
                  {serviceData?.description || 'Servicio solicitado'}
                </p>
              </div>
            </div>

            {/* Fecha y hora */}
            <div className="flex items-start space-x-3">
              <Calendar className="w-4 h-4 text-blue-600 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  FECHA Y HORA
                </h4>
                <p className="text-gray-800 font-medium">
                  {formatDate(selectedDate)}
                </p>
              </div>
            </div>

            {/* Dirección */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-blue-600 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  DIRECCIÓN
                </h4>
                <p className="text-gray-800 font-medium">
                  Av. Corrientes 1234, CABA
                </p>
              </div>
            </div>
          </div>

          {/* Total a pagar */}
          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                PRECIO ESTIMADO
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                ${estimatedPrice.toLocaleString()}
              </p>
            </div>

            {/* Información del pago protegido */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Pago Protegido</h4>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Tu pago será retenido de forma segura y solo se le liberará al 
                    profesional una vez que confirmes que el trabajo fue completado 
                    satisfactoriamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón confirmar */}
        <button
          onClick={handleConfirmarServicio}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Confirmando...' : 'Confirmar y Proceder al Pago'}
        </button>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Al confirmar, aceptas nuestros términos y condiciones. 
            El precio final puede variar según la complejidad del trabajo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmService;