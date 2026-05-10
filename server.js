process.on('uncaughtException', (err) => { console.error('🚨 CRITICAL UNCAUGHT ERROR:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('🚨 UNHANDLED REJECTION:', reason); });

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const Device = require('./models/Device');
const apiRoutes = require('./routes/api');
const config = require('./config');
const logger = require('./utils/logger');
const { validateLocationData } = require('./utils/geolocation');

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Rutas API
app.use('/api', apiRoutes);

// La ruta principal se manejará al final para soportar SPA

// Conectar a MongoDB
mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    logger.info('✓ Conectado a MongoDB correctamente');
  })
  .catch((error) => {
    logger.error('⚠️ No se pudo conectar a MongoDB. El sistema funcionará sin persistencia:', error.message);
    // Se elimina process.exit(1) para permitir que el servidor web inicie
  });

// Soporte para enrutamiento del lado del cliente (React Router SPA)
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Almacenar usuarios conectados
const connectedUsers = new Map();

io.on('connection', (socket) => {
  logger.info(`👤 Usuario conectado: ${socket.id}`);

  // Guardar ubicación del dispositivo
  socket.on('updateLocation', async (data) => {
    try {
      // Validar datos
      const validation = validateLocationData(data);
      if (!validation.valid) {
        logger.warn(`⚠️ Ubicación inválida: ${validation.error}`);
        socket.emit('error', { message: validation.error });
        return;
      }

      const { deviceId, name, lat, lon } = data;
      
      // Intentar persistir en BD si está conectada
      let finalDeviceId = deviceId;
      let finalLastSeen = new Date();
      
      try {
        if (mongoose.connection.readyState === 1) {
          const device = await Device.findByIdAndUpdate(
            deviceId,
            {
              name: name,
              location: { lat, lon },
              lastSeen: new Date(),
            },
            { upsert: true, new: true }
          );
          finalDeviceId = device._id;
          finalLastSeen = device.lastSeen;
        }
      } catch (dbError) {
        logger.warn(`⚠️ Error de persistencia en BD: ${dbError.message}`);
      }

      // Almacenar en memoria (Siempre funciona)
      connectedUsers.set(socket.id, {
        deviceId: finalDeviceId,
        name: name,
        lat: lat,
        lon: lon,
      });

      // Transmitir ubicación a todos los conectados
      io.emit('locationUpdate', {
        deviceId: finalDeviceId,
        name: name,
        location: { lat, lon },
        lastSeen: finalLastSeen,
      });

      logger.debug(`📍 Ubicación actualizada - ${name}: (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    } catch (error) {
      logger.error('❌ Error general al actualizar ubicación:', error.message);
      socket.emit('error', { message: 'Error al procesar ubicación' });
    }
  });

  // Señalización WebRTC - Offer
  socket.on('offer', (data) => {
    logger.debug(`📤 Offer recibido de: ${socket.id}`);
    if (data.to) {
        io.to(data.to).emit('offer', {
          from: socket.id,
          offer: data.offer,
        });
    } else {
        socket.broadcast.emit('offer', {
          from: socket.id,
          offer: data.offer,
        });
    }
  });

  // Señalización WebRTC - Answer
  socket.on('answer', (data) => {
    logger.debug(`📥 Answer recibido de: ${socket.id}`);
    io.to(data.to).emit('answer', {
      from: socket.id,
      answer: data.answer,
    });
  });
  
  // Registro específico de sesión
  socket.on('registerSessionDevice', async (data) => {
      const { token, name } = data;
      logger.info(`Dispositivo registrado en sesión temporal: ${token}`);
      // Lo unimos a una sala específica del token
      socket.join(token);
      // Notificamos a cualquiera escuchando en esa sala (dashboard)
      io.to(token).emit('sessionConnected', { from: socket.id, name });
      
      // También hacemos broadcast de actualización de locación simulada
      // Para que el dashboard que no está en salas lo detecte (como el demo actual)
      io.emit('locationUpdate', {
         deviceId: token,
         name: name,
         location: null,
         lastSeen: new Date()
      });
  });

  // Señalización WebRTC - ICE Candidates
  socket.on('ice-candidate', (data) => {
    logger.debug(`❄️ ICE Candidate recibido`);
    io.to(data.to).emit('ice-candidate', {
      from: socket.id,
      candidate: data.candidate,
    });
  });

  socket.on('disconnect', () => {
    logger.info(`👤 Usuario desconectado: ${socket.id}`);
    connectedUsers.delete(socket.id);
    io.emit('userDisconnected', socket.id);
  });

  socket.on('error', (error) => {
    logger.error(`❌ Error en socket ${socket.id}:`, error);
  });
});

server.listen(config.PORT, () => {
  logger.info(`
  ╔═══════════════════════════════════════╗
  ║   🎯 Sistema de Monitoreo en Vivo     ║
  ║                                       ║
  ║   Servidor corriendo en:              ║
  ║   http://localhost:${config.PORT}         ║
  ║                                       ║
  ║   Versión: 1.0.0                   ║
  ║   Entorno: ${config.NODE_ENV}            ║
  ╚═══════════════════════════════════════╝
  `);
  
  logger.info('✓ Socket.IO listo para conexiones');
  logger.info('✓ Rutas API disponibles en /api');
  logger.info('✓ Dashboard disponible en /');
});