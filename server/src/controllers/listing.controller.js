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

const expressInterest = async (req, res, next) => {
  try {
    const { message } = req.body;

    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    });

    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.status !== 'ACTIVE') return res.status(400).json({ error: 'Listing is no longer active.' });

    const interest = await prisma.expressInterest.create({
      data: {
        listingId: req.params.id,
        buyerId: req.user.id,
        message,
      },
    });

    // Notify the seller
    await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        title: 'A buyer is interested!',
        body: `${req.user.name} is interested in your listing: ${listing.title}`,
        type: 'INTEREST_RECEIVED',
        data: { listingId: listing.id, interestId: interest.id },
      },
    });

    res.status(201).json({ message: 'Interest expressed successfully', interest });
  } catch (err) {
    next(err);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { name: true, phoneNumber: true } },
        interests: {
          include: {
            buyer: { select: { name: true, buyerProfile: true } },
          },
        },
      },
    });

    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    res.json({ listing });
  } catch (err) {
    next(err);
  }
};

module.exports = { createListing, getListings, getMyListings, expressInterest, getListingById };