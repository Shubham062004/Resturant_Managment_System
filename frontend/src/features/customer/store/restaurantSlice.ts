import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RestaurantFiltersState {
  filters: {
    search: string;
    rating: number | null;
    veg: boolean;
    openNow: boolean;
  };
  sortBy: 'popularity' | 'rating' | 'name';
  sortOrder: 'asc' | 'desc';
}

const initialState: RestaurantFiltersState = {
  filters: {
    search: '',
    rating: null,
    veg: false,
    openNow: false,
  },
  sortBy: 'popularity',
  sortOrder: 'desc',
};

export const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setRating: (state, action: PayloadAction<number | null>) => {
      state.filters.rating = action.payload;
    },
    toggleVeg: (state) => {
      state.filters.veg = !state.filters.veg;
    },
    toggleOpenNow: (state) => {
      state.filters.openNow = !state.filters.openNow;
    },
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: 'popularity' | 'rating' | 'name'; sortOrder?: 'asc' | 'desc' }>
    ) => {
      state.sortBy = action.payload.sortBy;
      if (action.payload.sortOrder) {
        state.sortOrder = action.payload.sortOrder;
      } else {
        state.sortOrder = action.payload.sortBy === 'name' ? 'asc' : 'desc';
      }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.sortBy = initialState.sortBy;
      state.sortOrder = initialState.sortOrder;
    },
  },
});

export const { setSearch, setRating, toggleVeg, toggleOpenNow, setSorting, resetFilters } =
  restaurantSlice.actions;

export default restaurantSlice.reducer;
