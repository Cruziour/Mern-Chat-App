import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notificationsByUser: [], // { userId: count }
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action) {
      const userId = action.payload;
      if (state.notificationsByUser[userId]) {
        state.notificationsByUser[userId] += 1;
      } else {
        state.notificationsByUser[userId] = 1;
      }
    },
    clearNotification(state, action) {
      const userId = action.payload;
      if (state.notificationsByUser[userId]) {
        delete state.notificationsByUser[userId];
      }
    },
    clearAllNotifications(state) {
      state.notificationsByUser = {};
    },
  },
});

export const { addNotification, clearNotification, clearAllNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;
