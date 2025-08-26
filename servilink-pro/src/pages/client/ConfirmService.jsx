import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { appointmentService, paymentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ConfirmService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { requestId, serviceData, professional, selectedDate, selectedTime } = location.state || {};
  
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const dateObj = new Date(2025, 7, date); // Agosto 2025
    const dayName = days[dateObj.getDay()];
    const monthName = months[dateObj.getMonth()];
    
    return `${dayName}, ${date} de ${monthName} a las ${selectedTime} hs`;
  };

  const handleConfirmarYPagar = async () => {
    setLoading(true);
    
    try {
      // Crear la cita
      const appointmentData = {
        solicitud_id: requestId,
        contratista_id: professional?.id || 1,
        cliente_id: user?.id || 1,
        fecha_servicio: `2025-08-${selectedDate.toString().padStart(2, '0')}`,
        hora_inicio: `${selectedTime}:00`,
        hora_fin: `${parseInt(selectedTime) + 2}:00:00`,
        precio_acordado: 0, // A cotizar
        notas_cliente: serviceData?.description || 'Servicio solicitado'
      };

      const appointmentResponse = await appointmentService.createAppointment(appointmentData);
      
      if (appointmentResponse.success) {
        // Crear pago protegido (solo si hay precio acordado)
        if (appointmentData.precio_acordado > 0) {
          const paymentData = {
            cita_id: appointmentResponse.data.cita_id,
            monto_consulta: appointmentData.precio_acordado,
            notification_url: 'https://miapp.com/webhook/mercadopago',
            success_url: 'https://miapp.com/pago-exitoso',
            failure_url: 'https://miapp.com/pago-fallido'
          };

          const paymentResponse = await paymentService.createConsultationPayment(paymentData);
          
          if (paymentResponse.success && paymentResponse.data.init_point) {
            // Redirigir a MercadoPago
            window.open(paymentResponse.data.init_point, '_blank');
          }
        }
        
        alert('¡Cita confirmada exitosamente! El profesional se pondrá en contacto contigo.');
        navigate('/client/dashboard');
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
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              PROFESIONAL
            </h3>
            <p className="text-lg font-semibold text-gray-800">
              {professional?.nombre || 'Roberto Funes'}
            </p>
          </div>

          {/* Problema */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              PROBLEMA
            </h3>
            <p className="text-lg font-semibold text-gray-800">
              {serviceData?.description || 'asdasdasd'}
            </p>
          </div>

          {/* Fecha y hora */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              FECHA Y HORA
            </h3>
            <p className="text-lg font-semibold text-gray-800">
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* Total a pagar */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                TOTAL A PAGAR
              </h3>
              <p className="text-xl font-bold text-blue-600">
                $A cotizar
              </p>
            </div>

            {/* Información del pago protegido */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-medium">Pago Protegido:</span> Tu pago será retenido de forma segura y 
                solo se le liberará al profesional una vez que confirmes que el 
                trabajo fue completado.
              </p>
            </div>
          </div>
        </div>

        {/* Botón confirmar y pagar */}
        <button
          onClick={handleConfirmarYPagar}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span>Confirmar y Pagar (Retenido)</span>
        </button>
      </div>
    </div>
  );
};

export default ConfirmService;