import { OAuth2Client } from 'google-auth-library';

import logger from '../utils/logger';

// Setup OAuth Client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
  process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret'
);

export interface GoogleUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isEmailVerified: boolean;
}

export class GoogleAuthService {
  /**
   * Verifies Google ID Token and returns user details
   */
  public static async verifyGoogleToken(
    token: string
  ): Promise<GoogleUserPayload> {
    try {
      // Development bypass fallback if keys are missing
      if (
        !process.env.GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID === 'mock_client_id'
      ) {
        logger.warn(
          '[Google Auth Service] Missing GOOGLE_CLIENT_ID. Running in MOCK fallback mode.'
        );

        // If the token itself is an email address, use it; otherwise mock default
        let mockEmail = 'google.test.user@abc.com';
        if (token.includes('@')) {
          mockEmail = token;
        }

        const username = mockEmail.split('@')[0];
        const nameParts = username.split(/[._-]/);
        const firstName = nameParts[0]
          ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1)
          : 'Google';
        const lastName = nameParts[1]
          ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
          : 'User';

        return {
          email: mockEmail,
          firstName,
          lastName,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}+${lastName}`,
          isEmailVerified: true,
        };
      }

      // Official Google ID Token validation
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error(
          'Google token validation returned an empty payload or missing email.'
        );
      }

      return {
        email: payload.email,
        firstName: payload.given_name || 'Google',
        lastName: payload.family_name || 'User',
        avatar: payload.picture,
        isEmailVerified: payload.email_verified || false,
      };
    } catch (error) {
      logger.error(
        error,
        '[Google Auth Service] Failed to verify Google token:'
      );
      throw new Error(
        'Google OAuth token verification failed. The signature is invalid or expired.'
      );
    }
  }
}
