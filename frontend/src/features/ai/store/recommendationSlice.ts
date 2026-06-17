import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from '../../../services/apiClient';

interface RecommendationState {
  recommendations: any[];
  combos: any;
  trending: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RecommendationState = {
  recommendations: [],
  combos: null,
  trending: [],
  status: 'idle',
  error: null,
};

export const fetchRecommendations = createAsyncThunk(
  'ai/fetchRecommendations',
  async () => {
    const response = await api.get('/ai/recommendations');
    return response.data.data;
  }
);

export const fetchCombos = createAsyncThunk(
  'ai/fetchCombos',
  async (productIds: string[]) => {
    const response = await api.get(
      `/ai/combos?productIds=${productIds.join(',')}`
    );
    return response.data.data;
  }
);

export const fetchTrending = createAsyncThunk('ai/fetchTrending', async () => {
  const response = await api.get('/ai/trending');
  return response.data.data;
});

const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      })
      .addCase(fetchCombos.fulfilled, (state, action) => {
        state.combos = action.payload;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.trending = action.payload;
      });
  },
});

export default recommendationSlice.reducer;
