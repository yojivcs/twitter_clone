import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/globalStyles';
import { darkTheme, lightTheme, purpleTheme, greenTheme, orangeTheme, pinkTheme } from './styles/theme';

// Pages

import Explore from './pages/Explore';
import HashtagPage from './pages/HashtagPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';

import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Register from './pages/Register';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Redux actions
import { loadUser } from './redux/slices/authSlice';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const { currentTheme } = useSelector((state) => state.theme);

  // Theme mapping
  const getTheme = () => {
    switch (currentTheme) {
      case 'light':
        return lightTheme;
      case 'purple':
        return purpleTheme;
      case 'green':
        return greenTheme;
      case 'orange':
        return orangeTheme;
      case 'pink':
        return pinkTheme;
      case 'dark':
      default:
        return darkTheme;
    }
  };

  useEffect(() => {
    const loadUserWithRetry = async () => {
      try {
        await dispatch(loadUser()).unwrap();
      } catch (error) {
        console.log('Failed to load user:', error);
        
        // If it's a token issue, clear the token and let user login again
        if (error === 'Token expired or invalid') {
          localStorage.removeItem('token');
        }
        
        // Don't retry for token issues, but could retry for network issues
        // For now, just log the error and let the user handle it
      }
    };

    loadUserWithRetry();
  }, [dispatch]);

  return (
    <ThemeProvider theme={getTheme()}>
      <GlobalStyle />
      <Routes>
        <Route path="/login" element={!isAuthenticated && !loading ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated && !loading ? <Register /> : <Navigate to="/" />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<PrivateRoute component={Home} />} />
          <Route path="explore" element={<Explore />} />
  
  
          <Route path="post/:id" element={<PostDetail />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="hashtag/:hashtag" element={<HashtagPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* Messages routes outside of Layout to avoid RightBar */}
        <Route path="messages" element={<PrivateRoute component={Messages} />} />
        <Route path="messages/:conversationId" element={<PrivateRoute component={Messages} />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App; 