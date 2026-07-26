const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { 
  createListing, getListings, getMyListings, 
  expressInterest, getListingById, respondToInterest, getListingInterests, 
} = require('../controllers/listing.controller');

router.get('/', getListings);
router.get('/my', protect, restrictTo('PERSONAL', 'BUSINESS'), getMyListings);
router.get('/:id', getListingById);
router.get('/:id/interests', protect, restrictTo('SELLER'), getListingInterests);
router.post('/', protect, restrictTo('PERSONAL', 'BUSINESS'), createListing);
router.post('/:id/interest', protect, restrictTo('BUYER'), expressInterest);
router.patch('/:id/interest/:interestId', protect, restrictTo('SELLER'), respondToInterest);


module.exports = router;