import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messagesByChat: {}, // { chatId: [messages] }
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action) {
      const { chatId, messages } = action.payload;
      state.messagesByChat[chatId] = messages;
    },
    addMessage(state, action) {
      const { chatId, message } = action.payload;
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }
      state.messagesByChat[chatId].push(message);
    },
    clearMessages(state, action) {
      const chatId = action.payload;
      delete state.messagesByChat[chatId];
    },
  },
});

export const { setMessages, addMessage, clearMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
