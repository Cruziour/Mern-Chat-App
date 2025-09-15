import axiosInstance from '../api/axiosInstance';

export async function registerUserService(formData) {
  const { data } = await axiosInstance.post('/api/v1/user', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Important for sending files
    },
  });
  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post('/api/v1/user/login', formData);
  return data;
}

export async function logoutService() {
  const { data } = await axiosInstance.post('/api/v1/user/logout');
  return data;
}

export async function refreshAccessTokenService(refreshToken) {
  const { data } = await axiosInstance.post('/api/v1/user/refresh-token', {
    refreshToken,
  });
  return data;
}

export async function searchUserService(formData) {
  const { data } = await axiosInstance.get(`/api/v1/user?search=${formData}`);
  return data;
}

export async function createChatService(userId) {
  const { data } = await axiosInstance.post('/api/v1/chat', userId);
  return data;
}

export async function fetchAllChatsService() {
  const { data } = await axiosInstance.get('/api/v1/chat');
  return data;
}

export async function createGroupChatService(groupData) {
  const { data } = await axiosInstance.post('/api/v1/chat/group', groupData);
  return data;
}

// New message-related service functions
export async function fetchMessagesService(chatId) {
  const { data } = await axiosInstance.get(`/api/v1/message/${chatId}`);
  return data;
}

export async function sendMessageSerive(messageData) {
  const { data } = await axiosInstance.post('/api/v1/message', messageData);
  return data;
}

export async function forgetPassword(formData) {
  const { data } = await axiosInstance.patch('/api/v1/user/forget-password', formData);
  return data;
}