import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AIState {
  isAssistantOpen: boolean;
  provider: 'GEMINI' | 'OPENAI';
}

const initialState: AIState = {
  isAssistantOpen: false,
  provider: 'GEMINI',
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    toggleAssistant(state) {
      state.isAssistantOpen = !state.isAssistantOpen;
    },
    setProvider(state, action: PayloadAction<'GEMINI' | 'OPENAI'>) {
      state.provider = action.payload;
    },
  },
});

export const { toggleAssistant, setProvider } = aiSlice.actions;
export default aiSlice.reducer;
