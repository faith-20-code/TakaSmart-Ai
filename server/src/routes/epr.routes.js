const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { getDailyIncoming, getDailyOutgoing, getMonthlyEPRReport, downloadMonthlyEPR } = require('../controllers/epr.controller');


// All EPR routes are business only
router.get('/incoming', protect, restrictTo('SELLER'), getDailyIncoming);
router.get('/outgoing', protect, restrictTo('SELLER'), getDailyOutgoing);
router.get('/monthly', protect, restrictTo('SELLER'), getMonthlyEPRReport);
router.get('/download', protect, restrictTo('SELLER'), downloadMonthlyEPR);

module.exports = router;