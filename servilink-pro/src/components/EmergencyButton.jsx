// src/components/EmergencyButton.jsx - Botón de pánico
import React, { useState } from 'react';
import { AlertTriangle, Phone, X } from 'lucide-react';
import { whatsappService } from '../services/whatsappService';

const EmergencyButton = ({ appointmentId, location }) => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [emergencyActivated, setEmergencyActivated] = useState(false);

  const handleEmergencyPress = () => {
    setShowModal(true);
    setCountdown(5);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          activateEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const activateEmergency = async () => {
    setEmergencyActivated(true);
    
    // Obtener ubicación actual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendEmergencyAlert(latitude, longitude);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          sendEmergencyAlert(null, null);
        }
      );
    } else {
      sendEmergencyAlert(null, null);
    }
  };

  const sendEmergencyAlert = async (lat, lng) => {
    const locationText = lat && lng 
      ? `https://maps.google.com/?q=${lat},${lng}`
      : location || 'Ubicación desconocida';

    // Enviar WhatsApp de emergencia
    const emergencyMessage = whatsappService.templates.emergency(locationText);
    whatsappService.openBusinessChat(emergencyMessage);

    // Llamar al 911
    if (window.confirm('¿Deseas llamar al 911?')) {
      window.location.href = 'tel:911';
    }

    // Aquí iría la llamada a la API para notificar la emergencia
    try {
      // await api.post('/emergency', { appointmentId, lat, lng });
      console.log('Emergencia activada:', { appointmentId, lat, lng });
    } catch (error) {
      console.error('Error enviando alerta de emergencia:', error);
    }
  };

  const cancelEmergency = () => {
    setCountdown(null);
    setShowModal(false);
    setEmergencyActivated(false);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={handleEmergencyPress}
        className="fixed bottom-20 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all z-40"
      >
        <AlertTriangle className="w-6 h-6" />
      </button>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            {!emergencyActivated ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Activando Emergencia
                  </h2>
                  
                  {countdown !== null && countdown > 0 && (
                    <div className="text-5xl font-bold text-red-600 my-6">
                      {countdown}
                    </div>
                  )}
                  
                  <p className="text-gray-600">
                    Se enviará tu ubicación y se notificará a emergencias
                  </p>
                </div>

                <button
                  onClick={cancelEmergency}
                  className="w-full bg-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-10 h-10 text-green-600 animate-pulse" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Emergencia Activada
                  </h2>
                  
                  <p className="text-gray-600 mb-4">
                    Se ha enviado tu ubicación y notificado a los servicios de emergencia
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => window.location.href = 'tel:911'}
                      className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Llamar 911</span>
                    </button>
                    
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full bg-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-400 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyButton;