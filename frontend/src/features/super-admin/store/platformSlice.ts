import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import apiClient from '../../../services/apiClient';

export const fetchPlatformDashboard = createAsyncThunk(
  'platform/fetchDashboard',
  async () => {
    const response = await apiClient.get('/super-admin/dashboard');
    return response.data.data;
  }
);

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
