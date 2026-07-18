const prisma = require('../config/prisma');


const createCollectionPoint = async (req, res, next) => {
  try {
    // Only business accounts can create collection points
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile || profile.accountType !== 'BUSINESS') {
      return res.status(403).json({ 
        error: 'Only business accounts can list collection points.' 
      });
    }

    const { name, address, locationLat, locationLng, areaName, materials } = req.body;

    const point = await prisma.collectionPoint.create({
      data: {
        sellerId: req.user.id,
        name,
        address,
        locationLat: parseFloat(locationLat),
        locationLng: parseFloat(locationLng),
        areaName,
        materials: materials || [],
      },
    });

    res.status(201).json({ message: 'Collection point created', point });
  } catch (err) {
    next(err);
  }
};

const getCollectionPoints = async (req, res, next) => {
  try {
    const points = await prisma.collectionPoint.findMany({
      where: { isActive: true },
      include: { seller: { select: { name: true, sellerProfile: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ points });
  } catch (err) {
    next(err);
  }
};

const getMyCollectionPoints = async (req, res, next) => {
  try {
    const points = await prisma.collectionPoint.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ points });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCollectionPoint, getCollectionPoints, getMyCollectionPoints };