// lib/axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL, // Access environment variables
  headers: {
    'Content-Type': 'application/json',
    // Add other default headers here
  },
});

// Add interceptors if needed (optional)
instance.interceptors.request.use(
  (config) => {
    // Do something before every request
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    // Do something with every response
    return response;
  },
  (error) => {
    // Handle response errors
    return Promise.reject(error);
  }
);

export default instance;
