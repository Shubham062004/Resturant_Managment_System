import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/express';
import { AuthService } from './auth.service';
import { OtpService } from '../../services/otp.service';
import { EmailService } from '../../services/email.service';
import { GoogleAuthService } from '../../services/googleAuth.service';
import { AuditService } from '../../services/audit.service';
import { prisma } from '../../config/db';
import AppError from '../../utils/appError';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OtpType, Role } from '@prisma/client';
import logger from '../../utils/logger';
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearAuthCookieOptions,
} from '../../utils/authCookies';

export class AuthController {
  public static async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Force customer role for public registration
      req.body.role = Role.CUSTOMER;
      
      const user = await AuthService.registerUser(
        req.body,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || '',
      );

      res.status(201).json({
        success: true,
        data: { user },
        message: 'Registration successful. A verification link has been sent to your email.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.loginUser(
        req.body,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || '',
      );

      if (result.requireOtp) {
        res.status(200).json({
          success: true,
          data: { requireOtp: true, email: result.email, phone: result.phone },
          message: result.message,
        });
        return;
      }

      res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);
      res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);

      res.status(200).json({
        success: true,
        data: { user: result.user },
        message: 'Authentication successful.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async verifyLoginOtp(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accessToken, refreshToken, user } = await AuthService.verifyLoginOtpUser(
        req.body,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || '',
      );

      res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
      res.cookie('accessToken', accessToken, accessTokenCookieOptions);

      res.status(200).json({
        success: true,
        data: { user },
        message: 'OTP verified. Authentication successful.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async refresh(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!rawRefreshToken) {
        return next(new AppError('Access token refresh failed. Refresh token is missing.', 401));
      }

      const { accessToken, refreshToken } = await AuthService.rotateTokens(
        rawRefreshToken,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || '',
      );

      res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
      res.cookie('accessToken', accessToken, accessTokenCookieOptions);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Access token refreshed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (rawRefreshToken) {
        await AuthService.logoutUser(
          rawRefreshToken,
          req.ip || '127.0.0.1',
          req.headers['user-agent'] || '',
        );
      }

      res.clearCookie('refreshToken', { ...clearAuthCookieOptions, maxAge: 0 });
      res.clearCookie('accessToken', { ...clearAuthCookieOptions, maxAge: 0 });

      res.status(200).json({
        success: true,
        data: null,
        message: 'Logged out successfully from this device.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logoutAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Unauthenticated.', 401));
      }

      await AuthService.logoutAllDevices(
        req.user.id,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || '',
      );

      res.clearCookie('refreshToken', { ...clearAuthCookieOptions, maxAge: 0 });
      res.clearCookie('accessToken', { ...clearAuthCookieOptions, maxAge: 0 });

      res.status(200).json({
        success: true,
        data: null,
        message: 'Successfully logged out of all devices and active sessions.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async forgotPassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        // 1. Invalidate previous tokens
        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

        // 2. Generate secure token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            token: resetToken,
            expiresAt,
          },
        });

        // 3. Send mock email link
        await EmailService.sendPasswordResetEmail(user.email, resetToken);
        await AuditService.writeLog(
          user.id,
          'PASSWORD_RESET',
          req.ip || '127.0.0.1',
          req.headers['user-agent'] || '',
          {
            message: 'Password reset link requested.',
          },
        );
      }

      // Always return 200 to block email scanning audits
      res.status(200).json({
        success: true,
        data: null,
        message: 'If a user matches this email address, a password reset link has been dispatched.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async resetPassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token, password } = req.body;

      const storedToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!storedToken) {
        return next(new AppError('Password reset link is invalid or has expired.', 400));
      }

      if (new Date() > storedToken.expiresAt) {
        await prisma.passwordResetToken.delete({ where: { id: storedToken.id } });
        return next(new AppError('Password reset link has expired.', 400));
      }

      const user = storedToken.user;
      const passwordHash = await bcrypt.hash(password, 12);

      // Update User Password and make sure they verify email if they haven't
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, isEmailVerified: true },
      });

      // Clear the used token
      await prisma.passwordResetToken.delete({ where: { id: storedToken.id } });

      // Force Logout all active devices/sessions on password changes
      await AuthService.logoutAllDevices(
        user.id,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || '',
      );

      res.status(200).json({
        success: true,
        data: null,
        message: 'Password has been updated successfully. Please log in with your new credentials.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async verifyEmail(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token } = req.body;

      const storedToken = await prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!storedToken) {
        return next(new AppError('Email verification token is invalid or has expired.', 400));
      }

      if (new Date() > storedToken.expiresAt) {
        await prisma.emailVerificationToken.delete({ where: { id: storedToken.id } });
        return next(
          new AppError(
            'Email verification token has expired. Please request a new verification email.',
            400,
          ),
        );
      }

      const user = storedToken.user;

      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });

      await prisma.emailVerificationToken.delete({ where: { id: storedToken.id } });

      await AuditService.writeLog(
        user.id,
        'EMAIL_VERIFICATION',
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || '',
        {
          message: 'Email address verified.',
        },
      );

      res.status(200).json({
        success: true,
        data: null,
        message: 'Your email address has been verified successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async resendVerification(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return next(new AppError('User not found.', 404));
      }

      if (user.isEmailVerified) {
        res.status(200).json({
          success: true,
          data: null,
          message: 'Your email address is already verified.',
        });
        return;
      }

      // Delete old verification tokens
      await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

      // Generate new token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt,
        },
      });

      await EmailService.sendVerificationEmail(user.email, verificationToken);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Verification link resent successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async sendOtp(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, phone, _type } = req.body;

      let identifier: { email?: string; phone?: string; userId?: string } = {};

      if (email) {
        identifier.email = email;
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) identifier.userId = user.id;
      } else if (phone) {
        identifier.phone = phone;
        const user = await prisma.user.findUnique({ where: { phone } });
        if (user) identifier.userId = user.id;
      }

      const otp = OtpService.generateOtp();
      await OtpService.saveOtp(identifier, otp);

      // Trigger Dispatch
      if (email) {
        await EmailService.sendOtpEmail(email, otp);
      } else if (phone) {
        logger.info(`[SMS Dispatch Simulation] To: ${phone} -> Code: ${otp}`);
      }

      res.status(200).json({
        success: true,
        data: null,
        message: `OTP code successfully dispatched to your ${email ? 'email address' : 'phone number'}.`,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async verifyOtp(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, phone, code, type } = req.body;

      let identifier: { email?: string; phone?: string; userId?: string } = {};

      if (email) {
        identifier.email = email;
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) identifier.userId = user.id;
      } else if (phone) {
        identifier.phone = phone;
        const user = await prisma.user.findUnique({ where: { phone } });
        if (user) identifier.userId = user.id;
      }

      const isValid = await OtpService.verifyOtp(identifier, code);

      if (!isValid) {
        return next(new AppError('Invalid or expired OTP', 400));
      }

      // If verifying email registration OTP, auto-verify user email/phone
      if (identifier.userId) {
        if (type === OtpType.EMAIL_VERIFICATION) {
          await prisma.user.update({
            where: { id: identifier.userId },
            data: { isEmailVerified: true },
          });
        } else if (type === OtpType.PHONE_VERIFICATION) {
          await prisma.user.update({
            where: { id: identifier.userId },
            data: { isPhoneVerified: true },
          });
        }
      }

      res.status(200).json({
        success: true,
        data: null,
        message: 'OTP verified successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async googleAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token } = req.body;

      const profile = await GoogleAuthService.verifyGoogleToken(token);

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (!user) {
        // Auto-Register Google user
        user = await prisma.user.create({
          data: {
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatar: profile.avatar || null,
            role: Role.CUSTOMER,
            isEmailVerified: true,
            isActive: true,
          },
        });
        await AuditService.writeLog(
          user.id,
          'EMAIL_VERIFICATION',
          req.ip || '127.0.0.1',
          req.headers['user-agent'] || '',
          {
            message: 'Account registered and email auto-verified via Google OAuth login callback.',
          },
        );
      }

      if (!user.isActive) {
        return next(
          new AppError('Your account has been deactivated. Please contact support.', 403),
        );
      }

      // Issue tokens
      const accessToken = AuthService.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        assignedCategory: user.assignedCategory,
      });
      const refreshToken = await AuthService.generateRefreshToken(user.id);
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      // Record session
      await AuditService.registerSession(
        user.id,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || '',
        tokenHash,
      );
      await AuditService.writeLog(
        user.id,
        'LOGIN',
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || '',
        {
          provider: 'google',
        },
      );

      res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
      res.cookie('accessToken', accessToken, accessTokenCookieOptions);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
          },
        },
        message: 'Google login successful.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Unauthenticated.', 401));
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user) {
        return next(new AppError('User profile details not found.', 404));
      }

      res.status(200).json({
        success: true,
        data: { user },
        message: 'Profile retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
