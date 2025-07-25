import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();

  // Mock user state - replace with your actual user management
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios interceptors for auth
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setIsOwner(false);
        return;
      }

      const response = await axios.get('/api/user/user-details', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle the response format where user data is directly in userData
      const userData = response?.data?.userData;

      if (userData) {
        // Extract user info from the response
        const { accessToken, refreshToken, ...userInfo } = userData;

        // Update the token if we got a new one
        const newToken = accessToken || token;
        if (newToken !== token) {
          localStorage.setItem('token', newToken);
          setToken(newToken);
        }

        // Set the user state
        const userToSet = {
          ...userInfo,
          token: newToken
        };
        setUser(userToSet);

        // Update owner status
        const ownerStatus = userInfo.role === 'hotelOwner';
        setIsOwner(ownerStatus);
      } else {
        // Don't logout here, just clear the user
        setUser(null);
        setIsOwner(false);
      }
    } catch (error) {
      // If it's a 401, just clear the user but don't show error
      if (error.response?.status === 401) {
        setUser(null);
        setIsOwner(false);
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/user/sign-in', { email, password });

      const data = response?.data;
      // The token is at the root level of the response
      const token = data?.token;

      if (data?.success && token) {
        // Since the backend only returns token on login, we need to fetch user details
        const userResponse = await axios.get('/api/user/user-details', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const userData = userResponse?.data?.userData || {};

        // Extract user info from the response
        const { accessToken, refreshToken, ...userInfo } = userData;

        // Update the token in storage and state
        localStorage.setItem('token', token);
        setToken(token);

        // Set the user state
        const updatedUser = {
          ...userInfo,
          token
        };
        setUser(updatedUser);

        // Update owner status
        const isUserOwner = userInfo.role === 'hotelOwner';
        setIsOwner(isUserOwner);

        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        toast.success('Logged in successfully');
        return {
          success: true,
          user: updatedUser,
          isOwner: isUserOwner
        };
      } else {
        const errorMessage = data?.message || 'Login failed. Please try again.';
        toast.error(errorMessage);
        navigate('/login');
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please check your credentials.';

      // Handle different error cases
      if (error.response) {
        // Handle HTTP error responses
        const status = error.response.status;
        const data = error.response.data || {};

        if (status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (status === 404) {
          errorMessage = 'User not found. Please sign up.';
        } else if (data.message) {
          errorMessage = data.message;
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      const { data } = await axios.post('/api/user/sign-up', userData);
      if (data?.success) {
        toast.success('Account created successfully! Please login.');
        return { success: true };
      } else {
        const errorMessage = data?.message || 'Signup failed. Please try again.';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please check your information and try again.';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
        validationErrors: error.response?.data?.errors
      };
    }
  };

  const logout = async () => {
    // Clear all client-side state immediately
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsOwner(false);
    delete axios.defaults.headers.common['Authorization'];

    // Redirect to home page immediately
    navigate('/');

    // Show success message
    toast.success('Logged out successfully');

    // Make the logout request to the backend in the background
    // but don't wait for it or show any errors
    const token = getToken();
    if (token) {
      axios.post('/api/user/sign-out', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Don't throw on any status code
        validateStatus: () => true
      }).catch(() => { }); // Ignore all errors
    }
  };

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get('/api/rooms');
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to load rooms');
    }
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  // Function to get the current token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Derived state
  const isAuthenticated = !!user && !!token;

  const value = {
    currency,
    navigate,
    user,
    isOwner,
    isLoading,
    login,
    signup,
    logout,
    getToken,
    showHotelReg,
    setShowHotelReg,
    axios,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms,
    isAuthenticated,
    token // Make token available in context if needed
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
