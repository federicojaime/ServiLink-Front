import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import ClientAuth from './pages/auth/ClientAuth';
import ClientRegister from './pages/auth/ClientRegister';
import ContractorAuth from './pages/auth/ContractorAuth';
import ContractorRegister from './pages/auth/ContractorRegister';
import ClientDashboard from './pages/client/ClientDashboard';
import ServiceSelection from './pages/client/ServiceSelection';
import ServiceDetails from './pages/client/ServiceDetails';
import SearchingProfessional from './pages/client/SearchingProfessional';
import ProfessionalFound from './pages/client/ProfessionalFound';
import ScheduleTime from './pages/client/ScheduleTime';
import ConfirmService from './pages/client/ConfirmService';
import RateService from './pages/client/RateService';
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import ContractorCalendar from './pages/contractor/ContractorCalendar';
import ContractorAvailability from './pages/contractor/ContractorAvailability';

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

      {/* Ruta por defecto - redirigir a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;