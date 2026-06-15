import { describe, it, expect } from 'vitest';

import authReducer, { clearError } from './authSlice';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    authStatus: 'idle' as const,
    error: null,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const errorState = {
      ...initialState,
      error: 'Invalid password',
    };
    const actual = authReducer(errorState, clearError());
    expect(actual.error).toBeNull();
  });
});
