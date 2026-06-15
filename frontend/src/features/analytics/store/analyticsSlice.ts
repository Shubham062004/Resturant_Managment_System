import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from '../../../services/apiClient';

interface AnalyticsState {
  executive: any;
  revenueTrends: any[];
  customer: any;
  product: any;
  delivery: any;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AnalyticsState = {
  executive: null,
  revenueTrends: [],
  customer: null,
  product: null,
  delivery: null,
  status: 'idle',
  error: null,
};

export const fetchExecutiveSummary = createAsyncThunk('analytics/fetchExecutive', async () => {
  const response = await api.get('/admin/analytics/executive');
  return response.data.data;
});

export const fetchSalesTrends = createAsyncThunk('analytics/fetchSalesTrends', async () => {
  const response = await api.get('/admin/analytics/sales-trends');
  return response.data.data;
});

export const fetchCustomerAnalytics = createAsyncThunk('analytics/fetchCustomer', async () => {
  const response = await api.get('/admin/analytics/customer');
  return response.data.data;
});

export const fetchProductAnalytics = createAsyncThunk('analytics/fetchProduct', async () => {
  const response = await api.get('/admin/analytics/product');
  return response.data.data;
});

export const fetchDeliveryAnalytics = createAsyncThunk('analytics/fetchDelivery', async () => {
  const response = await api.get('/admin/analytics/delivery');
  return response.data.data;
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExecutiveSummary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExecutiveSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.executive = action.payload;
      })
      .addCase(fetchExecutiveSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed';
      })
      .addCase(fetchSalesTrends.fulfilled, (state, action) => {
        state.revenueTrends = action.payload;
      })
      .addCase(fetchCustomerAnalytics.fulfilled, (state, action) => {
        state.customer = action.payload;
      })
      .addCase(fetchProductAnalytics.fulfilled, (state, action) => {
        state.product = action.payload;
      })
      .addCase(fetchDeliveryAnalytics.fulfilled, (state, action) => {
        state.delivery = action.payload;
      });
  },
});

export default analyticsSlice.reducer;
