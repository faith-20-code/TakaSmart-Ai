// One-time script to create the first super admin
// Run with: node prisma/createSuperAdmin.js
// After running once, you can delete this file or keep it for emergencies

const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

async function createSuperAdmin() {
  const phoneNumber = '+254722222278'; // change to your real admin number
  const password = 'admin123'; // change before running
  const name = 'Super Admin';

  const existing = await prisma.user.findUnique({ where: { phoneNumber } });
  if (existing) {
    console.log('An admin with this phone number already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      phoneNumber,
      name,
      userType: 'ADMIN',
      adminLevel: 'SUPER_ADMIN',
      passwordHash,
      verified: true,
    },
  });

  console.log('Super admin created successfully:');
  console.log({ id: admin.id, phoneNumber: admin.phoneNumber, name: admin.name });
}

createSuperAdmin()
  .catch(console.error)
  .finally(() => process.exit());