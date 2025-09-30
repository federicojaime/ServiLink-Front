// src/App.jsx - Con todas las nuevas rutas
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import ClientAuth from './pages/auth/ClientAuth';
import ClientRegister from './pages/auth/ClientRegister';
import ContractorAuth from './pages/auth/ContractorAuth';
import ContractorRegister from './pages/auth/ContractorRegister';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import ServiceSelection from './pages/client/ServiceSelection';
import ServiceDetails from './pages/client/ServiceDetails';
import SearchingProfessional from './pages/client/SearchingProfessional';
import ProfessionalFound from './pages/client/ProfessionalFound';
import ScheduleTime from './pages/client/ScheduleTime';
import ConfirmService from './pages/client/ConfirmService';
import RateService from './pages/client/RateService';
import PaymentScreen from './pages/client/PaymentScreen';
import TrackingScreen from './pages/client/TrackingScreen';

// Contractor Pages
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import ContractorCalendar from './pages/contractor/ContractorCalendar';
import ContractorAvailability from './pages/contractor/ContractorAvailability';
import ServiceTracking from './pages/contractor/ServiceTracking';

// Shared Pages
import NotificationsScreen from './pages/shared/NotificationsScreen';
import UserProfile from './pages/shared/UserProfile';

// Onboarding Pages (Nuevas)
import ClientOnboarding from './pages/onboarding/ClientOnboarding';
import ContractorOnboarding from './pages/onboarding/ContractorOnboarding';

// Protected Route Component
const ProtectedRoute = ({ children, userType }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Verificar tipo de usuario si se especifica
  if (userType && user?.tipo_usuario !== userType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirige si ya está autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Verificar si necesita completar onboarding
    if (user.onboarding_completado === false) {
      if (user.tipo_usuario === 'cliente') {
        return <Navigate to="/client/onboarding" replace />;
      } else if (user.tipo_usuario === 'contratista') {
        return <Navigate to="/contractor/onboarding" replace />;
      }
    }
    
    // Redirigir según tipo de usuario
    if (user.tipo_usuario === 'cliente') {
      return <Navigate to="/client/dashboard" replace />;
    } else if (user.tipo_usuario === 'contratista') {
      return <Navigate to="/contractor/dashboard" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/client/auth" 
        element={
          <PublicRoute>
            <ClientAuth />
          </PublicRoute>
        } 
      />

      <Route 
        path="/client/register" 
        element={
          <PublicRoute>
            <ClientRegister />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/contractor/auth" 
        element={
          <PublicRoute>
            <ContractorAuth />
          </PublicRoute>
        } 
      />

      <Route 
        path="/contractor/register" 
        element={
          <PublicRoute>
            <ContractorRegister />
          </PublicRoute>
        } 
      />

      {/* Rutas de onboarding */}
      <Route 
        path="/client/onboarding" 
        element={
          <ProtectedRoute userType="cliente">
            <ClientOnboarding />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/contractor/onboarding" 
        element={
          <ProtectedRoute userType="contratista">
            <ContractorOnboarding />
          </ProtectedRoute>
        } 
      />

      {/* Rutas protegidas para clientes */}
      <Route 
        path="/client/dashboard" 
        element={
          <ProtectedRoute userType="cliente">
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/client/service-selection" 
        element={
          <ProtectedRoute userType="cliente">
            <ServiceSelection />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/client/service-details" 
        element={
          <ProtectedRoute userType="cliente">
            <ServiceDetails />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/client/searching-professional" 
        element={
          <ProtectedRoute userType="cliente">
            <SearchingProfessional />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/client/professional-found" 
        element={
          <ProtectedRoute userType="cliente">
            <ProfessionalFound />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/client/schedule-time" 
        element={
          <ProtectedRoute userType="cliente">
            <ScheduleTime />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/client/confirm-service" 
        element={
          <ProtectedRoute userType="cliente">
            <ConfirmService />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/client/rate-service" 
        element={
          <ProtectedRoute userType="cliente">
            <RateService />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/client/payment" 
        element={
          <ProtectedRoute userType="cliente">
            <PaymentScreen />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/client/tracking" 
        element={
          <ProtectedRoute userType="cliente">
            <TrackingScreen />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/client/profile" 
        element={
          <ProtectedRoute userType="cliente">
            <UserProfile />
          </ProtectedRoute>
        } 
      />

      {/* Rutas protegidas para contratistas */}
      <Route 
        path="/contractor/dashboard" 
        element={
          <ProtectedRoute userType="contratista">
            <ContractorDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/contractor/calendar" 
        element={
          <ProtectedRoute userType="contratista">
            <ContractorCalendar />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/contractor/availability" 
        element={
          <ProtectedRoute userType="contratista">
            <ContractorAvailability />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/contractor/tracking" 
        element={
          <ProtectedRoute userType="contratista">
            <ServiceTracking />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/contractor/profile" 
        element={
          <ProtectedRoute userType="contratista">
            <UserProfile />
          </ProtectedRoute>
        } 
      />

      {/* Rutas compartidas */}
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <NotificationsScreen />
          </ProtectedRoute>
        } 
      />

      {/* Ruta por defecto - redirigir a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename="/servi-link">
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;