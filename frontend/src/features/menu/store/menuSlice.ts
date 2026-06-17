import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCategories = createAsyncThunk(
  'menu/fetchCategories',
  async () => {
    return [];
  }
);

export const fetchProducts = createAsyncThunk(
  'menu/fetchProducts',
  async () => {
    return [];
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: { categories: [], products: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.products = action.payload;
    });
  },
});

export default menuSlice.reducer;
