import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ScheduleTime = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, serviceData, professional } = location.state || {};
  
  const [selectedDate, setSelectedDate] = useState(27);
  const [selectedTime, setSelectedTime] = useState('');

  // Días de la semana
  const weekDays = [
    { day: 'mié', date: 27, active: true },
    { day: 'jue', date: 28, active: false },
    { day: 'vie', date: 29, active: false },
    { day: 'sáb', date: 30, active: false },
    { day: 'mar', date: 2, active: false }
  ];

  // Horarios disponibles
  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset selected time when changing date
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
            Disponibilidad de {professional?.nombre || 'Roberto Funes'}
          </p>
        </div>

        {/* Selector de días */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            {weekDays.map((weekDay) => (
              <button
                key={weekDay.date}
                onClick={() => handleDateSelect(weekDay.date)}
                className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                  selectedDate === weekDay.date
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium mb-1">
                  {weekDay.day}
                </span>
                <span className="text-lg font-bold">
                  {weekDay.date}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selector de horarios */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`py-4 px-4 rounded-xl font-medium transition-colors ${
                  selectedTime === time
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Botón confirmar horario */}
        <button
          onClick={handleConfirmarHorario}
          disabled={!selectedTime}
          className="w-full bg-gray-400 text-white py-4 rounded-xl font-medium text-lg hover:bg-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar Horario
        </button>
      </div>
    </div>
  );
};

export default ScheduleTime;