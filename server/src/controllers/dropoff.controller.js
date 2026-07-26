const prisma = require('../config/prisma');
const { ensureUniqueCode } = require('../services/points.service');


// Fixed points rate
const POINTS_PER_KG = 10;



// Business staff logs a drop-off by entering user's unique code
const logDropOff = async (req, res, next) => {
  try {
    const { uniqueCode, materialType, quantityKg } = req.body;

    // Find the user by unique code
    const profile = await prisma.sellerProfile.findUnique({
      where: { uniqueCode },
      include: { user: true },
    });

    if (!profile) {
      return res.status(404).json({ error: 'User code not found.' });
    }

    // Find which collection point this business staff belongs to
    const collectionPoint = await prisma.collectionPoint.findFirst({
      where: { sellerId: req.user.id, isActive: true },
    });

    if (!collectionPoint) {
      return res.status(403).json({ error: 'No active collection point found for your account.' });
    }

    // Check user is registered at this collection point
    const balance = await prisma.pointsBalance.findUnique({
      where: {
        userId_collectionPointId: {
          userId: profile.userId,
          collectionPointId: collectionPoint.id,
        },
      },
    });

    if (!balance) {
      return res.status(400).json({
        error: 'This user is not registered at your collection point.',
      });
    }

    const pointsAwarded = Math.round(parseFloat(quantityKg) * 10);

    const dropOff = await prisma.dropOff.create({
      data: {
        userId: profile.userId,
        collectionPointId: collectionPoint.id,
        materialType,
        quantityKg: parseFloat(quantityKg),
        pointsAwarded,
        loggedBy: req.user.id,
      },
    });

    // Add to specific collection point balance
    await prisma.pointsBalance.update({
      where: {
        userId_collectionPointId: {
          userId: profile.userId,
          collectionPointId: collectionPoint.id,
        },
      },
      data: { points: { increment: pointsAwarded } },
    });

    // Add to global points total
    await prisma.sellerProfile.update({
      where: { userId: profile.userId },
      data: { points: { increment: pointsAwarded } },
    });

    await prisma.notification.create({
      data: {
        userId: profile.userId,
        title: 'Points earned!',
        body: `You earned ${pointsAwarded} points at ${collectionPoint.name}.`,
        type: 'POINTS_EARNED',
        data: { pointsAwarded, dropOffId: dropOff.id },
      },
    });

    res.status(201).json({ message: 'Drop-off logged', dropOff, pointsAwarded });
  } catch (err) {
    next(err);
  }
};

// User redeems points for a voucher
const redeemVoucher = async (req, res, next) => {
  try {
    const { pointsToRedeem, partner } = req.body;

    // 100 points = 500 KES voucher
    const POINTS_PER_VOUCHER = 50;
    const KES_PER_VOUCHER = 500;

    if (pointsToRedeem < POINTS_PER_VOUCHER) {
      return res.status(400).json({ 
        error: `Minimum ${POINTS_PER_VOUCHER} points required to redeem.` 
      });
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (profile.points < pointsToRedeem) {
      return res.status(400).json({ error: 'Insufficient points.' });
    }

    const voucherValue = Math.floor(pointsToRedeem / POINTS_PER_VOUCHER) * KES_PER_VOUCHER;
    const voucherCode = `VCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const voucher = await prisma.voucher.create({
      data: {
        userId: req.user.id,
        pointsUsed: pointsToRedeem,
        value: voucherValue,
        partner: partner || 'General',
        code: voucherCode,
      },
    });

    // Deduct points
    await prisma.sellerProfile.update({
      where: { userId: req.user.id },
      data: { points: { decrement: pointsToRedeem } },
    });

    res.status(201).json({ 
      message: `Voucher created! Worth KES ${voucherValue}`, 
      voucher 
    });
  } catch (err) {
    next(err);
  }
};

const getMyVouchers = async (req, res, next) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ vouchers });
  } catch (err) {
    next(err);
  }
};

module.exports = { logDropOff, redeemVoucher, getMyVouchers };