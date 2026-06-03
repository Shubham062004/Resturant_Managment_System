import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface DashboardData {
  revenueToday: number;
  ordersTodayCount: number;
  activeDeliveries: number;
  activeKitchenOrders: number;
  activeReservations: number;
}

interface AdminState {
  dashboard: DashboardData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AdminState = {
  dashboard: null,
  status: 'idle',
};

export const fetchDashboardOverview = createAsyncThunk(
  'admin/fetchDashboard',
  async (branchId: string) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/admin/dashboard?branchId=${branchId}`,
      {
        withCredentials: true,
      },
    );
    return response.data.data;
  },
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dashboard = action.payload;
      });
  },
});

export default adminSlice.reducer;
