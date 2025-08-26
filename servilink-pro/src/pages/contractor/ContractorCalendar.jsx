// src/pages/contractor/ContractorCalendar.jsx - Con datos reales de la API
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, List, Settings, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { appointmentService, scheduleService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ContractorCalendar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, currentDate]);

  useEffect(() => {
    if (user?.id && selectedDate) {
      loadAppointmentsForDate(selectedDate);
    }
  }, [selectedDate, user?.id, currentDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar disponibilidad para el mes actual
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const availabilityResponse = await scheduleService.getAvailability(user.id, {
        fecha_inicio: firstDay.toISOString().split('T')[0],
        fecha_fin: lastDay.toISOString().split('T')[0]
      });
      
      if (availabilityResponse.success) {
        setAvailability(availabilityResponse.data.horarios || []);
      }

    } catch (error) {
      console.error('Error cargando datos del calendario:', error);
      setError('Error cargando información del calendario');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointmentsForDate = async (day) => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const response = await appointmentService.getAppointments({
        contratista_id: user.id,
        fecha: dateStr,
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevMonth = new Date(year, month - 1, 0);
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false,
        hasAvailability: false,
        hasAppointments: false
      });
    }
    
    // Días del mes actual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = year === today.getFullYear() && 
                     month === today.getMonth() && 
                     day === today.getDate();
      
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      // Verificar si tiene disponibilidad
      const hasAvailability = availability.some(slot => 
        slot.fecha === dateStr && slot.disponible
      );
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        isSelected: day === selectedDate,
        hasAvailability,
        dateStr
      });
    }

    // Días del siguiente mes para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        hasAvailability: false,
        hasAppointments: false
      });
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    if (day.isCurrentMonth) {
      setSelectedDate(day.day);
    }
  };

  const formatTime = (timeString) => {
    return timeString?.substring(0, 5) || '';
  };

  const formatDate = (day) => {
    const month = monthNames[currentDate.getMonth()];
    return `${day} de ${month}`;
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'programada': return 'text-blue-600 bg-blue-100';
      case 'confirmada': return 'text-green-600 bg-green-100';
      case 'en_progreso': return 'text-yellow-600 bg-yellow-100';
      case 'completada': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'programada': return 'Programada';
      case 'confirmada': return 'Confirmada';
      case 'en_progreso': return 'En progreso';
      case 'completada': return 'Completada';
      default: return estado;
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              ¡Hola, {user?.nombre || 'Contratista'}!
            </h1>
            <p className="text-sm text-gray-600">Este es tu calendario de citas.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/contractor/dashboard')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <List className="w-5 h-5" />
            </button>
            <button className="p-2 text-blue-600 bg-blue-50 rounded-lg">
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
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Calendar Widget */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <h2 className="text-lg font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]} de {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((dayName) => (
              <div key={dayName} className="text-center text-sm font-medium text-gray-500 py-2">
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(day)}
                className={`
                  h-10 flex items-center justify-center text-sm rounded-lg transition-colors relative
                  ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}
                  ${day.isToday ? 'bg-gray-200 font-semibold' : ''}
                  ${day.isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                `}
              >
                {day.day}
                {/* Indicador de disponibilidad */}
                {day.hasAvailability && day.isCurrentMonth && (
                  <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected date appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {formatDate(selectedDate)}
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Cargando citas...</div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No hay citas agendadas para este día.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border-l-4 border-blue-500 pl-4 py-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {appointment.categoria_nombre || 'Servicio'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {appointment.cliente_nombre || 'Cliente'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {formatTime(appointment.hora_inicio)} - {formatTime(appointment.hora_fin)}
                        </span>
                      </div>
                      {appointment.direccion_servicio && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{appointment.direccion_servicio}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(appointment.estado)}`}>
                        {getStatusText(appointment.estado)}
                      </span>
                      {appointment.precio_acordado && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          ${appointment.precio_acordado}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {appointment.descripcion && (
                    <p className="text-sm text-gray-600 mt-2">
                      {appointment.descripcion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractorCalendar;