import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../shared/api/axios';

interface POSState {
  terminals: any[];
  activeTerminal: any | null;
  activeDrawer: any | null;
  cart: {
    items: any[];
    orderType: 'DINE_IN' | 'TAKEAWAY' | 'WALK_IN';
    tableId?: string;
    discount: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  activeOrder: any | null;
  receipts: any[];
  analytics: any;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: POSState = {
  terminals: [],
  activeTerminal: null,
  activeDrawer: null,
  cart: {
    items: [],
    orderType: 'WALK_IN',
    discount: 0,
    subtotal: 0,
    tax: 0,
    total: 0
  },
  activeOrder: null,
  receipts: [],
  analytics: {},
  status: 'idle',
  error: null,
};

export const fetchTerminals = createAsyncThunk('pos/fetchTerminals', async (branchId: string) => {
  const response = await api.get(`/pos/terminals/${branchId}`);
  return response.data.data;
});

export const startShift = createAsyncThunk('pos/startShift', async (data: { terminalId: string; openingAmount: number }) => {
  const response = await api.post('/pos/shifts/start', data);
  return response.data.data;
});

export const endShift = createAsyncThunk('pos/endShift', async (data: { drawerId: string; closingAmount: number; notes?: string }) => {
  const response = await api.post(`/pos/shifts/end/${data.drawerId}`, data);
  return response.data.data;
});

export const checkoutPOS = createAsyncThunk('pos/checkout', async (data: any, { getState }: any) => {
  const { pos } = getState();
  const payload = {
    terminalId: pos.activeTerminal.id,
    orderType: pos.cart.orderType,
    tableId: pos.cart.tableId,
    items: pos.cart.items,
    discount: pos.cart.discount,
  };
  const response = await api.post('/pos/orders', payload);
  return response.data.data;
});

export const processPayment = createAsyncThunk('pos/processPayment', async (data: { posOrderId: string; payments: any[] }) => {
  const response = await api.post('/pos/payments', data);
  return response.data.data; // { status, remaining or payments }
});

const calculateTotals = (cart: any) => {
  let subtotal = 0;
  cart.items.forEach((item: any) => {
    subtotal += Number(item.price) * item.quantity;
  });
  cart.subtotal = subtotal;
  cart.tax = subtotal * 0.05;
  cart.total = subtotal + cart.tax - cart.discount;
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    setActiveTerminal: (state, action: PayloadAction<any>) => {
      state.activeTerminal = action.payload;
    },
    setOrderType: (state, action: PayloadAction<'DINE_IN' | 'TAKEAWAY' | 'WALK_IN'>) => {
      state.cart.orderType = action.payload;
    },
    setTableId: (state, action: PayloadAction<string | undefined>) => {
      state.cart.tableId = action.payload;
    },
    addToCart: (state, action: PayloadAction<any>) => {
      const existing = state.cart.items.find(i => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.cart.items.push(action.payload);
      }
      calculateTotals(state.cart);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string, quantity: number }>) => {
      const item = state.cart.items.find(i => i.productId === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.cart.items = state.cart.items.filter(i => i.productId !== action.payload.productId);
        }
      }
      calculateTotals(state.cart);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart.items = state.cart.items.filter(i => i.productId !== action.payload);
      calculateTotals(state.cart);
    },
    clearCart: (state) => {
      state.cart.items = [];
      state.cart.discount = 0;
      state.activeOrder = null;
      calculateTotals(state.cart);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTerminals.fulfilled, (state, action) => {
        state.terminals = action.payload;
      })
      .addCase(startShift.fulfilled, (state, action) => {
        state.activeDrawer = action.payload;
      })
      .addCase(endShift.fulfilled, (state) => {
        state.activeDrawer = null;
      })
      .addCase(checkoutPOS.fulfilled, (state, action) => {
        state.activeOrder = action.payload;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        if (action.payload.status === 'PAID') {
          state.activeOrder = null; // Clear active order
          // Cart clearing can be dispatched after
        }
      });
  }
});

export const { setActiveTerminal, setOrderType, setTableId, addToCart, updateQuantity, removeFromCart, clearCart } = posSlice.actions;
export default posSlice.reducer;
