// src/pages/client/ClientDashboard.jsx - Conectado a API de producción
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Zap, Flame, Star, Calendar } from 'lucide-react';
import { configService, appointmentService, evaluationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCategories(),
        loadCompletedAppointments()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error cargando información');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await configService.getCategories();
      if (response.success) {
        setCategories(response.data.categorias);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      // Mantener categorías por defecto si falla la API
      setCategories([
        { id: 1, nombre: 'Gasista', descripcion: 'Instalación y reparación de gas, calefones, estufas' },
        { id: 2, nombre: 'Plomería', descripcion: 'Destapes, instalaciones, reparaciones de plomería' },
        { id: 3, nombre: 'Electricidad', descripcion: 'Instalaciones eléctricas, reparaciones, cableado' }
      ]);
    }
  };

  const loadCompletedAppointments = async () => {
    try {
      const response = await appointmentService.getAppointments({
        estado: 'completada',
        cliente_id: user?.id,
        limit: 10
      });
      
      if (response.success) {
        setCompletedAppointments(response.data.citas || []);
      }
    } catch (error) {
      console.error('Error cargando citas completadas:', error);
      setCompletedAppointments([]);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('plom')) return <Wrench className="w-6 h-6 text-blue-600" />;
    if (name.includes('elect')) return <Zap className="w-6 h-6 text-blue-600" />;
    if (name.includes('gas')) return <Flame className="w-6 h-6 text-blue-600" />;
    return <Wrench className="w-6 h-6 text-blue-600" />;
  };

  const handleCategorySelect = (category) => {
    navigate('/client/service-selection', { 
      state: { selectedCategory: category } 
    });
  };

  const handleRateService = (appointment) => {
    navigate('/client/rate-service', {
      state: {
        appointmentId: appointment.id,
        serviceType: appointment.categoria_nombre,
        description: appointment.descripcion,
        contractorId: appointment.contratista_id,
        contractorName: appointment.contratista_nombre
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header rojo */}
      <div className="bg-red-600 h-16 w-full"></div>
      
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Título con saludo personalizado */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            <span className="text-blue-600">ServiLink Pro</span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Hola {user?.nombre || 'Cliente'}, ¿qué servicio necesitas?
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Categorías de servicios */}
        <div className="space-y-4 mb-8">
          {categories.map((category) => (
            <div 
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  {getCategoryIcon(category.nombre)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {category.nombre}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {category.descripcion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de servicios finalizados */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Calificar Servicios Finalizados
          </h2>
          
          {completedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tienes servicios completados para calificar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {appointment.categoria_nombre}
                      </h3>
                      <p className="text-gray-600 text-sm mb-1">
                        {appointment.contratista_nombre}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(appointment.fecha_servicio)}
                      </p>
                    </div>
                    {appointment.calificacion_cliente ? (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-600">
                          {appointment.calificacion_cliente}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {!appointment.calificacion_cliente && (
                    <button
                      onClick={() => handleRateService(appointment)}
                      className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors duration-200"
                    >
                      Calificar Trabajo
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón cerrar sesión */}
        <div className="text-center mt-8">
          <button
            onClick={logout}
            className="text-gray-500 text-sm hover:text-gray-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;