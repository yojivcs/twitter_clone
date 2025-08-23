import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Load user from token
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.get('/api/auth/me', config);
      return { user: res.data.data, token };
    } catch (err) {
      // Only remove token if it's a 401 (unauthorized) or 403 (forbidden)
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('Token is invalid or expired, removing from localStorage');
        localStorage.removeItem('token');
        return rejectWithValue('Token expired or invalid');
      }
      
      // For other errors (network issues, server errors), don't remove the token
      console.log('Error loading user but keeping token:', err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to load user');
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        await axios.get('/api/auth/logout', config);
      }
      
      localStorage.removeItem('token');
      return null;
    } catch (err) {
      // Still remove the token even if the API call fails
      localStorage.removeItem('token');
      return rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
  }
);

// Follow/Unfollow user
export const followUser = createAsyncThunk(
  'auth/followUser',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.put(`/api/users/${userId}/follow`, {}, config);
      return { userId, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to follow/unfollow user');
    }
  }
);

const initialState = {
  token: null,
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      // Follow user
      .addCase(followUser.pending, (state) => {
        // No loading state needed for follow action
      })
      .addCase(followUser.fulfilled, (state, action) => {
        if (state.user && state.user.following) {
          const userId = action.payload.userId;
          const isFollowing = state.user.following.includes(userId);
          
          if (isFollowing) {
            // Unfollow: remove from following array
            state.user.following = state.user.following.filter(id => id !== userId);
          } else {
            // Follow: add to following array
            state.user.following.push(userId);
          }
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        // Handle follow error if needed
        console.error('Follow action failed:', action.payload);
      });
  }
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer; 