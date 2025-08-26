import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { configService } from '../../services/api';

const ServiceSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCategory } = location.state || {};
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      if (selectedCategory?.id) {
        const response = await configService.getServicesByCategory(selectedCategory.id);
        if (response.success) {
          setServices(response.data.servicios || []);
        }
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
      // Servicios por defecto para Plomería
      setServices([
        {
          id: 1,
          nombre: 'Goteo de grifo en cocina o baño',
          descripcion: 'Precio estimado. Sujeto a revisión.',
          precio_base: 1500
        },
        {
          id: 2,
          nombre: 'Inodoro pierde agua o está tapado',
          descripcion: 'Precio estimado. Sujeto a revisión.',
          precio_base: 2500
        },
        {
          id: 3,
          nombre: 'Baja presión de agua en general',
          descripcion: 'Precio estimado. Sujeto a revisión.',
          precio_base: 3000
        },
        {
          id: 4,
          nombre: 'Cambio de flexible de agua',
          descripcion: 'Precio estimado. Sujeto a revisión.',
          precio_base: 1200
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    navigate('/client/service-details', { 
      state: { 
        selectedCategory,
        selectedService: service
      }
    });
  };

  const handleOtherProblem = () => {
    navigate('/client/service-details', { 
      state: { 
        selectedCategory,
        selectedService: {
          id: 'other',
          nombre: 'Otro problema',
          descripcion: 'Describe tu problema específico',
          precio_base: 0
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Cargando servicios...</div>
      </div>
    );
  }

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

        {/* Subtítulo */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Servicio de {selectedCategory?.nombre || 'Plomería'}
          </h2>
          <p className="text-gray-600 text-sm">
            Elige un problema común o describe el tuyo
          </p>
        </div>

        {/* Lista de servicios */}
        <div className="space-y-4 mb-6">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {service.nombre}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {service.descripcion}
                  </p>
                </div>
                <div className="ml-4">
                  <span className="text-xl font-bold text-green-600">
                    ${service.precio_base}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón "Otro problema" */}
        <div className="mb-8">
          <button
            onClick={handleOtherProblem}
            className="w-full bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-xl font-medium text-lg hover:bg-blue-50 transition-colors duration-200"
          >
            Otro problema (describir)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;