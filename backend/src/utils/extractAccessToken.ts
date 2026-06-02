import { Request } from 'express';

/**
 * Resolve JWT access token from HttpOnly cookie (preferred) or Authorization header.
 */
export const extractAccessToken = (req: Request): string | undefined => {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken as string;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return undefined;
};
