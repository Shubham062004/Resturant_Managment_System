import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../services/apiClient';

export const fetchOrganizations = createAsyncThunk('organizations/fetchAll', async () => {
  const response = await apiClient.get('/super-admin/organizations');
  return response.data.data;
});

const organizationSlice = createSlice({
  name: 'organizations',
  initialState: { list: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      });
  },
});

export default organizationSlice.reducer;
