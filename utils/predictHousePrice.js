// backend/utils/predictHousePrice.js
module.exports = function predictHousePrice(data) {
  const { area, bedrooms, bathrooms, yearBuilt, location } = data;

  const basePrice = 50000;
  const locationBonusKeywords = ['hospital', 'school', 'airport', 'bus stand', 'railway'];

  let locationBonus = 0;
  const lowerLocation = location.toLowerCase();

  locationBonusKeywords.forEach(keyword => {
    if (lowerLocation.includes(keyword)) {
      locationBonus += 50000;
    }
  });

  const price =
    basePrice +
    area * 1000 +
    bedrooms * 10000 +
    bathrooms * 8000 -
    (2025 - yearBuilt) * 500 +
    locationBonus;

  return Promise.resolve(Math.round(price));
};
