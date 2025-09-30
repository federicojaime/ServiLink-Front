// src/services/locationService.js - Servicio completo de geolocalización
export const locationService = {
  // Obtener ubicación actual
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  // Observar cambios de ubicación
  watchPosition: (callback, errorCallback) => {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocalización no soportada'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  },

  // Calcular distancia entre dos puntos
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Geocoding (dirección a coordenadas)
  geocodeAddress: async (address) => {
    // Aquí iría la integración con Google Maps Geocoding API
    // Por ahora retornamos coordenadas de ejemplo
    return {
      lat: -34.603722,
      lng: -58.381592,
      formatted_address: address
    };
  },

  // Reverse Geocoding (coordenadas a dirección)
  reverseGeocode: async (lat, lng) => {
    // Aquí iría la integración con Google Maps Reverse Geocoding API
    // Por ahora retornamos dirección de ejemplo
    return {
      street: 'Av. Corrientes',
      number: '1234',
      city: 'CABA',
      province: 'Buenos Aires',
      country: 'Argentina',
      formatted_address: 'Av. Corrientes 1234, CABA, Buenos Aires'
    };
  },

  // Obtener tiempo estimado de llegada
  getETA: (distance) => {
    // Estimado: 30 km/h promedio en ciudad
    const hours = distance / 30;
    const minutes = Math.round(hours * 60);
    return minutes;
  },

  // Verificar si una ubicación está dentro del radio de cobertura
  isWithinRadius: (centerLat, centerLng, pointLat, pointLng, radiusKm) => {
    const distance = locationService.calculateDistance(
      centerLat, centerLng, pointLat, pointLng
    );
    return distance <= radiusKm;
  }
};