import logger from '../utils/logger';

export class EmailService {
  /**
   * Sends a verification email containing a link
   */
  public static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    logger.info(`
=============================================================
📧 [Mock Email Service] Email Verification
To: ${email}
Link: ${link}
=============================================================
    `);
  }

  /**
   * Sends a password reset email containing a link
   */
  public static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    logger.info(`
=============================================================
📧 [Mock Email Service] Password Reset Request
To: ${email}
Link: ${link}
=============================================================
    `);
  }

  /**
   * Sends an OTP verification email
   */
  public static async sendOtpEmail(email: string, code: string): Promise<void> {
    logger.info(`
=============================================================
📧 [Mock Email Service] OTP Verification Code
To: ${email}
Code: ${code}
Expires in: 5 minutes
=============================================================
    `);
  }
}
