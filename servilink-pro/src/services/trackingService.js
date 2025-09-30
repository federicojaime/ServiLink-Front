// src/services/trackingService.js - Servicio de tracking GPS
import api from './api';

export const trackingService = {
  // Actualizar posición (contratista)
  updatePosition: async (citaId, latitud, longitud) => {
    const response = await api.post('/tracking/actualizar', {
      cita_id: citaId,
      latitud,
      longitud
    });
    return response;
  },

  // Obtener tracking actual de una cita
  getCurrentTracking: async (citaId) => {
    const response = await api.get(`/tracking/cita/${citaId}`);
    return response;
  },

  // Confirmar llegada
  confirmArrival: async (citaId, latitud, longitud) => {
    const response = await api.post('/tracking/llegada', {
      cita_id: citaId,
      latitud,
      longitud
    });
    return response;
  },

  // Obtener historial de tracking
  getTrackingHistory: async (citaId) => {
    const response = await api.get(`/tracking/historial/${citaId}`);
    return response;
  }
};