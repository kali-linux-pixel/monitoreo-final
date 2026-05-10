const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  deviceName: String,
  status: { type: String, enum: ['pending', 'active', 'finished'], default: 'pending' },
  createdAt: { type: Date, default: Date.now, expires: 3600 * 24 }, // Automatically expire after 24 hours
  expiresAt: Date,
  locationHistory: [
    {
      lat: Number,
      lon: Number,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Session', SessionSchema);
