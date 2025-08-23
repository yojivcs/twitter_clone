import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Get all posts
export const getPosts = createAsyncThunk(
  'posts/getPosts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/posts');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

// Get post by ID
export const getPostById = createAsyncThunk(
  'posts/getPostById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/posts/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch post');
    }
  }
);

// Create new post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': postData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      };

      const res = await axios.post('/api/posts', postData, config);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create post');
    }
  }
);

// Like/unlike post
export const likePost = createAsyncThunk(
  'posts/likePost',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.put(`/api/posts/${id}/like`, {}, config);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to like post');
    }
  }
);

// Retweet/un-retweet post
export const retweetPost = createAsyncThunk(
  'posts/retweetPost',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.put(`/api/posts/${id}/retweet`, {}, config);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to retweet post');
    }
  }
);

// Delete post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`/api/posts/${id}`, config);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete post');
    }
  }
);

// Update post
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      };

      const res = await axios.put(`/api/posts/${postId}`, formData, config);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update post');
    }
  }
);

const initialState = {
  posts: [],
  post: null,
  loading: false,
  error: null
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.post = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all posts
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get post by ID
      .addCase(getPostById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPostById.fulfilled, (state, action) => {
        state.post = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts = [action.payload, ...state.posts];
        state.loading = false;
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        // Update the post in the posts array
        state.posts = state.posts.map(post => {
          if (post._id === action.payload._id) {
            // Preserve the existing user data structure
            return {
              ...action.payload,
              user: post.user // Keep the existing user data
            };
          }
          // Also update if this is a retweet of the liked post
          if (post.retweetData && post.retweetData._id === action.payload._id) {
            return {
              ...post,
              retweetData: {
                ...action.payload,
                user: post.retweetData.user // Keep the existing user data
              }
            };
          }
          return post;
        });
        
        // Update the current post if it's the one being liked
        if (state.post) {
          if (state.post._id === action.payload._id) {
            state.post = {
              ...action.payload,
              user: state.post.user // Keep the existing user data
            };
          } else if (state.post.retweetData && state.post.retweetData._id === action.payload._id) {
            state.post = {
              ...state.post,
              retweetData: {
                ...action.payload,
                user: state.post.retweetData.user // Keep the existing user data
              }
            };
          }
        }
      })
      // Retweet post
      .addCase(retweetPost.fulfilled, (state, action) => {
        state.posts = state.posts.map(post => {
          if (post._id === action.payload._id) {
            return {
              ...action.payload,
              user: post.user // Keep the existing user data
            };
          }
          return post;
        });
        
        if (state.post && state.post._id === action.payload._id) {
          state.post = {
            ...action.payload,
            user: state.post.user // Keep the existing user data
          };
        }
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
        if (state.post && state.post._id === action.payload) {
          state.post = null;
        }
      })
      // Update post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        // Update the post in the posts array
        state.posts = state.posts.map(post => {
          if (post._id === action.payload._id) {
            return {
              ...action.payload,
              user: post.user // Keep the existing user data
            };
          }
          return post;
        });
        
        // Update the current post if it's the one being updated
        if (state.post && state.post._id === action.payload._id) {
          state.post = {
            ...action.payload,
            user: state.post.user // Keep the existing user data
          };
        }
        
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPostError, clearCurrentPost } = postSlice.actions;
export default postSlice.reducer; 