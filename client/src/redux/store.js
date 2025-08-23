import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import searchReducer from './slices/searchSlice';
import themeReducer from './slices/themeSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    theme: themeReducer,
    search: searchReducer
  }
});

export default store; 