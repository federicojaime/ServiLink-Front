import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { requestService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ServiceDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { selectedCategory, selectedService } = location.state || {};
  
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert('Por favor describe el problema');
      return;
    }

    setLoading(true);
    
    try {
      const requestData = {
        cliente_id: user?.id || 1,
        categoria_id: selectedCategory?.id || 2,
        servicio_id: selectedService?.id === 'other' ? null : selectedService?.id,
        titulo: selectedService?.nombre || 'Solicitud de servicio',
        descripcion: description,
        direccion_servicio: 'Av. Corrientes 1234, CABA', // Dirección por defecto
        latitud: -34.6037,
        longitud: -58.3816,
        urgencia: 'media',
        fecha_preferida: new Date().toISOString().split('T')[0],
        hora_preferida: '14:00:00',
        flexible_horario: true,
        presupuesto_maximo: selectedService?.precio_base || 5000
      };

      const response = await requestService.createRequest(requestData);
      
      if (response.success) {
        // Simular búsqueda y mostrar pantalla de carga
        navigate('/client/searching-professional', {
          state: {
            requestId: response.data.solicitud_id,
            serviceData: {
              categoryId: selectedCategory?.id,
              category: selectedCategory?.nombre,
              service: selectedService?.nombre,
              description: description
            }
          }
        });
      } else {
        throw new Error(response.message || 'Error al crear solicitud');
      }
    } catch (error) {
      console.error('Error creando solicitud:', error);
      alert('Error al enviar la solicitud. Inténtalo nuevamente.');
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Detalla tu solicitud
          </h2>
          <p className="text-gray-600 text-sm">
            Servicio de: <span className="text-blue-600 font-medium">{selectedCategory?.nombre}</span>
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          {/* Descripción del problema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Describe el problema
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: El grifo de la cocina no deja de gotear y hace un ruido extraño."
              className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="6"
              required
            />
          </div>

          {/* Botón adjuntar foto */}
          <button
            type="button"
            className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-xl font-medium text-base hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>Adjuntar Foto del Problema</span>
          </button>

          {/* Botón buscar profesional */}
          <button
            onClick={handleSubmit}
            disabled={loading || !description.trim()}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Buscar Profesional'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;