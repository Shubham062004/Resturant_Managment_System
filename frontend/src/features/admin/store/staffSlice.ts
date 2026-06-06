import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const fetchAllStaff = createAsyncThunk('staff/fetchAll', async () => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/admin/staff`, { withCredentials: true });
  return response.data.data;
});

export const updateStaffProfile = createAsyncThunk(
  'staff/updateProfile',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await axios.patch(`${API_BASE_URL}/api/v1/admin/staff/${id}`, data, {
      withCredentials: true,
    });
    return response.data.data;
  },
);

export const bulkUpdateStaff = createAsyncThunk(
  'staff/bulkUpdate',
  async ({ ids, data }: { ids: string[]; data: any }) => {
    const response = await axios.patch(
      `${API_BASE_URL}/api/v1/admin/staff/bulk-update`,
      { ids, ...data },
      { withCredentials: true },
    );
    return { ids, updatedData: data, result: response.data };
  },
);

const staffSlice = createSlice({
  name: 'staff',
  initialState: { list: [] as any[], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStaff.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllStaff.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(updateStaffProfile.fulfilled, (state, action) => {
        const index = state.list.findIndex((s: any) => s.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...action.payload };
        }
      });
  },
});

export default staffSlice.reducer;
