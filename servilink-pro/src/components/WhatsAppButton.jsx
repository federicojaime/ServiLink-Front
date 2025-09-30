// src/components/WhatsAppButton.jsx
import React from 'react';
import { whatsappService } from '../services/whatsappService';

const WhatsAppButton = ({ 
  phoneNumber, 
  message = '', 
  variant = 'default',
  className = '',
  children 
}) => {
  const handleClick = () => {
    whatsappService.openChat(phoneNumber || whatsappService.BUSINESS_NUMBER, message);
  };

  const getButtonClass = () => {
    switch(variant) {
      case 'floating':
        return 'fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all z-50';
      case 'inline':
        return 'inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors';
      default:
        return 'w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${getButtonClass()} ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2c-.122.425.313.87.748.748l3.032-.892A9.935 9.935 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
      </svg>
      {children || <span>WhatsApp</span>}
    </button>
  );
};

export default WhatsAppButton;