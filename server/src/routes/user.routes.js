const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const prisma = require('../config/prisma');

// Get all notifications for logged in user
router.get('/notifications', protect, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ notifications });
  } catch (err) { next(err); }
});

// Mark a notification as read
router.patch('/notifications/:id/read', protect, async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ message: 'Marked as read.' });
  } catch (err) { next(err); }
});

// Mark all notifications as read
router.patch('/notifications/read-all', protect, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ message: 'All marked as read.' });
  } catch (err) { next(err); }
});

module.exports = router;