import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import api from '../../../services/apiClient';

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  driverId: string;
  status:
    | 'ASSIGNED'
    | 'ACCEPTED'
    | 'AT_RESTAURANT'
    | 'PICKED_UP'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'FAILED';
  order: any;
  createdAt: string;
}

interface DeliveryState {
  assignments: DeliveryAssignment[];
  activeAssignment: DeliveryAssignment | null;
  earnings: { totalEarnings: number; history: any[] };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DeliveryState = {
  assignments: [],
  activeAssignment: null,
  earnings: { totalEarnings: 0, history: [] },
  status: 'idle',
  error: null,
};

export const fetchAssignedOrders = createAsyncThunk(
  'delivery/fetchAssignedOrders',
  async () => {
    const response = await api.get('/delivery/orders');
    return response.data.data.orders;
  }
);

export const acceptOrder = createAsyncThunk(
  'delivery/acceptOrder',
  async (orderId: string) => {
    const response = await api.patch(`/delivery/orders/${orderId}/accept`);
    return response.data.data.order;
  }
);

export const pickupOrder = createAsyncThunk(
  'delivery/pickupOrder',
  async (orderId: string) => {
    const response = await api.patch(`/delivery/orders/${orderId}/pickup`);
    return response.data.data.order;
  }
);

export const deliverOrder = createAsyncThunk(
  'delivery/deliverOrder',
  async ({ orderId, proof }: { orderId: string; proof: any }) => {
    const response = await api.patch(
      `/delivery/orders/${orderId}/deliver`,
      proof
    );
    return response.data.data.order;
  }
);

export const fetchEarnings = createAsyncThunk(
  'delivery/fetchEarnings',
  async () => {
    const response = await api.get('/delivery/earnings');
    return response.data.data;
  }
);

export const updateLocation = createAsyncThunk(
  'delivery/updateLocation',
  async (location: any) => {
    const response = await api.post('/delivery/location', location);
    return response.data.data.location;
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    socketAssignmentUpdate: (
      state,
      action: PayloadAction<DeliveryAssignment>
    ) => {
      const index = state.assignments.findIndex(
        (a) => a.id === action.payload.id
      );
      if (index !== -1) {
        state.assignments[index] = {
          ...state.assignments[index],
          ...action.payload,
        };
      } else {
        state.assignments.unshift(action.payload);
      }

      if (state.activeAssignment?.id === action.payload.id) {
        state.activeAssignment = {
          ...state.activeAssignment,
          ...action.payload,
        };
      }
    },
    setActiveAssignment: (
      state,
      action: PayloadAction<DeliveryAssignment | null>
    ) => {
      state.activeAssignment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignedOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.assignments = action.payload;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(pickupOrder.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(deliverOrder.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.earnings = action.payload;
      });
  },
});

export const { socketAssignmentUpdate, setActiveAssignment } =
  deliverySlice.actions;
export default deliverySlice.reducer;
