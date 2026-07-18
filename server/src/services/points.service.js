const prisma = require('../config/prisma');

// Award points to a seller when a listing is marked completed
// Base rate: 10 points per kg of material recycled
const awardPoints = async (sellerId, quantityKg, materialType) => {
  const pointsEarned = Math.round(quantityKg * 10);

  await prisma.sellerProfile.update({
    where: { userId: sellerId },
    data: { points: { increment: pointsEarned } },
  });

  await prisma.notification.create({
    data: {
      userId: sellerId,
      title: 'Points earned!',
      body: `You earned ${pointsEarned} points for recycling ${quantityKg}kg of ${materialType.toLowerCase()}.`,
      type: 'POINTS_EARNED',
      data: { pointsEarned, materialType },
    },
  });

  return pointsEarned;
};

const getPointsBalance = async (userId) => {
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId },
    select: { points: true },
  });
  return profile?.points || 0;
};

module.exports = { awardPoints, getPointsBalance };