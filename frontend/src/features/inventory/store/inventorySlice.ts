import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import api from '../../../services/apiClient';

interface InventoryState {
  ingredients: any[];
  inventory: any[];
  suppliers: any[];
  purchaseOrders: any[];
  inventoryRequests: any[];
  analytics: any;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: InventoryState = {
  ingredients: [],
  inventory: [],
  suppliers: [],
  purchaseOrders: [],
  inventoryRequests: [],
  analytics: {},
  status: 'idle',
  error: null,
};

export const fetchInventory = createAsyncThunk('inventory/fetchInventory', async () => {
  const response = await api.get('/inventory');
  return response.data.data;
});

export const fetchSuppliers = createAsyncThunk('inventory/fetchSuppliers', async () => {
  const response = await api.get('/inventory/suppliers');
  return response.data.data;
});

export const fetchPurchaseOrders = createAsyncThunk('inventory/fetchPurchaseOrders', async () => {
  const response = await api.get('/inventory/purchase-orders');
  return response.data.data;
});

export const fetchAnalytics = createAsyncThunk('inventory/fetchAnalytics', async () => {
  const response = await api.get('/inventory/analytics');
  return response.data.data;
});

export const fetchInventoryRequests = createAsyncThunk(
  'inventory/fetchInventoryRequests',
  async (branchId?: string) => {
    const url = branchId ? `/inventory/requests?branchId=${branchId}` : '/inventory/requests';
    const response = await api.get(url);
    return response.data.data;
  },
);

export const createInventoryRequest = createAsyncThunk(
  'inventory/createInventoryRequest',
  async (data: any) => {
    const response = await api.post('/inventory/requests', data);
    return response.data.data;
  },
);

export const approveInventoryRequest = createAsyncThunk(
  'inventory/approveInventoryRequest',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await api.patch(`/inventory/requests/${id}/approve`, data);
    return response.data.data;
  },
);

export const updateInventoryRequestStatus = createAsyncThunk(
  'inventory/updateStatus',
  async ({
    id,
    status,
    type,
  }: {
    id: string;
    status: 'PACKED' | 'DISPATCHED' | 'DELIVERED';
    type: 'dispatch' | 'deliver';
  }) => {
    const response = await api.patch(`/inventory/requests/${id}/${type}`, { status });
    return response.data.data;
  },
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    socketInventoryUpdate: (state, action: PayloadAction<any>) => {
      const idx = state.inventory.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) {
        state.inventory[idx] = action.payload;
      } else {
        state.inventory.push(action.payload);
      }
    },
    socketPurchaseReceived: (state, action: PayloadAction<any>) => {
      const idx = state.purchaseOrders.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.purchaseOrders[idx] = action.payload;
      }
    },
    socketInventoryRequestUpdated: (state, action: PayloadAction<any>) => {
      const idx = state.inventoryRequests.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state.inventoryRequests[idx] = action.payload;
      } else {
        state.inventoryRequests.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inventory = action.payload;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.purchaseOrders = action.payload;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(fetchInventoryRequests.fulfilled, (state, action) => {
        state.inventoryRequests = action.payload;
      })
      .addCase(createInventoryRequest.fulfilled, (state, action) => {
        state.inventoryRequests.unshift(action.payload);
      })
      .addCase(approveInventoryRequest.fulfilled, (state, action) => {
        const idx = state.inventoryRequests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) {
          state.inventoryRequests[idx] = action.payload;
        }
      })
      .addCase(updateInventoryRequestStatus.fulfilled, (state, action) => {
        const idx = state.inventoryRequests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) {
          state.inventoryRequests[idx] = action.payload;
        }
      });
  },
});

export const { socketInventoryUpdate, socketPurchaseReceived, socketInventoryRequestUpdated } =
  inventorySlice.actions;
export default inventorySlice.reducer;
