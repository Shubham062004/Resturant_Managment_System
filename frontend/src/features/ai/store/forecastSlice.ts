import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../services/apiClient';

interface ForecastState {
  demand: any;
  inventory: any;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ForecastState = {
  demand: null,
  inventory: null,
  status: 'idle',
};

export const fetchPredictions = createAsyncThunk('forecast/fetchPredictions', async ({ branchId, type }: { branchId: string, type: 'demand' | 'inventory' }) => {
  const response = await api.get(`/ai/predictions?branchId=${branchId}&type=${type}`);
  return { type, data: response.data.data };
});

const forecastSlice = createSlice({
  name: 'forecast',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPredictions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPredictions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.type === 'demand') {
          state.demand = action.payload.data;
        } else {
          state.inventory = action.payload.data;
        }
      });
  },
});

export default forecastSlice.reducer;
