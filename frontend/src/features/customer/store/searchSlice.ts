import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SearchState {
  query: string;
  history: string[];
}

const loadSearchHistory = (): string[] => {
  try {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const initialState: SearchState = {
  query: '',
  history: loadSearchHistory(),
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    addHistory: (state, action: PayloadAction<string>) => {
      const trimmed = action.payload.trim();
      if (!trimmed) return;
      const filtered = state.history.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      state.history = [trimmed, ...filtered].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(state.history));
    },
    clearHistory: (state) => {
      state.history = [];
      localStorage.removeItem('searchHistory');
    },
  },
});

export const { setQuery, addHistory, clearHistory } = searchSlice.actions;

export default searchSlice.reducer;
