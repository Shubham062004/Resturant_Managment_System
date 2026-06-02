import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Branch } from '../../../shared/data/branches';

export interface CustomerState {
  selectedBranch: Branch | null;
  recentSearches: string[];
  preferences: {
    dietaryFilters: string[];
    theme: 'light' | 'dark';
  };
}

const loadRecentSearches = (): string[] => {
  try {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const loadSelectedBranch = (): Branch | null => {
  try {
    const saved = localStorage.getItem('selectedBranch');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const initialState: CustomerState = {
  selectedBranch: loadSelectedBranch(),
  recentSearches: loadRecentSearches(),
  preferences: {
    dietaryFilters: [],
    theme: 'dark',
  },
};

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    selectBranch: (state, action: PayloadAction<Branch | null>) => {
      state.selectedBranch = action.payload;
      if (action.payload) {
        localStorage.setItem('selectedBranch', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('selectedBranch');
      }
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const trimmed = action.payload.trim();
      if (!trimmed) return;

      // Uniquify and limit to 5 searches
      const filtered = state.recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      state.recentSearches = updated;
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
      localStorage.removeItem('recentSearches');
    },
    toggleDietaryFilter: (state, action: PayloadAction<string>) => {
      const filter = action.payload;
      if (state.preferences.dietaryFilters.includes(filter)) {
        state.preferences.dietaryFilters = state.preferences.dietaryFilters.filter((f) => f !== filter);
      } else {
        state.preferences.dietaryFilters.push(filter);
      }
    },
    setThemePreference: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.preferences.theme = action.payload;
    },
  },
});

export const {
  selectBranch,
  addRecentSearch,
  clearRecentSearches,
  toggleDietaryFilter,
  setThemePreference,
} = customerSlice.actions;

export default customerSlice.reducer;
