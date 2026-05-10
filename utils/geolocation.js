// Utilidades para Geolocalización

const config = require('../config');

/**
 * Validar coordenadas de ubicación
 * @param {Number} lat - Latitud
 * @param {Number} lon - Longitud
 * @returns {Boolean} True si son válidas
 */
function isValidCoordinates(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Calcular distancia entre dos puntos usando la fórmula de Haversine
 * @param {Number} lat1 - Latitud punto 1
 * @param {Number} lon1 - Longitud punto 1
 * @param {Number} lat2 - Latitud punto 2
 * @param {Number} lon2 - Longitud punto 2
 * @returns {Number} Distancia en kilómetros
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validar datos de ubicación
 * @param {Object} locationData - Datos de ubicación
 * @returns {Object} {valid: Boolean, error: String|null}
 */
function validateLocationData(locationData) {
  if (!locationData) {
    return { valid: false, error: 'Datos de ubicación vacíos' };
  }

  const { lat, lon, deviceId, name } = locationData;

  if (!deviceId) {
    return { valid: false, error: 'deviceId requerido' };
  }

  if (!isValidCoordinates(lat, lon)) {
    return { valid: false, error: 'Coordenadas inválidas' };
  }

  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Nombre de dispositivo inválido' };
  }

  return { valid: true, error: null };
}

/**
 * Obtener intervalo de actualización de ubicación
 * @returns {Number} Intervalo en milisegundos
 */
function getLocationUpdateInterval() {
  return config.LOCATION_UPDATE_INTERVAL;
}

module.exports = {
  isValidCoordinates,
  calculateDistance,
  validateLocationData,
  getLocationUpdateInterval,
};
