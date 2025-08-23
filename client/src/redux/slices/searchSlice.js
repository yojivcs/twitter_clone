import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const searchPosts = createAsyncThunk(
  'search/posts',
  async (query) => {
    const response = await axios.get(`/api/search/posts?q=${encodeURIComponent(query)}`);
    return response.data;
  }
);

export const searchUsers = createAsyncThunk(
  'search/users',
  async (query) => {
    const response = await axios.get(`/api/search/users?q=${encodeURIComponent(query)}`);
    return response.data;
  }
);

export const searchHashtags = createAsyncThunk(
  'search/hashtags',
  async (query) => {
    const response = await axios.get(`/api/search/hashtags?q=${encodeURIComponent(query)}`);
    return response.data;
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    posts: [],
    users: [],
    hashtags: [],
    loading: false,
    error: null
  },
  reducers: {
    clearSearch: (state) => {
      state.posts = [];
      state.users = [];
      state.hashtags = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Posts
      .addCase(searchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Hashtags
      .addCase(searchHashtags.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchHashtags.fulfilled, (state, action) => {
        state.loading = false;
        state.hashtags = action.payload;
      })
      .addCase(searchHashtags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
