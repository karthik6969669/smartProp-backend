// utils/predictLandPrice.js

module.exports = function predictLandPrice(data) {
  const { location, area, landType, soilQuality } = data;

  if (!location || !area || !landType || !soilQuality) {
    throw new Error('Missing required fields');
  }

  // Dummy ML logic (replace with real model later)
  const basePrice = 200; // ₹ per sq.ft
  const adjustmentFactor = 
    (landType.toLowerCase() === 'agricultural' ? 1.0 : 1.3) *
    (soilQuality.toLowerCase() === 'high' ? 1.2 : 1.0);

  const predictedPrice = Math.round(basePrice * area * adjustmentFactor);
  return predictedPrice;
};
