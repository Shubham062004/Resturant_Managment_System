import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import apiClient from '../../../services/apiClient';

interface Refund {
  id: string;
  orderId: string;
  amount: string;
  status: string;
  reason?: string;
  createdAt: string;
}

interface RefundState {
  refunds: Refund[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RefundState = {
  refunds: [],
  status: 'idle',
  error: null,
};

export const processRefund = createAsyncThunk(
  'refunds/process',
  async (data: { orderId: string; amount: number; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/refunds', data);
      return response.data.data.refund;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to process refund');
    }
  },
);

const refundSlice = createSlice({
  name: 'refunds',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(processRefund.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.refunds.push(action.payload);
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default refundSlice.reducer;
