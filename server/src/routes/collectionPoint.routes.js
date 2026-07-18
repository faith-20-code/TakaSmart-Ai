const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { 
  createCollectionPoint, 
  getCollectionPoints, 
  getMyCollectionPoints 
} = require('../controllers/collectionPoint.controller');

router.get('/', getCollectionPoints);
router.get('/my', protect, restrictTo('SELLER'), getMyCollectionPoints);
router.post('/', protect, restrictTo('SELLER'), createCollectionPoint);

module.exports = router;