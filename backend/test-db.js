const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'superadmin@ovenxpress.com' }
    });
    console.log('User found:', user);

    if (user) {
      console.log('Attempting to update lastLoginAt...');
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
      console.log('Update lastLoginAt succeeded!');

      // Attempt to save OTP
      console.log('Attempting to save OTP...');
      const codeHash = 'mock_hash_for_test';
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // delete old
      await prisma.otp.deleteMany({ where: { email: user.email } });

      const otp = await prisma.otp.create({
        data: {
          email: user.email,
          phone: user.phone || null,
          userId: user.id,
          type: 'LOGIN_2FA',
          codeHash,
          expiresAt,
          createdAt: new Date(),
        }
      });
      console.log('OTP created successfully:', otp);
    } else {
      console.log('User superadmin@ovenxpress.com not found in DB!');
    }
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
