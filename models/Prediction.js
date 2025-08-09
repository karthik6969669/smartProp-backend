const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  // Common fields
  location: { type: String, required: true },
  area: { type: Number, required: true }, // Use "area" instead of "size" for consistency
  predictedPrice: { type: Number },
  type: { type: String, enum: ['house', 'land'], required: true },

  // House-specific fields
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  yearBuilt: { type: Number },

  // Land-specific fields
  landType: { type: String },
  soilQuality: { type: String },

  // Timestamp
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
