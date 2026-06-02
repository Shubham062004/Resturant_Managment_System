import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Reservation {
  id: string;
  customerId: string;
  branchId: string;
  tableId?: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  specialRequest?: string;
  status: string;
  customer?: any;
  table?: any;
}

interface WaitlistEntry {
  id: string;
  customerId: string;
  branchId: string;
  guestCount: number;
  estimatedWaitTime: number;
  status: string;
  customer?: any;
}

interface ReservationState {
  reservations: Reservation[];
  waitlist: WaitlistEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  waitlist: [],
  status: 'idle',
  error: null,
};

export const fetchBranchReservations = createAsyncThunk(
  'reservations/fetchBranch',
  async (branchId: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/reservations/branch?branchId=${branchId}`, {
      withCredentials: true,
    });
    return response.data.data;
  }
);

export const fetchWaitlist = createAsyncThunk(
  'reservations/fetchWaitlist',
  async (branchId: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/waitlist/branch/${branchId}`, {
      withCredentials: true,
    });
    return response.data.data;
  }
);

export const updateReservationStatus = createAsyncThunk(
  'reservations/updateStatus',
  async ({ id, status, tableId }: { id: string; status: string; tableId?: string }) => {
    const response = await axios.patch(`${API_BASE_URL}/api/v1/reservations/${id}`, { status, tableId }, {
      withCredentials: true,
    });
    return response.data.data;
  }
);

export const updateWaitlistStatus = createAsyncThunk(
  'reservations/updateWaitlist',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await axios.patch(`${API_BASE_URL}/api/v1/waitlist/${id}`, { status }, {
      withCredentials: true,
    });
    return response.data.data;
  }
);

const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    reservationCreated: (state, action: PayloadAction<Reservation>) => {
      state.reservations.push(action.payload);
    },
    reservationUpdated: (state, action: PayloadAction<Reservation>) => {
      const index = state.reservations.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
    },
    waitlistUpdated: (state, action: PayloadAction<WaitlistEntry>) => {
      const index = state.waitlist.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.waitlist[index] = action.payload;
      } else {
        state.waitlist.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchReservations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBranchReservations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reservations = action.payload;
      })
      .addCase(fetchBranchReservations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch reservations';
      })
      .addCase(fetchWaitlist.fulfilled, (state, action) => {
        state.waitlist = action.payload;
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        const index = state.reservations.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
      })
      .addCase(updateWaitlistStatus.fulfilled, (state, action) => {
        const index = state.waitlist.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.waitlist[index] = action.payload;
        }
      });
  },
});

export const { reservationCreated, reservationUpdated, waitlistUpdated } = reservationSlice.actions;
export default reservationSlice.reducer;
