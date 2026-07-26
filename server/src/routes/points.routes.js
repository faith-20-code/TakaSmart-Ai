const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  registerAtCollectionPoint,
  getMyBalances,
  getAvailableCollectionPoints,
  redeemFromBalance,
} = require('../controllers/points.controller');

router.get('/collection-points', getAvailableCollectionPoints);
router.get('/balances', protect, restrictTo('SELLER'), getMyBalances);
router.post('/register', protect, restrictTo('SELLER'), registerAtCollectionPoint);
router.post('/redeem', protect, restrictTo('SELLER'), redeemFromBalance);

module.exports = router;