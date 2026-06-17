import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import apiClient from '../../../services/apiClient';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  salary?: number;
  attendanceCount?: number;
  performanceScore?: number;
  assignedCategory?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  authStatus: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.data.requireOtp) {
        return {
          requireOtp: true,
          email: response.data.data.email,
          phone: response.data.data.phone,
        };
      }
      const { user } = response.data.data;
      return { requireOtp: false, user };
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      const errorMsg = error.response?.data?.error?.message || 'Login failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        '/auth/verify-login-otp',
        credentials
      );
      const { user } = response.data.data;
      return { user };
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      const errorMsg =
        error.response?.data?.error?.message || 'OTP verification failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data.message;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      const errorMsg =
        error.response?.data?.error?.message || 'Registration failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const googleAuthLogin = createAsyncThunk(
  'auth/googleLogin',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/google', { token });
      const { user } = response.data.data;
      return { user };
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      const errorMsg =
        error.response?.data?.error?.message || 'Google login failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Local cleanups proceed even if API triggers warnings
  }
});

export const logoutAllDevices = createAsyncThunk('auth/logoutAll', async () => {
  try {
    await apiClient.post('/auth/logout-all');
  } catch {
    // Local cleanups proceed
  }
});

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    if (!localStorage.getItem('hasSession')) {
      return rejectWithValue('No active session found locally');
    }
    try {
      await apiClient.post('/auth/refresh');
      return true;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      return rejectWithValue(
        error.response?.data?.error?.message || 'Session expired'
      );
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.data.user;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      const errorMsg =
        error.response?.data?.error?.message || 'Failed to fetch profile';
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData: FormData | Record<string, unknown>, { rejectWithValue }) => {
    try {
      const isFormData = formData instanceof FormData;
      const response = await apiClient.patch('/users/profile', formData, {
        headers: {
          'Content-Type': isFormData
            ? 'multipart/form-data'
            : 'application/json',
        },
      });
      return response.data.data.user;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      const errorMsg =
        error.response?.data?.error?.message || 'Failed to update profile';
      return rejectWithValue(errorMsg);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authStatus = 'idle';
      localStorage.removeItem('hasSession');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.authStatus = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authStatus = 'succeeded';
        if (!action.payload.requireOtp) {
          state.user = action.payload.user as User;
          state.isAuthenticated = true;
          localStorage.setItem('hasSession', 'true');
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.authStatus = 'loading';
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.authStatus = 'succeeded';
        state.user = action.payload.user as User;
        state.isAuthenticated = true;
        localStorage.setItem('hasSession', 'true');
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(googleAuthLogin.pending, (state) => {
        state.authStatus = 'loading';
        state.error = null;
      })
      .addCase(googleAuthLogin.fulfilled, (state, action) => {
        state.authStatus = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(googleAuthLogin.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.authStatus = 'idle';
        localStorage.removeItem('hasSession');
      })
      .addCase(logoutAllDevices.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.authStatus = 'idle';
        localStorage.removeItem('hasSession');
      })
      .addCase(refreshSession.fulfilled, (state) => {
        state.isAuthenticated = true;
        localStorage.setItem('hasSession', 'true');
      })
      .addCase(refreshSession.rejected, (state) => {
        // Only clear auth if there was a prior session attempt
        // Don't nuke state for users who simply have no session
        state.authStatus = 'idle';
        if (localStorage.getItem('hasSession')) {
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem('hasSession');
        }
      })
      .addCase(fetchProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authStatus = 'succeeded';
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        // CRITICAL: Do NOT set isAuthenticated=false here.
        // A profile fetch failure is NOT a logout event.
        // The user's session cookies are still valid.
        // Only record the error — the session remains active.
        state.error = action.payload as string;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
