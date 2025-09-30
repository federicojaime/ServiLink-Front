// src/pages/shared/ChatScreen.jsx - Chat interno completo
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Camera, Paperclip, Phone, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import WhatsAppButton from '../../components/WhatsAppButton';

const ChatScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { appointmentId, otherUser } = location.state || {};
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    loadMessages();
    // Simular conexión WebSocket
    const interval = setInterval(checkNewMessages, 5000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    // Mensajes de ejemplo
    setMessages([
      {
        id: 1,
        sender: 'other',
        message: '¡Hola! Soy Roberto, el electricista asignado para tu servicio.',
        time: '10:30',
        read: true
      },
      {
        id: 2,
        sender: 'me',
        message: 'Hola Roberto! Gracias por contactarme.',
        time: '10:32',
        read: true
      },
      {
        id: 3,
        sender: 'other',
        message: 'Estoy en camino, llegaré en aproximadamente 15 minutos.',
        time: '10:35',
        read: true
      },
      {
        id: 4,
        sender: 'other',
        message: '📍 Compartiendo ubicación en tiempo real',
        type: 'location',
        time: '10:36',
        read: true
      }
    ]);
  };

  const checkNewMessages = () => {
    // Aquí iría la lógica para verificar nuevos mensajes
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      sender: 'me',
      message: newMessage,
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simular respuesta
    simulateTyping();
  };

  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response = {
        id: messages.length + 2,
        sender: 'other',
        message: 'Perfecto, ya estoy llegando a tu domicilio.',
        time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Aquí iría la lógica de upload
      const imageMessage = {
        id: messages.length + 1,
        sender: 'me',
        type: 'image',
        message: URL.createObjectURL(file),
        time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      setMessages([...messages, imageMessage]);
    }
  };

  const renderMessage = (msg) => {
    const isMe = msg.sender === 'me';
    
    if (msg.type === 'image') {
      return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
          <div className={`max-w-xs ${isMe ? 'bg-blue-600' : 'bg-gray-200'} rounded-2xl p-2`}>
            <img src={msg.message} alt="Imagen" className="rounded-lg w-full" />
            <p className={`text-xs ${isMe ? 'text-blue-100' : 'text-gray-500'} mt-1 px-2`}>
              {msg.time}
            </p>
          </div>
        </div>
      );
    }

    if (msg.type === 'location') {
      return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
          <div className={`max-w-xs ${isMe ? 'bg-blue-600' : 'bg-gray-200'} rounded-2xl p-3`}>
            <div className="bg-white rounded-lg p-2 mb-2">
              <div className="h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
            </div>
            <p className={`text-sm ${isMe ? 'text-white' : 'text-gray-800'}`}>
              {msg.message}
            </p>
            <p className={`text-xs ${isMe ? 'text-blue-100' : 'text-gray-500'} mt-1`}>
              {msg.time}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs px-4 py-3 rounded-2xl ${
          isMe ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
        }`}>
          <p className="text-sm">{msg.message}</p>
          <div className="flex items-center justify-end mt-1 space-x-1">
            <p className={`text-xs ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
              {msg.time}
            </p>
            {isMe && (
              <span className="text-xs">
                {msg.read ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {otherUser?.nombre?.charAt(0) || 'R'}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800">
                  {otherUser?.nombre || 'Roberto Funes'}
                </h3>
                <p className="text-xs text-green-500">En línea</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            
            <WhatsAppButton
              phoneNumber={otherUser?.whatsapp || '+5491123456789'}
              message="Hola, te escribo por el servicio programado"
              variant="inline"
              className="p-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </WhatsAppButton>
            
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-lg relative"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
              
              {showActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                    Ver perfil
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                    Silenciar notificaciones
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">
                    Reportar problema
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Fecha */}
        <div className="text-center mb-6">
          <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
            Hoy
          </span>
        </div>

        {/* Mensajes */}
        {messages.map(msg => (
          <div key={msg.id}>
            {renderMessage(msg)}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Camera className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-lg transition-colors ${
              newMessage.trim() 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default ChatScreen;