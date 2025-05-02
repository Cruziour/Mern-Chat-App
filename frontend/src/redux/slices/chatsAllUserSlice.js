import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chatsAllUser: [],
};

const chatsAllUserSlice = createSlice({
  name: 'chatsAllUser',
  initialState,
  reducers: {
    setChatAllUsers(state, action) {
      const userExists = state.chatsAllUser.find(
        (user) => user._id === action.payload._id
      );
      if (!userExists) {
        state.chatsAllUser.push(action.payload);
      }
    },
  },
});

export const { setChatAllUsers } = chatsAllUserSlice.actions;
export default chatsAllUserSlice.reducer;
