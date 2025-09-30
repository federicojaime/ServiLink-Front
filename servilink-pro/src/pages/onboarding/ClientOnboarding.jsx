// src/pages/onboarding/ClientOnboarding.jsx - Onboarding paso a paso para clientes
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, User, MapPin, Shield, Camera } from 'lucide-react';
import { onboardingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ClientOnboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Paso 1
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    dni: '',
    fecha_nacimiento: '',
    genero: '',
    
    // Paso 2
    telefono: user?.telefono || '',
    whatsapp: user?.whatsapp || '',
    direccion: '',
    ciudad: '',
    provincia: '',
    latitud: -34.6037,
    longitud: -58.3816,
    tipo_propiedad: 'departamento',
    requiere_coordinacion_acceso: false,
    datos_acceso_edificio: {},
    
    // Paso 3
    acepta_terminos: false,
    selfie_url: '',
    dni_frente_url: '',
    dni_dorso_url: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNextStep = async () => {
    setLoading(true);
    try {
      let response;
      
      switch(currentStep) {
        case 1:
          response = await onboardingService.clientStep1({
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            fecha_nacimiento: formData.fecha_nacimiento,
            genero: formData.genero
          });
          break;
          
        case 2:
          response = await onboardingService.clientStep2({
            telefono: formData.telefono,
            whatsapp: formData.whatsapp,
            direccion: formData.direccion,
            ciudad: formData.ciudad,
            provincia: formData.provincia,
            latitud: formData.latitud,
            longitud: formData.longitud,
            tipo_propiedad: formData.tipo_propiedad,
            requiere_coordinacion_acceso: formData.requiere_coordinacion_acceso,
            datos_acceso_edificio: formData.datos_acceso_edificio
          });
          break;
          
        case 3:
          response = await onboardingService.clientStep3({
            acepta_terminos: formData.acepta_terminos,
            selfie_url: formData.selfie_url || 'https://example.com/selfie.jpg',
            dni_frente_url: formData.dni_frente_url || 'https://example.com/dni_frente.jpg',
            dni_dorso_url: formData.dni_dorso_url || 'https://example.com/dni_dorso.jpg'
          });
          
          if (response.success) {
            // Actualizar usuario con onboarding completado
            updateUser({ ...user, onboarding_completado: true });
            navigate('/client/dashboard');
            return;
          }
          break;
      }
      
      if (response?.success) {
        setCurrentStep(currentStep + 1);
      } else {
        throw new Error(response?.message || 'Error en el proceso');
      }
    } catch (error) {
      console.error('Error en onboarding:', error);
      alert('Error completando el paso. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Información Personal
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Necesitamos algunos datos para verificar tu identidad
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                placeholder="12345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Datos de Contacto
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                ¿Dónde necesitarás los servicios?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="+5491123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="+5491123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Av. Corrientes 1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  placeholder="CABA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provincia
                </label>
                <input
                  type="text"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleInputChange}
                  placeholder="Buenos Aires"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Propiedad
              </label>
              <select
                name="tipo_propiedad"
                value={formData.tipo_propiedad}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="departamento">Departamento</option>
                <option value="casa">Casa</option>
                <option value="oficina">Oficina</option>
                <option value="local">Local Comercial</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="requiere_coordinacion_acceso"
                checked={formData.requiere_coordinacion_acceso}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Requiere coordinar acceso con portería/administración
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Verificación y Términos
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Último paso para completar tu registro
              </p>
            </div>

            <div className="space-y-4">
              {/* Botones para subir fotos */}
              <button className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Tomar Selfie</span>
              </button>

              <button className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Foto DNI Frente</span>
              </button>

              <button className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Foto DNI Dorso</span>
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <h3 className="font-medium text-blue-800 mb-2">
                Términos y Condiciones
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Al continuar, aceptas nuestros términos de servicio y política de privacidad.
              </p>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="acepta_terminos"
                  checked={formData.acepta_terminos}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  Acepto los términos y condiciones
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-red-600 h-16 w-full relative">
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
            ))}
          </div>
          <div className="bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        {renderStep()}

        {/* Next button */}
        <button
          onClick={handleNextStep}
          disabled={loading || (currentStep === 3 && !formData.acepta_terminos)}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : currentStep === 3 ? 'Completar Registro' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default ClientOnboarding;