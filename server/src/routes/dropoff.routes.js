const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { logDropOff, redeemVoucher, getMyVouchers } = require('../controllers/dropoff.controller');

// Business staff logs a drop-off
router.post('/log', protect, restrictTo('SELLER'), logDropOff);

// Personal user redeems points
router.post('/redeem', protect, restrictTo('SELLER'), redeemVoucher);

// Personal user views their vouchers
router.get('/vouchers', protect, restrictTo('SELLER'), getMyVouchers);

module.exports = router;