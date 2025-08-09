const express = require('express');
const router = express.Router();
const predictHousePrice = require('../utils/predictHousePrice');
const predictLandPrice = require('../utils/predictLandPrice');
const Prediction = require('../models/Prediction'); // Model to store data

// House price prediction
router.post('/house', async (req, res) => {
  try {
    const inputData = req.body;
    const predictedPrice = await predictHousePrice(inputData); // Call ML model

    // Store the input + result in DB
    await Prediction.create({ ...inputData, predictedPrice, type: 'house' });

    res.json({ predictedPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

// Land price prediction
router.post('/land', async (req, res) => {
  try {
    const inputData = req.body;
    const predictedPrice = await predictLandPrice(inputData);

    await Prediction.create({ ...inputData, predictedPrice, type: 'land' });

    res.json({ predictedPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

module.exports = router;
