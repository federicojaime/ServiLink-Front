// src/pages/client/ScheduleTime.jsx - Con disponibilidad real de la API
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { scheduleService } from '../../services/api';

const ScheduleTime = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, serviceData, professional } = location.state || {};
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (professional?.id) {
      loadAvailableDates();
    } else {
      setError('No se encontró información del profesional');
      setLoading(false);
    }
  }, [professional?.id]);

  useEffect(() => {
    if (selectedDate && professional?.id) {
      loadAvailableTimes(selectedDate);
    }
  }, [selectedDate, professional?.id]);

  const loadAvailableDates = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener disponibilidad para los próximos 14 días
      const startDate = new Date();
      const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      
      const response = await scheduleService.getAvailability(professional.id, {
        fecha_inicio: startDate.toISOString().split('T')[0],
        fecha_fin: endDate.toISOString().split('T')[0]
      });
      
      if (response.success && response.data.horarios) {
        // Extraer fechas únicas con horarios disponibles
        const uniqueDates = [...new Set(
          response.data.horarios
            .filter(slot => slot.disponible && new Date(slot.fecha + 'T00:00:00') >= new Date().setHours(0,0,0,0))
            .map(slot => slot.fecha)
        )].sort();
        
        const formattedDates = uniqueDates.map(dateStr => ({
          value: dateStr,
          label: formatDateLabel(dateStr),
          dayName: getDayName(dateStr),
          dayNumber: new Date(dateStr).getDate()
        }));
        
        setAvailableDates(formattedDates);
        
        // Si hay fechas disponibles, seleccionar la primera automáticamente
        if (formattedDates.length > 0) {
          setSelectedDate(formattedDates[0].value);
        }
      } else {
        setError('No hay fechas disponibles en este momento');
        setAvailableDates([]);
      }
    } catch (error) {
      console.error('Error cargando fechas disponibles:', error);
      setError('Error cargando fechas disponibles');
      setAvailableDates([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTimes = async (date) => {
    try {
      setLoadingTimes(true);
      
      const response = await scheduleService.getScheduleByContractor(professional.id, {
        fecha: date,
        limit: 50
      });
      
      if (response.success && response.data.horarios) {
        // Filtrar solo horarios disponibles para la fecha seleccionada
        const timesForDate = response.data.horarios
          .filter(slot => 
            slot.fecha === date && 
            slot.disponible &&
            new Date(date + 'T' + slot.hora_inicio) > new Date() // No mostrar horarios pasados
          )
          .map(slot => ({
            value: slot.hora_inicio.substring(0, 5),
            label: slot.hora_inicio.substring(0, 5),
            id: slot.id
          }))
          .sort((a, b) => a.value.localeCompare(b.value));
        
        setAvailableTimes(timesForDate);
        setSelectedTime(''); // Limpiar selección de tiempo
      } else {
        setAvailableTimes([]);
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { weekday: 'short' });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Limpiar tiempo seleccionado
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleConfirmarHorario = () => {
    if (!selectedTime) {
      alert('Por favor selecciona un horario');
      return;
    }

    navigate('/client/confirm-service', {
      state: {
        requestId,
        serviceData,
        professional,
        selectedDate,
        selectedTime
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Cargando disponibilidad...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-red-600 h-16 w-full relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {error}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              El profesional no tiene horarios disponibles en este momento.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            Elige un Horario
          </h2>
          <p className="text-gray-600 text-sm">
            Disponibilidad de {professional?.nombre || 'Profesional'}
          </p>
        </div>

        {availableDates.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Sin fechas disponibles
            </h3>
            <p className="text-gray-600 text-sm">
              El profesional no tiene horarios disponibles próximamente.
            </p>
          </div>
        ) : (
          <>
            {/* Selector de días */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Selecciona una fecha
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {availableDates.slice(0, 6).map((date) => (
                  <button
                    key={date.value}
                    onClick={() => handleDateSelect(date.value)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                      selectedDate === date.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium mb-1">
                      {date.dayName}
                    </span>
                    <span className="text-lg font-bold">
                      {date.dayNumber}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de horarios */}
            {selectedDate && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Horarios disponibles
                </h3>
                
                {loadingTimes ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600">Cargando horarios...</div>
                  </div>
                ) : availableTimes.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No hay horarios disponibles para esta fecha
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimes.map((time) => (
                      <button
                        key={time.value}
                        onClick={() => handleTimeSelect(time.value)}
                        className={`py-4 px-4 rounded-xl font-medium transition-colors ${
                          selectedTime === time.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botón confirmar horario */}
            <button
              onClick={handleConfirmarHorario}
              disabled={!selectedTime}
              className={`w-full py-4 rounded-xl font-medium text-lg transition-colors duration-200 ${
                selectedTime
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirmar Horario
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleTime;