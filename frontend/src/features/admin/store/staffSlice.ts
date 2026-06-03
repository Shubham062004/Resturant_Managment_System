import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchAllStaff = createAsyncThunk('staff/fetchAll', async () => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/admin/staff`, { withCredentials: true });
  return response.data.data;
});

const staffSlice = createSlice({
  name: 'staff',
  initialState: { list: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStaff.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllStaff.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      });
  },
});

export default staffSlice.reducer;
