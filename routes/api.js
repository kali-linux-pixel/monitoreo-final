// Rutas API para el sistema de monitoreo

const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const router = express.Router();
const Device = require('../models/Device');
const Session = require('../models/Session');
const logger = require('../utils/logger');

/**
 * POST /api/sessions/generate
 * Genera un token QR temporal
 */
router.post('/sessions/generate', async (req, res) => {
  try {
    const token = crypto.randomBytes(6).toString('hex'); // genera ej. 'a3b8c9d2e1f0'
    const { deviceName } = req.body;

    let newSession;
    if (mongoose.connection.readyState === 1) {
      newSession = new Session({
        token,
        deviceName: deviceName || 'Dispositivo Remoto',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      });
      await newSession.save();
    } else {
      // Mock fallback for demo if no DB
      newSession = { token, deviceName, status: 'pending' };
    }

    res.json({
      success: true,
      data: newSession
    });
  } catch (error) {
    logger.error('Error al generar sesión:', error.message);
    res.status(500).json({ success: false, error: 'Error al generar sesión' });
  }
});

/**
 * GET /api/sessions/:token
 * Valida sesión
 */
router.get('/sessions/:token', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const session = await Session.findOne({ token: req.params.token });
      if (!session) {
        return res.status(404).json({ success: false, error: 'Sesión no encontrada o expirada' });
      }
      return res.json({ success: true, data: session });
    }
    // En modo fallback, cualquier sesión es válida para la demo
    res.json({ success: true, data: { token: req.params.token, deviceName: 'Modo Demostración' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error de validación' });
  }
});

/**
 * GET /api/devices
 * Obtener todos los dispositivos
 */
router.get('/devices', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        warning: 'Database disconnected'
      });
    }
    const devices = await Device.find();
    res.json({
      success: true,
      data: devices,
      count: devices.length,
    });
  } catch (error) {
    logger.error('Error al obtener dispositivos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener dispositivos',
    });
  }
});

/**
 * GET /api/devices/:id
 * Obtener un dispositivo por ID
 */
router.get('/devices/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Dispositivo no encontrado',
      });
    }

    res.json({
      success: true,
      data: device,
    });
  } catch (error) {
    logger.error('Error al obtener dispositivo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener dispositivo',
    });
  }
});

/**
 * POST /api/devices
 * Crear un nuevo dispositivo
 */
router.post('/devices', async (req, res) => {
  try {
    const { name, lat, lon } = req.body;

    const newDevice = new Device({
      name,
      location: { lat, lon },
      lastSeen: new Date(),
    });

    const savedDevice = await newDevice.save();

    res.status(201).json({
      success: true,
      data: savedDevice,
    });
  } catch (error) {
    logger.error('Error al crear dispositivo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al crear dispositivo',
    });
  }
});

/**
 * PUT /api/devices/:id
 * Actualizar un dispositivo
 */
router.put('/devices/:id', async (req, res) => {
  try {
    const { name, lat, lon } = req.body;

    const updatedDevice = await Device.findByIdAndUpdate(
      req.params.id,
      {
        name,
        location: { lat, lon },
        lastSeen: new Date(),
      },
      { new: true }
    );

    if (!updatedDevice) {
      return res.status(404).json({
        success: false,
        error: 'Dispositivo no encontrado',
      });
    }

    res.json({
      success: true,
      data: updatedDevice,
    });
  } catch (error) {
    logger.error('Error al actualizar dispositivo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar dispositivo',
    });
  }
});

/**
 * DELETE /api/devices/:id
 * Eliminar un dispositivo
 */
router.delete('/devices/:id', async (req, res) => {
  try {
    const deletedDevice = await Device.findByIdAndDelete(req.params.id);

    if (!deletedDevice) {
      return res.status(404).json({
        success: false,
        error: 'Dispositivo no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Dispositivo eliminado',
      data: deletedDevice,
    });
  } catch (error) {
    logger.error('Error al eliminar dispositivo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar dispositivo',
    });
  }
});

/**
 * GET /api/status
 * Obtener estado del sistema
 */
router.get('/status', async (req, res) => {
  try {
    const deviceCount = await Device.countDocuments();

    res.json({
      success: true,
      data: {
        status: 'online',
        timestamp: new Date(),
        totalDevices: deviceCount,
        uptime: process.uptime(),
        version: require('../package.json').version,
      },
    });
  } catch (error) {
    logger.error('Error al obtener estado:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estado del sistema',
    });
  }
});

module.exports = router;
