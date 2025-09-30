// src/pages/onboarding/ContractorOnboarding.jsx - Onboarding para contratistas
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, User, Briefcase, MapPin, DollarSign, Shield, Camera } from 'lucide-react';
import { onboardingService, configService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ContractorOnboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    // Paso 1
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    cuil_cuit: '',
    fecha_nacimiento: '',
    genero: '',
    
    // Paso 2
    nombre_emprendimiento: '',
    anos_experiencia: 0,
    categorias: [],
    trabaja_con_equipo: false,
    tamano_equipo: 1,
    especialidades: '',
    
    // Paso 3
    ciudad: '',
    provincia: '',
    direccion: '',
    latitud: -34.6037,
    longitud: -58.3816,
    radio_cobertura: 15,
    tiene_movilidad: true,
    atiende_urgencias: true,
    dias_trabajo: [],
    
    // Paso 4
    politica_precios: 'por_hora',
    tarifa_hora: 15000,
    incluye_materiales: 'depende',
    metodos_pago: [],
    acepta_pagos_plataforma: true,
    
    // Paso 5
    acepta_terminos: false,
    selfie_url: '',
    dni_frente_url: '',
    dni_dorso_url: '',
    matricula_numero: '',
    matricula_estado: 'vigente',
    otras_certificaciones: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await configService.getCategories();
      if (response.success) {
        setCategories(response.data.categorias);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData(prev => {
      const currentValues = prev[name] || [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [name]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [name]: [...currentValues, value]
        };
      }
    });
  };

  const handleDayScheduleChange = (day, field, value) => {
    setFormData(prev => {
      const currentDays = [...(prev.dias_trabajo || [])];
      const existingIndex = currentDays.findIndex(d => d.dia === day);
      
      if (existingIndex >= 0) {
        currentDays[existingIndex][field] = value;
      } else {
        currentDays.push({
          dia: day,
          hora_inicio: '08:00',
          hora_fin: '18:00',
          disponible: true,
          [field]: value
        });
      }
      
      return { ...prev, dias_trabajo: currentDays };
    });
  };

  const handleNextStep = async () => {
    setLoading(true);
    try {
      let response;
      
      switch(currentStep) {
        case 1:
          response = await onboardingService.contractorStep1({
            nombre: formData.nombre,
            apellido: formData.apellido,
            cuil_cuit: formData.cuil_cuit,
            fecha_nacimiento: formData.fecha_nacimiento,
            genero: formData.genero
          });
          break;
          
        case 2:
          response = await onboardingService.contractorStep2({
            nombre_emprendimiento: formData.nombre_emprendimiento,
            anos_experiencia: formData.anos_experiencia,
            categorias: formData.categorias,
            trabaja_con_equipo: formData.trabaja_con_equipo,
            tamano_equipo: formData.tamano_equipo,
            especialidades: formData.especialidades
          });
          break;
          
        case 3:
          response = await onboardingService.contractorStep3({
            ciudad: formData.ciudad,
            provincia: formData.provincia,
            direccion: formData.direccion,
            latitud: formData.latitud,
            longitud: formData.longitud,
            radio_cobertura: formData.radio_cobertura,
            tiene_movilidad: formData.tiene_movilidad,
            atiende_urgencias: formData.atiende_urgencias,
            dias_trabajo: formData.dias_trabajo
          });
          break;
          
        case 4:
          response = await onboardingService.contractorStep4({
            politica_precios: formData.politica_precios,
            tarifa_hora: formData.tarifa_hora,
            incluye_materiales: formData.incluye_materiales,
            metodos_pago: formData.metodos_pago,
            acepta_pagos_plataforma: formData.acepta_pagos_plataforma
          });
          break;
          
        case 5:
          response = await onboardingService.contractorStep5({
            acepta_terminos: formData.acepta_terminos,
            selfie_url: formData.selfie_url || 'https://example.com/selfie.jpg',
            dni_frente_url: formData.dni_frente_url || 'https://example.com/dni_frente.jpg',
            dni_dorso_url: formData.dni_dorso_url || 'https://example.com/dni_dorso.jpg',
            matricula_numero: formData.matricula_numero,
            matricula_estado: formData.matricula_estado,
            otras_certificaciones: formData.otras_certificaciones
          });
          
          if (response.success) {
            updateUser({ ...user, onboarding_completado: true });
            navigate('/contractor/dashboard');
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
                Datos básicos para tu perfil profesional
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
                CUIL/CUIT
              </label>
              <input
                type="text"
                name="cuil_cuit"
                value={formData.cuil_cuit}
                onChange={handleInputChange}
                placeholder="20-12345678-9"
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
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Datos Profesionales
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Cuéntanos sobre tu experiencia
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Emprendimiento
              </label>
              <input
                type="text"
                name="nombre_emprendimiento"
                value={formData.nombre_emprendimiento}
                onChange={handleInputChange}
                placeholder="Ej: Electricidad Rodriguez"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Años de Experiencia
              </label>
              <input
                type="number"
                name="anos_experiencia"
                value={formData.anos_experiencia}
                onChange={handleInputChange}
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rubros (máx. 3)
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.categorias.includes(category.id)}
                      onChange={() => handleMultiSelectChange('categorias', category.id)}
                      disabled={formData.categorias.length >= 3 && !formData.categorias.includes(category.id)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{category.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="trabaja_con_equipo"
                checked={formData.trabaja_con_equipo}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Trabajo con equipo
              </label>
            </div>

            {formData.trabaja_con_equipo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamaño del equipo
                </label>
                <input
                  type="number"
                  name="tamano_equipo"
                  value={formData.tamano_equipo}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidades
              </label>
              <textarea
                name="especialidades"
                value={formData.especialidades}
                onChange={handleInputChange}
                placeholder="Ej: Instalaciones eléctricas, tableros, automatización"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Zona de Cobertura
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                ¿Dónde ofreces tus servicios?
              </p>
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
                Dirección Base
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Av. Rivadavia 5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radio de cobertura (km)
              </label>
              <input
                type="number"
                name="radio_cobertura"
                value={formData.radio_cobertura}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="tiene_movilidad"
                  checked={formData.tiene_movilidad}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  Tengo movilidad propia
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="atiende_urgencias"
                  checked={formData.atiende_urgencias}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  Atiendo urgencias 24/7
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de trabajo
              </label>
              <div className="space-y-2">
                {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map(day => (
                  <div key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dias_trabajo.some(d => d.dia === day)}
                      onChange={(e) => handleDayScheduleChange(day, 'disponible', e.target.checked)}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700 capitalize w-24">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Política de Precios
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Define tu estructura de precios
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de tarifa
              </label>
              <select
                name="politica_precios"
                value={formData.politica_precios}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="por_hora">Por hora</option>
                <option value="por_trabajo">Por trabajo</option>
                <option value="presupuesto">Presupuesto personalizado</option>
              </select>
            </div>

            {formData.politica_precios === 'por_hora' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa por hora ($)
                </label>
                <input
                  type="number"
                  name="tarifa_hora"
                  value={formData.tarifa_hora}
                  onChange={handleInputChange}
                  min="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Incluyes materiales?
              </label>
              <select
                name="incluye_materiales"
                value={formData.incluye_materiales}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="siempre">Sí, siempre incluidos</option>
                <option value="nunca">No, el cliente los compra</option>
                <option value="depende">Depende del trabajo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Métodos de pago aceptados
              </label>
              <div className="space-y-2">
                {['efectivo', 'transferencia', 'mercadopago', 'tarjeta'].map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.metodos_pago.includes(method)}
                      onChange={() => handleMultiSelectChange('metodos_pago', method)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="acepta_pagos_plataforma"
                checked={formData.acepta_pagos_plataforma}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Acepto pagos a través de la plataforma
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Verificación y Documentación
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Último paso para activar tu cuenta
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Matrícula (opcional)
              </label>
              <input
                type="text"
                name="matricula_numero"
                value={formData.matricula_numero}
                onChange={handleInputChange}
                placeholder="MAT-12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formData.matricula_numero && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado de matrícula
                </label>
                <select
                  name="matricula_estado"
                  value={formData.matricula_estado}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vigente">Vigente</option>
                  <option value="en_tramite">En trámite</option>
                  <option value="vencida">Vencida</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Otras certificaciones
              </label>
              <textarea
                name="otras_certificaciones"
                value={formData.otras_certificaciones}
                onChange={handleInputChange}
                placeholder="Ej: Certificado COPIME, Curso seguridad eléctrica"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>

            <div className="space-y-3">
              <button className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Tomar Selfie</span>
              </button>

              <button className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Foto DNI Frente</span>
              </button>

              <button className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Foto DNI Dorso</span>
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <h3 className="font-medium text-blue-800 mb-2">
                Términos y Condiciones
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Al continuar, aceptas nuestros términos de servicio, política de privacidad y código de conducta profesional.
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
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs ${
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
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        {renderStep()}

        {/* Next button */}
        <button
          onClick={handleNextStep}
          disabled={loading || (currentStep === 5 && !formData.acepta_terminos)}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : currentStep === 5 ? 'Completar Registro' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default ContractorOnboarding;