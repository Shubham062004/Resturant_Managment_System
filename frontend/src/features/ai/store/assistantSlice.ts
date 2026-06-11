import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../services/apiClient';

interface AssistantState {
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AssistantState = {
  messages: [{ role: 'assistant', content: 'Hello! I am your ABC AI Assistant. How can I help you today?' }],
  status: 'idle',
};

export const sendMessage = createAsyncThunk('assistant/sendMessage', async (messages: any[]) => {
  const response = await api.post('/ai/chat', { messages });
  return response.data.data.response;
});

const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    addUserMessage(state, action) {
      state.messages.push({ role: 'user', content: action.payload });
    },
    clearChat(state) {
      state.messages = initialState.messages;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages.push({ role: 'assistant', content: action.payload });
      })
      .addCase(sendMessage.rejected, (state) => {
        state.status = 'failed';
        state.messages.push({ role: 'assistant', content: 'Sorry, I encountered an error.' });
      });
  },
});

export const { addUserMessage, clearChat } = assistantSlice.actions;
export default assistantSlice.reducer;
