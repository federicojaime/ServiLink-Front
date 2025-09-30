// src/services/aiService.js - Servicios de AI y precios dinámicos
import api from './api';

export const aiService = {
  // Procesar descripción con AI
  processDescription: async (descripcion, categoriaId) => {
    const response = await api.post('/solicitudes/ai/procesar-descripcion', {
      descripcion,
      categoria_id: categoriaId
    });
    return response;
  },

  // Validar resumen de AI
  validateSummary: async (solicitudId, resumenValidado) => {
    const response = await api.post(`/solicitudes/${solicitudId}/ai/validar`, {
      resumen_validado: resumenValidado
    });
    return response;
  },

  // Sugerir servicios con AI
  suggestServices: async (descripcion, categoriaId) => {
    const response = await api.post('/solicitudes/ai/sugerir-servicios', {
      descripcion,
      categoria_id: categoriaId
    });
    return response;
  }
};

export const pricingService = {
  // Obtener precio de servicio con multiplicadores
  getServicePrice: async (servicioId, contratistaId) => {
    const response = await api.get(`/precios/servicio/${servicioId}`, {
      params: { contratista_id: contratistaId }
    });
    return response;
  },

  // Calcular precio con multiplicadores
  calculatePrice: async (priceData) => {
    const response = await api.post('/precios/calcular', priceData);
    return response;
  },

  // Generar presupuesto completo
  generateQuote: async (quoteData) => {
    const response = await api.post('/precios/presupuesto', quoteData);
    return response;
  },

  // Personalizar precio (contratista)
  customizePrice: async (servicioId, precio) => {
    const response = await api.post('/precios/personalizar', {
      servicio_id: servicioId,
      precio
    });
    return response;
  }
};