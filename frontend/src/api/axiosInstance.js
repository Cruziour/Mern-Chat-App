import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/slices/userSlice';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (response?.data.statusCode === 401) {
      store.dispatch(logout());
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
