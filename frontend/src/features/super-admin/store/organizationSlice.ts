import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resturant-managment-system-qkow.onrender.com';

export const fetchOrganizations = createAsyncThunk('organizations/fetchAll', async () => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/super-admin/organizations`, {
    withCredentials: true,
  });
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
