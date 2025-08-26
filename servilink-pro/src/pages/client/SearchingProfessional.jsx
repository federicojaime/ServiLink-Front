import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { contractorService } from '../../services/api';

const SearchingProfessional = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, serviceData } = location.state || {};
  
  const [searchText, setSearchText] = useState('Buscando al mejor profesional...');
  const [error, setError] = useState('');

  useEffect(() => {
    searchForProfessional();
  }, []);

  const searchForProfessional = async () => {
    const messages = [
      'Buscando al mejor profesional...',
      `Estamos analizando tu solicitud para encontrar al experto ideal para "${serviceData?.description || 'tu problema'}".`,
      'Revisando disponibilidad...',
      'Encontrando el mejor profesional...'
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setSearchText(messages[messageIndex]);
    }, 2000);

    try {
      // Buscar contratistas disponibles usando la API real
      const searchData = {
        categoria_id: serviceData?.categoryId || 2, // ID de la categoría seleccionada
        fecha_servicio: new Date().toISOString().split('T')[0],
        latitud: -34.6037, // Buenos Aires por defecto
        longitud: -58.3816,
        radio_km: 15
      };

      const response = await contractorService.searchAvailableContractors(searchData);
      
      clearInterval(messageInterval);
      
      if (response.success && response.data.contratistas && response.data.contratistas.length > 0) {
        const professional = response.data.contratistas[0]; // Tomar el primer profesional disponible
        
        navigate('/client/professional-found', {
          state: {
            requestId,
            serviceData,
            professional: {
              id: professional.id,
              nombre: `${professional.nombre} ${professional.apellido}`,
              especialidad: professional.servicios?.[0]?.categoria_nombre || 'Profesional',
              rating: professional.rating?.promedio || 4.5,
              reviews: professional.rating?.total_evaluaciones || 0,
              experiencia: `Especialista en ${professional.servicios?.[0]?.categoria_nombre || 'servicios técnicos'} con ${professional.servicios?.[0]?.experiencia_anos || 5} años de experiencia. Ofrezco un servicio rápido, eficiente y garantizado.`,
              imagen: '/placeholder-professional.jpg'
            }
          }
        });
      } else {
        // No se encontraron profesionales disponibles
        setError('No encontramos profesionales disponibles en este momento. Inténtalo más tarde.');
      }
    } catch (error) {
      console.error('Error buscando profesionales:', error);
      clearInterval(messageInterval);
      setError('Error al buscar profesionales. Verifica tu conexión e inténtalo nuevamente.');
    }
  };

  const handleRetry = () => {
    setError('');
    setSearchText('Buscando al mejor profesional...');
    searchForProfessional();
  };

  const handleGoBack = () => {
    navigate('/client/dashboard');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-4">
            {error}
          </div>
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Intentar nuevamente
            </button>
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-400 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center">
        {/* Spinner de carga */}
        <div className="mb-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        {/* Título */}
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          {searchText.split('Estamos')[0]}
        </h1>

        {/* Descripción dinámica */}
        {searchText.includes('Estamos') && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {searchText}
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchingProfessional;