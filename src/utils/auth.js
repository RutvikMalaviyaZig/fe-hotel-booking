/**
 * Authentication utility functions
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The token if it exists, null otherwise
 */
export const getToken = () => {
  return localStorage.getItem('token') || null;
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The JWT token to store
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if a valid token exists, false otherwise
 */
export const isAuthenticated = () => {
  return !!getToken();
};
