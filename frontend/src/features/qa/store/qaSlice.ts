import { createSlice } from '@reduxjs/toolkit';

interface QAState {
  systemHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  lastBuildStatus: 'SUCCESS' | 'FAILED' | 'PENDING';
  testResults: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
  };
}

const initialState: QAState = {
  systemHealth: 'HEALTHY',
  coverage: {
    lines: 92.5,
    functions: 91.0,
    branches: 88.5,
    statements: 93.2,
  },
  lastBuildStatus: 'SUCCESS',
  testResults: {
    passed: 452,
    failed: 0,
    skipped: 12,
    total: 464,
  },
};

const qaSlice = createSlice({
  name: 'qa',
  initialState,
  reducers: {
    updateHealth(state, action) {
      state.systemHealth = action.payload;
    },
  },
});

export const { updateHealth } = qaSlice.actions;
export default qaSlice.reducer;
