import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, List, Settings, MapPin, Clock } from 'lucide-react';
import { assignmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('nuevas');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssignments();
  }, [activeTab]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await assignmentService.getAssignments({
        estado: activeTab === 'nuevas' ? 'enviada' : activeTab,
        limit: 20
      });
      
      if (response.success) {
        setAssignments(response.data.asignaciones || []);
      } else {
        setAssignments([]);
        setError('No se pudieron cargar las asignaciones');
      }
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
      setAssignments([]);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async (assignmentId) => {
    try {
      const acceptData = {
        precio_propuesto: 8000,
        fecha_propuesta: '2025-08-26',
        hora_propuesta: '14:00:00',
        tiempo_estimado: 120,
        comentarios: 'Puedo realizar el trabajo mañana por la tarde'
      };

      const response = await assignmentService.acceptAssignment(assignmentId, acceptData);
      
      if (response.success) {
        alert('Asignación aceptada exitosamente');
        loadAssignments();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error aceptando asignación:', error);
      alert('Error al aceptar la asignación');
    }
  };

  const handleRejectAssignment = async (assignmentId) => {
    try {
      const rejectData = {
        motivo: 'No tengo disponibilidad en esa fecha'
      };

      const response = await assignmentService.rejectAssignment(assignmentId, rejectData);
      
      if (response.success) {
        alert('Asignación rechazada');
        loadAssignments();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error rechazando asignación:', error);
      alert('Error al rechazar la asignación');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              ¡Hola, {user?.nombre || 'Contratista Ejemplo'}!
            </h1>
            <p className="text-sm text-gray-600">Este es tu panel de control.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/contractor/calendar')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/contractor/calendar')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/contractor/availability')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('nuevas')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'nuevas'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Nuevas
          </button>
          <button
            onClick={() => setActiveTab('activas')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'activas'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setActiveTab('completadas')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completadas'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Completadas
          </button>
        </div>

        {/* Lista de asignaciones */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Cargando asignaciones...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={loadAssignments}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-600">No hay asignaciones disponibles</div>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                {/* Header con categoría y precio */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {assignment.categoria_nombre}
                  </h3>
                  <span className="text-lg font-bold text-blue-600">
                    ${assignment.precio_estimado}
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {assignment.descripcion}
                </p>

                {/* Ubicación y tiempo */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{assignment.direccion}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>hace {assignment.tiempo_creacion}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                {activeTab === 'nuevas' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAcceptAssignment(assignment.id)}
                      className="bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors duration-200"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => handleRejectAssignment(assignment.id)}
                      className="bg-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-400 transition-colors duration-200"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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

export default ContractorDashboard;