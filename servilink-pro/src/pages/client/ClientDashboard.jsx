import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Zap, Flame } from 'lucide-react';
import { configService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await configService.getCategories();
      if (response.success) {
        setCategories(response.data.categorias);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName.toLowerCase()) {
      case 'plomería':
        return <Wrench className="w-8 h-8 text-blue-600" />;
      case 'electricidad':
        return <Zap className="w-8 h-8 text-blue-600" />;
      case 'gasista':
        return <Flame className="w-8 h-8 text-blue-600" />;
      default:
        return <Wrench className="w-8 h-8 text-blue-600" />;
    }
  };

  const handleCategorySelect = (category) => {
    navigate('/client/service-selection', { state: { selectedCategory: category } });
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
            Hola {user?.nombre || 'Cliente Ejemplo'}, ¿qué servicio necesitas?
          </p>
        </div>

        {/* Categorías de servicios */}
        <div className="space-y-4 mb-8">
          {/* Plomería */}
          <div 
            onClick={() => handleCategorySelect({ id: 2, nombre: 'Plomería' })}
            className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Plomería
                </h3>
                <p className="text-gray-600 text-sm">
                  Reparaciones de tuberías, fugas, instalaciones.
                </p>
              </div>
            </div>
          </div>

          {/* Electricidad */}
          <div 
            onClick={() => handleCategorySelect({ id: 3, nombre: 'Electricidad' })}
            className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Electricidad
                </h3>
                <p className="text-gray-600 text-sm">
                  Instalaciones de luces, cableado, cortocircuitos.
                </p>
              </div>
            </div>
          </div>

          {/* Gasista */}
          <div 
            onClick={() => handleCategorySelect({ id: 1, nombre: 'Gasista' })}
            className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Gasista
                </h3>
                <p className="text-gray-600 text-sm">
                  Instalación de artefactos, revisión de fugas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de servicios finalizados */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Calificar Servicios Finalizados
          </h2>
          
          {/* Mostrar mensaje si no hay servicios completados */}
          <div className="text-center py-8">
            <p className="text-gray-500">No tienes servicios completados para calificar</p>
          </div>
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