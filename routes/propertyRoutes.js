const express = require('express');
const router = express.Router();

// Just a placeholder route
router.get('/', (req, res) => {
  res.send("Property route working!");
});

module.exports = router;
