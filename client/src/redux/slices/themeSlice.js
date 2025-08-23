import { createSlice } from '@reduxjs/toolkit';

// Get theme preference from local storage or default to 'dark'
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  
  // If no saved preference, use system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const initialState = {
  currentTheme: getInitialTheme()
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.currentTheme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      // Toggle between dark and light only
      const newTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
      state.currentTheme = newTheme;
      localStorage.setItem('theme', newTheme);
    }
  }
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer; 