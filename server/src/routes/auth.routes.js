const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, createAdmin } = require('../controllers/auth.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Only logged-in admins can hit this — restrictTo checks userType, 
// the SUPER_ADMIN check happens inside the controller itself
router.post('/create-admin', protect, restrictTo('ADMIN'), createAdmin);

module.exports = router;