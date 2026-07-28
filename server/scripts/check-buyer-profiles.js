const prisma = require('../src/config/prisma');

async function main() {
  const buyersWithoutProfile = await prisma.user.findMany({
    where: {
      userType: 'BUYER',
      buyerProfile: null,
    },
  });
  console.log(buyersWithoutProfile.length, 'buyers missing a profile');
  console.log(buyersWithoutProfile.map(u => ({ id: u.id, name: u.name })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());