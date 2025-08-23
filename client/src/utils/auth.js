// Clear all authentication data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  // You can add other auth-related items here if needed
  // localStorage.removeItem('user');
  // localStorage.removeItem('refreshToken');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get the stored token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set the token
export const setToken = (token) => {
  localStorage.setItem('token', token);
};
