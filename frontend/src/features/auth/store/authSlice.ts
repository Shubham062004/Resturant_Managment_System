import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../../services/apiClient';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'KITCHEN_STAFF' | 'DELIVERY_PARTNER' | 'CASHIER' | 'SUPER_ADMIN';
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  authStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('token'),
  authStatus: 'idle',
  error: null,
};

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Login failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data.message;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Registration failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const googleAuthLogin = createAsyncThunk(
  'auth/googleLogin',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/google', { token });
      const { token: accessToken, user } = response.data.data;
      localStorage.setItem('token', accessToken);
      return { token: accessToken, user };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Google login failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err: any) {
      // Local cleanups proceed even if API triggers warnings
    } finally {
      localStorage.removeItem('token');
    }
  }
);

export const logoutAllDevices = createAsyncThunk(
  'auth/logoutAll',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/auth/logout-all');
    } catch (err: any) {
      // Local cleanups proceed
    } finally {
      localStorage.removeItem('token');
    }
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { token } = response.data.data;
      localStorage.setItem('token', token);
      return token;
    } catch (err: any) {
      localStorage.removeItem('token');
      return rejectWithValue(err.response?.data?.error?.message || 'Session expired');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.data.user;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to fetch profile';
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData: FormData | Record<string, any>, { rejectWithValue }) => {
    try {
      const isFormData = formData instanceof FormData;
      const response = await apiClient.patch('/users/profile', formData, {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return response.data.data.user;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to update profile';
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
    setToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.authStatus = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authStatus = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.error = action.payload as string;
      })
      // Google Login
      .addCase(googleAuthLogin.pending, (state) => {
        state.authStatus = 'loading';
        state.error = null;
      })
      .addCase(googleAuthLogin.fulfilled, (state, action) => {
        state.authStatus = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
      })
      .addCase(googleAuthLogin.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.error = action.payload as string;
      })
      // Logout / Logout All
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.authStatus = 'idle';
      })
      .addCase(logoutAllDevices.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.authStatus = 'idle';
      })
      // Refresh Session
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.authStatus = 'failed';
      })
      // Fetch Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.authStatus = 'succeeded';
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.error = action.payload as string;
        state.authStatus = 'failed';
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
