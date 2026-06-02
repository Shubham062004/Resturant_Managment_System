import crypto from 'crypto';
import { prisma } from '../config/db';
import { OtpType } from '@prisma/client';
import logger from '../utils/logger';

export class OtpService {
  private static hashOtp(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Generates a 6-digit secure numeric OTP and saves its hash to PostgreSQL
   */
  public static async generateOtp(
    type: OtpType,
    identifier: { email?: string; phone?: string; userId?: string },
    expiryMinutes = 5
  ): Promise<string> {
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = this.hashOtp(rawCode);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // 1. Revoke/Delete previous active OTPs of same type for the identifier
    await prisma.otp.deleteMany({
      where: {
        type,
        OR: [
          identifier.email ? { email: identifier.email } : {},
          identifier.phone ? { phone: identifier.phone } : {},
          identifier.userId ? { userId: identifier.userId } : {},
        ].filter((o) => Object.keys(o).length > 0),
      },
    });

    // 2. Create the new Otp record
    await prisma.otp.create({
      data: {
        userId: identifier.userId || null,
        email: identifier.email || null,
        phone: identifier.phone || null,
        codeHash,
        type,
        expiresAt,
      },
    });

    logger.info(`[OTP Service] Generated 6-digit OTP code [${rawCode}] for ${identifier.email || identifier.phone || identifier.userId} (Type: ${type}). Expires in ${expiryMinutes}m.`);

    return rawCode;
  }

  /**
   * Verifies the OTP code against database record
   */
  public static async verifyOtp(
    type: OtpType,
    identifier: { email?: string; phone?: string; userId?: string },
    inputCode: string
  ): Promise<{ success: boolean; message: string }> {
    const searchConditions = [
      identifier.email ? { email: identifier.email } : {},
      identifier.phone ? { phone: identifier.phone } : {},
      identifier.userId ? { userId: identifier.userId } : {},
    ].filter((o) => Object.keys(o).length > 0);

    if (searchConditions.length === 0) {
      return { success: false, message: 'Invalid identifier parameters provided.' };
    }

    // 1. Retrieve the latest active OTP for this identifier and type
    const otpRecord = await prisma.otp.findFirst({
      where: {
        type,
        verified: false,
        OR: searchConditions,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return { success: false, message: 'OTP code is invalid or has already been verified.' };
    }

    // 2. Check Expiration
    if (new Date() > otpRecord.expiresAt) {
      // Clean up expired OTP record
      await prisma.otp.delete({ where: { id: otpRecord.id } });
      return { success: false, message: 'OTP code has expired. Please request a new code.' };
    }

    // 3. Check attempts throttling (max 5 attempts)
    if (otpRecord.attempts >= 5) {
      await prisma.otp.delete({ where: { id: otpRecord.id } });
      return { success: false, message: 'Too many incorrect attempts. This OTP has been voided. Please request a new code.' };
    }

    // 4. Compare hash
    const inputHash = this.hashOtp(inputCode);
    if (otpRecord.codeHash !== inputHash) {
      // Increment attempts
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return {
        success: false,
        message: `Incorrect OTP code. ${4 - otpRecord.attempts} attempts remaining before voiding.`,
      };
    }

    // 5. Success - mark as verified and delete/keep depending on requirements. Let's delete it so it's single-use, or mark verified.
    // Marking verified is useful if we need to query verifyOtp status elsewhere. Let's mark as verified.
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return { success: true, message: 'OTP verification successful.' };
  }
}
