import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

import env from './src/config/env';
import { AuthService } from './src/modules/auth/auth.service';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    if (env.MONGODB_URI) {
      mongoose.set('strictQuery', true);
      await mongoose.connect(env.MONGODB_URI);
    }

    console.log('Attempting login...');
    const result = await AuthService.loginUser(
      { email: 'admin@abcrestaurant.com', password: 'Admin@123' },
      '127.0.0.1',
      'Test Script'
    );
    console.log('Login success:', result);
  } catch (error: any) {
    console.error('Login failed!');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Error Meta:', error.meta);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await mongoose.disconnect();
  }
}

testLogin();
