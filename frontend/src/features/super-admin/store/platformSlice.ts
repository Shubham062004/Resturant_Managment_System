import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resturant-managment-system-qkow.onrender.com';

export const fetchPlatformDashboard = createAsyncThunk('platform/fetchDashboard', async () => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/super-admin/dashboard`, {
    withCredentials: true,
  });
  return response.data.data;
});

const platformSlice = createSlice({
  name: 'platform',
  initialState: { dashboard: null, status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformDashboard.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlatformDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dashboard = action.payload;
      });
  },
});

export default platformSlice.reducer;
