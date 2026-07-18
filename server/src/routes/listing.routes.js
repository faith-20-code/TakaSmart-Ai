const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { 
  createListing, getListings, getMyListings, 
  expressInterest, getListingById 
} = require('../controllers/listing.controller');

router.get('/', getListings);
router.get('/my', protect, restrictTo('SELLER'), getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, restrictTo('SELLER'), createListing);
router.post('/:id/interest', protect, restrictTo('BUYER'), expressInterest);

module.exports = router;