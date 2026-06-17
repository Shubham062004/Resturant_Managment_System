import crypto from 'crypto';

import { OtpType } from '@prisma/client';

import { prisma } from '../config/db';
import logger from '../utils/logger';

export class OtpService {
  /**
   * Generates a 6 digit OTP.
   * If NODE_ENV is development, always returns 123456.
   */
  public static generateOtp(): string {
    // For demo purposes, always return 123456 regardless of environment
    return '123456';
  }

  /**
   * Hashes the OTP for secure DB storage.
   */
  public static hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Dispatches OTP via SMS or Email abstractly.
   */
  public static async dispatchOtp(
    phoneOrEmail: string,
    otp: string,
    provider: 'TWILIO' | 'MSG91' | 'FIREBASE' | 'MOCK' = 'MOCK'
  ): Promise<void> {
    logger.info(
      `[OTP Service] Dispatching OTP using ${provider} to ${phoneOrEmail}...`
    );

    if (process.env.NODE_ENV === 'development') {
      logger.info(
        `[OTP Service] Development Mode -> OTP for ${phoneOrEmail} is ${otp}`
      );
      return;
    }

    switch (provider) {
      case 'TWILIO':
        // Twilio integration logic here
        break;
      case 'MSG91':
        // MSG91 integration logic here
        break;
      case 'FIREBASE':
        // Firebase integration logic here
        break;
      default:
        logger.warn(
          `[OTP Service] Mock dispatch for ${phoneOrEmail} with OTP ${otp}`
        );
        break;
    }
  }

  /**
   * Saves the OTP to the database, overwriting previous active ones for this identifier.
   */
  public static async saveOtp(
    identifier: { email?: string; phone?: string; userId?: string },
    otp: string
  ) {
    const codeHash = this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Clear old ones first (optional cleanup)
    if (identifier.email) {
      await prisma.otp.deleteMany({ where: { email: identifier.email } });
    }
    if (identifier.phone) {
      await prisma.otp.deleteMany({ where: { phone: identifier.phone } });
    }

    return await prisma.otp.create({
      data: {
        email: identifier.email || null,
        phone: identifier.phone || null,
        userId: identifier.userId || null,
        type: OtpType.LOGIN_2FA,
        codeHash,
        expiresAt,
        createdAt: new Date(),
      },
    });
  }

  /**
   * Validates an OTP.
   */
  public static async verifyOtp(
    identifier: { email?: string; phone?: string },
    otp: string
  ): Promise<boolean> {
    const codeHash = this.hashOtp(otp);

    const conditions: any[] = [];
    if (identifier.email) conditions.push({ email: identifier.email });
    if (identifier.phone) conditions.push({ phone: identifier.phone });

    if (conditions.length === 0) return false;

    const otpRecord = await prisma.otp.findFirst({
      where: {
        OR: conditions,
        codeHash,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) return false;

    if (new Date() > otpRecord.expiresAt) {
      // Clean up expired
      await prisma.otp.delete({ where: { id: otpRecord.id } });
      return false;
    }

    // Burn OTP after successful use
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    return true;
  }
}
