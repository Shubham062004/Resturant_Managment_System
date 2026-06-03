import authReducer, { setCredentials, logout } from './authSlice';
import { describe, it, expect } from 'vitest';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    tenantId: null,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCredentials', () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'CUSTOMER' };
    const actual = authReducer(
      initialState,
      setCredentials({ user: mockUser as any, accessToken: 'token123' })
    );

    expect(actual.isAuthenticated).toEqual(true);
    expect(actual.accessToken).toEqual('token123');
    expect(actual.user).toEqual(mockUser);
  });

  it('should handle logout', () => {
    const loggedInState = {
      user: { id: '1', email: 'test@example.com', role: 'CUSTOMER' as const },
      accessToken: 'token123',
      isAuthenticated: true,
      tenantId: null,
    };
    const actual = authReducer(loggedInState, logout());
    expect(actual).toEqual(initialState);
  });
});
