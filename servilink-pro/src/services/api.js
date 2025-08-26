import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear instancia de axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar refresh
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token } = response.data.data.tokens;
          localStorage.setItem('access_token', access_token);
          
          // Reintentar la petición original
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api.request(error.config);
        }
      } catch (refreshError) {
        // Refresh falló, redirigir a login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
    try {
      console.log('Enviando request de login a:', `${API_BASE_URL}/api/v1/auth/login`);
      console.log('Con datos:', { email, password });
      
      const response = await api.post('/auth/login', { email, password });
      console.log('Respuesta de login:', response);
      return response;
    } catch (error) {
      console.error('Error en authService.login:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      console.log('Enviando request de registro a:', `${API_BASE_URL}/api/v1/auth/register`);
      console.log('Con datos:', userData);
      
      const response = await api.post('/auth/register', userData);
      console.log('Respuesta de registro:', response);
      return response;
    } catch (error) {
      console.error('Error en authService.register:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response;
  },
  
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response;
  }
};

// Servicios de usuarios
export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/usuarios', { params });
    return response;
  },
  
  getUserById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response;
  }
};

// Servicios de contratistas
export const contractorService = {
  getContractors: async (params = {}) => {
    const response = await api.get('/contratistas', { params });
    return response;
  },
  
  getContractorById: async (id) => {
    const response = await api.get(`/contratistas/${id}`);
    return response;
  },
  
  searchAvailableContractors: async (searchData) => {
    const response = await api.post('/contratistas/buscar-disponibles', searchData);
    return response;
  }
};

// Servicios de configuración
export const configService = {
  getCategories: async () => {
    const response = await api.get('/config/categorias');
    return response;
  },
  
  getServices: async () => {
    const response = await api.get('/config/servicios');
    return response;
  },
  
  getServicesByCategory: async (categoryId) => {
    const response = await api.get(`/config/categorias/${categoryId}/servicios`);
    return response;
  }
};

// Servicios de solicitudes
export const requestService = {
  createRequest: async (requestData) => {
    const response = await api.post('/solicitudes', requestData);
    return response;
  },
  
  getRequests: async (params = {}) => {
    const response = await api.get('/solicitudes', { params });
    return response;
  },
  
  getRequestById: async (id) => {
    const response = await api.get(`/solicitudes/${id}`);
    return response;
  },
  
  updateRequestStatus: async (id, status) => {
    const response = await api.put(`/solicitudes/${id}/estado`, { estado: status });
    return response;
  }
};

// Servicios de asignaciones
export const assignmentService = {
  getAssignments: async (params = {}) => {
    const response = await api.get('/asignaciones', { params });
    return response;
  },
  
  getAssignmentsByContractor: async (contractorId, params = {}) => {
    const response = await api.get(`/asignaciones/contratista/${contractorId}`, { params });
    return response;
  },
  
  acceptAssignment: async (id, acceptData) => {
    const response = await api.post(`/asignaciones/${id}/aceptar`, acceptData);
    return response;
  },
  
  rejectAssignment: async (id, rejectData) => {
    const response = await api.post(`/asignaciones/${id}/rechazar`, rejectData);
    return response;
  }
};

// Servicios de citas
export const appointmentService = {
  createAppointment: async (appointmentData) => {
    const response = await api.post('/citas', appointmentData);
    return response;
  },
  
  getAppointments: async (params = {}) => {
    const response = await api.get('/citas', { params });
    return response;
  },
  
  getAppointmentById: async (id) => {
    const response = await api.get(`/citas/${id}`);
    return response;
  },
  
  confirmAppointment: async (id) => {
    const response = await api.post(`/citas/${id}/confirmar`);
    return response;
  },
  
  startService: async (id) => {
    const response = await api.post(`/citas/${id}/iniciar`);
    return response;
  },
  
  completeService: async (id, completionData) => {
    const response = await api.post(`/citas/${id}/completar`, completionData);
    return response;
  }
};

// Servicios de horarios
export const scheduleService = {
  getScheduleByContractor: async (contractorId, params = {}) => {
    const response = await api.get(`/horarios/contratista/${contractorId}`, { params });
    return response;
  },
  
  createSchedule: async (scheduleData) => {
    const response = await api.post('/horarios', scheduleData);
    return response;
  },
  
  updateAvailability: async (id, availabilityData) => {
    const response = await api.put(`/horarios/${id}`, availabilityData);
    return response;
  },
  
  getAvailability: async (contractorId, params = {}) => {
    const response = await api.get(`/horarios/contratista/${contractorId}/disponibilidad`, { params });
    return response;
  }
};

// Servicios de evaluaciones
export const evaluationService = {
  createEvaluation: async (evaluationData) => {
    const response = await api.post('/evaluaciones', evaluationData);
    return response;
  },
  
  getEvaluationsByAppointment: async (appointmentId) => {
    const response = await api.get(`/evaluaciones/cita/${appointmentId}`);
    return response;
  },
  
  getEvaluationsByContractor: async (contractorId, params = {}) => {
    const response = await api.get(`/evaluaciones/contratista/${contractorId}`, { params });
    return response;
  }
};

// Servicios de pagos
export const paymentService = {
  createConsultationPayment: async (paymentData) => {
    const response = await api.post('/pagos/consulta', paymentData);
    return response;
  },
  
  getPaymentsByAppointment: async (appointmentId) => {
    const response = await api.get(`/pagos/cita/${appointmentId}`);
    return response;
  }
};

// Servicios de notificaciones
export const notificationService = {
  getNotificationsByUser: async (userId, params = {}) => {
    const response = await api.get(`/notificaciones/usuario/${userId}`, { params });
    return response;
  },
  
  markAsRead: async (id) => {
    const response = await api.put(`/notificaciones/${id}/leida`);
    return response;
  },
  
  sendManualNotification: async (notificationData) => {
    const response = await api.post('/notificaciones/enviar', notificationData);
    return response;
  }
};

export default api;