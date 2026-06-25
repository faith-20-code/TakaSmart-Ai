const prisma = require('../config/prisma');

const createListing = async (req, res, next) => {
  try {
    const { 
      title, description, materialType, quantityKg, 
      images, locationLat, locationLng, plusCode, areaName 
    } = req.body;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const listing = await prisma.listing.create({
      data: {
        sellerId: req.user.id,
        title,
        description,
        materialType,
        quantityKg: parseFloat(quantityKg),
        images: images || [],
        locationLat: parseFloat(locationLat),
        locationLng: parseFloat(locationLng),
        plusCode,
        areaName,
        expiresAt,
      },
      include: { seller: { select: { name: true, phoneNumber: true } } },
    });

    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (err) {
    next(err);
  }
};

const getListings = async (req, res, next) => {
  try {
    const { materialType, status = 'ACTIVE', page = 1, limit = 20 } = req.query;

    const where = { status };
    if (materialType) where.materialType = materialType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const listings = await prisma.listing.findMany({
      where,
      include: { 
        seller: { select: { name: true } },
        _count: { select: { interests: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.listing.count({ where });

    res.json({ listings, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { sellerId: req.user.id },
      include: { _count: { select: { interests: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ listings });
  } catch (err) {
    next(err);
  }
};

module.exports = { createListing, getListings, getMyListings };