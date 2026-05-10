// Configuración del Sistema de Monitoreo

module.exports = {
  // Servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/monitoring',
  MONGODB_OPTIONS: {},

  // Socket.IO
  SOCKET_IO: {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  },

  // Geolocalización
  LOCATION_UPDATE_INTERVAL: 10000, // 10 segundos
  LOCATION_ACCURACY_THRESHOLD: 100, // metros

  // WebRTC
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],

  // Límites
  MAX_DEVICES: 100,
  SESSION_TIMEOUT: 3600000, // 1 hora

  // Google Maps (para frontend)
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY',

  // JWT (para autenticación futura)
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
  JWT_EXPIRY: '24h',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
