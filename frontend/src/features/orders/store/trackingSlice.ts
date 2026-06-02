import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrackingState {
  connected: boolean;
  activeOrderId: string | null;
  liveStatus: string | null;
  logs: string[];
}

const initialState: TrackingState = {
  connected: false,
  activeOrderId: null,
  liveStatus: null,
  logs: [],
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setActiveOrder: (state, action: PayloadAction<string | null>) => {
      state.activeOrderId = action.payload;
      state.liveStatus = null;
    },
    updateLiveStatus: (state, action: PayloadAction<string>) => {
      state.liveStatus = action.payload;
      state.logs.push(`Order status updated to: ${action.payload} at ${new Date().toLocaleTimeString()}`);
    },
    addLog: (state, action: PayloadAction<string>) => {
      state.logs.push(`${action.payload} at ${new Date().toLocaleTimeString()}`);
    },
  },
});

export const { setConnected, setActiveOrder, updateLiveStatus, addLog } = trackingSlice.actions;
export default trackingSlice.reducer;
