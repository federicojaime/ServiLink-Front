// src/components/NavigationHeader.jsx - Header común para todas las pantallas
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBadge from './NotificationBadge';

const NavigationHeader = ({ 
  title, 
  showBack = false, 
  backPath = null,
  showNotifications = true,
  showProfile = true,
  variant = 'default' // 'default', 'red', 'transparent'
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleProfileClick = () => {
    // Navegar al perfil según tipo de usuario
    if (user?.tipo_usuario === 'cliente') {
      navigate('/client/profile');
    } else {
      navigate('/contractor/profile');
    }
  };

  const getHeaderClasses = () => {
    switch (variant) {
      case 'red':
        return 'bg-red-600 text-white';
      case 'transparent':
        return 'bg-transparent';
      default:
        return 'bg-white text-gray-800 shadow-sm';
    }
  };

  return (
    <div className={`h-16 w-full relative ${getHeaderClasses()}`}>
      <div className="max-w-md mx-auto px-4 h-full flex items-center justify-between">
        {/* Lado izquierdo */}
        <div className="flex items-center space-x-4">
          {showBack && (
            <button
              onClick={handleBack}
              className={`p-2 rounded-lg transition-colors ${
                variant === 'red' 
                  ? 'text-white hover:bg-white/20' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          {title && (
            <h1 className={`text-lg font-semibold ${
              variant === 'red' ? 'text-white' : 'text-gray-800'
            }`}>
              {title}
            </h1>
          )}
        </div>

        {/* Lado derecho */}
        <div className="flex items-center space-x-2">
          {showNotifications && user && (
            <NotificationBadge />
          )}
          
          {showProfile && user && (
            <div className="relative group">
              <button
                onClick={handleProfileClick}
                className={`p-2 rounded-lg transition-colors ${
                  variant === 'red' 
                    ? 'text-white hover:bg-white/20' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
              </button>
              
              {/* Dropdown del perfil */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <p className="font-medium text-gray-800">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {user.tipo_usuario}
                  </p>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Ver Perfil
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;