import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import apiClient from '../../../services/apiClient';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async () => {
    const response = await apiClient.get('/notifications');
    return response.data.data;
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string) => {
    await apiClient.patch(`/notifications/${id}/read`, {});
    return id;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [] as any[],
    unreadCount: 0,
    status: 'idle',
  },
  reducers: {
    addRealtimeNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload?.notifications ?? [];
        state.unreadCount = action.payload?.unreadCount ?? 0;
        state.status = 'succeeded';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.list.find((n) => n.id === action.payload);
        if (notif && notif.status !== 'READ') {
          notif.status = 'READ';
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addRealtimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
