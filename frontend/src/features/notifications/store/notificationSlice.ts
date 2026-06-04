import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resturant-managment-system-qkow.onrender.com';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async () => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/notifications`, {
    withCredentials: true,
  });
  return response.data.data; // { notifications: [], unreadCount: number }
});

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string) => {
    await axios.patch(
      `${API_BASE_URL}/api/v1/notifications/${id}/read`,
      {},
      { withCredentials: true },
    );
    return id;
  },
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
        state.list = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
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
