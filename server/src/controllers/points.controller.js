const prisma = require('../config/prisma');

// User registers at a collection point
const registerAtCollectionPoint = async (req, res, next) => {
  try {
    const { collectionPointId } = req.body;

    const point = await prisma.collectionPoint.findUnique({
      where: { id: collectionPointId },
    });

    if (!point || !point.isActive) {
      return res.status(404).json({ error: 'Collection point not found or inactive.' });
    }

    // Create balance record — upsert so registering twice doesn't fail
    const balance = await prisma.pointsBalance.upsert({
      where: {
        userId_collectionPointId: {
          userId: req.user.id,
          collectionPointId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        collectionPointId,
        points: 0,
      },
    });

    res.status(201).json({ message: 'Registered at collection point', balance });
  } catch (err) {
    next(err);
  }
};

// Get all collection points user is registered at with their balances
const getMyBalances = async (req, res, next) => {
  try {
    const balances = await prisma.pointsBalance.findMany({
      where: { userId: req.user.id },
      include: {
        collectionPoint: {
          select: { id: true, name: true, address: true, areaName: true, materials: true },
        },
      },
      orderBy: { points: 'desc' },
    });

    res.json({ balances });
  } catch (err) {
    next(err);
  }
};

// Get all active collection points — for browse page
const getAvailableCollectionPoints = async (req, res, next) => {
  try {
    const points = await prisma.collectionPoint.findMany({
      where: { isActive: true },
      include: {
        seller: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ points });
  } catch (err) {
    next(err);
  }
};

// Redeem points from a specific collection point balance
const redeemFromBalance = async (req, res, next) => {
  try {
    const { collectionPointId, pointsToRedeem } = req.body;

    const POINTS_PER_VOUCHER = 100;
    const KES_PER_VOUCHER = 500;

    if (pointsToRedeem < POINTS_PER_VOUCHER) {
      return res.status(400).json({
        error: `Minimum ${POINTS_PER_VOUCHER} points required.`,
      });
    }

    const balance = await prisma.pointsBalance.findUnique({
      where: {
        userId_collectionPointId: {
          userId: req.user.id,
          collectionPointId,
        },
      },
      include: { collectionPoint: true },
    });

    if (!balance) {
      return res.status(404).json({ error: 'You are not registered at this collection point.' });
    }

    if (balance.points < pointsToRedeem) {
      return res.status(400).json({ error: 'Insufficient points at this collection point.' });
    }

    const voucherValue = Math.floor(pointsToRedeem / POINTS_PER_VOUCHER) * KES_PER_VOUCHER;
    const voucherCode = `VCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const voucher = await prisma.voucher.create({
      data: {
        userId: req.user.id,
        pointsUsed: pointsToRedeem,
        value: voucherValue,
        partner: balance.collectionPoint.name,
        code: voucherCode,
      },
    });

    // Deduct from specific balance
    await prisma.pointsBalance.update({
      where: {
        userId_collectionPointId: {
          userId: req.user.id,
          collectionPointId,
        },
      },
      data: { points: { decrement: pointsToRedeem } },
    });

    // Deduct from global points total on sellerProfile
    await prisma.sellerProfile.update({
      where: { userId: req.user.id },
      data: { points: { decrement: pointsToRedeem } },
    });

    res.status(201).json({
      message: `Voucher created! Worth KES ${voucherValue} at ${balance.collectionPoint.name}`,
      voucher,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {registerAtCollectionPoint, getMyBalances, getAvailableCollectionPoints, redeemFromBalance,
};