// src/services/whatsappService.js - Servicio completo de WhatsApp
export const whatsappService = {
  // Número de WhatsApp Business de la empresa
  BUSINESS_NUMBER: '+5491123456789',
  
  // Abrir chat de WhatsApp con mensaje predefinido
  openChat: (phoneNumber, message = '') => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  },

  // Templates de mensajes
  templates: {
    newService: (serviceName, clientName) => 
      `¡Hola! Soy ${clientName} y necesito un servicio de ${serviceName}. ¿Podrías ayudarme?`,
    
    confirmArrival: (address) => 
      `El profesional está en camino a ${address}. Llegará en aproximadamente 15 minutos.`,
    
    serviceComplete: (serviceId) => 
      `Servicio #${serviceId} completado. Por favor califica tu experiencia.`,
    
    emergency: (location) => 
      `⚠️ EMERGENCIA: Necesito ayuda urgente en ${location}`,
    
    quote: (service, description) => 
      `Hola, necesito un presupuesto para: ${service}\n\nDescripción: ${description}`,
    
    schedule: (date, time) => 
      `Confirmo la cita para el ${date} a las ${time}hs`,
  },

  // Botón flotante de WhatsApp
  createFloatingButton: (container) => {
    const button = document.createElement('div');
    button.className = 'whatsapp-float-button';
    button.innerHTML = `
      <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2c-.122.425.313.87.748.748l3.032-.892A9.935 9.935 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
      </svg>
    `;
    button.onclick = () => whatsappService.openBusinessChat();
    container.appendChild(button);
  },

  // Abrir chat con el negocio
  openBusinessChat: (message = '') => {
    whatsappService.openChat(whatsappService.BUSINESS_NUMBER, message);
  }
};