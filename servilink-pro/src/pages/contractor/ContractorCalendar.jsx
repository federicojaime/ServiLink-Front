import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, List, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ContractorCalendar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(25); // Día 25 seleccionado por defecto
  const [appointments, setAppointments] = useState([]);

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
        isToday: false
      });
    }
    
    // Días del mes actual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = year === today.getFullYear() && 
                     month === today.getMonth() && 
                     day === today.getDate();
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        isSelected: day === selectedDate
      });
    }

    // Días del siguiente mes para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false
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

  const loadAppointments = async (date) => {
    try {
      const response = await appointmentService.getAppointments({
        fecha: `2025-08-${date.toString().padStart(2, '0')}`,
        estado: 'programada'
      });
      
      if (response.success) {
        setAppointments(response.data.citas || []);
      }
    } catch (error) {
      console.error('Error cargando citas:', error);
      // Para demo, no hay citas
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments(selectedDate);
  }, [selectedDate]);

  const days = getDaysInMonth(currentDate);

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
                  h-10 flex items-center justify-center text-sm rounded-lg transition-colors
                  ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}
                  ${day.isToday ? 'bg-gray-200 font-semibold' : ''}
                  ${day.isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                `}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* Selected date appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Citas para el lunes, 25 de agosto
          </h3>
          
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay citas agendadas para este día.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border-l-4 border-blue-500 pl-4 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {appointment.servicio_nombre}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {appointment.cliente_nombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.hora_inicio} - {appointment.hora_fin}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      ${appointment.precio_acordado}
                    </span>
                  </div>
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