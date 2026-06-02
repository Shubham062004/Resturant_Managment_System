import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../services/apiClient';

interface Station {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

interface StationState {
  stations: Station[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StationState = {
  stations: [],
  status: 'idle',
  error: null,
};

export const fetchStations = createAsyncThunk(
  'stations/fetchStations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/kitchen/stations');
      return response.data.data.stations;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch stations');
    }
  }
);

const stationSlice = createSlice({
  name: 'stations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stations = action.payload;
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default stationSlice.reducer;
