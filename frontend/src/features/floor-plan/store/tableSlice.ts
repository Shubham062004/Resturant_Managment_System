import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../../services/apiClient';

interface Table {
  id: string;
  branchId: string;
  number: string;
  capacity: number;
  status: string;
  x: number;
  y: number;
  qrCode?: string;
  active: boolean;
}

interface TableState {
  tables: Table[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TableState = {
  tables: [],
  status: 'idle',
  error: null,
};

export const fetchTables = createAsyncThunk('tables/fetchBranch', async (branchId: string) => {
  const response = await apiClient.get(`/tables/branch/${branchId}`);
  return response.data.data;
});

export const updateTablePosition = createAsyncThunk(
  'tables/updatePosition',
  async ({ id, x, y }: { id: string; x: number; y: number }) => {
    const response = await apiClient.patch(`/tables/${id}`, { x, y });
    return response.data.data;
  },
);

export const updateTableStatus = createAsyncThunk(
  'tables/updateStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await apiClient.patch(`/tables/${id}`, { status });
    return response.data.data;
  },
);

const tableSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    tableUpdated: (state, action: PayloadAction<Table>) => {
      const index = state.tables.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tables[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tables = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tables';
      })
      .addCase(updateTablePosition.fulfilled, (state, action) => {
        const index = state.tables.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tables[index] = action.payload;
        }
      })
      .addCase(updateTableStatus.fulfilled, (state, action) => {
        const index = state.tables.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tables[index] = action.payload;
        }
      });
  },
});

export const { tableUpdated } = tableSlice.actions;
export default tableSlice.reducer;
