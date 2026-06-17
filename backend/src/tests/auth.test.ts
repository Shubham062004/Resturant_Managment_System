import bcrypt from 'bcryptjs';
import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import app from '../app';
import { prisma } from '../config/db';
import { AuditService } from '../services/audit.service';

vi.mock('../config/db', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
    },
    emailVerificationToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    otp: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  connectDatabases: vi.fn(),
  disconnectDatabases: vi.fn(),
}));

vi.mock('../services/audit.service', () => ({
  AuditService: {
    writeLog: vi.fn(),
    registerSession: vi.fn(),
    terminateSession: vi.fn(),
    terminateAllSessions: vi.fn(),
  },
}));

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully and send verification link', async () => {
      // Setup prisma mocks
      (prisma.user.findFirst as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: 'user-uuid',
        firstName: 'Jane',
        lastName: 'Cook',
        email: 'jane.cook@abc.com',
        role: 'KITCHEN_STAFF',
      });
      (prisma.emailVerificationToken.create as any).mockResolvedValue({
        id: 'token-uuid',
      });

      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'jane.cook@abc.com',
        firstName: 'Jane',
        lastName: 'Cook',
        password: 'securePassword123',
        role: 'KITCHEN_STAFF',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('jane.cook@abc.com');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.emailVerificationToken.create).toHaveBeenCalled();
    });

    it('should block registration if payload fields are invalid', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'not-an-email',
        firstName: '',
        lastName: 'Cook',
        password: '123', // less than 6 chars
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate user and return access token with cookie set', async () => {
      const hashedPassword = await bcrypt.hash('securePassword123', 12);
      (prisma.user.findFirst as any).mockResolvedValue({
        id: 'user-uuid',
        firstName: 'Jane',
        lastName: 'Cook',
        email: 'jane.cook@abc.com',
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
        isActive: true,
      });
      (prisma.refreshToken.create as any).mockResolvedValue({
        id: 'token-uuid',
      });

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'jane.cook@abc.com',
        password: 'securePassword123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = [response.headers['set-cookie']]
        .flat()
        .filter(Boolean) as string[];
      expect(cookies.some((c) => c.includes('refreshToken='))).toBe(true);
      expect(cookies.some((c) => c.includes('accessToken='))).toBe(true);
      expect(AuditService.registerSession).toHaveBeenCalled();
      expect(AuditService.writeLog).toHaveBeenCalled();
    });

    it('should deny access if credentials do not match', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'wrong@abc.com',
        password: 'wrongPassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should rotate access and refresh tokens successfully', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 2); // expires in 2 days (valid)

      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        id: 'token-uuid',
        userId: 'user-uuid',
        tokenHash: 'hashed-old-token',
        expiresAt,
        revoked: false,
        user: {
          id: 'user-uuid',
          email: 'jane.cook@abc.com',
          role: 'KITCHEN_STAFF',
        },
      });

      (prisma.refreshToken.update as any).mockResolvedValue({
        id: 'token-uuid',
      });
      (prisma.refreshToken.create as any).mockResolvedValue({
        id: 'new-token-uuid',
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refreshToken=mockedrawrefreshtoken'])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.success).toBe(true);
      const cookies = [response.headers['set-cookie']]
        .flat()
        .filter(Boolean) as string[];
      expect(cookies.some((c) => c.includes('accessToken='))).toBe(true);
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { revoked: true },
        })
      );
      expect(AuditService.terminateSession).toHaveBeenCalled();
    });

    it('should detect token replay attacks and revoke all sessions', async () => {
      // Mock refresh token is revoked
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        id: 'token-uuid',
        userId: 'user-uuid',
        tokenHash: 'hashed-old-token',
        revoked: true,
        user: { id: 'user-uuid' },
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refreshToken=mockedrawrefreshtoken'])
        .send();

      expect(response.status).toBe(401);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid' },
        data: { revoked: true },
      });
      expect(AuditService.terminateAllSessions).toHaveBeenCalledWith(
        'user-uuid'
      );
    });
  });
});
