import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import selectedUserReducer from './slices/selectedUserSlice';
import chatAllUsersReducer from './slices/chatsAllUserSlice';
import messagesReducer from './slices/messagesSlice';
import notificationReducer from "./slices/notificationsSlice"

const store = configureStore({
  reducer: {
    user: userReducer,
    selectedUser: selectedUserReducer,
    chatsAllUser: chatAllUsersReducer,
    messages: messagesReducer,
    notifications: notificationReducer
  },
});

export default store;
