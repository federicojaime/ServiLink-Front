import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { scheduleService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ContractorAvailability = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [schedule, setSchedule] = useState({
    lunes: {
      enabled: true,
      horarios: '09:00, 10:00, 11:00, 14:00, 15:00, 16:00'
    },
    martes: {
      enabled: true,
      horarios: '09:00, 10:00, 11:00, 14:00, 15:00, 16:00'
    },
    miercoles: {
      enabled: false,
      horarios: ''
    },
    jueves: {
      enabled: false,
      horarios: ''
    },
    viernes: {
      enabled: false,
      horarios: ''
    },
    sabado: {
      enabled: false,
      horarios: ''
    },
    domingo: {
      enabled: false,
      horarios: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const dayLabels = {
    lunes: 'Lunes',
    martes: 'Martes', 
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  useEffect(() => {
    // Comentar la carga de horarios existentes por ahora
    // loadCurrentSchedule();
    setLoading(false);
  }, []);

  const loadCurrentSchedule = async () => {
    // Función deshabilitada temporalmente para evitar errores de red
    /*
    try {
      setLoading(true);
      const response = await scheduleService.getScheduleByContractor(user?.id || 4, {
        fecha: new Date().toISOString().split('T')[0]
      });
      
      if (response.success && response.data.horarios) {
        // Procesar horarios de la API si están disponibles
        console.log('Horarios cargados:', response.data.horarios);
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
      // Usar datos por defecto
    } finally {
      setLoading(false);
    }
    */
  };

  const handleToggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
  };

  const handleHorariosChange = (day, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        horarios: value
      }
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Primero eliminar horarios existentes para evitar duplicados
      try {
        await scheduleService.clearScheduleForDate(user?.id, new Date().toISOString().split('T')[0]);
      } catch (clearError) {
        console.log('No se pudieron limpiar horarios existentes, continuando...');
      }

      let successCount = 0;
      
      // Crear horarios para cada día habilitado
      for (const [day, config] of Object.entries(schedule)) {
        if (config.enabled && config.horarios.trim()) {
          const horarios = config.horarios.split(',').map(h => h.trim());
          
          for (const hora of horarios) {
            const scheduleData = {
              contratista_id: user?.id,
              fecha: new Date().toISOString().split('T')[0],
              hora_inicio: hora + ':00',
              hora_fin: (parseInt(hora) + 1).toString().padStart(2, '0') + ':00:00',
              disponible: true
            };

            try {
              await scheduleService.createSchedule(scheduleData);
              successCount++;
            } catch (error) {
              console.log(`Error creando horario ${hora}:`, error.response?.status);
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      alert(`Disponibilidad actualizada: ${successCount} horarios guardados`);
      navigate('/contractor/dashboard');
      
    } catch (error) {
      console.error('Error guardando horarios:', error);
      alert('Error al guardar la disponibilidad.');
    } finally {
      setSaving(false);
    }
  };

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
      </div>
      
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            Mi Disponibilidad
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Configura tus días y horarios de trabajo. Los clientes
            solo podrán agendar en los horarios que definas.
          </p>
        </div>

        {/* Configuración por días */}
        <div className="space-y-6">
          {Object.entries(schedule).map(([day, config]) => (
            <div key={day} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              {/* Toggle del día */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {dayLabels[day]}
                </h3>
                <div className="flex items-center">
                  <button
                    onClick={() => handleToggleDay(day)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Input de horarios */}
              {config.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horarios disponibles (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={config.horarios}
                    onChange={(e) => handleHorariosChange(day, e.target.value)}
                    placeholder="09:00, 10:00, 11:00, 14:00, 15:00, 16:00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botón guardar */}
        <div className="mt-8">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractorAvailability;