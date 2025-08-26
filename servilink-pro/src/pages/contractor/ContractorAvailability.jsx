// src/pages/contractor/ContractorAvailability.jsx - Versión corregida
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { scheduleService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ContractorAvailability = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [availabilityData, setAvailabilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Estado para el modal de agregar horario
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    disponible: true
  });

  const dayLabels = {
    0: 'Domingo',
    1: 'Lunes', 
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  };

  useEffect(() => {
    if (user?.id) {
      loadAvailability();
    }
  }, [user?.id]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar disponibilidad para los próximos 30 días
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const response = await scheduleService.getAvailability(user.id, {
        fecha_inicio: startDate.toISOString().split('T')[0],
        fecha_fin: endDate.toISOString().split('T')[0]
      });
      
      if (response.success) {
        setAvailabilityData(response.data.horarios || []);
      } else {
        setError('Error cargando disponibilidad');
      }
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      setError('Error de conexión al cargar horarios');
      // Datos por defecto si falla la API
      setAvailabilityData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = async () => {
    if (!newSlot.fecha || !newSlot.hora_inicio || !newSlot.hora_fin) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Validar que hora_fin sea mayor que hora_inicio
    if (newSlot.hora_inicio >= newSlot.hora_fin) {
      alert('La hora de fin debe ser mayor que la hora de inicio');
      return;
    }

    try {
      setSaving(true);
      
      const scheduleData = {
        contratista_id: user.id,
        fecha: newSlot.fecha,
        hora_inicio: newSlot.hora_inicio + ':00',
        hora_fin: newSlot.hora_fin + ':00',
        disponible: newSlot.disponible
      };

      const response = await scheduleService.createSchedule(scheduleData);
      
      if (response.success) {
        // Recargar datos
        await loadAvailability();
        
        // Limpiar formulario
        setNewSlot({
          fecha: '',
          hora_inicio: '',
          hora_fin: '',
          disponible: true
        });
        
        setShowAddModal(false);
        alert('Horario agregado exitosamente');
      } else {
        throw new Error(response.message || 'Error creando horario');
      }
    } catch (error) {
      console.error('Error agregando horario:', error);
      alert('Error al agregar horario: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (horarioId, currentStatus) => {
    try {
      const response = await scheduleService.updateAvailability(horarioId, {
        disponible: !currentStatus
      });
      
      if (response.success) {
        // Actualizar estado local
        setAvailabilityData(prev => 
          prev.map(slot => 
            slot.id === horarioId 
              ? { ...slot, disponible: !currentStatus }
              : slot
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error actualizando disponibilidad:', error);
      alert('Error al actualizar disponibilidad');
    }
  };

  const handleDeleteSlot = async (horarioId) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) {
      return;
    }

    try {
      // Nota: La API no tiene endpoint de delete, así que marcamos como no disponible
      await handleToggleAvailability(horarioId, true);
      
      // Remover de la vista local
      setAvailabilityData(prev => prev.filter(slot => slot.id !== horarioId));
      
    } catch (error) {
      console.error('Error eliminando horario:', error);
      alert('Error al eliminar horario');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = dayLabels[date.getDay()];
    const dayNum = date.getDate();
    const month = date.toLocaleDateString('es-AR', { month: 'short' });
    return `${day} ${dayNum} ${month}`;
  };

  const formatTime = (timeString) => {
    return timeString?.substring(0, 5) || '';
  };

  // Generar fechas para los próximos 7 días para el selector
  const getNextWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: formatDate(date.toISOString())
      });
    }
    return dates;
  };

  // Agrupar horarios por fecha
  const groupedSchedules = availabilityData.reduce((acc, slot) => {
    const date = slot.fecha;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Cargando disponibilidad...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header rojo */}
      <div className="bg-red-600 h-16 w-full relative">
        <button
          onClick={() => navigate('/contractor/dashboard')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Mi Disponibilidad
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Gestiona tus horarios disponibles. Los clientes solo podrán 
            agendar en los horarios que definas.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p className="text-sm">{error}</p>
            <button 
              onClick={loadAvailability}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de horarios por fecha */}
        <div className="space-y-6">
          {Object.keys(groupedSchedules).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No hay horarios configurados
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Agrega tus primeros horarios disponibles para que los clientes puedan reservar citas.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Agregar Horario
              </button>
            </div>
          ) : (
            Object.entries(groupedSchedules).map(([date, slots]) => (
              <div key={date} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {formatDate(date)}
                </h3>
                
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-800">
                          {formatTime(slot.hora_inicio)} - {formatTime(slot.hora_fin)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Toggle disponibilidad */}
                        <button
                          onClick={() => handleToggleAvailability(slot.id, slot.disponible)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            slot.disponible ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              slot.disponible ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        
                        {/* Botón eliminar */}
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para agregar horario */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Agregar Horario
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <select
                  value={newSlot.fecha}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar fecha</option>
                  {getNextWeekDates().map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hora inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  value={newSlot.hora_inicio}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, hora_inicio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Hora fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de fin
                </label>
                <input
                  type="time"
                  value={newSlot.hora_fin}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, hora_fin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTimeSlot}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorAvailability;