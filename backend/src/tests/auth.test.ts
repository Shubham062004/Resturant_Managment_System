import request from 'supertest';
import app from '../app';
import { prisma } from '../config/db';
import { AuditService } from '../services/audit.service';
import bcrypt from 'bcryptjs';

jest.mock('../config/db', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    otp: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
  connectDatabases: jest.fn(),
  disconnectDatabases: jest.fn(),
}));

jest.mock('../services/audit.service', () => ({
  AuditService: {
    writeLog: jest.fn(),
    registerSession: jest.fn(),
    terminateSession: jest.fn(),
    terminateAllSessions: jest.fn(),
  },
}));

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully and send verification link', async () => {
      // Setup prisma mocks
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-uuid',
        firstName: 'Jane',
        lastName: 'Cook',
        email: 'jane.cook@ovenxpress.com',
        role: 'KITCHEN_STAFF',
      });
      (prisma.emailVerificationToken.create as jest.Mock).mockResolvedValue({
        id: 'token-uuid',
      });

      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'jane.cook@ovenxpress.com',
        firstName: 'Jane',
        lastName: 'Cook',
        password: 'securePassword123',
        role: 'KITCHEN_STAFF',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('jane.cook@ovenxpress.com');
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
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user-uuid',
        firstName: 'Jane',
        lastName: 'Cook',
        email: 'jane.cook@ovenxpress.com',
        passwordHash: hashedPassword,
        role: 'KITCHEN_STAFF',
        isActive: true,
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'token-uuid',
      });

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'jane.cook@ovenxpress.com',
        password: 'securePassword123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = [response.headers['set-cookie']].flat().filter(Boolean) as string[];
      expect(cookies.some((c) => c.includes('refreshToken='))).toBe(true);
      expect(cookies.some((c) => c.includes('accessToken='))).toBe(true);
      expect(AuditService.registerSession).toHaveBeenCalled();
      expect(AuditService.writeLog).toHaveBeenCalledWith(
        'user-uuid',
        'LOGIN',
        expect.any(String),
        expect.any(String),
      );
    });

    it('should deny access if credentials do not match', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'wrong@ovenxpress.com',
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

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'token-uuid',
        userId: 'user-uuid',
        tokenHash: 'hashed-old-token',
        expiresAt,
        revoked: false,
        user: {
          id: 'user-uuid',
          email: 'jane.cook@ovenxpress.com',
          role: 'KITCHEN_STAFF',
        },
      });

      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({ id: 'token-uuid' });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({ id: 'new-token-uuid' });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refreshToken=mockedrawrefreshtoken'])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.success).toBe(true);
      const cookies = [response.headers['set-cookie']].flat().filter(Boolean) as string[];
      expect(cookies.some((c) => c.includes('accessToken='))).toBe(true);
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { revoked: true },
        }),
      );
      expect(AuditService.terminateSession).toHaveBeenCalled();
    });

    it('should detect token replay attacks and revoke all sessions', async () => {
      // Mock refresh token is revoked
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
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
      expect(AuditService.terminateAllSessions).toHaveBeenCalledWith('user-uuid');
    });
  });
});
