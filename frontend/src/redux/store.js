import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer, { logout } from './slices/userSlice';
import selectedUserReducer from './slices/selectedUserSlice';
import chatAllUsersReducer from './slices/chatsAllUserSlice';
import messagesReducer from './slices/messagesSlice';
import notificationReducer from "./slices/notificationsSlice";

const appReducer = combineReducers({
  user: userReducer,
  selectedUser: selectedUserReducer,
  chatsAllUser: chatAllUsersReducer,
  messages: messagesReducer,
  notifications: notificationReducer,
});

const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    state = undefined;
  }
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
