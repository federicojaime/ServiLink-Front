// src/pages/client/PaymentScreen.jsx - Versión completa
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Shield, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { paymentService, appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const { appointmentId, amount, serviceData } = location.state || {};
  
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, error
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar si venimos de MercadoPago con resultado
  useEffect(() => {
    const status = searchParams.get('status');
    const paymentId = searchParams.get('payment_id');
    const preferenceId = searchParams.get('preference_id');

    if (status) {
      handlePaymentResult(status, paymentId, preferenceId);
    }
  }, [searchParams]);

  const handlePaymentResult = async (status, paymentId, preferenceId) => {
    setLoading(true);
    try {
      if (status === 'approved') {
        setPaymentStatus('success');
        // Actualizar el estado de la cita
        if (appointmentId) {
          await appointmentService.confirmAppointment(appointmentId);
        }
      } else if (status === 'rejected') {
        setPaymentStatus('error');
        setError('El pago fue rechazado. Verifica tus datos e intenta nuevamente.');
      } else if (status === 'pending') {
        setPaymentStatus('processing');
      }
    } catch (error) {
      console.error('Error procesando resultado del pago:', error);
      setPaymentStatus('error');
      setError('Error al procesar el resultado del pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Obtener la URL base actual considerando el basename
      const baseUrl = window.location.origin + '/servi-link';
      
      const paymentData = {
        cita_id: appointmentId,
        monto_consulta: amount || 3000,
        notification_url: `${baseUrl}/api/webhook/mercadopago`,
        success_url: `${baseUrl}/client/payment?status=approved`,
        failure_url: `${baseUrl}/client/payment?status=rejected`
      };

      const response = await paymentService.createConsultationPayment(paymentData);
      
      if (response.success && response.data.init_point) {
        setPaymentData(response.data);
        // Redirigir a MercadoPago
        window.location.href = response.data.init_point;
      } else {
        throw new Error(response.message || 'Error creando el pago');
      }
    } catch (error) {
      console.error('Error creando pago:', error);
      setError('Error al procesar el pago. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setPaymentStatus('pending');
    setError('');
    handleCreatePayment();
  };

  const handleGoToDashboard = () => {
    navigate('/client/dashboard');
  };

  // Pantalla de éxito
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Pago Exitoso!
            </h1>
            <p className="text-gray-600">
              Tu pago ha sido procesado correctamente. El profesional se pondrá en contacto contigo.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Resumen del Servicio</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Servicio:</span>
                <span>{serviceData?.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Monto:</span>
                <span>${amount || 3000}</span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="text-green-600 font-medium">Confirmado</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="mb-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Error en el Pago
            </h1>
            <p className="text-gray-600 mb-4">
              {error || 'Hubo un problema procesando tu pago.'}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRetry}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Intentar Nuevamente'}
            </button>
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-gray-300 text-gray-700 py-4 rounded-xl font-medium text-lg hover:bg-gray-400 transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de procesamiento
  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Procesando Pago
            </h1>
            <p className="text-gray-600">
              Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.
            </p>
          </div>

          <button
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pantalla principal de pago
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
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
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Confirmar Pago
          </h1>
          <p className="text-gray-600">
            Pago seguro con MercadoPago
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Detalles del pago */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Resumen del Servicio
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium text-gray-800">
                {serviceData?.category || 'Servicio Técnico'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Descripción:</span>
              <span className="font-medium text-gray-800 text-right text-sm">
                {serviceData?.description || 'Servicio solicitado'}
              </span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-xl font-bold text-blue-600">
                  ${amount || 3000}
                </span>
              </div>
            </div>
          </div>

          {/* Información de pago protegido */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Pago Protegido</h4>
                <p className="text-sm text-blue-700">
                  Tu dinero estará retenido de forma segura hasta que confirmes 
                  que el trabajo fue completado satisfactoriamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de pago */}
        <button
          onClick={handleCreatePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <CreditCard className="w-5 h-5" />
          <span>{loading ? 'Procesando...' : 'Pagar con MercadoPago'}</span>
        </button>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Al proceder con el pago, aceptas nuestros términos y condiciones.
            Procesado de forma segura por MercadoPago.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;