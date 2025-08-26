import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Calendar } from 'lucide-react';

const ProfessionalFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, serviceData, professional } = location.state || {};

  const handleCoordinarVisita = () => {
    navigate('/client/schedule-time', {
      state: {
        requestId,
        serviceData,
        professional
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header rojo */}
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
          <h1 className="text-2xl font-semibold text-gray-800">
            <span className="text-blue-600">ServiLink Pro</span>
          </h1>
        </div>

        {/* Mensaje de éxito */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-green-600 mb-2">
            ¡Encontramos a tu profesional!
          </h2>
        </div>

        {/* Card del profesional */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          {/* Foto del profesional */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-b from-blue-300 to-blue-500"></div>
              </div>
            </div>
          </div>

          {/* Información del profesional */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {professional?.nombre || 'Roberto Funes'}
            </h3>
            <p className="text-blue-600 font-medium mb-3">
              {professional?.especialidad || 'Gasista'}
            </p>

            {/* Rating */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-bold text-gray-800">
                {professional?.rating || '4.8'}
              </span>
              <span className="text-gray-600">
                ({professional?.reviews || '124'} reseñas)
              </span>
            </div>

            {/* Descripción */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 text-sm italic leading-relaxed">
                "{professional?.experiencia || 'Especialista en Gasista con más de 15 años de experiencia. Ofrezco un servicio rápido, eficiente y garantizado.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Botón coordinar visita */}
        <button
          onClick={handleCoordinarVisita}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Calendar className="w-5 h-5" />
          <span>Coordinar Visita</span>
        </button>
      </div>
    </div>
  );
};

export default ProfessionalFound;