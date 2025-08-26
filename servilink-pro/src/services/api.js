// src/services/api.js - Con URLs actualizadas para /servi-link
import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://codeo.site/api-servilink';

// Crear instancia de axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Variable para evitar bucles infinitos en el refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor para agregar token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} - Success`);
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Si es error 401 y no es el endpoint de login/refresh y no hemos intentado refresh ya
    if (error.response?.status === 401 && 
        !originalRequest.url.includes('/auth/login') && 
        !originalRequest.url.includes('/auth/refresh') &&
        !originalRequest._retry) {
      
      if (isRefreshing) {
        // Si ya estamos refrescando, poner en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        // No hay refresh token, limpiar y redirigir
        clearAuthData();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Usar una instancia nueva de axios para evitar interceptores
        const refreshResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken
        });
        
        if (refreshResponse.data.success) {
          const { access_token } = refreshResponse.data.data.tokens;
          localStorage.setItem('access_token', access_token);
          
          // Procesar cola de peticiones
          processQueue(null, access_token);
          
          // Reintentar petición original
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        processQueue(refreshError, null);
        clearAuthData();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  // Redirigir considerando el base path
  const currentPath = window.location.pathname;
  const basePath = '/servi-link';
  
  // Solo redirigir si estamos en una ruta protegida
  if (!currentPath.startsWith(basePath) || 
      currentPath === basePath || 
      currentPath === basePath + '/' ||
      currentPath.includes('/auth') || 
      currentPath.includes('/register')) {
    return; // No redirigir
  }
  
  window.location.href = basePath;
};

// Resto de los servicios permanecen igual...
// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response;
  },
  
  refreshToken: async (refreshToken) => {
    // Usar axios directo para evitar interceptores
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, { 
      refresh_token: refreshToken 
    });
    return response.data;
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

// Servicios de administración
export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response;
  },
  
  getStatsByPeriod: async (periodo = 'mes') => {
    const response = await api.get('/admin/estadisticas', { params: { periodo } });
    return response;
  },
  
  manageUsers: async (params = {}) => {
    const response = await api.get('/admin/usuarios', { params });
    return response;
  }
};

export default api;