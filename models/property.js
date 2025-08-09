const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String,
  pincode: String,
  nearbyPlaces: [String],
  size: String,
  roadWidth: String,
  zoneType: String,
  buildYear: String,
  floors: String,
  houseType: String,
  photos: [String], // Image URLs (optional)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', PropertySchema);
