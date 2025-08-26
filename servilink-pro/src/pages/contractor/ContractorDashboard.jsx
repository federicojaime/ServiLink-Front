// src/pages/contractor/ContractorDashboard.jsx - Conectado a API de producción
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, List, Settings, MapPin, Clock, DollarSign } from 'lucide-react';
import { assignmentService, appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('nuevas');
  const [assignments, setAssignments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab, user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'nuevas') {
        await loadAssignments();
      } else {
        await loadAppointments();
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error cargando información');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      // Cargar asignaciones por contratista
      const response = await assignmentService.getAssignmentsByContractor(
        user?.id,
        { estado: 'enviada', limit: 20 }
      );
      
      if (response.success) {
        setAssignments(response.data.asignaciones || []);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
      setAssignments([]);
    }
  };

  const loadAppointments = async () => {
    try {
      let estado = 'programada';
      if (activeTab === 'completadas') estado = 'completada';
      if (activeTab === 'activas') estado = 'confirmada';

      const response = await appointmentService.getAppointments({
        contratista_id: user?.id,
        estado: estado,
        limit: 20
      });
      
      if (response.success) {
        setAppointments(response.data.citas || []);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error cargando citas:', error);
      setAppointments([]);
    }
  };

  const handleAcceptAssignment = async (assignmentId) => {
    try {
      const acceptData = {
        precio_propuesto: 8000,
        fecha_propuesta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
        hora_propuesta: '14:00:00',
        tiempo_estimado: 120,
        comentarios: 'Puedo realizar el trabajo en el horario propuesto'
      };

      const response = await assignmentService.acceptAssignment(assignmentId, acceptData);
      
      if (response.success) {
        alert('Asignación aceptada exitosamente');
        loadData(); // Recargar datos
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error aceptando asignación:', error);
      alert('Error al aceptar la asignación. Inténtalo nuevamente.');
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
        loadData(); // Recargar datos
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error rechazando asignación:', error);
      alert('Error al rechazar la asignación. Inténtalo nuevamente.');
    }
  };

  const handleStartService = async (appointmentId) => {
    try {
      const response = await appointmentService.startService(appointmentId);
      if (response.success) {
        alert('Servicio iniciado');
        loadData();
      }
    } catch (error) {
      console.error('Error iniciando servicio:', error);
      alert('Error al iniciar el servicio');
    }
  };

  const handleCompleteService = async (appointmentId) => {
    try {
      const completionData = {
        notas_final: 'Trabajo completado exitosamente'
      };
      
      const response = await appointmentService.completeService(appointmentId, completionData);
      if (response.success) {
        alert('Servicio completado');
        loadData();
      }
    } catch (error) {
      console.error('Error completando servicio:', error);
      alert('Error al completar el servicio');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (timeString) => {
    return timeString?.substring(0, 5) || '';
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    return `hace ${diffDays} días`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              ¡Hola, {user?.nombre || 'Contratista'}!
            </h1>
            <p className="text-sm text-gray-600">Este es tu panel de control.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('nuevas')}
              className={`p-2 rounded-lg ${activeTab === 'nuevas' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
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

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p className="text-sm">{error}</p>
            <button 
              onClick={loadData}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de contenido */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Cargando...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Nuevas asignaciones */}
            {activeTab === 'nuevas' && (
              <>
                {assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay nuevas asignaciones disponibles</p>
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {assignment.categoria_nombre}
                        </h3>
                        <div className="flex items-center space-x-1 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-bold">
                            {assignment.presupuesto_maximo || 'A cotizar'}
                          </span>
                        </div>
                      </div>

                      {/* Descripción */}
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {assignment.descripcion}
                      </p>

                      {/* Información adicional */}
                      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{assignment.ciudad || 'Buenos Aires'}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{getTimeAgo(assignment.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Urgencia */}
                      {assignment.urgencia && (
                        <div className="mb-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            assignment.urgencia === 'alta' ? 'bg-red-100 text-red-800' :
                            assignment.urgencia === 'media' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Urgencia {assignment.urgencia}
                          </span>
                        </div>
                      )}

                      {/* Botones de acción */}
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
                    </div>
                  ))
                )}
              </>
            )}

            {/* Citas activas y completadas */}
            {(activeTab === 'activas' || activeTab === 'completadas') && (
              <>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No hay {activeTab === 'activas' ? 'servicios activos' : 'servicios completados'}
                    </p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {appointment.categoria_nombre}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Cliente: {appointment.cliente_nombre}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-green-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-bold">
                              ${appointment.precio_acordado}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(appointment.fecha_servicio)}
                          </div>
                        </div>
                      </div>

                      {/* Horario */}
                      <div className="flex items-center mb-4 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {formatTime(appointment.hora_inicio)} - {formatTime(appointment.hora_fin)}
                        </span>
                      </div>

                      {/* Dirección */}
                      {appointment.direccion_servicio && (
                        <div className="flex items-center mb-4 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{appointment.direccion_servicio}</span>
                        </div>
                      )}

                      {/* Estado y acciones */}
                      {activeTab === 'activas' && (
                        <div className="flex space-x-2">
                          {appointment.estado === 'confirmada' && (
                            <button
                              onClick={() => handleStartService(appointment.id)}
                              className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                            >
                              Iniciar Servicio
                            </button>
                          )}
                          {appointment.estado === 'en_progreso' && (
                            <button
                              onClick={() => handleCompleteService(appointment.id)}
                              className="flex-1 bg-green-500 text-white py-2 rounded-xl font-medium hover:bg-green-600 transition-colors"
                            >
                              Completar
                            </button>
                          )}
                        </div>
                      )}

                      {/* Estado para completadas */}
                      {activeTab === 'completadas' && (
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completado
                          </span>
                          {appointment.calificacion_contratista && (
                            <div className="flex items-center space-x-1 text-yellow-500">
                              <span className="text-sm">★</span>
                              <span className="text-sm font-medium">
                                {appointment.calificacion_contratista}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
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