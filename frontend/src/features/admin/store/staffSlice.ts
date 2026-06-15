import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../services/apiClient';

export const fetchAllStaff = createAsyncThunk('staff/fetchAll', async () => {
  const response = await apiClient.get('/admin/staff');
  return response.data.data;
});

export const updateStaffProfile = createAsyncThunk(
  'staff/updateProfile',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await apiClient.patch(`/admin/staff/${id}`, data);
    return response.data.data;
  },
);

export const bulkUpdateStaff = createAsyncThunk(
  'staff/bulkUpdate',
  async ({ ids, data }: { ids: string[]; data: any }) => {
    const response = await apiClient.patch('/admin/staff/bulk-update', { ids, ...data });
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
