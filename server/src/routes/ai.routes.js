const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { analyseListing } = require('../services/ai.service');

// POST /api/ai/analyse
// Called after seller uploads a photo — returns condition + price suggestion
router.post('/analyse', protect, restrictTo('SELLER'), async (req, res, next) => {
  try {
    const { imageUrl, materialType, quantityKg } = req.body;

    if (!imageUrl || !materialType || !quantityKg) {
      return res.status(400).json({ 
        error: 'imageUrl, materialType and quantityKg are required.' 
      });
    }

    const analysis = await analyseListing(imageUrl, materialType, quantityKg);
    res.json({ analysis });
  } catch (err) {
    next(err);
  }
});

module.exports = router;