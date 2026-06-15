import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { authGuard, restrictTo } from '../middleware/authGuard';
import { AuthRequest } from '../types/express';
import AppError from '../utils/appError';

vi.mock('jsonwebtoken');

describe('Auth Middleware Tests', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = vi.fn();
    vi.clearAllMocks();
  });

  describe('authGuard', () => {
    it('should fail with 401 if Authorization header is missing', async () => {
      await authGuard(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const error = (nextFunction as any).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Access token is missing');
    });

    it('should verify and attach user details from HttpOnly cookie if token is valid', async () => {
      mockRequest.cookies = { accessToken: 'valid-jwt-token' };
      const mockDecoded = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'ADMIN',
      };
      (jwt.verify as any).mockReturnValue(mockDecoded);

      await authGuard(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(jwt.verify).toHaveBeenCalledWith('valid-jwt-token', expect.any(String));
      expect(mockRequest.user).toEqual({
        id: 'user-123',
        email: 'user@example.com',
        role: 'ADMIN',
      });
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should fail with 401 if token verification throws an error', async () => {
      mockRequest.headers!.authorization = 'Bearer invalid-jwt-token';
      (jwt.verify as any).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await authGuard(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const error = (nextFunction as any).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });
  });

  describe('restrictTo', () => {
    it('should allow matching user roles to proceed', () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'ADMIN',
      };

      const restrictMiddleware = restrictTo('ADMIN', 'SUPER_ADMIN');
      restrictMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should restrict unmatching user roles with 403 Forbidden', () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER',
      };

      const restrictMiddleware = restrictTo('ADMIN', 'SUPER_ADMIN');
      restrictMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const error = (nextFunction as any).mock.calls[0][0];
      expect(error.statusCode).toBe(403);
      expect(error.message).toContain('Forbidden');
    });
  });
});
