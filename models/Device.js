const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  name: String,
  location: { lat: Number, lon: Number },
  lastSeen: Date,
});

const Device = mongoose.model('Device', DeviceSchema);

module.exports = Device;
