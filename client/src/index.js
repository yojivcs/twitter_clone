import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { logout } from './redux/slices/authSlice';
import store from './redux/store';
import './styles/index.css';

// Global axios interceptor to handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 if it's not a file upload request
    if (error.response?.status === 401) {
      const isUploadRequest = error.config?.url?.includes('/upload') || 
                             error.config?.url?.includes('/profile-picture') ||
                             error.config?.url?.includes('/cover-picture');
      
      // Don't logout for upload requests as they might fail for other reasons
      if (!isUploadRequest) {
        console.log('401 response detected, logging out user');
        store.dispatch(logout());
      } else {
        console.log('401 response on upload request, not logging out');
      }
    }
    return Promise.reject(error);
  }
);

// Global axios interceptor to automatically add auth token to requests
axios.interceptors.request.use(
  (config) => {
    // Don't add token for auth endpoints
    if (config.url && config.url.includes('/api/auth')) {
      return config;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>
); 