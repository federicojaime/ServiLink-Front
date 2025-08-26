// src/context/AuthContext.jsx - Versión sin bucles infinitos
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay usuario logueado al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Verificar que el token siga siendo válido (sin reintentos automáticos)
        try {
          const profileResponse = await authService.getProfile();
          if (profileResponse.success) {
            const updatedUser = profileResponse.data.user;
            if (JSON.stringify(updatedUser) !== JSON.stringify(userData)) {
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          }
        } catch (error) {
          // Si el token es inválido, hacer logout silencioso
          console.warn('Token inválido durante checkAuth, haciendo logout silencioso');
          silentLogout();
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      silentLogout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { user: userData, tokens } = response.data;
        
        // Guardar tokens y usuario en localStorage
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Actualizar estado
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response?.status === 401) {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (error.response?.status === 422) {
        errorMessage = 'Datos inválidos. Verifica tu email y contraseña';
      } else if (error.response?.status === 429) {
        errorMessage = 'Demasiados intentos. Espera unos minutos';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && !error.message.includes('Network Error')) {
        errorMessage = error.message;
      } else if (!navigator.onLine) {
        errorMessage = 'Sin conexión a internet';
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      
      let errorMessage = 'Error al registrarse';
      
      if (error.response?.status === 409) {
        errorMessage = 'El email ya está registrado';
      } else if (error.response?.status === 422) {
        errorMessage = 'Datos inválidos. Verifica todos los campos';
      } else if (error.response?.status === 429) {
        errorMessage = 'Demasiados intentos. Espera unos minutos';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && !error.message.includes('Network Error')) {
        errorMessage = error.message;
      } else if (!navigator.onLine) {
        errorMessage = 'Sin conexión a internet';
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const silentLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Función para refrescar el perfil del usuario
  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success) {
        const updatedUser = response.data.user;
        updateUser(updatedUser);
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      console.error('Error refrescando perfil:', error);
      return { success: false, message: 'Error al actualizar perfil' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};