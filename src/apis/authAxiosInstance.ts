import axios from 'axios';
import { API_BASE_URL } from '@/constants';

const authAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default authAxiosInstance;
