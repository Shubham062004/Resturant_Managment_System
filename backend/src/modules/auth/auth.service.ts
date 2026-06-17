import crypto from 'crypto';

import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../../config/db';
import env from '../../config/env';
import { AuditService } from '../../services/audit.service';
import { EmailService } from '../../services/email.service';
import { OtpService } from '../../services/otp.service';
import AppError from '../../utils/appError';

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  assignedCategory?: string | null;
}

export class AuthService {
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates a 15-minute JWT Access Token
   */
  public static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: (env.JWT_EXPIRES_IN || '15m') as any,
    });
  }

  /**
   * Generates a 7-day secure Refresh Token and stores its hash in PostgreSQL
   */
  public static async generateRefreshToken(userId: string): Promise<string> {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return rawToken;
  }

  /**
   * Register a new user with password hashing and verification email dispatch
   */
  public static async registerUser(
    data: any,
    ipAddress: string,
    userAgent: string
  ) {
    const { email, phone, firstName, lastName, password, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, phone ? { phone } : {}].filter(
          (c) => Object.keys(c).length > 0
        ),
      },
    });

    if (existingUser) {
      throw new AppError(
        'A user with this email or phone number already exists.',
        409
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        firstName,
        lastName,
        passwordHash,
        role: role || Role.CUSTOMER,
      },
    });

    // Generate Email Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    // Send verification email mock
    await EmailService.sendVerificationEmail(user.email, verificationToken);

    // Record register event
    await AuditService.writeLog(
      user.id,
      'EMAIL_VERIFICATION',
      ipAddress,
      userAgent,
      {
        message: 'Verification token generated and sent.',
      }
    );

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Login standard credentials and conditionally issue OTP or session tokens
   */
  public static async loginUser(
    data: any,
    ipAddress: string,
    userAgent: string
  ) {
    const { email, phone, password } = data;

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user || !user.passwordHash) {
      if (user)
        await AuditService.writeLog(user.id, 'LOGIN', ipAddress, userAgent, {
          status: 'FAILED',
          error: 'Incorrect password',
        });
      throw new AppError('Incorrect credentials. Access denied.', 401);
    }

    if (!user.isActive) {
      throw new AppError(
        'Your account has been deactivated. Please contact support.',
        403
      );
    }

    // Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      await AuditService.writeLog(user.id, 'LOGIN', ipAddress, userAgent, {
        status: 'FAILED',
        error: 'Incorrect password',
      });
      throw new AppError('Incorrect credentials. Access denied.', 401);
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // OTP Requirement Check for Staff
    if (user.role !== Role.CUSTOMER) {
      // Generate & Dispatch OTP
      const otp = OtpService.generateOtp();
      await OtpService.saveOtp(
        { userId: user.id, email: user.email, phone: user.phone || undefined },
        otp
      );
      await OtpService.dispatchOtp(user.phone || user.email, otp, 'MOCK'); // or SMS provider

      await AuditService.writeLog(
        user.id,
        'PASSWORD_RESET',
        ipAddress,
        userAgent,
        {
          status: 'OTP_REQUESTED',
        }
      ); // using existing types or custom

      return {
        requireOtp: true,
        email: user.email,
        phone: user.phone,
        message: 'OTP sent to your registered device.',
      };
    }

    // Generate tokens for Customers directly
    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      assignedCategory: user.assignedCategory,
    });
    const refreshToken = await this.generateRefreshToken(user.id);
    const tokenHash = this.hashToken(refreshToken);

    // Write login session to MongoDB & audit logs
    await AuditService.registerSession(
      user.id,
      ipAddress,
      userAgent,
      tokenHash
    );
    await AuditService.writeLog(user.id, 'LOGIN', ipAddress, userAgent, {
      status: 'SUCCESS',
    });

    return {
      requireOtp: false,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  /**
   * Verifies staff OTP and issues JWT
   */
  public static async verifyLoginOtpUser(
    data: any,
    ipAddress: string,
    userAgent: string
  ) {
    const { email, phone, otp } = data;

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isValid = await OtpService.verifyOtp({ email, phone }, otp);

    if (!isValid) {
      await AuditService.writeLog(user.id, 'LOGIN', ipAddress, userAgent, {
        status: 'FAILED',
        error: 'Invalid OTP',
      });
      throw new AppError('Invalid or expired OTP.', 401);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      assignedCategory: user.assignedCategory,
    });
    const refreshToken = await this.generateRefreshToken(user.id);
    const tokenHash = this.hashToken(refreshToken);

    await AuditService.registerSession(
      user.id,
      ipAddress,
      userAgent,
      tokenHash
    );
    await AuditService.writeLog(user.id, 'LOGIN', ipAddress, userAgent, {
      status: 'SUCCESS',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  /**
   * Performs Refresh Token Rotation (RTR) and protects against replay attacks
   */
  public static async rotateTokens(
    rawRefreshToken: string,
    ipAddress: string,
    userAgent: string
  ) {
    const tokenHash = this.hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError('Refresh token is invalid.', 401);
    }

    // REPLAY ATTACK DETECTION:
    // If a refresh token is reused after it was marked revoked, it indicates token compromise.
    // In that event, we revoke all active refresh tokens for the user and force them to re-login.
    if (storedToken.revoked) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revoked: true },
      });
      await AuditService.terminateAllSessions(storedToken.userId);
      await AuditService.writeLog(
        storedToken.userId,
        'LOGOUT',
        ipAddress,
        userAgent,
        {
          warn: 'Token replay attack detected. Revoked all active user sessions.',
        }
      );
      throw new AppError(
        'Security breach detected. Refresh token has already been used. Please log in again.',
        401
      );
    }

    // Check expiration
    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      await AuditService.terminateSession(tokenHash);
      throw new AppError(
        'Refresh token has expired. Please log in again.',
        401
      );
    }

    // Perform Rotation:
    // 1. Revoke the old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });
    await AuditService.terminateSession(tokenHash);

    // 2. Generate new tokens
    const user = storedToken.user;
    const newAccessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      assignedCategory: user.assignedCategory,
    });
    const newRefreshToken = await this.generateRefreshToken(user.id);
    const newHash = this.hashToken(newRefreshToken);

    // 3. Register the rotated session
    await AuditService.registerSession(user.id, ipAddress, userAgent, newHash);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logs out user from a single session
   */
  public static async logoutUser(
    rawRefreshToken: string,
    ipAddress: string,
    userAgent: string
  ) {
    const tokenHash = this.hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (storedToken) {
      // Delete or revoke the token
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      await AuditService.terminateSession(tokenHash);
      await AuditService.writeLog(
        storedToken.userId,
        'LOGOUT',
        ipAddress,
        userAgent
      );
    }
  }

  /**
   * Logs out user from all active devices and sessions
   */
  public static async logoutAllDevices(
    userId: string,
    ipAddress: string,
    userAgent: string
  ) {
    // Delete all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Terminate all sessions in MongoDB
    await AuditService.terminateAllSessions(userId);
    await AuditService.writeLog(userId, 'LOGOUT', ipAddress, userAgent, {
      message: 'Logged out of all active devices.',
    });
  }
}
