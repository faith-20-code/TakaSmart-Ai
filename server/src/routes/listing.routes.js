const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { createListing, getListings, getMyListings } = require('../controllers/listing.controller');

router.get('/', getListings);                                          // public — anyone can browse
router.get('/my', protect, restrictTo('SELLER'), getMyListings);        // seller only
router.post('/', protect, restrictTo('SELLER'), createListing);         // seller only

module.exports = router;