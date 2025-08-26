// src/pages/shared/UserProfile.jsx - Perfil de usuario
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Edit, Save, X, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService, evaluationService } from '../../services/api';
import NavigationHeader from '../../components/NavigationHeader';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    whatsapp: '',
    ciudad: '',
    provincia: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        whatsapp: user.whatsapp || '',
        ciudad: user.ciudad || '',
        provincia: user.provincia || ''
      });
      
      // Cargar estadísticas si es contratista
      if (user.tipo_usuario === 'contratista') {
        loadContractorStats();
      }
    }
  }, [user]);

  const loadContractorStats = async () => {
    try {
      const response = await evaluationService.getEvaluationsByContractor(user.id);
      if (response.success) {
        setStats(response.data.estadisticas);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Aquí iría la llamada a la API para actualizar el perfil
      // const response = await userService.updateProfile(user.id, formData);
      
      // Por ahora, actualizamos localmente
      const updatedUser = { ...user, ...formData };
      updateUser(updatedUser);
      
      setIsEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      alert('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      telefono: user.telefono || '',
      whatsapp: user.whatsapp || '',
      ciudad: user.ciudad || '',
      provincia: user.provincia || ''
    });
    setIsEditing(false);
  };

  const getBackPath = () => {
    return user?.tipo_usuario === 'cliente' ? '/client/dashboard' : '/contractor/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavigationHeader
        title="Mi Perfil"
        showBack={true}
        backPath={getBackPath()}
        variant="default"
      />
      
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Avatar y información básica */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800">
            {user?.nombre} {user?.apellido}
          </h2>
          
          <p className="text-blue-600 font-medium capitalize">
            {user?.tipo_usuario}
          </p>
          
          {user?.verificado && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              ✓ Verificado
            </span>
          )}
        </div>

        {/* Estadísticas para contratistas */}
        {user?.tipo_usuario === 'contratista' && stats && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Mis Estadísticas
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold text-gray-800 ml-2">
                    {stats.promedio_general?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Calificación</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total_evaluaciones || 0}
                </p>
                <p className="text-sm text-gray-600">Trabajos</p>
              </div>
            </div>
          </div>
        )}

        {/* Información personal */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Información Personal
            </h3>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Nombre */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-800">{user?.nombre}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-800">{user?.apellido}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-800">{user?.email}</p>
                )}
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-800">{user?.telefono || 'No especificado'}</p>
                )}
              </div>
            </div>

            {/* Ubicación */}
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      placeholder="Ciudad"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleInputChange}
                      placeholder="Provincia"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <p className="text-gray-800">
                    {user?.ciudad}, {user?.provincia}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información de la cuenta */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Información de la Cuenta
          </h3>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Miembro desde:</span>
              <span>{new Date(user?.created_at || Date.now()).toLocaleDateString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Tipo de cuenta:</span>
              <span className="capitalize font-medium">{user?.tipo_usuario}</span>
            </div>
            <div className="flex justify-between">
              <span>Estado:</span>
              <span className="text-green-600 font-medium">
                {user?.verificado ? 'Verificada' : 'Pendiente verificación'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;