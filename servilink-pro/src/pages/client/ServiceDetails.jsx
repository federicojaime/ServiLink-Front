// src/pages/client/ServiceDetails.jsx - Con AI y carrito de servicios
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, Plus, Minus, Trash2, ShoppingCart, Sparkles } from 'lucide-react';
import { requestService, configService } from '../../services/api';
import { aiService, pricingService } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

const ServiceDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { selectedCategory, selectedService } = location.state || {};
  
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  
  // Estados para AI
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  
  // Estados para carrito
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  
  // Estados para multiplicadores
  const [urgency, setUrgency] = useState('normal');
  const [height, setHeight] = useState(0);
  const [distance, setDistance] = useState(0);
  const [complexity, setComplexity] = useState('baja');
  const [whoProvidesMaterials, setWhoProvidesMaterials] = useState('profesional');

  useEffect(() => {
    loadAvailableServices();
  }, [selectedCategory]);

  const loadAvailableServices = async () => {
    if (selectedCategory?.id) {
      try {
        const response = await configService.getServicesByCategory(selectedCategory.id);
        if (response.success) {
          setAvailableServices(response.data.servicios || []);
        }
      } catch (error) {
        console.error('Error cargando servicios:', error);
      }
    }
  };

  const handleProcessWithAI = async () => {
    if (!description.trim()) return;

    setProcessingAI(true);
    try {
      // Procesar descripción con AI
      const aiResponse = await aiService.processDescription(description, selectedCategory?.id || 1);
      
      if (aiResponse.success) {
        setAiSummary(aiResponse.data.resumen);
        
        // Obtener sugerencias de servicios
        const suggestionsResponse = await aiService.suggestServices(description, selectedCategory?.id || 1);
        if (suggestionsResponse.success) {
          setAiSuggestions(suggestionsResponse.data.servicios_sugeridos || []);
          
          // Auto-agregar servicios sugeridos al carrito
          const suggestedItems = suggestionsResponse.data.servicios_sugeridos.map(service => ({
            servicio_id: service.id,
            nombre: service.nombre,
            cantidad: 1,
            precio_base: service.precio_base,
            descripcion: service.descripcion
          }));
          setCartItems(suggestedItems);
        }

        // Calcular precio estimado
        await calculateEstimatedPrice();
      }
    } catch (error) {
      console.error('Error procesando con AI:', error);
      alert('Error al procesar con AI. Continuando sin asistencia.');
    } finally {
      setProcessingAI(false);
    }
  };

  const calculateEstimatedPrice = async () => {
    try {
      let totalPrice = 0;
      
      for (const item of cartItems) {
        const priceData = {
          servicio_id: item.servicio_id,
          cuando_necesita: urgency,
          altura_metros: height,
          complejidad: complexity,
          distancia_km: distance,
          incluye_materiales: whoProvidesMaterials === 'profesional',
          cantidad: item.cantidad,
          incluir_desglose: true
        };
        
        const response = await pricingService.calculatePrice(priceData);
        if (response.success) {
          totalPrice += response.data.precio_total;
        }
      }
      
      setEstimatedPrice(totalPrice);
    } catch (error) {
      console.error('Error calculando precio:', error);
    }
  };

  const addToCart = (service) => {
    const existingItem = cartItems.find(item => item.servicio_id === service.id);
    
    if (existingItem) {
      updateQuantity(service.id, existingItem.cantidad + 1);
    } else {
      setCartItems([...cartItems, {
        servicio_id: service.id,
        nombre: service.nombre,
        cantidad: 1,
        precio_base: service.precio_base,
        descripcion: service.descripcion
      }]);
    }
    setShowCart(true);
  };

  const updateQuantity = (servicioId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(servicioId);
    } else {
      setCartItems(cartItems.map(item =>
        item.servicio_id === servicioId
          ? { ...item, cantidad: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (servicioId) => {
    setCartItems(cartItems.filter(item => item.servicio_id !== servicioId));
  };

  const getTotalCartPrice = () => {
    return cartItems.reduce((total, item) => total + (item.precio_base * item.cantidad), 0);
  };

  const getUrgencyMultiplier = () => {
    switch(urgency) {
      case 'hoy': return 1.8;
      case 'manana': return 1.5;
      case 'esta_semana': return 1.2;
      default: return 1;
    }
  };

  const handleSubmit = async () => {
    if (!description.trim() && cartItems.length === 0) {
      alert('Por favor describe el problema o agrega servicios al carrito');
      return;
    }

    setLoading(true);
    
    try {
      const requestData = {
        cliente_id: user?.id || 1,
        categoria_id: selectedCategory?.id || 2,
        titulo: selectedService?.nombre || 'Solicitud de servicio',
        descripcion: description,
        direccion_servicio: 'Av. Corrientes 1234, CABA',
        latitud: -34.6037,
        longitud: -58.3816,
        cuando_necesita: urgency,
        quien_provee_materiales: whoProvidesMaterials,
        necesita_multiples_servicios: cartItems.length > 1,
        cantidad_servicios: cartItems.length,
        servicios_carrito: cartItems.map(item => ({
          servicio_id: item.servicio_id,
          cantidad: item.cantidad,
          descripcion: item.descripcion,
          multiplicadores: {
            altura: height,
            complejidad: complexity,
            distancia: distance
          }
        })),
        descripcion_ai: aiSummary,
        precio_estimado: estimatedPrice || getTotalCartPrice() * getUrgencyMultiplier()
      };

      const response = await requestService.createRequest(requestData);
      
      if (response.success) {
        navigate('/client/searching-professional', {
          state: {
            requestId: response.data.solicitud_id,
            serviceData: {
              categoryId: selectedCategory?.id,
              category: selectedCategory?.nombre,
              service: selectedService?.nombre,
              description: description,
              aiSummary: aiSummary,
              estimatedPrice: response.data.precio_estimado
            }
          }
        });
      } else {
        throw new Error(response.message || 'Error al crear solicitud');
      }
    } catch (error) {
      console.error('Error creando solicitud:', error);
      alert('Error al enviar la solicitud. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header rojo */}
      <div className="bg-red-600 h-16 w-full relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {/* Botón carrito */}
        <button
          onClick={() => setShowCart(!showCart)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartItems.length}
              </span>
            )}
          </div>
        </button>
      </div>
      
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            <span className="text-blue-600">ServiLink Pro</span>
          </h1>
        </div>

        {/* Subtítulo */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Detalla tu solicitud
          </h2>
          <p className="text-gray-600 text-sm">
            Servicio de: <span className="text-blue-600 font-medium">{selectedCategory?.nombre}</span>
          </p>
        </div>

        {/* Urgencia */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Cuándo necesitas el servicio?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setUrgency('hoy')}
              className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                urgency === 'hoy'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              ⏰ HOY (+80%)
            </button>
            <button
              onClick={() => setUrgency('manana')}
              className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                urgency === 'manana'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Mañana (+50%)
            </button>
            <button
              onClick={() => setUrgency('esta_semana')}
              className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                urgency === 'esta_semana'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Esta semana (+20%)
            </button>
            <button
              onClick={() => setUrgency('normal')}
              className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                urgency === 'normal'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Sin apuro
            </button>
          </div>
        </div>

        {/* Descripción del problema */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Describe el problema
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleProcessWithAI}
            placeholder="Ej: El grifo de la cocina no deja de gotear y hace un ruido extraño."
            className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows="4"
          />
          
          {processingAI && (
            <div className="mt-2 text-sm text-blue-600 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Analizando con AI...
            </div>
          )}
        </div>

        {/* Resumen AI */}
        {aiSummary && (
          <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 mb-2">Resumen AI</h4>
                <p className="text-sm text-blue-700">{aiSummary.problema_principal}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {aiSummary.sintomas?.map((sintoma, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {sintoma}
                    </span>
                  ))}
                </div>
                {aiSummary.urgencia_detectada && (
                  <p className="text-xs text-blue-600 mt-2">
                    Urgencia detectada: <span className="font-medium">{aiSummary.urgencia_detectada}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Servicios sugeridos por AI */}
        {aiSuggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
              Servicios sugeridos por AI
            </h3>
            <div className="space-y-2">
              {aiSuggestions.map((service) => (
                <div key={service.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{service.nombre}</h4>
                      <p className="text-sm text-gray-600">${service.precio_base}</p>
                    </div>
                    <button
                      onClick={() => addToCart(service)}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios disponibles */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Agregar servicios adicionales
          </h3>
          <div className="space-y-2">
            {availableServices.slice(0, 4).map((service) => (
              <div key={service.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{service.nombre}</h4>
                    <p className="text-sm text-gray-600">${service.precio_base}</p>
                  </div>
                  <button
                    onClick={() => addToCart(service)}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quien provee materiales */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Quién provee los materiales?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setWhoProvidesMaterials('profesional')}
              className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                whoProvidesMaterials === 'profesional'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              ✅ El profesional
            </button>
            <button
              onClick={() => setWhoProvidesMaterials('cliente')}
              className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                whoProvidesMaterials === 'cliente'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              📦 Yo los tengo
            </button>
          </div>
        </div>

        {/* Botón adjuntar foto */}
        <button
          type="button"
          className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-xl font-medium text-base hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2 mb-6"
        >
          <Camera className="w-5 h-5" />
          <span>Adjuntar Foto del Problema</span>
        </button>

        {/* Precio estimado */}
        {(estimatedPrice || cartItems.length > 0) && (
          <div className="mb-6 bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-medium">Precio estimado:</span>
              <span className="text-2xl font-bold text-green-600">
                ${estimatedPrice || getTotalCartPrice() * getUrgencyMultiplier()}
              </span>
            </div>
            <p className="text-xs text-green-700 mt-2">
              * Precio sujeto a evaluación del profesional
            </p>
          </div>
        )}

        {/* Botón buscar profesional */}
        <button
          onClick={handleSubmit}
          disabled={loading || (!description.trim() && cartItems.length === 0)}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Buscar Profesional'}
        </button>
      </div>

      {/* Carrito lateral */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Carrito de Servicios
                </h3>
                <button onClick={() => setShowCart(false)} className="text-gray-500">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Carrito vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.servicio_id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-800 text-sm">{item.nombre}</h4>
                        <button
                          onClick={() => removeFromCart(item.servicio_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.servicio_id, item.cantidad - 1)}
                            className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item.servicio_id, item.cantidad + 1)}
                            className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          ${item.precio_base * item.cantidad}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-800">Total base:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${getTotalCartPrice()}
                  </span>
                </div>
                {urgency !== 'normal' && (
                  <p className="text-xs text-gray-600">
                    * Se aplicará multiplicador por urgencia: x{getUrgencyMultiplier()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;