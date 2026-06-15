import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import apiClient from '../../../services/apiClient';

interface KitchenTask {
  id: string;
  productId: string;
  quantity: number;
  notes?: string;
  status: string;
  product: { name: string };
}

interface KitchenOrder {
  id: string;
  orderId: string;
  status: 'QUEUED' | 'COOKING' | 'READY_FOR_PACKING' | 'PACKED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  stationId?: string;
  assignedTo?: string;
  tasks: KitchenTask[];
  order: {
    orderNumber: string;
    notes?: string;
    orderType: string;
    items: {
      id: string;
      product: { name: string };
      quantity: number;
    }[];
  };
}

interface KitchenState {
  orders: KitchenOrder[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: KitchenState = {
  orders: [],
  status: 'idle',
  error: null,
};

export const fetchActiveOrders = createAsyncThunk(
  'kitchen/fetchActiveOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/kitchen/orders');
      return response.data.data.orders;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch kitchen orders',
      );
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  'kitchen/updateOrderStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/kitchen/orders/${id}/status`, { status });
      return response.data.data.order;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to update order status',
      );
    }
  },
);

const kitchenSlice = createSlice({
  name: 'kitchen',
  initialState,
  reducers: {
    receiveNewOrder: (state, action: PayloadAction<KitchenOrder>) => {
      state.orders.push(action.payload);
    },
    receiveOrderStatusUpdate: (state, action: PayloadAction<KitchenOrder>) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        if (action.payload.status === 'COMPLETED') {
          state.orders.splice(index, 1);
        } else {
          state.orders[index] = action.payload;
        }
      } else if (action.payload.status !== 'COMPLETED') {
        state.orders.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchActiveOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload;
      })
      .addCase(fetchActiveOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          if (action.payload.status === 'COMPLETED') {
            state.orders.splice(index, 1);
          } else {
            state.orders[index] = action.payload;
          }
        }
      });
  },
});

export const { receiveNewOrder, receiveOrderStatusUpdate } = kitchenSlice.actions;
export default kitchenSlice.reducer;
