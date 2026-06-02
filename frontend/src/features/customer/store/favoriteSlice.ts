import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoriteState {
  favoritedIds: Record<string, boolean>;
}

const initialState: FavoriteState = {
  favoritedIds: {},
};

export const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<string[]>) => {
      const ids: Record<string, boolean> = {};
      action.payload.forEach((id) => {
        ids[id] = true;
      });
      state.favoritedIds = ids;
    },
    toggleFavoriteState: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (state.favoritedIds[productId]) {
        delete state.favoritedIds[productId];
      } else {
        state.favoritedIds[productId] = true;
      }
    },
    addFavorite: (state, action: PayloadAction<string>) => {
      state.favoritedIds[action.payload] = true;
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      delete state.favoritedIds[action.payload];
    },
  },
});

export const { setFavorites, toggleFavoriteState, addFavorite, removeFavorite } =
  favoriteSlice.actions;

export default favoriteSlice.reducer;
